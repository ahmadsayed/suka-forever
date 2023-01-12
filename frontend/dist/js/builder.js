window.addEventListener('DOMContentLoaded', async event => {
    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var scene = new BABYLON.Scene(engine);
    var advancedTexture =  BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const  TOP_FACTOR=0.8;

    var picker = null;
    var pickerTitle = null;
    var rightClick = BABYLON.GUI.Button.CreateImageButton("rightClick", "Right click to change color", "assets/img/rightClick.png");
    var leftClick = BABYLON.GUI.Button.CreateImageButton("leftClick", "Left click and Drag to rotate", "assets/img/leftClick.png");
    var button = BABYLON.GUI.Button.CreateImageButton("Save", "Save to disk", "assets/img/save.png");
    var gltf = null;
    function guideLocation() {
        const GUIDE_WIDTH = 300, GUIDE_HEIGHT=100;
        rightClick.width = `${GUIDE_WIDTH}px`;
        rightClick.height = `${GUIDE_HEIGHT}px`;
        rightClick.color = "#acb5ce";
        rightClick.thickness = 0;
        rightClick.top = - (canvas.height / 2) + (GUIDE_HEIGHT  / 2) + 30;
        rightClick.left =  (canvas.width/2) - (GUIDE_WIDTH/2) - 20;
        rightClick.isEnabled = false;
        leftClick.width = `${GUIDE_WIDTH}px`;
        leftClick.height = `${GUIDE_HEIGHT}px`;
        leftClick.color = "#acb5ce";
        leftClick.thickness = 0;
        leftClick.top = - (canvas.height / 2) + (GUIDE_HEIGHT/2 ) + 30;
        leftClick.left = - (canvas.width/2) + (GUIDE_WIDTH/2) + 20;
        leftClick.isEnabled = false;   
    }
    function createGuide() {
        guideLocation();
        advancedTexture.addControl(rightClick);
        advancedTexture.addControl(leftClick);

    }
    function getPicker(mesh) {
        const PICKER_HEIGHT = 220, PICKER_WIDTH = 220;

        if (picker == null) {
            pickerTitle = new BABYLON.GUI.TextBlock();
            pickerTitle.text = "";
            pickerTitle.height = "30px";
            pickerTitle.isVisible = false;
            pickerTitle.color = "white";
                        
            picker = new BABYLON.GUI.ColorPicker();
            //picker.value = skullMaterial.diffuseColor;
            picker.height = `${PICKER_HEIGHT}px`;
            picker.width = `${PICKER_WIDTH}px`;
            picker.isVisible = false;

            advancedTexture.addControl(picker);
            //advancedTexture.addControl(pickerTitle);

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
                gltf.materials.forEach(material => {
                    if (material.name == mesh.material.name) {
                        material.pbrMetallicRoughness.baseColorFactor[0]=value.r;
                        material.pbrMetallicRoughness.baseColorFactor[1]=value.g;
                        material.pbrMetallicRoughness.baseColorFactor[2]=value.b;
    
                    }
                });
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

    function menuLocation() {
        const WIDTH = 150, HEIGHT=50;     
        const style = advancedTexture.createStyle();
        style.borderRadius = "20px";
        button.style = style;
        button.width = `${WIDTH}px`;
        button.height = `${HEIGHT}px`;
        button.color = "#acb5ce";
        button.background= "#262d48";
        button.thickness = 0.1;
        button.top = (canvas.height / 2) - (HEIGHT * 2);
        button.left = (canvas.width/2) - (WIDTH/2) - 130;
    }
    function createMenu() {
        menuLocation();
        button.onPointerClickObservable.add(() => {
            var blob = new Blob([JSON.stringify(gltf)]);
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = `suka.gltf`;
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove();  //afterwards we remove the element again             
            //  window.location.reload();
            // BABYLON.GLTF2Export.GLBAsync(scene, "suka").then((glb) => {
            //     glb.downloadFiles();
            //   });
        });        
        advancedTexture.addControl(button);
    }

    function resize(button, index) {

       // button.top = (canvas.height / 2)- (HEIGHT * TOP_FACTOR); ;
       // button.left = index * WIDTH;
        menuLocation();
        guideLocation();
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
        var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2, 5, new BABYLON.Vector3(0, 0, 0), scene);

        camera.lowerRadiusLimit = 6;
        camera.upperRadiusLimit = 6;
        camera.panningSensibility = 0;
        gltf = await (await fetch("https://cloudflare-ipfs.com/ipfs/bafybeicicnm2sf6udivx6jquvndfw3t4wodhq2b7t6s44svqruykqoz3je/howdy.gltf")).json();
        console.log(gltf.materials);
        var gltfData = `data:${JSON.stringify(gltf)}`;
        BABYLON.SceneLoader.ImportMesh('', '',gltfData, scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
            newMeshes.forEach(mesh => {
                if (mesh.name == "__root__") {
                    root = mesh;
                    mesh.position.y -=2;
                   // mesh.position.z -=1;
                }
                //root.position.y -= 2;
            })
        });
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
       // advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        scene.clearColor = new BABYLON.Color4(0.03, 0.03, 0.03, 0.5);

        return scene;
    };
    await createScene(); 
    createMenu(); 
    createGuide();
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
        console.log(kbInfo.event);

        switch (kbInfo.type) {
          case BABYLON.KeyboardEventTypes.KEYUP:
            if (kbInfo.event.code == "Escape") {
                hidePicker();
            }
            break;
        }
      });
});