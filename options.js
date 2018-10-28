let page = document.getElementById('buttonDiv');
const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];
function constructOptions(kButtonColors) {
  for (let item of kButtonColors) {
    let button = document.createElement('button');
    button.style.backgroundColor = item;
    button.addEventListener('click', function() {
      chrome.storage.sync.set({color: item}, function() {
        console.log('color is ' + item);
      })
    });
    page.appendChild(button);
  }
}
constructOptions(kButtonColors);
flag=0;
kcode=0;
function rec(){
  if (flag == 0)
    {
      flag=1;
      alert("Recording started, please press any character key. After pressing the key, recording will be stopped and saved. The key will be case sensitive.");
    }
    else
    {
      flag=0;
      alert("Stopped recording key");
    }
  }
function asd(e){
  if (flag == 1)   {
    let kcode = (e.keyCode ? e.keyCode : e.which);
      chrome.storage.sync.set({"key": kcode}, function() {
          alert('key is ' + e.key);
      });
      flag=0;
    }
  }
document.getElementById('btn').addEventListener('click', function() {rec();});
document.getElementById('bd').addEventListener('keypress', function() {asd(event);});