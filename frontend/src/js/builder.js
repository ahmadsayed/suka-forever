window.addEventListener('DOMContentLoaded', async event => {
    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var scene = new BABYLON.Scene(engine);
    var advancedTexture = null;
    const WIDTH = 100, HEIGHT=50, TOP_FACTOR=0.9;
    var button = BABYLON.GUI.Button.CreateImageButton("downlaod", "Download", "assets/img/download.png");
    var picker = null;
    var pickerTitle = null;

    function getPicker(mesh) {
        const PICKER_HEIGHT = 200, PICKER_WIDTH = 200;

        if (picker == null) {
            pickerTitle = new BABYLON.GUI.TextBlock();
            pickerTitle.text = "";
            pickerTitle.height = "30px";
            pickerTitle.isVisible = false;
                        
            picker = new BABYLON.GUI.ColorPicker();
            //picker.value = skullMaterial.diffuseColor;
            picker.height = `${PICKER_HEIGHT}px`;
            picker.width = `${PICKER_WIDTH}px`;
            picker.isVisible = false;

            advancedTexture.addControl(picker);
            advancedTexture.addControl(pickerTitle);

        }
        picker.top = `${window.innerHeight / 2 - ((PICKER_HEIGHT * 2))}px`;
        picker.left = pickerTitle.left = `${window.innerWidth / 2 - PICKER_WIDTH}px`;
        pickerTitle.top = `${window.innerHeight / 2 - ((PICKER_HEIGHT * 2.6))}px`;
        
        picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        picker.onValueChangedObservable.clear();
        if (mesh != null) {
            pickerTitle.text = mesh.material.name;

            picker.value = mesh.material.albedoColor;
            picker.onValueChangedObservable.add(function(value) { // value is a color3
                mesh.material.albedoColor.copyFrom(value);
            });            
        }

        return picker;
    }


    function showPicker(mesh) {
        getPicker(mesh).isVisible = true;
        pickerTitle.isVisible = true;
    }

    function hidePicker(mesh) {
        getPicker(mesh).isVisible = false;
        pickerTitle.isVisible = false;
    }
    function createMenu(button, index) {
        button.width = `${WIDTH}px`;
        button.height = `${HEIGHT}px`;
        button.color = "white";
        button.fontSize = 15;
        button.background = "gray";
        button.top = (window.innerHeight / 2) - WIDTH * TOP_FACTOR;
        button.left = index * WIDTH;
        button.onPointerClickObservable.add(() => {
            //  window.location.reload();
            BABYLON.GLTF2Export.GLBAsync(scene, "suka").then((glb) => {
                glb.downloadFiles();
              });
        });        
        advancedTexture.addControl(button);
    }

    function resize(button, index) {

        button.top = (window.innerHeight / 2) - HEIGHT * TOP_FACTOR;
        button.left = index * WIDTH;

    }

    async function createScene() {

        var environment = scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false,
            skyboxSize: 1,
            skyboxColor: BABYLON.Color3.White(),
            enableGroundShadow: false,
            groundYBias: 1
        });
        var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2, 8, new BABYLON.Vector3(0, 0, 0), scene);

        BABYLON.SceneLoader.ImportMesh("", "assets/glb/", "suka.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
            newMeshes.forEach(mesh => {
                if (mesh.name == "__root__") {
                    root = mesh;
                    mesh.position.y -=2;
                    mesh.position.z -=1;
                }
                //root.position.y -= 2;
            })
        });
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
        advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        scene.clearColor = new BABYLON.Color3(0.2, 0.2, 0.2);

        return scene;
    };
    await createScene(); 
    createMenu(button, 0); 
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
        
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
        resize(button, 0);
    });
    window.addEventListener("auxclick", function () {
        // We try to pick an object
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        // We try to pick an object
        if (pickResult.hit) {
            // pickResult.pickedMesh.name;
            console.log(pickResult.pickedMesh.material);
            showPicker(pickResult.pickedMesh);
        }  else {
            hidePicker();
        }
    });    

    window.addEventListener("click", function () {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        // We try to pick an object
        if (!pickResult.hit) {
           // getPicker().isVisible = false;
        }
    });   
    
   scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {

          case BABYLON.KeyboardEventTypes.KEYUP:
            console.log("KEY UP: ", kbInfo.event.code);
            if (kbInfo.event.code == "Escape") {
                hidePicker();
            }
            break;
        }
      });
});