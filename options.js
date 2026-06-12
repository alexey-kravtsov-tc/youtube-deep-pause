const saveOptions = () => {
  const apiKey = document.getElementById('apiKey').value;
  const ytApiKey = document.getElementById('ytApiKey').value;
  const sources = {
    wiki: document.getElementById('src-wiki').checked,
    reddit: document.getElementById('src-reddit').checked,
    scholar: document.getElementById('src-scholar').checked,
    youtube: document.getElementById('src-youtube').checked
  };

  chrome.storage.local.set(
    { geminiApiKey: apiKey, ytApiKey: ytApiKey, searchSources: sources },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Preferences saved successfully!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

const restoreOptions = () => {
  chrome.storage.local.get(
    { 
      geminiApiKey: '', 
      ytApiKey: '',
      searchSources: { wiki: true, reddit: true, scholar: false, youtube: false } 
    },
    (items) => {
      document.getElementById('apiKey').value = items.geminiApiKey;
      document.getElementById('ytApiKey').value = items.ytApiKey;
      document.getElementById('src-wiki').checked = items.searchSources.wiki;
      document.getElementById('src-reddit').checked = items.searchSources.reddit;
      document.getElementById('src-scholar').checked = items.searchSources.scholar;
      document.getElementById('src-youtube').checked = items.searchSources.youtube;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
