let deepPauseTimeout = null;
let linkBuffer = [];
let currentVideoUrl = "";
let isMinimized = false;

// Remove timestamp parameter to identify unique videos
const getBaseUrl = (url) => url.split('&t=')[0];

function renderOverlay(currentSentence = null) {
  const body = document.getElementById('vc-body');
  if (!body) return;
  
  let html = '';
  
  if (currentSentence && currentSentence.trim() !== "") {
    html += `<div style="font-size: 14px; margin-bottom: 10px; color: #ffcc00; font-style: italic;">"${currentSentence}"</div>`;
  }
  
  if (linkBuffer.length > 0) {
    html += '<ul style="margin: 0; padding-left: 20px;">';
    linkBuffer.forEach(link => {
      // Increased font size of title to 32px (twice the previous default of 16px/14px logic)
      html += `<li style="margin-bottom: 16px;">
        <a href="${link.url}" target="_blank" style="color: #3ea6ff; text-decoration: none; font-weight: bold; font-size: 28px;">${link.title}</a>
        <span style="display: block; font-size: 14px; color: #aaa; margin-top: 4px;">${link.reason}</span>
      </li>`;
    });
    html += '</ul>';
  } else {
    html += '<div style="font-size: 14px; color: #aaa;">No context links buffered yet.</div>';
  }
  
  body.innerHTML = html;
}

document.addEventListener('pause', (event) => {
  if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
    const videoElement = event.target;
    const timestamp = Math.round(videoElement.currentTime);
    const rawUrl = window.location.href; 
    const baseUrl = getBaseUrl(rawUrl);
    
    // Clear buffer if the user navigates to a new video
    if (baseUrl !== currentVideoUrl) {
      currentVideoUrl = baseUrl;
      linkBuffer = [];
    }

    let overlay = document.getElementById('vibe-code-overlay');
    
    // Scaffold UI on first run
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'vibe-code-overlay';
      
      overlay.innerHTML = `
        <div class="vc-header">
          <span class="vc-title">Context Links</span>
          <div class="vc-controls">
            <button id="vc-min-btn" title="Minimize">_</button>
            <button id="vc-close-btn" title="Close">X</button>
          </div>
        </div>
        <div id="vc-loading" class="vc-loading"></div>
        <div id="vc-body" class="vc-body"></div>
      `;
      document.body.appendChild(overlay);

      // Event listeners for UI controls
      document.getElementById('vc-min-btn').addEventListener('click', () => {
        isMinimized = !isMinimized;
        document.getElementById('vc-body').style.display = isMinimized ? 'none' : 'block';
        const loading = document.getElementById('vc-loading');
        if (loading.innerText) {
          loading.style.display = isMinimized ? 'none' : 'block';
        }
      });

      document.getElementById('vc-close-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
      });
    }
    
    // Dynamically limit height to 1/2 of the actual video player height
    const videoHeight = videoElement.clientHeight || window.innerHeight;
    overlay.style.maxHeight = (videoHeight / 2) + 'px';
    
    // Reset display states on pause
    overlay.style.display = 'flex';
    isMinimized = false;
    document.getElementById('vc-body').style.display = 'block';

    const loadingIndicator = document.getElementById('vc-loading');
    loadingIndicator.style.display = 'block';
    loadingIndicator.style.color = '#ffcc00';
    loadingIndicator.innerText = "Awaiting playback halt...";
    
    // Render existing buffer immediately while waiting for API
    renderOverlay();

    if (deepPauseTimeout) {
      clearTimeout(deepPauseTimeout);
    }

    // 2-Second Debounce Throttle
    deepPauseTimeout = setTimeout(() => {
      loadingIndicator.innerText = "Extracting context via AI...";
      
      chrome.runtime.sendMessage(
        { action: "getDeepPauseContext", timestamp, videoUrl: rawUrl },
        (response) => {
          loadingIndicator.style.display = 'none';
          loadingIndicator.innerText = "";
          
          if (!response || response.error) {
            loadingIndicator.style.display = 'block';
            loadingIndicator.style.color = '#f44336';
            loadingIndicator.innerText = response ? response.error : "Error: No response from backend.";
            return;
          }

          const { links } = response.data;
          
          if (links && links.length > 0) {
            links.reverse().forEach(newLink => {
              // Aggressive deduplication: check for matching URL (ignoring trailing slash) OR identical title
              const normUrl = newLink.url.replace(/\/$/, '').toLowerCase();
              const normTitle = newLink.title.toLowerCase();
              
              const isDuplicate = linkBuffer.some(existing => 
                existing.url.replace(/\/$/, '').toLowerCase() === normUrl || 
                existing.title.toLowerCase() === normTitle
              );
              
              if (!isDuplicate) {
                linkBuffer.unshift(newLink); // Add to the top of the list
              }
            });
          }
          
          renderOverlay(response.currentSentence);
        }
      );
    }, 2000);
  }
}, true);

document.addEventListener('play', (event) => {
  if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
    if (deepPauseTimeout) {
      clearTimeout(deepPauseTimeout);
      deepPauseTimeout = null;
    }

    const overlay = document.getElementById('vibe-code-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}, true);
