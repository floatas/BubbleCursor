(function () {


    Rect = {
        create: function (x1, y1, x2, y2) {
            return {
                bottom: y2,
                top: y1,
                left: x1,
                right: x2,
                width: x2 - x1,
                height: y2 - y1
            };
        },
        copy: function (rect) {
            return {
                bottom: rect.bottom,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height
            };
        },
        translate: function (rect, x, y) {
            if (x == null) {
                x = 0;
            }
            if (y == null) {
                y = 0;
            }
            return {
                bottom: rect.bottom + y,
                top: rect.top + y,
                left: rect.left + x,
                right: rect.right + x,
                width: rect.width,
                height: rect.height
            };
        },
        subtract: function (rect1, rect2) {
            var rects;
            rect2 = this.create(Math.max(rect1.left, rect2.left), Math.max(rect1.top, rect2.top), Math.min(rect1.right, rect2.right), Math.min(rect1.bottom, rect2.bottom));
            if (rect2.width < 0 || rect2.height < 0) {
                return [Rect.copy(rect1)];
            }
            rects = [this.create(rect1.left, rect1.top, rect2.left, rect2.top), this.create(rect2.left, rect1.top, rect2.right, rect2.top), this.create(rect2.right, rect1.top, rect1.right, rect2.top), this.create(rect1.left, rect2.top, rect2.left, rect2.bottom), this.create(rect2.right, rect2.top, rect1.right, rect2.bottom), this.create(rect1.left, rect2.bottom, rect2.left, rect1.bottom), this.create(rect2.left, rect2.bottom, rect2.right, rect1.bottom), this.create(rect2.right, rect2.bottom, rect1.right, rect1.bottom)];
            return rects.filter(function (rect) {
                return rect.height > 0 && rect.width > 0;
            });
        },
        intersects: function (rect1, rect2) {
            return rect1.right > rect2.left && rect1.left < rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
        },
        intersectsStrict: function (rect1, rect2) {
            return rect1.right >= rect2.left && rect1.left <= rect2.right && rect1.bottom >= rect2.top && rect1.top <= rect2.bottom;
        },
        equals: function (rect1, rect2) {
            var i, len, property, ref;
            ref = ["top", "bottom", "left", "right", "width", "height"];
            for (i = 0, len = ref.length; i < len; i++) {
                property = ref[i];
                if (rect1[property] !== rect2[property]) {
                    return false;
                }
            }
            return true;
        },
        intersect: function (rect1, rect2) {
            return this.create(Math.max(rect1.left, rect2.left), Math.max(rect1.top, rect2.top), Math.min(rect1.right, rect2.right), Math.min(rect1.bottom, rect2.bottom));
        }
    };

    if (window.forTrusted == null) {
        window.forTrusted = function (handler) {
            return function (event) {
                if (event != null ? event.isTrusted : void 0) {
                    return handler.apply(this, arguments);
                } else {
                    return true;
                }
            };
        };
    }

    DomUtils = {
        documentReady: (function () {
            var callbacks, isReady, onDOMContentLoaded, ref;
            ref = [document.readyState !== "loading", []], isReady = ref[0], callbacks = ref[1];
            if (!isReady) {
                window.addEventListener("DOMContentLoaded", onDOMContentLoaded = forTrusted(function () {
                    var callback, i, len;
                    window.removeEventListener("DOMContentLoaded", onDOMContentLoaded);
                    isReady = true;
                    for (i = 0, len = callbacks.length; i < len; i++) {
                        callback = callbacks[i];
                        callback();
                    }
                    return callbacks = null;
                }));
            }
            return function (callback) {
                if (isReady) {
                    return callback();
                } else {
                    return callbacks.push(callback);
                }
            };
        })(),
        documentComplete: (function () {
            var callbacks, isComplete, onLoad, ref;
            ref = [document.readyState === "complete", []], isComplete = ref[0], callbacks = ref[1];
            if (!isComplete) {
                window.addEventListener("load", onLoad = forTrusted(function () {
                    var callback, i, len;
                    window.removeEventListener("load", onLoad);
                    isComplete = true;
                    for (i = 0, len = callbacks.length; i < len; i++) {
                        callback = callbacks[i];
                        callback();
                    }
                    return callbacks = null;
                }));
            }
            return function (callback) {
                if (isComplete) {
                    return callback();
                } else {
                    return callbacks.push(callback);
                }
            };
        })(),
        createElement: function (tagName) {
            var element;
            element = document.createElement(tagName);
            if (element instanceof HTMLElement) {
                this.createElement = function (tagName) {
                    return document.createElement(tagName);
                };
                return element;
            } else {
                this.createElement = function (tagName) {
                    return document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
                };
                return this.createElement(tagName);
            }
        },
        addElementList: function (els, overlayOptions) {
            var el, i, len, parent;
            parent = this.createElement("div");
            if (overlayOptions.id != null) {
                parent.id = overlayOptions.id;
            }
            if (overlayOptions.className != null) {
                parent.className = overlayOptions.className;
            }
            for (i = 0, len = els.length; i < len; i++) {
                el = els[i];
                parent.appendChild(el);
            }
            document.documentElement.appendChild(parent);
            return parent;
        },
        removeElement: function (el) {
            return el.parentNode.removeChild(el);
        },
        isTopFrame: function () {
            return window.top === window.self;
        },
        makeXPath: function (elementArray) {
            var element, i, len, xpath;
            xpath = [];
            for (i = 0, len = elementArray.length; i < len; i++) {
                element = elementArray[i];
                xpath.push(".//" + element, ".//xhtml:" + element);
            }
            return xpath.join(" | ");
        },
        evaluateXPath: function (xpath, resultType) {
            var contextNode, namespaceResolver;
            contextNode = document.webkitIsFullScreen ? document.webkitFullscreenElement : document.documentElement;
            namespaceResolver = function (namespace) {
                if (namespace === "xhtml") {
                    return "http://www.w3.org/1999/xhtml";
                } else {
                    return null;
                }
            };
            return document.evaluate(xpath, contextNode, namespaceResolver, resultType, null);
        },
        getVisibleClientRect: function (element, testChildren) {
            var child, childClientRect, clientRect, clientRects, computedStyle, i, isInlineZeroHeight, j, len, len1, ref, ref1;
            if (testChildren == null) {
                testChildren = false;
            }
            clientRects = (function () {
                var i, len, ref, results;
                ref = element.getClientRects();
                results = [];
                for (i = 0, len = ref.length; i < len; i++) {
                    clientRect = ref[i];
                    results.push(Rect.copy(clientRect));
                }
                return results;
            })();
            isInlineZeroHeight = function () {
                var elementComputedStyle, isInlineZeroFontSize;
                elementComputedStyle = window.getComputedStyle(element, null);
                isInlineZeroFontSize = (0 === elementComputedStyle.getPropertyValue("display").indexOf("inline")) && (elementComputedStyle.getPropertyValue("font-size") === "0px");
                isInlineZeroHeight = function () {
                    return isInlineZeroFontSize;
                };
                return isInlineZeroFontSize;
            };
            for (i = 0, len = clientRects.length; i < len; i++) {
                clientRect = clientRects[i];
                if ((clientRect.width === 0 || clientRect.height === 0) && testChildren) {
                    ref = element.children;
                    for (j = 0, len1 = ref.length; j < len1; j++) {
                        child = ref[j];
                        computedStyle = window.getComputedStyle(child, null);
                        if (computedStyle.getPropertyValue("float") === "none" && !((ref1 = computedStyle.getPropertyValue("position")) === "absolute" || ref1 === "fixed") && !(clientRect.height === 0 && isInlineZeroHeight() && 0 === computedStyle.getPropertyValue("display").indexOf("inline"))) {
                            continue;
                        }
                        childClientRect = this.getVisibleClientRect(child, true);
                        if (childClientRect === null || childClientRect.width < 3 || childClientRect.height < 3) {
                            continue;
                        }
                        return childClientRect;
                    }
                } else {
                    clientRect = this.cropRectToVisible(clientRect);
                    if (clientRect === null || clientRect.width < 3 || clientRect.height < 3) {
                        continue;
                    }
                    computedStyle = window.getComputedStyle(element, null);
                    if (computedStyle.getPropertyValue('visibility') !== 'visible') {
                        continue;
                    }
                    return clientRect;
                }
            }
            return null;
        },
        cropRectToVisible: function (rect) {
            var boundedRect;
            boundedRect = Rect.create(Math.max(rect.left, 0), Math.max(rect.top, 0), rect.right, rect.bottom);
            //detect offscreen
            return boundedRect;
            if (boundedRect.top >= window.innerHeight - 4 || boundedRect.left >= window.innerWidth - 4) {
                return null;
            } else {
                return boundedRect;
            }
        },
        getClientRectsForAreas: function (imgClientRect, areas) {
            var area, coords, diff, i, len, r, rect, rects, ref, shape, x, x1, x2, y, y1, y2;
            rects = [];
            for (i = 0, len = areas.length; i < len; i++) {
                area = areas[i];
                coords = area.coords.split(",").map(function (coord) {
                    return parseInt(coord, 10);
                });
                shape = area.shape.toLowerCase();
                if (shape === "rect" || shape === "rectangle") {
                    x1 = coords[0], y1 = coords[1], x2 = coords[2], y2 = coords[3];
                } else if (shape === "circle" || shape === "circ") {
                    x = coords[0], y = coords[1], r = coords[2];
                    diff = r / Math.sqrt(2);
                    x1 = x - diff;
                    x2 = x + diff;
                    y1 = y - diff;
                    y2 = y + diff;
                } else if (shape === "default") {
                    ref = [0, 0, imgClientRect.width, imgClientRect.height], x1 = ref[0], y1 = ref[1], x2 = ref[2], y2 = ref[3];
                } else {
                    x1 = coords[0], y1 = coords[1], x2 = coords[2], y2 = coords[3];
                }
                rect = Rect.translate(Rect.create(x1, y1, x2, y2), imgClientRect.left, imgClientRect.top);
                rect = this.cropRectToVisible(rect);
                if (rect && !isNaN(rect.top)) {
                    rects.push({
                        element: area,
                        rect: rect
                    });
                }
            }
            return rects;
        },
        isSelectable: function (element) {
            var unselectableTypes;
            if (!(element instanceof Element)) {
                return false;
            }
            unselectableTypes = ["button", "checkbox", "color", "file", "hidden", "image", "radio", "reset", "submit"];
            return (element.nodeName.toLowerCase() === "input" && unselectableTypes.indexOf(element.type) === -1) || element.nodeName.toLowerCase() === "textarea" || element.isContentEditable;
        },
        isEditable: function (element) {
            var ref;
            return (this.isSelectable(element)) || ((ref = element.nodeName) != null ? ref.toLowerCase() : void 0) === "select";
        },
        isEmbed: function (element) {
            var ref, ref1;
            return (ref = (ref1 = element.nodeName) != null ? ref1.toLowerCase() : void 0) === "embed" || ref === "object";
        },
        isFocusable: function (element) {
            return element && (this.isEditable(element) || this.isEmbed(element));
        },
        isDOMDescendant: function (parent, child) {
            var node;
            node = child;
            while (node !== null) {
                if (node === parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        },
        isSelected: function (element) {
            var containerNode, node, selection;
            selection = document.getSelection();
            if (element.isContentEditable) {
                node = selection.anchorNode;
                return node && this.isDOMDescendant(element, node);
            } else {
                if (DomUtils.getSelectionType(selection) === "Range" && selection.isCollapsed) {
                    containerNode = selection.anchorNode.childNodes[selection.anchorOffset];
                    return element === containerNode;
                } else {
                    return false;
                }
            }
        },
        simulateSelect: function (element) {
            if (element === document.activeElement && DomUtils.isEditable(document.activeElement)) {
                return handlerStack.bubbleEvent("click", {
                    target: element
                });
            } else {
                element.focus();
                if (element.tagName.toLowerCase() !== "textarea") {
                    try {
                        if (element.selectionStart === 0 && element.selectionEnd === 0) {
                            return element.setSelectionRange(element.value.length, element.value.length);
                        }
                    } catch (error) { }
                }
            }
        },
        simulateClick: function (element, modifiers) {
            var defaultActionShouldTrigger, event, eventSequence, i, len, results;
            if (modifiers == null) {
                modifiers = {};
            }
            eventSequence = ["mouseover", "mousedown", "mouseup", "click"];
            results = [];
            for (i = 0, len = eventSequence.length; i < len; i++) {
                event = eventSequence[i];
                defaultActionShouldTrigger = Utils.isFirefox() && Object.keys(modifiers).length === 0 && event === "click" && element.target === "_blank" && element.href && !element.hasAttribute("onclick") && !element.hasAttribute("_vimium-has-onclick-listener") ? true : this.simulateMouseEvent(event, element, modifiers);
                if (event === "click" && defaultActionShouldTrigger && Utils.isFirefox()) {
                    if (0 < Object.keys(modifiers).length || element.target === "_blank") {
                        DomUtils.simulateClickDefaultAction(element, modifiers);
                    }
                }
                results.push(defaultActionShouldTrigger);
            }
            return results;
        },
        simulateMouseEvent: (function () {
            var lastHoveredElement;
            lastHoveredElement = void 0;
            return function (event, element, modifiers) {
                var mouseEvent;
                if (modifiers == null) {
                    modifiers = {};
                }
                if (event === "mouseout") {
                    if (element == null) {
                        element = lastHoveredElement;
                    }
                    lastHoveredElement = void 0;
                    if (element == null) {
                        return;
                    }
                } else if (event === "mouseover") {
                    this.simulateMouseEvent("mouseout", void 0, modifiers);
                    lastHoveredElement = element;
                }
                mouseEvent = document.createEvent("MouseEvents");
                mouseEvent.initMouseEvent(event, true, true, window, 1, 0, 0, 0, 0, modifiers.ctrlKey, modifiers.altKey, modifiers.shiftKey, modifiers.metaKey, 0, null);
                return element.dispatchEvent(mouseEvent);
            };
        })(),
        simulateClickDefaultAction: function (element, modifiers) {
            var altKey, ctrlKey, metaKey, newTabModifier, ref, shiftKey;
            if (modifiers == null) {
                modifiers = {};
            }
            if (!(((ref = element.tagName) != null ? ref.toLowerCase() : void 0) === "a" && (element.href != null))) {
                return;
            }
            ctrlKey = modifiers.ctrlKey, shiftKey = modifiers.shiftKey, metaKey = modifiers.metaKey, altKey = modifiers.altKey;
            if (KeyboardUtils.platform === "Mac") {
                newTabModifier = metaKey === true && ctrlKey === false;
            } else {
                newTabModifier = metaKey === false && ctrlKey === true;
            }
            if (newTabModifier) {
                chrome.runtime.sendMessage({
                    handler: "openUrlInNewTab",
                    url: element.href,
                    active: shiftKey === true
                });
            } else if (shiftKey === true && metaKey === false && ctrlKey === false && altKey === false) {
                chrome.runtime.sendMessage({
                    handler: "openUrlInNewWindow",
                    url: element.href
                });
            } else if (element.target === "_blank") {
                chrome.runtime.sendMessage({
                    handler: "openUrlInNewTab",
                    url: element.href,
                    active: true
                });
            }
        },
        addFlashRect: function (rect) {
            var flashEl;
            flashEl = this.createElement("div");
            flashEl.classList.add("vimiumReset");
            flashEl.classList.add("vimiumFlash");
            flashEl.style.left = rect.left + "px";
            flashEl.style.top = rect.top + "px";
            flashEl.style.width = rect.width + "px";
            flashEl.style.height = rect.height + "px";
            document.documentElement.appendChild(flashEl);
            return flashEl;
        },
        flashRect: function (rect) {
            var flashEl;
            flashEl = this.addFlashRect(rect);
            return setTimeout((function () {
                return DomUtils.removeElement(flashEl);
            }), 400);
        },
        getViewportTopLeft: function () {
            var box, clientLeft, clientTop, marginLeft, marginTop, rect, style;
            box = document.documentElement;
            style = getComputedStyle(box);
            rect = box.getBoundingClientRect();
            if (style.position === "static" && !/content|paint|strict/.test(style.contain || "")) {
                marginTop = parseInt(style.marginTop);
                marginLeft = parseInt(style.marginLeft);
                return {
                    top: -rect.top + marginTop,
                    left: -rect.left + marginLeft
                };
            } else {
                if (Utils.isFirefox()) {
                    clientTop = parseInt(style.borderTopWidth);
                    clientLeft = parseInt(style.borderLeftWidth);
                } else {
                    clientTop = box.clientTop, clientLeft = box.clientLeft;
                }
                return {
                    top: -rect.top - clientTop,
                    left: -rect.left - clientLeft
                };
            }
        },
        suppressPropagation: function (event) {
            return event.stopImmediatePropagation();
        },
        suppressEvent: function (event) {
            event.preventDefault();
            return this.suppressPropagation(event);
        },
        consumeKeyup: (function () {
            var handlerId;
            handlerId = null;
            return function (event, callback, suppressPropagation) {
                var code;
                if (callback == null) {
                    callback = null;
                }
                if (!event.repeat) {
                    if (handlerId != null) {
                        handlerStack.remove(handlerId);
                    }
                    code = event.code;
                    handlerId = handlerStack.push({
                        _name: "dom_utils/consumeKeyup",
                        keyup: function (event) {
                            if (event.code !== code) {
                                return handlerStack.continueBubbling;
                            }
                            this.remove();
                            if (suppressPropagation) {
                                DomUtils.suppressPropagation(event);
                            } else {
                                DomUtils.suppressEvent(event);
                            }
                            return handlerStack.continueBubbling;
                        },
                        blur: function (event) {
                            if (event.target === window) {
                                this.remove();
                            }
                            return handlerStack.continueBubbling;
                        }
                    });
                }
                if (typeof callback === "function") {
                    callback();
                }
                if (suppressPropagation) {
                    DomUtils.suppressPropagation(event);
                    return handlerStack.suppressPropagation;
                } else {
                    DomUtils.suppressEvent(event);
                    return handlerStack.suppressEvent;
                }
            };
        })(),
        getSelectionType: function (selection) {
            if (selection == null) {
                selection = document.getSelection();
            }
            return selection.type || (function () {
                if (selection.rangeCount === 0) {
                    return "None";
                } else if (selection.isCollapsed) {
                    return "Caret";
                } else {
                    return "Range";
                }
            })();
        },
        getElementWithFocus: function (selection, backwards) {
            var o, r, t;
            r = t = selection.getRangeAt(0);
            if (DomUtils.getSelectionType(selection) === "Range") {
                r = t.cloneRange();
                r.collapse(backwards);
            }
            t = r.startContainer;
            if (t.nodeType === 1) {
                t = t.childNodes[r.startOffset];
            }
            o = t;
            while (o && o.nodeType !== 1) {
                o = o.previousSibling;
            }
            t = o || (t != null ? t.parentNode : void 0);
            return t;
        },
        getSelectionFocusElement: function () {
            var sel;
            sel = window.getSelection();
            if (sel.focusNode == null) {
                return null;
            } else if (sel.focusNode === sel.anchorNode && sel.focusOffset === sel.anchorOffset) {
                return sel.focusNode.childNodes[sel.focusOffset];
            } else if (sel.focusNode.nodeType !== sel.focusNode.ELEMENT_NODE) {
                return sel.focusNode.parentElement;
            } else {
                return sel.focusNode;
            }
        },
        getContainingElement: function (element) {
            return (typeof element.getDestinationInsertionPoints === "function" ? element.getDestinationInsertionPoints()[0] : void 0) || element.parentElement;
        },
        windowIsTooSmall: function () {
            return window.innerWidth < 3 || window.innerHeight < 3;
        },
        injectUserCss: function () {

        }
    };


    browserInfo = typeof browser !== "undefined" && browser !== null ? (ref = browser.runtime) != null ? typeof ref.getBrowserInfo === "function" ? ref.getBrowserInfo() : void 0 : void 0 : void 0;

    Utils = {
        isFirefox: (function () {
            var isFirefox;
            isFirefox = false;
            if (browserInfo != null) {
                if (typeof browserInfo.then === "function") {
                    browserInfo.then(function (browserInfo) {
                        return isFirefox = (browserInfo != null ? browserInfo.name : void 0) === "Firefox";
                    });
                }
            }
            return function () {
                return isFirefox;
            };
        })(),
        firefoxVersion: (function () {
            var ffVersion;
            ffVersion = void 0;
            if (browserInfo != null) {
                if (typeof browserInfo.then === "function") {
                    browserInfo.then(function (browserInfo) {
                        return ffVersion = browserInfo != null ? browserInfo.version : void 0;
                    });
                }
            }
            return function () {
                return ffVersion;
            };
        })(),
        getCurrentVersion: function () {
            return chrome.runtime.getManifest().version;
        },
        isExtensionPage: function (win) {
            var ref1;
            if (win == null) {
                win = window;
            }
            try {
                return ((ref1 = win.document.location) != null ? ref1.origin : void 0) + "/" === chrome.extension.getURL("");
            } catch (error) { }
        },
        isBackgroundPage: function () {
            var base;
            return this.isExtensionPage() && (typeof (base = chrome.extension).getBackgroundPage === "function" ? base.getBackgroundPage() : void 0) === window;
        },
        escapeRegexSpecialCharacters: (function () {
            var escapeRegex;
            escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
            return function (str) {
                return str.replace(escapeRegex, "\\$&");
            };
        })(),
        escapeHtml: function (string) {
            return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },
        createUniqueId: (function () {
            var id;
            id = 0;
            return function () {
                return id += 1;
            };
        })(),
        hasChromePrefix: (function () {
            var chromePrefixes;
            chromePrefixes = ["about:", "view-source:", "extension:", "chrome-extension:", "data:"];
            return function (url) {
                var k, len, prefix;
                for (k = 0, len = chromePrefixes.length; k < len; k++) {
                    prefix = chromePrefixes[k];
                    if (url.startsWith(prefix)) {
                        return true;
                    }
                }
                return false;
            };
        })(),
        hasJavascriptPrefix: function (url) {
            return url.startsWith("javascript:");
        },
        hasFullUrlPrefix: (function () {
            var urlPrefix;
            urlPrefix = new RegExp("^[a-z][-+.a-z0-9]{2,}://.");
            return function (url) {
                return urlPrefix.test(url);
            };
        })(),
        decodeURIByParts: function (uri) {
            return uri.split(/(?=%)/).map(function (uriComponent) {
                try {
                    return decodeURIComponent(uriComponent);
                } catch (error) {
                    return uriComponent;
                }
            }).join("");
        },
        createFullUrl: function (partialUrl) {
            if (this.hasFullUrlPrefix(partialUrl)) {
                return partialUrl;
            } else {
                return "http://" + partialUrl;
            }
        },
        isUrl: function (str) {
            var dottedParts, hostName, lastPart, longTlds, match, ref1, specialHostNames, urlRegex;
            if (indexOf.call(str, ' ') >= 0) {
                return false;
            }
            if (this.hasFullUrlPrefix(str)) {
                return true;
            }
            urlRegex = new RegExp('^(?:([^:]+)(?::([^:]+))?@)?' + '([^:]+|\\[[^\\]]+\\])' + '(?::(\\d+))?$');
            longTlds = ['arpa', 'asia', 'coop', 'info', 'jobs', 'local', 'mobi', 'museum', 'name', 'onion'];
            specialHostNames = ['localhost'];
            match = urlRegex.exec((str.split('/'))[0]);
            if (!match) {
                return false;
            }
            hostName = match[3];
            if (indexOf.call(specialHostNames, hostName) >= 0) {
                return true;
            }
            if (indexOf.call(hostName, ':') >= 0) {
                return true;
            }
            dottedParts = hostName.split('.');
            if (dottedParts.length > 1) {
                lastPart = dottedParts.pop();
                if ((2 <= (ref1 = lastPart.length) && ref1 <= 3) || indexOf.call(longTlds, lastPart) >= 0) {
                    return true;
                }
            }
            if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostName)) {
                return true;
            }
            return false;
        },
        createSearchQuery: function (query) {
            if (typeof query === "string") {
                query = query.split(/\s+/);
            }
            return query.map(encodeURIComponent).join("+");
        },
        createSearchUrl: function (query, searchUrl) {
            if (searchUrl == null) {
                searchUrl = Settings.get("searchUrl");
            }
            if (!['%s', '%S'].some(function (token) {
                return searchUrl.indexOf(token) >= 0;
            })) {
                searchUrl += "%s";
            }
            searchUrl = searchUrl.replace(/%S/g, query);
            return searchUrl.replace(/%s/g, this.createSearchQuery(query));
        },
        extractQuery: (function (_this) {
            return function () {
                var httpProtocolRegexp, queryTerminator;
                queryTerminator = new RegExp("[?&#/]");
                httpProtocolRegexp = new RegExp("^https?://");
                return function (searchUrl, url) {
                    var k, len, ref1, suffix, suffixTerms;
                    url = url.replace(httpProtocolRegexp);
                    searchUrl = searchUrl.replace(httpProtocolRegexp);
                    ref1 = searchUrl.split("%s"), searchUrl = ref1[0], suffixTerms = 2 <= ref1.length ? slice.call(ref1, 1) : [];
                    if (!url.startsWith(searchUrl)) {
                        return null;
                    }
                    for (k = 0, len = suffixTerms.length; k < len; k++) {
                        suffix = suffixTerms[k];
                        if (!(0 <= url.indexOf(suffix))) {
                            return null;
                        }
                    }
                    try {
                        return url.slice(searchUrl.length).split(queryTerminator)[0].split("+").map(decodeURIComponent).join(" ");
                    } catch (error) {
                        return null;
                    }
                };
            };
        })(this)(),
        convertToUrl: function (string) {
            string = string.trim();
            if (Utils.hasChromePrefix(string)) {
                return string;
            } else if (Utils.hasJavascriptPrefix(string)) {
                if (Utils.haveChromeVersion("46.0.2467.2")) {
                    return string;
                } else {
                    return Utils.decodeURIByParts(string);
                }
            } else if (Utils.isUrl(string)) {
                return Utils.createFullUrl(string);
            } else {
                return Utils.createSearchUrl(string);
            }
        },
        isString: function (obj) {
            return typeof obj === 'string' || obj instanceof String;
        },
        distinctCharacters: function (str) {
            var ch, chars, index;
            chars = str.split("").sort();
            return ((function () {
                var k, len, results;
                results = [];
                for (index = k = 0, len = chars.length; k < len; index = ++k) {
                    ch = chars[index];
                    if (index === 0 || ch !== chars[index - 1]) {
                        results.push(ch);
                    }
                }
                return results;
            })()).join("");
        },
        compareVersions: function (versionA, versionB) {
            var a, b, i, k, ref1;
            versionA = versionA.split(".");
            versionB = versionB.split(".");
            for (i = k = 0, ref1 = Math.max(versionA.length, versionB.length); 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
                a = parseInt(versionA[i] || 0, 10);
                b = parseInt(versionB[i] || 0, 10);
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                }
            }
            return 0;
        },
        haveChromeVersion: function (required) {
            var chromeVersion, ref1;
            chromeVersion = (ref1 = navigator.appVersion.match(/Chrom(e|ium)\/(.*?) /)) != null ? ref1[2] : void 0;
            return chromeVersion && 0 <= Utils.compareVersions(chromeVersion, required);
        },
        zip: function (arrays) {
            return arrays[0].map(function (_, i) {
                return arrays.map(function (array) {
                    return array[i];
                });
            });
        },
        hasUpperCase: function (s) {
            return s.toLowerCase() !== s;
        },
        matchesAnyRegexp: function (regexps, string) {
            var k, len, re;
            for (k = 0, len = regexps.length; k < len; k++) {
                re = regexps[k];
                if (re.test(string)) {
                    return true;
                }
            }
            return false;
        },
        setTimeout: function (ms, func) {
            return setTimeout(func, ms);
        },
        nextTick: function (func) {
            return this.setTimeout(0, func);
        },
        makeIdempotent: function (func) {
            return function () {
                var args, base, previousFunc, ref1;
                args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
                return typeof (base = (ref1 = [func, null], previousFunc = ref1[0], func = ref1[1], ref1))[0] === "function" ? base[0].apply(base, args) : void 0;
            };
        },
        monitorChromeStorage: function (key, setter) {
            return typeof chrome !== "undefined" && chrome !== null ? chrome.storage.local.get(key, (function (_this) {
                return function (obj) {
                    if (obj[key] != null) {
                        setter(obj[key]);
                    }
                    return chrome.storage.onChanged.addListener(function (changes, area) {
                        var ref1;
                        if (((ref1 = changes[key]) != null ? ref1.newValue : void 0) != null) {
                            return setter(changes[key].newValue);
                        }
                    });
                };
            })(this)) : void 0;
        }
    };

    LocalHints = {
        getVisibleClickable: function (element) {
            var actionName, areas, areasAndRects, base1, clientRect, contentEditable, eventType, i, imgClientRects, isClickable, jsactionRule, jsactionRules, len, map, mapName, namespace, onlyHasTabIndex, possibleFalsePositive, reason, ref, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, role, ruleSplit, tabIndex, tabIndexValue, tagName, visibleElements;
            tagName = (ref = typeof (base1 = element.tagName).toLowerCase === "function" ? base1.toLowerCase() : void 0) != null ? ref : "";
            isClickable = false;
            onlyHasTabIndex = false;
            possibleFalsePositive = false;
            visibleElements = [];
            reason = null;
            if (tagName === "img") {
                mapName = element.getAttribute("usemap");
                if (mapName) {
                    imgClientRects = element.getClientRects();
                    mapName = mapName.replace(/^#/, "").replace("\"", "\\\"");
                    map = document.querySelector("map[name=\"" + mapName + "\"]");
                    if (map && imgClientRects.length > 0) {
                        areas = map.getElementsByTagName("area");
                        areasAndRects = DomUtils.getClientRectsForAreas(imgClientRects[0], areas);
                        visibleElements.push.apply(visibleElements, areasAndRects);
                    }
                }
            }
            if (((ref1 = (ref2 = element.getAttribute("aria-hidden")) != null ? ref2.toLowerCase() : void 0) === "" || ref1 === "true") || ((ref3 = (ref4 = element.getAttribute("aria-disabled")) != null ? ref4.toLowerCase() : void 0) === "" || ref3 === "true")) {
                return [];
            }
            if (this.checkForAngularJs == null) {
                this.checkForAngularJs = (function () {
                    var angularElements, i, k, len, len1, ngAttributes, prefix, ref5, ref6, separator;
                    angularElements = document.getElementsByClassName("ng-scope");
                    if (angularElements.length === 0) {
                        return function () {
                            return false;
                        };
                    } else {
                        ngAttributes = [];
                        ref5 = ['', 'data-', 'x-'];
                        for (i = 0, len = ref5.length; i < len; i++) {
                            prefix = ref5[i];
                            ref6 = ['-', ':', '_'];
                            for (k = 0, len1 = ref6.length; k < len1; k++) {
                                separator = ref6[k];
                                ngAttributes.push(prefix + "ng" + separator + "click");
                            }
                        }
                        return function (element) {
                            var attribute, l, len2;
                            for (l = 0, len2 = ngAttributes.length; l < len2; l++) {
                                attribute = ngAttributes[l];
                                if (element.hasAttribute(attribute)) {
                                    return true;
                                }
                            }
                            return false;
                        };
                    }
                })();
            }
            isClickable || (isClickable = this.checkForAngularJs(element));
            if (element.hasAttribute("onclick") || (role = element.getAttribute("role")) && ((ref5 = role.toLowerCase()) === "button" || ref5 === "tab" || ref5 === "link" || ref5 === "checkbox" || ref5 === "menuitem" || ref5 === "menuitemcheckbox" || ref5 === "menuitemradio") || (contentEditable = element.getAttribute("contentEditable")) && ((ref6 = contentEditable.toLowerCase()) === "" || ref6 === "contenteditable" || ref6 === "true")) {
                isClickable = true;
            }
            if (!isClickable && element.hasAttribute("jsaction")) {
                jsactionRules = element.getAttribute("jsaction").split(";");
                for (i = 0, len = jsactionRules.length; i < len; i++) {
                    jsactionRule = jsactionRules[i];
                    ruleSplit = jsactionRule.trim().split(":");
                    if ((1 <= (ref7 = ruleSplit.length) && ref7 <= 2)) {
                        ref8 = ruleSplit.length === 1 ? ["click"].concat(slice.call(ruleSplit[0].trim().split(".")), ["_"]) : [ruleSplit[0]].concat(slice.call(ruleSplit[1].trim().split(".")), ["_"]), eventType = ref8[0], namespace = ref8[1], actionName = ref8[2];
                        isClickable || (isClickable = eventType === "click" && namespace !== "none" && actionName !== "_");
                    }
                }
            }
            switch (tagName) {
                case "a":
                    isClickable = true;
                    break;
                case "textarea":
                    isClickable || (isClickable = !element.disabled && !element.readOnly);
                    break;
                case "input":
                    isClickable || (isClickable = !(((ref9 = element.getAttribute("type")) != null ? ref9.toLowerCase() : void 0) === "hidden" || element.disabled || (element.readOnly && DomUtils.isSelectable(element))));
                    break;
                case "button":
                case "select":
                    isClickable || (isClickable = !element.disabled);
                    break;
                case "label":
                    isClickable || (isClickable = (element.control != null) && !element.control.disabled && (this.getVisibleClickable(element.control)).length === 0);
                    break;
                // case "body":
                //     isClickable || (isClickable = element === document.body && !windowIsFocused() && window.innerWidth > 3 && window.innerHeight > 3 && ((ref10 = document.body) != null ? ref10.tagName.toLowerCase() : void 0) !== "frameset" ? reason = "Frame." : void 0);
                //     isClickable || (isClickable = element === document.body && windowIsFocused() && Scroller.isScrollableElement(element) ? reason = "Scroll." : void 0);
                //     break;
                case "img":
                    isClickable || (isClickable = (ref11 = element.style.cursor) === "zoom-in" || ref11 === "zoom-out");
                    break;
                case "div":
                case "ol":
                case "ul":
                    // isClickable || (isClickable = element.clientHeight < element.scrollHeight && Scroller.isScrollableElement(element) ? reason = "Scroll." : void 0);
                    break;
                case "details":
                    isClickable = true;
                    reason = "Open.";
            }
            if (!isClickable && 0 <= ((ref12 = element.getAttribute("class")) != null ? ref12.toLowerCase().indexOf("button") : void 0)) {
                possibleFalsePositive = isClickable = true;
            }
            tabIndexValue = element.getAttribute("tabindex");
            tabIndex = tabIndexValue === "" ? 0 : parseInt(tabIndexValue);
            if (!(isClickable || isNaN(tabIndex) || tabIndex < 0)) {
                isClickable = onlyHasTabIndex = true;
            }
            if (isClickable) {
                clientRect = DomUtils.getVisibleClientRect(element, true);
                if (clientRect !== null) {
                    visibleElements.push({
                        element: element,
                        rect: clientRect,
                        secondClassCitizen: onlyHasTabIndex,
                        possibleFalsePositive: possibleFalsePositive,
                        reason: reason
                    });
                }
            }
            return visibleElements;
        },
        getLocalHints: function (requireHref) {
            var descendantsToCheck, element, elements, hint, i, k, l, left, len, len1, len2, len3, localHints, m, negativeRect, nonOverlappingElements, position, rects, ref, ref1, top, visibleElement, visibleElements;
            if (!document.documentElement) {
                return [];
            }
            elements = document.documentElement.getElementsByTagName("*");
            visibleElements = [];
            for (i = 0, len = elements.length; i < len; i++) {
                element = elements[i];
                if (!(requireHref && !element.href)) {
                    visibleElement = this.getVisibleClickable(element);
                    visibleElements.push.apply(visibleElements, visibleElement);
                }
            }
            visibleElements = visibleElements.reverse();
            descendantsToCheck = [1, 2, 3];
            visibleElements = (function () {
                var k, len1, results;
                results = [];
                for (position = k = 0, len1 = visibleElements.length; k < len1; position = ++k) {
                    element = visibleElements[position];
                    if (element.possibleFalsePositive && (function () {
                        var _, candidateDescendant, index, l, len2;
                        index = Math.max(0, position - 6);
                        while (index < position) {
                            candidateDescendant = visibleElements[index].element;
                            for (l = 0, len2 = descendantsToCheck.length; l < len2; l++) {
                                _ = descendantsToCheck[l];
                                candidateDescendant = candidateDescendant != null ? candidateDescendant.parentElement : void 0;
                                if (candidateDescendant === element.element) {
                                    return true;
                                }
                            }
                            index += 1;
                        }
                        return false;
                    })()) {
                        continue;
                    }
                    results.push(element);
                }
                return results;
            })();
            localHints = nonOverlappingElements = [];
            while (visibleElement = visibleElements.pop()) {
                rects = [visibleElement.rect];
                for (k = 0, len1 = visibleElements.length; k < len1; k++) {
                    negativeRect = visibleElements[k].rect;
                    rects = (ref = []).concat.apply(ref, rects.map(function (rect) {
                        return Rect.subtract(rect, negativeRect);
                    }));
                }

                nonOverlappingElements.push(visibleElement);
            }
            ref1 = DomUtils.getViewportTopLeft(), top = ref1.top, left = ref1.left;
            for (l = 0, len2 = nonOverlappingElements.length; l < len2; l++) {
                hint = nonOverlappingElements[l];
                hint.rect.top += top;
                hint.rect.left += left;
            }

            return localHints;
        },
        generateLinkText: function (hint) {
            var element, linkText, nodeName, ref, showLinkText;
            element = hint.element;
            linkText = "";
            showLinkText = false;
            nodeName = element.nodeName.toLowerCase();
            if (nodeName === "input") {
                if ((element.labels != null) && element.labels.length > 0) {
                    linkText = element.labels[0].textContent.trim();
                    if (linkText[linkText.length - 1] === ":") {
                        linkText = linkText.slice(0, linkText.length - 1);
                    }
                    showLinkText = true;
                } else if (((ref = element.getAttribute("type")) != null ? ref.toLowerCase() : void 0) === "file") {
                    linkText = "Choose File";
                } else if (element.type !== "password") {
                    linkText = element.value;
                    if (!linkText && 'placeholder' in element) {
                        linkText = element.placeholder;
                    }
                }
            } else if (nodeName === "a" && !element.textContent.trim() && element.firstElementChild && element.firstElementChild.nodeName.toLowerCase() === "img") {
                linkText = element.firstElementChild.alt || element.firstElementChild.title;
                if (linkText) {
                    showLinkText = true;
                }
            } else if (hint.reason != null) {
                linkText = hint.reason;
                showLinkText = true;
            } else if (0 < element.textContent.length) {
                linkText = element.textContent.slice(0, 256);
            } else if (element.hasAttribute("title")) {
                linkText = element.getAttribute("title");
            } else {
                linkText = element.innerHTML.slice(0, 256);
            }
            return {
                linkText: linkText.trim(),
                showLinkText: showLinkText
            };
        }
    };

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

    // [rect:{top:0, left:0, right:0, bottom:0, element:<anchor>}, ...]
    var links = LocalHints.getLocalHints(false);

    var prevClosest = links[0];

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

    var clicked = false;
    document.addEventListener('click', function (e) {
        if (!clicked) {
            //clicked = true;
            location.href = prevClosest.element.href;
        }
    }, false);

    document.addEventListener('keypress', function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);

        if (code == 66 || code == 98) {
            showCirc = !showCirc;
            if (!showCirc) circ.style.display = 'none';
            else circ.style.display = 'block';
            return false;
        }
    }, false);
})();