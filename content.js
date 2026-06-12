let deepPauseTimeout = null;
let linkBuffer = [];
let currentVideoUrl = "";
let isMinimized = false;
window.vcPreviews = {}; 

const getBaseUrl = (url) => url.split('&t=')[0];

function renderOverlay(currentSentence = null) {
  const body = document.getElementById('vc-body');
  if (!body) return;
  
  let html = '';
  
  if (currentSentence && currentSentence.trim() !== "") {
    html += `<div style="font-size: 14px; margin-bottom: 16px; color: #ffcc00; font-style: italic;">"${currentSentence}"</div>`;
  }
  
  if (linkBuffer.length > 0) {
    const groups = { "Comments Insights": [], Wikipedia: [], Reddit: [], "Google Scholar": [], YouTube: [], Other: [] };
    
    linkBuffer.forEach(link => {
      if (link.url === '#comments') groups["Comments Insights"].push(link);
      else if (link.url.includes('wikipedia.org')) groups.Wikipedia.push(link);
      else if (link.url.includes('reddit.com')) groups.Reddit.push(link);
      else if (link.url.includes('scholar.google')) groups["Google Scholar"].push(link);
      else if (link.url.includes('youtube.com') || link.url.includes('youtu.be')) groups.YouTube.push(link);
      else groups.Other.push(link);
    });

    for (const [sourceName, links] of Object.entries(groups)) {
      if (links.length === 0) continue;
      
      const isComments = sourceName === 'Comments Insights';
      const borderColor = isComments ? '#6a1b9a' : '#444';
      const titleColor = isComments ? '#ce93d8' : '#ffcc00';

      html += `<div class="vc-source-card" style="border-color: ${borderColor};">`;
      html += `<div class="vc-source-group-title" style="color: ${titleColor};">${sourceName}</div>`;
      html += '<ul style="margin: 0; list-style-type: none; padding-left: 0;">';
      
      links.forEach((link, idx) => {
        const linkId = `vc-link-${sourceName.replace(/\s+/g, '')}-${idx}-${Date.now()}`;
        
        let previewText = link.preview || "No preview information generated for this link.";
        window.vcPreviews[linkId] = previewText;

        const liBorderColor = isComments ? '#ab47bc' : '#444';
        const linkColor = isComments ? '#e1bee7' : '#3ea6ff';
        const targetAttr = isComments ? '' : 'target="_blank"';

        html += `<li style="margin-bottom: 12px; padding-left: 10px; border-left: 2px solid ${liBorderColor};">
          <a href="${link.url}" ${targetAttr} class="vc-link-item" data-id="${linkId}" style="color: ${linkColor}; text-decoration: none; font-weight: bold; font-size: 24px;">${link.title}</a>
          <span style="display: block; font-size: 14px; color: #aaa; margin-top: 4px;">${link.reason}</span>
        </li>`;
      });
      html += '</ul></div>';
    }
  } else {
    html += '<div style="font-size: 14px; color: #aaa;">No context links buffered yet.</div>';
  }
  
  body.innerHTML = html;
}

// Global click listener to catch our #comments deep link without reloading
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('vc-link-item') && e.target.getAttribute('href') === '#comments') {
    e.preventDefault();
    const commentSection = document.querySelector('ytd-comments');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      alert("Please scroll down manually to load the comments section first.");
    }
  }
});

document.addEventListener('mouseover', (e) => {
  if (e.target.classList.contains('vc-link-item')) {
    const previewPanel = document.getElementById('vc-preview-panel');
    const title = e.target.innerText;
    const text = window.vcPreviews[e.target.dataset.id];
    
    if (previewPanel && text) {
      previewPanel.innerHTML = `
        <h3 style="margin-top:0; color:#fff; font-size:18px; border-bottom:1px solid #444; padding-bottom:8px;">${title}</h3>
        <p style="font-size:14px; line-height:1.6; color:#e1e1e1; margin:0;">${text}</p>
      `;
      previewPanel.style.display = 'block';
    }
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.classList.contains('vc-link-item')) {
    const previewPanel = document.getElementById('vc-preview-panel');
    if (previewPanel) previewPanel.style.display = 'none';
  }
});

document.addEventListener('pause', (event) => {
  if (window.location.pathname !== '/watch') return;

  if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
    const videoElement = event.target;
    const timestamp = Math.round(videoElement.currentTime);
    const rawUrl = window.location.href; 
    const baseUrl = getBaseUrl(rawUrl);
    
    if (baseUrl !== currentVideoUrl) {
      currentVideoUrl = baseUrl;
      linkBuffer = [];
      window.vcPreviews = {};
    }

    let overlay = document.getElementById('vibe-code-overlay');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'vibe-code-overlay';
      
      overlay.innerHTML = `
        <div class="vc-header">
          <span class="vc-title">Context Links</span>
          <div class="vc-controls">
            <button id="vc-settings-btn" title="Settings">⚙</button>
            <button id="vc-min-btn" title="Minimize">_</button>
            <button id="vc-close-btn" title="Close">X</button>
          </div>
        </div>
        <div id="vc-loading" class="vc-loading"></div>
        <div id="vc-body" class="vc-body"></div>
        <div id="vc-preview-panel"></div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('vc-settings-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "openOptions" });
      });

      document.getElementById('vc-min-btn').addEventListener('click', () => {
        isMinimized = !isMinimized;
        document.getElementById('vc-body').style.display = isMinimized ? 'none' : 'block';
        const loading = document.getElementById('vc-loading');
        if (loading.innerText) loading.style.display = isMinimized ? 'none' : 'block';
      });

      document.getElementById('vc-close-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
      });
    }
    
    const videoHeight = videoElement.clientHeight || window.innerHeight;
    const targetHeight = videoHeight / 2;
    
    overlay.style.maxHeight = targetHeight + 'px';
    document.getElementById('vc-preview-panel').style.height = targetHeight + 'px';
    
    overlay.style.display = 'flex';
    isMinimized = false;
    document.getElementById('vc-body').style.display = 'block';

    const loadingIndicator = document.getElementById('vc-loading');
    loadingIndicator.style.display = 'block';
    loadingIndicator.style.color = '#ffcc00';
    loadingIndicator.innerText = "Awaiting playback halt...";
    
    renderOverlay();

    if (deepPauseTimeout) {
      clearTimeout(deepPauseTimeout);
    }

    deepPauseTimeout = setTimeout(() => {
      loadingIndicator.innerText = "Extracting context via AI...";
      
      // Pass URLs of already suggested links to the background script
      const previousLinksPayload = linkBuffer.map(link => link.url);

      chrome.runtime.sendMessage(
        { action: "getDeepPauseContext", timestamp, videoUrl: rawUrl, previousLinks: previousLinksPayload },
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
              const normUrl = newLink.url.replace(/\/$/, '').toLowerCase();
              const isDuplicate = linkBuffer.some(existing => existing.url.replace(/\/$/, '').toLowerCase() === normUrl);
              
              if (!isDuplicate) linkBuffer.unshift(newLink);
            });
          }
          
          renderOverlay(response.currentSentence);
        }
      );
    }, 2000);
  }
}, true);

document.addEventListener('play', (event) => {
  if (window.location.pathname !== '/watch') return;

  if (event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
    if (deepPauseTimeout) {
      clearTimeout(deepPauseTimeout);
      deepPauseTimeout = null;
    }

    const overlay = document.getElementById('vibe-code-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}, true);
