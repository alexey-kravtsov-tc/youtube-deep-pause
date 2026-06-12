chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getDeepPauseContext") {
    console.log("%c[Deep Pause Background] New Request Received", "color: #00bcd4; font-weight: bold;", request);

    (async () => {
      try {
        const items = await chrome.storage.local.get(['geminiApiKey', 'searchSources']);
        const apiKey = items.geminiApiKey;
        if (!apiKey) throw new Error("API Key missing. Click extension options to set it.");

        const sources = items.searchSources || { wiki: true, reddit: true, scholar: false, youtube: false };
        let activeSources = [];
        if (sources.wiki) activeSources.push("Wikipedia");
        if (sources.reddit) activeSources.push("Reddit");
        if (sources.scholar) activeSources.push("Google Scholar");
        if (sources.youtube) activeSources.push("YouTube");
        
        const sourceInstruction = activeSources.length > 0 
          ? `Source the links PREFERABLY from the following domains: ${activeSources.join(', ')}.` 
          : "Source the links from high-quality educational websites.";

        let fullTranscript = "";
        let exactMomentText = "";
        let videoTitle = "Unknown Title";
        
        const htmlRes = await fetch(request.videoUrl);
        const html = await htmlRes.text();
        
        const splitHtml = html.split('ytInitialPlayerResponse = ');
        if (splitHtml.length > 1) {
          const jsonStr = splitHtml[1].split(';var meta')[0].split(';</script>')[0];
          const ytData = JSON.parse(jsonStr);
          
          videoTitle = ytData?.videoDetails?.title || "Unknown Title";
          const tracks = ytData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
          
          if (tracks && tracks.length > 0) {
            let trackUrl = tracks[0].baseUrl;
            const enTrack = tracks.find(t => t.languageCode === 'en');
            if (enTrack) trackUrl = enTrack.baseUrl;
            
            const xmlRes = await fetch(trackUrl);
            const xmlText = await xmlRes.text();
            
            const textRegex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
            let matchArr;
            const targetTime = parseFloat(request.timestamp);
            let transcriptLines = [];
            
            while ((matchArr = textRegex.exec(xmlText)) !== null) {
              const start = parseFloat(matchArr[1]);
              const dur = parseFloat(matchArr[2]);
              let decodedText = matchArr[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
              
              transcriptLines.push(`[${start}s] ${decodedText}`);
              
              if (targetTime >= start && targetTime <= start + dur) {
                exactMomentText += decodedText + " ";
              }
            }
            
            fullTranscript = transcriptLines.join(' ');
          }
        }

        let promptText = `Video Title: "${videoTitle}". Video URL: "${request.videoUrl}". The user paused at ${request.timestamp}s. `;
        if (fullTranscript.trim() !== "") {
          promptText += `Spoken dialogue: <dialogue> ${fullTranscript} </dialogue> `;
        }
        
        promptText += `Task: 1. Identify the concept discussed at exactly ${request.timestamp}s. 2. Output 5-10 direct educational links. ${sourceInstruction} 3. For each link, provide a 'preview' field containing a concise, 40-word factual summary of what the user will read when they click the link. This preloads data for a hover panel. 4. Provide a short reason for relevance. 5. DO NOT generate a general summary.`;
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
                      reason: { type: "STRING" },
                      preview: { type: "STRING" }
                    },
                    required: ["title", "url", "reason", "preview"]
                  }
                }
              },
              required: ["links"]
            }
          }
        };

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (!response.ok || data.error) throw new Error(data.error?.message || `HTTP ${response.status}`);

        const rawText = data.candidates[0].content.parts[0].text;
        const parsedResult = JSON.parse(rawText);
        
        sendResponse({ data: parsedResult, currentSentence: exactMomentText });

      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();

    return true; 
  }
});
