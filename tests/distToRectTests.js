//Test shortest distance to rect
var r = window.Rect.create(10, 10, 20, 15);

var areEqual = function (actual, expected) {
    var equal = Math.abs(actual - expected) < 0.01;
    if (equal === true) {
        console.log('Passing');
    } else {
        console.log('Failing');
        console.log('\tExpected: ' + expected + ' but actual: ' + actual);
    }
}


var testPointOnLeft = function () {
    console.log('testPointOnLeft');
    var point = { x: 5, y: 15 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 5)
};

var testPointOnBottomLeft = function () {
    console.log('testPointOnBottomLeft');
    var point = { x: 5, y: 20 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 7.07107);
};

var testPointOnBottom = function () {
    console.log('testPointOnBottom');
    var point = { x: 15, y: 20 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 5);
};

var testPointOnBottomRight = function () {
    console.log('testPointOnBottomRight');
    var point = { x: 25, y: 20 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 7.07107);
};


var testPointOnRight = function () {
    console.log('testPointOnRight');
    var point = { x: 25, y: 15 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 5);
};


var testPointOnTopRight = function () {
    console.log('testPointOnTopRight');
    var point = { x: 25, y: 5 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 7.07107);
};

var testPointOnTop = function () {
    console.log('testPointOnTop');
    var point = { x: 15, y: 5 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 5);
};

var testPointOnTopLeft = function () {
    console.log('testPointOnTopLeft');
    var point = { x: 5, y: 5 };
    var dist = window.pointRectDist(point.x, point.y, r);
    areEqual(dist, 7.07107);
};

testPointOnLeft();
testPointOnBottomLeft();
testPointOnBottom();
testPointOnBottomRight();
testPointOnRight();
testPointOnTopRight();
testPointOnTop();
testPointOnTopLeft();
