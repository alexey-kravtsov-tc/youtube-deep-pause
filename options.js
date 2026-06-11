const saveOptions = () => {
  const apiKey = document.getElementById('apiKey').value;

  chrome.storage.local.set(
    { geminiApiKey: apiKey },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'API Key saved successfully.';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

const restoreOptions = () => {
  chrome.storage.local.get(
    ['geminiApiKey'],
    (items) => {
      if (items.geminiApiKey) {
        document.getElementById('apiKey').value = items.geminiApiKey;
      }
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
