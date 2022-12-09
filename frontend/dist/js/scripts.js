/*!
* Start Bootstrap - Business Casual v7.0.8 (https://startbootstrap.com/theme/business-casual)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-business-casual/blob/master/LICENSE)
*/

// Highlights current date on contact page
window.addEventListener('DOMContentLoaded', event => {

    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
       
        var environment = scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false,
            skyboxSize: 1,
            skyboxColor: BABYLON.Color3.White(),
            enableGroundShadow: false,
            groundYBias: 1
        });
        //scene.ambientColor = BABYLON.Color3.White();
        scene.clearColor = new BABYLON.Color4(0.0, 0.0, 0.0, 0.0);
        //var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 40, new BABYLON.Vector3(0, 0, 0), scene);
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 2.5, 6.5), scene);
        // This targets the camera to scene origin
        camera.setTarget(new BABYLON.Vector3(0, 0.2, 0));


        let scrollHeight = canvas.scrollHeight;
        let stop = false;
        BABYLON.SceneLoader.ImportMesh("", "/assets/glb/", "intro.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
            animationGroups.forEach(animation => {
                animation.stop();
            });
            window.addEventListener("scroll", (event) => {
                let position = this.scrollY;
                if (!stop)
                    camera.setTarget(new BABYLON.Vector3(0, 0.2 + (position / (scrollHeight / 6)), 0));
                //camera.position.y = camera.position.y + (position/(scrollHeight/6))
                animationGroups.forEach(animation => {
                    let key = ((position / scrollHeight) * animation.to) * 3.5
                    if (key < animation.to && key > 0) {
                        stop = false;
                        animation.start(false, 1, key, key, false);
                    } else if (animation.to > 0) {
                        stop = true;
                    }
                });
            });
        });
        return scene;
    };

    // Add your code here matching the playground format

    const scene = createScene(); //Call the createScene function

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
})

