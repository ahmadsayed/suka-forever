window.addEventListener('DOMContentLoaded', event => {
    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var scene = new BABYLON.Scene(engine);
    var advancedTexture = null;

    function createMenu() {
        const width = 100;
        const height = 50;
        var downloadButton = BABYLON.GUI.Button.CreateImageButton("downlaod", "Download", "assets/img/download.png");
        downloadButton.width = `${width}px`;
        downloadButton.height = `${height}px`;
        downloadButton.color = "white";
        downloadButton.fontSize = 15;
        downloadButton.background = "gray";
        downloadButton.top = (window.innerHeight / 2) - height * 3;
        downloadButton.left = -width;
        advancedTexture.addControl(downloadButton);
    }

    function createScene() {

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
        advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        return scene;
    };
    createScene(); 
    createMenu(); 
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
});