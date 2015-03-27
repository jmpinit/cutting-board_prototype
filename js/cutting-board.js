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
        document.addEventListener('mousemove', function(event) { director.onMouseMove(event); });
        document.addEventListener('keypress', function(event) { director.onKeypress(event); });
    }

    function animate() {
        requestAnimationFrame(animate);
        director.render();
    }
});
