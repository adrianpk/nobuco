/**
 * Nobuco - Popup Settings
 *
 * Handles user preferences for filtering options.
 * Settings are stored locally using chrome.storage.sync
 */

const DEFAULTS = {
  filterSpam: true,
  filterPolls: true
};

// Load saved settings on popup open
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.sync.get(DEFAULTS);

  document.getElementById('filterSpam').checked = settings.filterSpam;
  document.getElementById('filterPolls').checked = settings.filterPolls;
});

// Save settings on change
document.getElementById('filterSpam').addEventListener('change', (e) => {
  chrome.storage.sync.set({ filterSpam: e.target.checked });
});

document.getElementById('filterPolls').addEventListener('change', (e) => {
  chrome.storage.sync.set({ filterPolls: e.target.checked });
});
