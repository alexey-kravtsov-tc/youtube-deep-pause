// Global cache to ensure we only fetch comments once per video per worker session
let videoCommentCache = { videoId: null, comments: [] };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openOptions") {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
    sendResponse({ status: "ok" });
    return true;
  }

  if (request.action === "getDeepPauseContext") {
    console.log("%c[Deep Pause Background] New Request Received", "color: #00bcd4; font-weight: bold;", request);

    (async () => {
      try {
        const items = await chrome.storage.local.get(['geminiApiKey', 'ytApiKey', 'maxComments', 'searchSources']);
        const apiKey = items.geminiApiKey;
        if (!apiKey) throw new Error("API Key missing. Click the settings icon (⚙) to set it.");

        const ytApiKey = items.ytApiKey;
        const maxComments = items.maxComments || 100;
        const videoIdMatch = request.videoUrl.match(/[?&]v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        // Fetch YouTube Comments if API Key is present
        let fetchedComments = [];
        if (ytApiKey && videoId && maxComments > 0) {
          if (videoCommentCache.videoId === videoId) {
            fetchedComments = videoCommentCache.comments;
          } else {
            try {
              const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxComments}&order=relevance&key=${ytApiKey}`);
              const ytData = await ytRes.json();
              
              if (ytData.items) {
                fetchedComments = ytData.items.map(item => ({
                  author: item.snippet.topLevelComment.snippet.authorDisplayName,
                  text: item.snippet.topLevelComment.snippet.textOriginal
                }));
                videoCommentCache = { videoId, comments: fetchedComments };
              }
            } catch (err) {
              console.warn("[Deep Pause Background] Failed to fetch comments:", err);
            }
          }
        }

        const sources = items.searchSources || { wiki: true, reddit: true, scholar: false, youtube: false };
        let activeSources = [];
        if (sources.wiki) activeSources.push("Wikipedia");
        
        // Critical fix for Reddit: LLMs hallucinate specific post URL IDs, so we force them to use search URLs
        if (sources.reddit) activeSources.push("Reddit (CRITICAL: DO NOT guess specific post URLs as they will 404. ALWAYS use the search format instead: https://www.reddit.com/search/?q=search+terms)");
        
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

        if (fetchedComments.length > 0) {
          const commentString = fetchedComments.map(c => `[Author: ${c.author}] ${c.text.substring(0, 400)}`).join('\n');
          promptText += `Top comments on this video: <comments> ${commentString} </comments>. `;
        }
        
        promptText += `Task: 1. Identify the concept discussed at exactly ${request.timestamp}s. 2. Output 5-10 direct educational links. ${sourceInstruction} 3. For each link, provide an 80-word factual preview. 4. If any <comments> relate to this timestamp, include exactly ONE extra link in the array with Title "Community Insights", URL "#comments", a brief reason, and a detailed synthesis of the relevant comments in the 'preview' field. 5. DO NOT generate a general summary.`;
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
