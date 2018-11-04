let toggleKey = document.getElementById('toggleKey');
let changeKeyBtn = document.getElementById('changeKeyBtn');

let disableKey = document.getElementById('disableKey');
let disableKeyBtn = document.getElementById('changeDisableKeyBtn');

let refreshShowCircleButton = function () {
  chrome.storage.sync.get(['showCircle'], function (option) {
    toggleKey.innerText = option.showCircle.key;
  });
};

let refreshDisableBubbleButton = function () {
  chrome.storage.sync.get(['disableBubble'], function (option) {
    disableKey.innerText = option.disableBubble.key;
  });
};

refreshShowCircleButton();
refreshDisableBubbleButton();

let waitForKeyInput = 0;
let waitKeyFor = 0;

let newKeyForToggleCircle = 1;
let newKeyForDisableBubble = 2;

function recordNewKey(keyFor) {
  if (waitForKeyInput == 0) {
    waitForKeyInput = 1;

    if (keyFor === newKeyForToggleCircle) {
      changeKeyBtn.value = 'Press any key';
      changeKeyBtn.disabled = true;
    } else if (keyFor === newKeyForDisableBubble) {
      disableKeyBtn.value = 'Press any key';
      disableKeyBtn.disabled = true;
    }

    waitKeyFor = keyFor;
  }
  else {
    waitForKeyInput = 0;
    waitKeyFor = 0;
  }
};

function newKeyPressed(e) {
  if (waitForKeyInput == 1) {
    let kcode = (e.keyCode ? e.keyCode : e.which);

    if (waitKeyFor == newKeyForToggleCircle) {
      chrome.storage.sync.set(
        { showCircle: { key: e.key, keyCode: kcode } },
        function () {
          refreshShowCircleButton();
        });
      changeKeyBtn.value = 'Change bubble toggle button';
      changeKeyBtn.disabled = false;
    } else if (waitKeyFor == newKeyForDisableBubble) {
      chrome.storage.sync.set(
        { disableBubble: { key: e.key, keyCode: kcode } },
        function () {
          refreshDisableBubbleButton();
        });
        disableKeyBtn.value = 'Change disable bubble cursor button';
        disableKeyBtn.disabled = false;
    }

    waitForKeyInput = 0;
  }
}

document.getElementById('changeKeyBtn').addEventListener('click', function () { recordNewKey(newKeyForToggleCircle); });
document.getElementById('changeDisableKeyBtn').addEventListener('click', function () { recordNewKey(newKeyForDisableBubble); });
document.getElementById('bd').addEventListener('keypress', function () { newKeyPressed(event); });