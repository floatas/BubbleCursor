let toggleKey = document.getElementById('toggleKey');
let changeKeyBtn = document.getElementById('changeKeyBtn');

let refreshShowCircleButton = function () {
  chrome.storage.sync.get(['showCircle'], function (option) {
    toggleKey.innerText = option.showCircle.key;
  });
};

refreshShowCircleButton();

let waitForKeyInput = 0;
function recordNewKey() {
  if (waitForKeyInput == 0) {
    waitForKeyInput = 1;
    changeKeyBtn.value = 'Press any key';
    changeKeyBtn.disabled = true;
  }
  else {
    waitForKeyInput = 0;
  }
};

function asd(e) {
  if (waitForKeyInput == 1) {
    let kcode = (e.keyCode ? e.keyCode : e.which);
    chrome.storage.sync.set(
      { showCircle: { key: e.key, keyCode: kcode } },
      function () {
        refreshShowCircleButton();
      });
    changeKeyBtn.value = 'Change bubble toggle button';
    waitForKeyInput = 0;
    changeKeyBtn.disabled = false;
  }
}

document.getElementById('changeKeyBtn').addEventListener('click', function () { recordNewKey(); });
document.getElementById('bd').addEventListener('keypress', function () { asd(event); });