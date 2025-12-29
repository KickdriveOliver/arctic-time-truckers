// Utility functions for managing cat selection per browser session

const CAT_SESSION_KEY = 'pringles-selected-cat';

export function getSelectedCatId() {
  try {
    const stored = localStorage.getItem(CAT_SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading selected cat from localStorage:', error);
    return null;
  }
}

export function setSelectedCatId(catId) {
  try {
    if (catId) {
      localStorage.setItem(CAT_SESSION_KEY, JSON.stringify(catId));
    } else {
      localStorage.removeItem(CAT_SESSION_KEY);
    }
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('cat-session-changed', { detail: catId }));
  } catch (error) {
    console.error('Error saving selected cat to localStorage:', error);
  }
}

export function clearSelectedCat() {
  setSelectedCatId(null);
}