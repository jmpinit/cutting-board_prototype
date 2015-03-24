document.addEventListener('DOMContentLoaded', function() {
    var lwip = require('lwip');

    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var SCREEN_WIDTH, SCREEN_HEIGHT;
    var windowHalfX, windowHalfY;

    function resized() {
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        if(webglRenderer !== undefined)
            webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    window.onresize = function(event) { resized(); };
    resized();

    var FLOOR = 0;

    var container;

    var camera, scene;
    var webglRenderer;

    var cube, geometry;

    var mouseX = 0, mouseY = 0;
    var mousemoveX = 0, mousemoveY = 0;

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousewheel', onDocumentMouseWheel, false);

    init();
    animate();

    function init() {
        var closeEl = document.querySelector(".close");

        if (closeEl) {
            closeEl.addEventListener('click', function() {
                window.close();
            });
        };

        // prevent default behavior from changing page on dropped file
        window.ondragover = function(e) { e.preventDefault(); return false };
        window.ondrop = function(e) { e.preventDefault(); return false };

        var holder = document.getElementById('holder');
        holder.ondragover = function () { this.className = 'hover'; return false; };
        holder.ondragleave = function () { this.className = ''; return false; };
        holder.ondrop = function (e) {
            e.preventDefault();

            for (var i = 0; i < e.dataTransfer.files.length; ++i) {
                console.log(e.dataTransfer.files[i].path);
            }

            var imagePath = e.dataTransfer.files[0].path;
            lwip.open(imagePath, function(err, image) {
                scene.remove(cube);
                var geometry = new THREE.BoxGeometry(image.width() / 500, image.height() / 500, 1);
                var texture = THREE.ImageUtils.loadTexture(imagePath);
                var material = new THREE.MeshLambertMaterial({ map: texture });
                cube = new THREE.Mesh(geometry, material);
                scene.add(cube);
                console.log(image.width(), image.height());
            });

            return false;
        };

        container = document.createElement('div');
        document.body.appendChild(container);

        // camera
        camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
        //camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 1000);
        camera.position.z = 5;

        //scene
        scene = new THREE.Scene();

        // lights
        var ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // renderer
        webglRenderer = new THREE.WebGLRenderer();
        webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        webglRenderer.domElement.style.position = "relative";
        container.appendChild(webglRenderer.domElement);

        // scene
        createScene(new THREE.BoxGeometry(10, 10, 1));
    }

    function createScene(geometry) {
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    }

    function onDocumentMouseDown(event) {
        document.body.requestPointerLock =
        document.body.requestPointerLock ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();
    }

    function onDocumentMouseUp(event) {
        document.exitPointerLock =
        document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock;
        document.exitPointerLock();
    }

    function onDocumentMouseWheel(event) {
        camera.position.z -= event.wheelDelta/120*3;
    }

    function onDocumentMouseMove(event) {
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
    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        webglRenderer.render(scene, camera);
    }
});
