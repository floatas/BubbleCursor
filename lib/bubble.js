(function () {
    var pointPointDist = function (x1, y1, x2, y2) {
        var x = x1 - x2;
        var y = y1 - y2;
        return Math.sqrt(x * x + y * y);
    };

    var pointRectDist = function (x, y, box) {
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

    // Setup
    var circ = document.createElement('div');
    var props = {
        position: 'absolute', borderRadius: '999px',
        MozBorderRadius: '999px', WebkitBorderRadius: '999px',
        backgroundColor: 'rgba(128,128,128,0.4)', display: 'none'
    };
    for (var prop in props) {
        circ.style[prop] = props[prop];
    }

    document.body.appendChild(circ);
    var showCirc = false;
    var timeoutId = null;

    window.addEventListener('scroll', function (e) {
        if (timeoutId) {
            this.clearTimeout(timeoutId);
        }

        timeoutId = this.setTimeout(refreshLink, 250);
    });

    let refreshLink = function () {
        links = window.LocalHints.getLocalHints(false);
    }

    // [rect:{top:0, left:0, right:0, bottom:0, element:<anchor>}, ...]
    var links = window.LocalHints.getLocalHints(false);

    var prevClosest = links[0];

    var clicked = false;

    var setBubbleVisibility = function (visible) {
        if (!visible) circ.style.display = 'none';
        else circ.style.display = 'block';
    };

    document.addEventListener('keypress', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        chrome.storage.sync.get(['showCircle'], function (obj) {
            if (code == obj.showCircle.keyCode) {
                showCirc = !showCirc;
                setBubbleVisibility(showCirc);
                chrome.storage.sync.set({ persistent: { persistVisual: showCirc } }, function () {
                });
            }
        });
    }, false);

    clicked = false;

    let addBubbleCursorEvents = function () {
        document.addEventListener('click', function (e) {
            if (!clicked) {
                clicked = true;
                window.DomUtils.simulateClick(prevClosest.element, null);
            }
        }, false);

        document.addEventListener('mousemove', function (e) {
            var closest;
            var closeDist = 9999;

            for (var i = 0; i < links.length; i++) {
                var l = links[i];
                var dist = pointRectDist(e.pageX, e.pageY, l.rect);
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
                circ.style.top = e.pageY - closeDist + "px";
                circ.style.left = e.pageX - closeDist + "px";
            }
        }, false);
    };

    chrome.storage.sync.get(['bubbleCursor'], function (data) {
        if (data.bubbleCursor.enabled === true) {
            addBubbleCursorEvents();
        }
    });

    chrome.storage.sync.get(['persistent'], function (data) {
        showCirc = data.persistent.persistVisual;
        setBubbleVisibility(showCirc);
    });
})();