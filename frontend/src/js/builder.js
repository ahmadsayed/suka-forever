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
        var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2, 10, new BABYLON.Vector3(0, 0, 0), scene);
        BABYLON.SceneLoader.ImportMesh("", "assets/glb/", "suka.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        });
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        return scene;
    };
    const scene = createScene(); //Call the createScene function

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
});