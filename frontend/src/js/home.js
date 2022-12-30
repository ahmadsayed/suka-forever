
window.addEventListener('load', async event => {
    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var loadingScreenDiv = window.document.getElementById("loadingScreen");
    var sideContent = window.document.getElementById("sideContent");
    var sukaVerse1 = window.document.getElementById("suka_verse1");
    var sukaVerse2 = window.document.getElementById("suka_verse2");
    var sukaVerse3 = window.document.getElementById("suka_verse3");    
    // var sideContentMiddle = window.document.getElementById("sideContentMiddle");
    // var sideContentBottom = window.document.getElementById("sideContentBottom");

    function customLoadingScreen() {
        console.log("customLoadingScreen creation")
    }
    customLoadingScreen.prototype.displayLoadingUI = function () {
        console.log("customLoadingScreen loading")
        //document.querySelector("#navbarSupportedContent").classList.remove("collapse");
    };
    customLoadingScreen.prototype.hideLoadingUI = function () {


        // var sukeVerse4 = window.document.getElementById("suka_verse4");

        sukaVerse1.style.display="none";
        sukaVerse2.style.display="none";

        sukaVerse3.style.display="none";
        //sukeVerse4.style.display="block";

        console.log("customLoadingScreen loaded")
        loadingScreenDiv.classList.remove("loadingScreen");
        loadingScreenDiv.classList.add("screenContent");
        sideContent.style.display='none';

        //loadingScreenDiv.style.display = "none";
    };
    var loadingScreen = new customLoadingScreen();
    engine.loadingScreen = loadingScreen;

    engine.displayLoadingUI();

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
        var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(2, 2.5, 7.5), scene);
        // This targets the camera to scene origin
        //camera.setTarget(new BABYLON.Vector3(0, 0.2, 0));
        let scrollHeight = canvas.scrollHeight;

        camera.setTarget(new BABYLON.Vector3(-3, 0 + (this.scrollY / (scrollHeight / 7)), 0));

        let stop = false;
        BABYLON.SceneLoader.ImportMesh("", "https://cloudflare-ipfs.com/ipfs/bafybeicifqtj2guv3ylfbiybrt2wwsi5xjflygsnmjtlt3foasitjc7l7q/", "intro.glb", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
            newMeshes.forEach(mesh => {
            })
            animationGroups.forEach(animation => {
                animation.stop();
            });
            engine.hideLoadingUI();
            //sideContent.style.top = `${this.scrollY/20 + 5}vw`;
            //sideContent.style.left = `0%`;            
            window.addEventListener("scroll", (event) => {
                let position = this.scrollY;
                if (!stop) {
                    let pos =  (position / (scrollHeight / 7)) > 2.4 ? 2.4 :  (position / (scrollHeight / 7)) ;
                    
                    camera.setTarget(new BABYLON.Vector3(-3, 0 + pos, 0));
                    // let contents = [sideContentMiddle, sideContentBottom];
                    sukaVerse1.style.top = `${2+this.scrollY/15}vw`;
                    sukaVerse1.style.marginLeft = `${this.scrollY/38+35}vw`;

                    sukaVerse1.style.height = `${7.5-this.scrollY/150}vw`;

                    // contents.forEach((content, index) => {
                    //     content.style.top = `${this.scrollY/20 + 5}vw`;
                    //     let speed = index + 0.3;
                    //     let leftPos = (100-(this.scrollY/speed)) <= 0? 0: (100-(this.scrollY/speed));
                    //     content.style.left = `${leftPos}%`;
                    // })


                }

                //camera.position.y = camera.position.y + (position/(scrollHeight/6))
                animationGroups.forEach(animation => {
                    let key = ((position / scrollHeight) * animation.to) * 3
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