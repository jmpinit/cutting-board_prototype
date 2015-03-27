var async = require('async'),
    fs = require('fs'),
    path = require('path');

var jsonlint = require('jsonlint'),
    lwip = require('lwip');

function makeImageLayerBuilder(three, scene, filename) {
    return function(callback) {
        var texture = three.ImageUtils.loadTexture(filename);
        texture.minFilter = three.LinearFilter;

        var material = new three.MeshLambertMaterial({ map: texture });

        lwip.open(filename, function(err, image) {
            if (err) callback(err);

            var geometry = new three.BoxGeometry(image.width(), image.height(), 1);
            var mesh = new three.Mesh(geometry, material);
            scene.add(mesh);

            callback(null, {
                name: path.basename(filename),
                x: 0, y: 0,
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
        height: height,
    };

    this.cameraInfo = {
        distance: 2000,
        xAngle: 0,
        x: 0,
        y: 0
    };

    this.renderer = new this.three.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.position = "relative";

    this.target = this.renderer.domElement;
}

Director.prototype.render = function() {
    this.renderer.render(this.scene, this.camera);
}

Director.prototype.resize = function(width, height) {
    this.renderer.setSize(width, height);
    this.renderInfo.width = width;
    this.renderInfo.height = height;
}

Director.prototype.updateCamera = function() {
    var yAxis = new this.three.Vector3(0, 1, 0);
    var view = new this.three.Vector3(this.cameraInfo.x, this.cameraInfo.y, this.cameraInfo.distance);
    view.applyAxisAngle(yAxis, this.cameraInfo.xAngle);

    this.camera.position.x = view.x;
    this.camera.position.y = view.y;
    this.camera.position.z = view.z;

    this.camera.lookAt(new this.three.Vector3(this.cameraInfo.x, this.cameraInfo.y, 0));
}

Director.prototype.onMouseWheel = function(event) {
    this.cameraInfo.distance -= event.wheelDelta;
    this.updateCamera();
}

Director.prototype.onMouseMove = function(event) {
    var mouseX = (event.clientX - this.renderInfo.width / 2);
    var mouseY = (event.clientY - this.renderInfo.height / 2);

    var mousePos = new this.three.Vector3(mouseX / this.renderInfo.width * 2, -mouseY / this.renderInfo.height * 2, 0.5);

    /*vector.unproject(this.camera);
    var blah = vector.sub(this.camera.position).normalize();
    var ray = new this.three.Ray(this.camera.position, blah);
    var pos = ray.intersectPlane(new this.three.Plane(new this.three.Vector3(0, 0, 1), 0));*/

    this.cameraInfo.xAngle = Math.PI * (mouseX / this.renderInfo.width);

    this.updateCamera();
}

Director.prototype.onKeypress = function(event) {
    var char = String.fromCharCode(event.charCode);

    switch(char) {
        case 'w':
            this.cameraInfo.y += 10;
            this.updateCamera();
            break;
        case 'a':
            this.cameraInfo.x -= 10;
            this.updateCamera();
            break;
        case 's':
            this.cameraInfo.y -= 10;
            this.updateCamera();
            break;
        case 'd':
            this.cameraInfo.x += 10;
            this.updateCamera();
            break;
    }
}

Director.prototype.load = function(fn, callback) {
    this.scene = new this.three.Scene();

    this.camera = new this.three.PerspectiveCamera(75, this.renderInfo.width / this.renderInfo.height, 0.1, 5000);
    this.camera.position.z = 2000;

    var ambient = new this.three.AmbientLight(0xffffff);
    this.scene.add(ambient);

    var three = this.three;
    var scene = this.scene;

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
            function buildFeatureLayer() {
                if(this.imageLayers === undefined || this.imageLayers.length === 0) {
                    console.log("no image layers to base feature coordinate system on.");
                    return;
                }

                var halfWidth = this.imageLayers[0].width / 2;
                var halfHeight = this.imageLayers[0].height / 2;

                var offsetX = this.imageLayers[0].x;
                var offsetY = this.imageLayers[0].y;

                for (var i = 0; i < layer.features.length; i++) {
                    var feature = layer.features[i];

                    switch(feature.type) {
                        case "device":
                            var pts = [];
                            for(var j in feature.outline) {
                                var pt = feature.outline[j];
                                pts.push(new three.Vector2(offsetX + -halfWidth + pt[0], offsetY + halfHeight - pt[1]));
                            }
                            var shape = new three.Shape(pts);
                            var geometry = new three.ExtrudeGeometry(shape, {amount: 1});
                            var material = new three.MeshBasicMaterial({ color: 0xffff00, wireframe: true});
                            var mesh = new three.Mesh(geometry, material);
                            scene.add(mesh);
                            break;

                        case "copper":
                            var pts = [];
                            for(var j in feature.outline) {
                                var pt = feature.outline[j];
                                pts.push(new three.Vector2(offsetX + -halfWidth + pt[0], offsetY + halfHeight - pt[1]));
                            }
                            var shape = new three.Shape(pts);
                            var geometry = new three.ExtrudeGeometry(shape, {amount: 1});
                            var material = new three.MeshBasicMaterial({ color: 0xffff00, wireframe: true});
                            var mesh = new three.Mesh(geometry, material);
                            scene.add(mesh);
                            break;

                        case "via":
                            var geometry = new three.CylinderGeometry(5, 5, 20, 32);
                            var material = new three.MeshBasicMaterial( {color: 0xff00ff} );
                            var cylinder = new three.Mesh( geometry, material );

                            var x = offsetX + -halfWidth + feature.position[0];
                            var y = offsetY + halfHeight - feature.position[1];

                            cylinder.translateX(x);
                            cylinder.translateY(y);
                            cylinder.rotateOnAxis(new three.Vector3(1, 0, 0), Math.PI / 2);

                            scene.add(cylinder);

                            break;
                    }
                }
            }

            // construct image layers

            var imageLayerBuilders = [];
            for (var i = 0; i < layer.images.length; i++) {
                var imagePath = path.join(fn, layer.images[i]);
                imageLayerBuilders.push(makeImageLayerBuilder(three, scene, imagePath));
            }

            async.parallel(imageLayerBuilders, function(err, results) {
                this.imageLayers = results;
                console.log("images layers constructed!", results);
                buildFeatureLayer();
            });
        });
    });

    callback();
}

module.exports = Director;
