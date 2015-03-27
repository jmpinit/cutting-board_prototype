var async = require('async'),
    fs = require('fs'),
    path = require('path');

var jsonlint = require('jsonlint'),
    lwip = require('lwip');

/*{
    device: function(context, data) {
        var geometry = new THREE.BoxGeometry(10, 10, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        return new THREE.Mesh(geometry, material);
    },

    pin: function(context, data) {

    },

    via: function(context, data) {

    },

    copper: function(context, data) {

    }
}*/

function makeImageLayerBuilder(three, scene, filename) {
    return function(callback) {
        var texture = three.ImageUtils.loadTexture(filename);
        texture.minFilter = three.LinearFilter;

        var material = new three.MeshLambertMaterial({ map: texture });

        lwip.open(filename, function(err, image) {
            if (err) callback(err);

            var geometry = new three.BoxGeometry(image.width() / 500, image.height() / 500, 1);
            var mesh = new three.Mesh(geometry, material);
            scene.add(mesh);

            callback(null, {
                name: path.basename(filename),
                width: image.width(),
                height: image.height(),
                mesh: mesh
            });
        });
    }
}

function Director(three, width, height) {
    this.three = three;

    this.renderInfo = {
        width: width,
        height: height
    };

    this.renderer = new this.three.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.position = "relative";

    this.target = this.renderer.domElement;

    /*(function() {
        var geometry = new this.three.BoxGeometry(0.01, 0.1, 2);
        var material = new this.three.MeshBasicMaterial({ color: 0xff00ff });
        pointer = new this.three.Mesh(geometry, material);
        scene.add(pointer);
    })();*/
}

Director.prototype.load = function(fn, callback) {
    this.scene = new this.three.Scene();

    this.camera = new this.three.PerspectiveCamera(75, this.renderInfo.width / this.renderInfo.height, 0.1, 1000);
    this.camera.position.z = 5;

    var ambient = new this.three.AmbientLight(0xffffff);
    this.scene.add(ambient);

    var three = this.three;
    var scene = this.scene;

    /*(function() {
        var geometry = new three.BoxGeometry(10, 10, 1);
        var material = new three.MeshBasicMaterial({ color: 0x00ff00 });
        cube = new three.Mesh(geometry, material);
        scene.add(cube);
    })();*/

    fs.readFile(path.join(fn, 'pcbs.json'), 'utf8', function(err, data) {
        if (err) {
            // FIXME callback with error
            console.log(err.message);
            return;
        }

        try {
            pcbs = jsonlint.parse(data);
        } catch (err) {
            // FIXME callback with error
            console.log(err.message);
            return;
        }

        if(pcbs["signal-layers"] === undefined)
            throw new Error("no signal-layers!");

        async.each(pcbs["signal-layers"], function(layer, callback) {
            var imageLayerBuilders = [];
            for (var i = 0; i < layer.images.length; i++) {
                var imagePath = path.join(fn, layer.images[i]);
                imageLayerBuilders.push(makeImageLayerBuilder(three, scene, imagePath));
            }

            // construct image layers
            async.parallel(imageLayerBuilders, function(err, results) {
                console.log("images layers constructed!", results);
            });
        });
    });

    callback();
}

Director.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
}

Director.prototype.resize = function(width, height) {
    this.renderer.setSize(width, height);
    this.renderInfo.width = width;
    this.renderInfo.height = height;
}

module.exports = Director;
