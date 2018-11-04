(function () {
    var showCirc = false;
    var timeoutId = null;
    // [rect:{top:0, left:0, right:0, bottom:0, element:<anchor>}, ...]
    var links = [];
    var prevClosest = null;
    var clicked = false;
    var circ;
    var refreshId = null;
    var lastMousePos = null;

    let pointPointDist = function (x1, y1, x2, y2) {
        var x = x1 - x2;
        var y = y1 - y2;
        return Math.sqrt(x * x + y * y);
    };

    pointRectDist = function (x, y, box) {
        var hori = (x >= box.left && x <= box.right);
        var vert = (y >= box.top && y <= box.bottom);

        // inside
        if (hori && vert) return 0;

        // edges are closest
        if (hori) {
            if (y < box.top) return box.top - y;
            else return y - box.bottom;
        }
        if (vert) {
            if (x < box.left) return box.left - x;
            else return x - box.right;
        }

        // corners
        if (y < box.top && x < box.left) //top left
            return pointPointDist(box.left, box.top, x, y);
        else if (y < box.top && x > box.right) // top right
            return pointPointDist(box.right, box.top, x, y);
        else if (y > box.bottom && x > box.right) // bottom right
            return pointPointDist(box.right, box.bottom, x, y);
        else if (y > box.bottom && x < box.left) // bottom left
            return pointPointDist(box.left, box.bottom, x, y);

        return "ERROR";
    };

    let createCircle = function () {
        circ = window.DomUtils.createElement('div');
        var props = {
            position: 'absolute', borderRadius: '999px',
            MozBorderRadius: '999px', WebkitBorderRadius: '999px',
            backgroundColor: 'rgba(128,128,128,0.4)', display: 'none'
        };

        for (var prop in props) {
            circ.style[prop] = props[prop];
        }

        window.DomUtils.addElementList([circ], {});
    };

    let refreshLinks = function () {
        links = removeInvisibleLinks(window.LocalHints.getLocalHints(false));
        prevClosest = links[0];
    };

    let removeInvisibleLinks = function (tempLinks) {
        var visibleLinks = [];
        for (var i = 0; i < tempLinks.length; i++) {
            var area = tempLinks[i].rect.width * tempLinks[i].rect.height;
            if (area > 0) {
                var l = tempLinks[i];
                visibleLinks.push(l);
            }
        }
        return visibleLinks;
    };

    let loadSettings = function () {
        chrome.storage.sync.get(['bubbleCursor'], function (data) {
            if (data.bubbleCursor.enabled === true) {
                addBubbleCursorEvents();
            }
        });

        chrome.storage.sync.get(['persistent'], function (data) {
            showCirc = data.persistent.persistVisual;
            setBubbleVisibility(showCirc);
        });
    };

    let setBubbleVisibility = function (visible) {
        circ.style.display = visible ? 'block' : 'none';
    };

    let onKeyPress = function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        chrome.storage.sync.get(['showCircle'], function (obj) {
            if (code == obj.showCircle.keyCode) {
                showCirc = !showCirc;
                setBubbleVisibility(showCirc);
                chrome.storage.sync.set({ persistent: { persistVisual: showCirc } }, function () {
                });
            }
        });

        chrome.storage.sync.get(['disableBubble'], function (obj) {
            if (code == obj.disableBubble.keyCode) {
                removeBubbleCursorEvents();

            }
        });
    };

    let onClick = function (e) {
        if (!clicked) {
            clicked = true;
            window.DomUtils.simulateClick(prevClosest.element, null);
        }
    };

    let onMousemove = function (e) {
        lastMousePos = e;
        refreshBubble(lastMousePos);
    };

    let refreshBubble = function (mouse) {
        var closest;
        var closeDist = 9999;

        if (!mouse) {
            return;
        }
        for (var i = 0; i < links.length; i++) {
            var l = links[i];
            var dist = pointRectDist(mouse.pageX, mouse.pageY, l.rect);
            if (dist < closeDist) {
                closest = links[i];
                closeDist = dist;
            }
        }
        if (closest !== prevClosest) {
            prevClosest.element.style.outline = '';
            closest.element.style.outline = '3px solid #529DFF';
            prevClosest = closest;
        }
        if (showCirc) {
            circ.style.width = closeDist * 2 + "px";
            circ.style.height = closeDist * 2 + "px";
            circ.style.top = mouse.pageY - closeDist + "px";
            circ.style.left = mouse.pageX - closeDist + "px";
        }
    }

    let addBubbleCursorEvents = function () {
        document.addEventListener('keypress', onKeyPress, false);
        document.addEventListener('click', onClick, false);
        document.addEventListener('mousemove', onMousemove, false);
        refreshId = setInterval(refreshLinks, 300);
        refreshBubble(lastMousePos);
    };

    let removeBubbleCursorEvents = function () {
        document.removeEventListener('keypress', onKeyPress, false);
        document.removeEventListener('click', onClick, false);
        document.removeEventListener('mousemove', onMousemove, false);
        if (refreshId) {
            clearInterval(refreshId);
        }
        prevClosest.element.style.outline = '';
        window.DomUtils.removeElement(circ);
    };

    loadSettings();
    createCircle();

    //For tests
    window.pointRectDist = pointRectDist;
})();