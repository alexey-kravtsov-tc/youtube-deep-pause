chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDeepPauseContext") {
    console.log("%c[Deep Pause Background] New Request Received", "color: #00bcd4; font-weight: bold;", request);

    (async () => {
      try {
        const items = await chrome.storage.local.get(['geminiApiKey']);
        const apiKey = items.geminiApiKey;
        if (!apiKey) {
          console.error("[Deep Pause Background] API Key is missing in storage!");
          throw new Error("API Key missing. Click extension options to set it.");
        }

        let fullTranscript = "";
        let exactMomentText = "";
        let videoTitle = "Unknown Title";
        
        console.log(`[Deep Pause Background] Step 1: Fetching full HTML for URL: ${request.videoUrl}`);
        const htmlRes = await fetch(request.videoUrl);
        const html = await htmlRes.text();
        console.log(`[Deep Pause Background] Step 1 Success: HTML length received = ${html.length} characters.`);
        
        console.log("[Deep Pause Background] Step 2: Extracting 'ytInitialPlayerResponse' script tag...");
        const splitHtml = html.split('ytInitialPlayerResponse = ');
        if (splitHtml.length > 1) {
          console.log("[Deep Pause Background] Found 'ytInitialPlayerResponse =' string pattern.");
          
          const jsonStr = splitHtml[1].split(';var meta')[0].split(';</script>')[0];
          const ytData = JSON.parse(jsonStr);
          console.log("[Deep Pause Background] Parsed ytInitialPlayerResponse object successfully.");
          
          videoTitle = ytData?.videoDetails?.title || "Unknown Title";
          
          const tracks = ytData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          console.log("[Deep Pause Background] Identified caption tracks array:", tracks);
          
          if (tracks && tracks.length > 0) {
            let trackUrl = tracks[0].baseUrl;
            const enTrack = tracks.find(t => t.languageCode === 'en');
            if (enTrack) {
              console.log("[Deep Pause Background] English caption track located:", enTrack);
              trackUrl = enTrack.baseUrl;
            } else {
              console.warn("[Deep Pause Background] English track not found, falling back to first available.");
            }
            
            console.log(`[Deep Pause Background] Step 3: Fetching XML caption track from URL: ${trackUrl}`);
            const xmlRes = await fetch(trackUrl);
            const xmlText = await xmlRes.text();
            console.log(`[Deep Pause Background] Step 3 Success: XML response size = ${xmlText.length} characters.`);
            
            const textRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
            let matchArr;
            const targetTime = parseFloat(request.timestamp);
            let transcriptLines = [];
            let matchCount = 0;
            
            console.log(`[Deep Pause Background] Step 4: Iterating text segments for target timestamp: ${targetTime}s`);
            
            while ((matchArr = textRegex.exec(xmlText)) !== null) {
              matchCount++;
              const start = parseFloat(matchArr[1]);
              const dur = parseFloat(matchArr[2]);
              let decodedText = matchArr[3]
                .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>').replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"');
              
              transcriptLines.push(`[${start}s] ${decodedText}`);
              
              if (targetTime >= start && targetTime <= start + dur) {
                console.log(`[Deep Pause Background] Exact timeline hit found at segment [${start}s - ${start+dur}s]: "${decodedText}"`);
                exactMomentText += decodedText + " ";
              }
            }
            
            console.log(`[Deep Pause Background] Regex matching complete. Processed ${matchCount} total speech blocks.`);
            fullTranscript = transcriptLines.join(' ');
            
            if (!exactMomentText) {
               console.log(`[Deep Pause Background] No active subtitle overlapped exactly at ${targetTime}s.`);
               exactMomentText = ""; 
            }
          } else {
            console.error("[Deep Pause Background] Error: tracks array is missing or empty.");
          }
        } else {
          console.error("[Deep Pause Background] Error: Could not locate 'ytInitialPlayerResponse' in HTML.");
          throw new Error("Failed to parse YouTube initial player response.");
        }

        console.log("[Deep Pause Background] Step 5: Preparing prompt and payload for Gemini API...");
        
        let promptText = `Video Title: "${videoTitle}". Video URL (Source of Truth): "${request.videoUrl}". The user paused at ${request.timestamp}s. `;
        
        if (fullTranscript.trim() !== "") {
          promptText += `Spoken dialogue: <dialogue> ${fullTranscript} </dialogue> `;
        }
        
        promptText += `Task: 1. Identify the concept discussed at exactly ${request.timestamp}s. 2. Output a comprehensive list of AT LEAST 5 TO 10 direct Wikipedia/educational links. Cover multiple angles of the topic: the main subject, background history, related technology, and specific terminology used at this moment. 3. For each link, provide a raw, direct explanation (reason) of its relevance. 4. DO NOT generate a general summary. 5. If dialogue is empty, infer the context STRICTLY from the title and URL. Do not hallucinate.`;
        
        promptText = promptText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                links: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: { type: "STRING" },
                      url: { type: "STRING" },
                      reason: { type: "STRING" }
                    },
                    required: ["title", "url", "reason"]
                  }
                }
              },
              required: ["links"]
            }
          }
        };

        console.log("[Deep Pause Background] Sending prompt to Gemini:", promptText);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
           console.error("[Deep Pause Background] Gemini API returned an error:", data.error);
           throw new Error(data.error?.message || `HTTP ${response.status}`);
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const parsedResult = JSON.parse(rawText);
        
        console.log("%c[Deep Pause Background] Success! Sending response to content script.", "color: #4caf50; font-weight: bold;");
        sendResponse({ data: parsedResult, currentSentence: exactMomentText });

      } catch (err) {
        console.error("%c[Deep Pause Background] Process failed:", "color: #f44336; font-weight: bold;", err);
        sendResponse({ error: err.message });
      }
    })();

    return true; 
  }
});
