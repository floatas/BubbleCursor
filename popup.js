let toggleBubbleBtn = document.getElementById('toggleBubbleBtn');
let isEnabled = true;

chrome.storage.sync.get(['bubbleCursor'], function (data) {
  isEnabled = data.bubbleCursor.enabled;
  updateToggleBubbleBtnText(isEnabled);
});

let toggleBubbleCursor = function () {
  isEnabled = !isEnabled;
  chrome.storage.sync.set({ bubbleCursor: { enabled: isEnabled } }, function () {
    updateToggleBubbleBtnText(isEnabled);
  });
}

let updateToggleBubbleBtnText = function (isEnabled) {
  if (isEnabled === true) {
    toggleBubbleBtn.value = 'Disable bubble cursor';
  } else {
    toggleBubbleBtn.value = 'Enable bubble cursor';
  }
}

toggleBubbleBtn.addEventListener('click', toggleBubbleCursor);

