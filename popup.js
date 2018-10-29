let toggleBubbleBtn = document.getElementById('toggleBubbleBtn');
let isEnabled = true;

chrome.storage.sync.get(['bubbleCursor'], function (data) {
  isEnabled = data.bubbleCursor.enabled;
  if (isEnabled === true) {
    toggleBubbleBtn.value = 'Disable bubble cursor';
  } else {
    toggleBubbleBtn.value = 'Enable bubble cursor';
  }
});

let toggleBubbleCursor = function () {
  isEnabled = !isEnabled;
  chrome.storage.sync.set({ bubbleCursor: {enabled : isEnabled} }, function () {
    if (isEnabled === true) {
      toggleBubbleBtn.value = 'Disable bubble cursor';
    } else {
      toggleBubbleBtn.value = 'Enable bubble cursor';
    }
  });
}

toggleBubbleBtn.addEventListener('click', function () { toggleBubbleCursor(); });

