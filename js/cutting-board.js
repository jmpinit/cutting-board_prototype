"use strict";

var Director = require('./js/Director');

document.addEventListener('DOMContentLoaded', function() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var director;

    window.onresize = function(event) {
        if(director !== undefined)
            director.resize(window.innerWidth, window.innerHeight);
    };

    init();

    function init() {
        var closeEl = document.querySelector(".close");

        if (closeEl) {
            closeEl.addEventListener('click', function() {
                window.close();
            });
        }

        director = new Director(THREE, window.innerWidth, window.innerHeight);

        director.load("tests/blu-ray", function() {
            var container = document.createElement('div');
            document.body.appendChild(container);
            container.appendChild(director.target);

            animate();
            console.log("director loaded scene.");
        });

        document.addEventListener('mousewheel', function(event) { director.onMouseWheel(event); });
    }

    function animate() {
        requestAnimationFrame(animate);
        director.render();
    }

    /*function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);

        document.pointerLockElement =
        document.pointerLockElement ||
        document.mozPointerLockElement ||
        document.webkitPointerLockElement;

        if (document.pointerLockElement) {
            mousemoveX += event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            mousemoveY += event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        }

        var vector = new THREE.Vector3(mouseX / SCREEN_WIDTH * 2, -mouseY / SCREEN_HEIGHT * 2, 0.5);

        vector.unproject(camera);
        var blah = vector.sub(camera.position).normalize();
        var ray = new THREE.Ray(camera.position, blah);
        var pos = ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));

        pointer.translateX(0.1);
        pointer.translateY(0.0);
        //pointer.geometry.verticesNeedUpdate = true;
    }*/
});
