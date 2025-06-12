// Popup script for Wizzly extension
document.addEventListener('DOMContentLoaded', function() {
  const openTeachButton = document.getElementById('openTeachButton');
  
  if (openTeachButton) {
    openTeachButton.addEventListener('click', function() {
      const teachUrl = chrome.runtime.getURL('/teach.html');
      
      chrome.tabs.create({
        url: teachUrl,
        active: true
      });
      
      window.close();
    });
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    const openTeachButton = document.getElementById('openTeachButton');
    if (document.activeElement === openTeachButton) {
      openTeachButton.click();
    }
  }
}); 