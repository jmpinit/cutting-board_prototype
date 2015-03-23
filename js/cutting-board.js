document.addEventListener('DOMContentLoaded', function() {
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    var SCREEN_WIDTH = window.innerWidth;
    var SCREEN_HEIGHT = window.innerHeight;
    var FLOOR = 0;

    var container;

    var camera, scene;
    var webglRenderer;

    var cube, geometry;

    var mouseX = 0, mouseY = 0;
    var mousemoveX = 0, mousemoveY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

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

        container = document.createElement('div');
        document.body.appendChild(container);

        // camera
        camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000);
        camera.position.z = 5;

        //scene
        scene = new THREE.Scene();

        // lights
        var ambient = new THREE.AmbientLight(0xffffff);
        scene.add(ambient);

        // more lights
        var directionalLight = new THREE.DirectionalLight( 0xffeedd );
        directionalLight.position.set(0, -70, 100).normalize();
        scene.add(directionalLight);

        // renderer
        webglRenderer = new THREE.WebGLRenderer();
        webglRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        webglRenderer.domElement.style.position = "relative";
        container.appendChild( webglRenderer.domElement );

        // scene
        createScene(new THREE.BoxGeometry( 1, 1, 1 ));
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
        cube.rotation.y = mouseX / SCREEN_WIDTH;
        cube.rotation.x = mouseY / SCREEN_HEIGHT;
        webglRenderer.render(scene, camera);
    }
});
