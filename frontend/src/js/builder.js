
var clearAll = null;
window.addEventListener('DOMContentLoaded', async event => {
    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var scene = new BABYLON.Scene(engine);
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const TOP_FACTOR = 0.8;
    var camera = null;
    var root = null;
    const template = document.querySelector("#suka-template");
    const sukaList = document.querySelector("#sukas-list");
    const dropdown = document.querySelector(".dropdown-menu");

    var currentSuka = null;
    var  node;
    var microLedger = {};
    Ipfs.create().then(data => {
        node = data;
    });
    clearAll = function() {
        localStorage.removeItem(currentSuka.name);
        importMesh(currentSuka);
        updateHistoryList();
    };
    const sukas = [
        {
            name:"tota",
            image: "https://cloudflare-ipfs.com/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/tota/images/300x300.jpg",
            gltf: "https://bafybeiev2jo3nghj6tgxalvpks624hrb7edooa75dw2qs4cjspwkxgx7ja.ipfs.w3s.link/ipfs/bafybeiev2jo3nghj6tgxalvpks624hrb7edooa75dw2qs4cjspwkxgx7ja/tota.gltf"
        },
        {
            name:"howdy",
            image: "https://cloudflare-ipfs.com/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/howdy/images/300x300.jpg",
            gltf: "https://bafybeigugzrqjel5vpcj3h3s5bxgodslgt3tlushdpierdqpcjeqrhe5b4.ipfs.w3s.link/ipfs/bafybeigugzrqjel5vpcj3h3s5bxgodslgt3tlushdpierdqpcjeqrhe5b4/howdy.gltf"
        },
        {
            name:"muka",
            image: "https://cloudflare-ipfs.com/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/muka/images/300x300.jpg",
            gltf: "https://bafybeieoksrjaxmhx6uoxzcnr5mu6xtxi6cwvlgxcoyozdmegegxiaqsba.ipfs.w3s.link/ipfs/bafybeieoksrjaxmhx6uoxzcnr5mu6xtxi6cwvlgxcoyozdmegegxiaqsba/muka.gltf"
        },
        {
            name:"laith",
            image: "https://cloudflare-ipfs.com/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/laith/images/300x300.jpg",
            gltf: "https://bafybeidn3e7jytcmzc6b5ilibsx7bomumbijp3pndth2e2w27idz2l6kjq.ipfs.w3s.link/ipfs/bafybeidn3e7jytcmzc6b5ilibsx7bomumbijp3pndth2e2w27idz2l6kjq/laith.gltf"

        }
    ]

    sukas.forEach(suka => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".my-suka").src = suka.image;
        clone.querySelector(".my-suka").onclick = async function () {
            currentSuka = suka;
            
            importMesh(suka);
            updateHistoryList();


        }
        sukaList.appendChild(clone);
    })
    var picker = null;
    var pickerTitle = null;
    var rightClick = BABYLON.GUI.Button.CreateImageButton("rightClick", "Edit Color", "assets/img/rightClick.png");
    var leftClick = BABYLON.GUI.Button.CreateImageButton("leftClick", "Explore 360", "assets/img/leftClick.png");
    var button = BABYLON.GUI.Button.CreateImageButton("Save", "Save to disk", "assets/img/save.png");
    var gltf = null;
    function guideLocation() {
        const GUIDE_WIDTH = 150, GUIDE_HEIGHT = 100;
        rightClick.width = `${GUIDE_WIDTH}px`;
        rightClick.height = `${GUIDE_HEIGHT}px`;
        rightClick.color = "#acb5ce";
        rightClick.thickness = 0;
        rightClick.top = - (canvas.height / 2) + (GUIDE_HEIGHT / 2);
        rightClick.left = (canvas.width / 2) - (GUIDE_WIDTH / 2) - 20;
        rightClick.isEnabled = false;
        leftClick.width = `${GUIDE_WIDTH}px`;
        leftClick.height = `${GUIDE_HEIGHT}px`;
        leftClick.color = "#acb5ce";
        leftClick.thickness = 0;
        leftClick.top = - (canvas.height / 2) + (GUIDE_HEIGHT / 2);
        leftClick.left = - (canvas.width / 2) + (GUIDE_WIDTH / 2) + 20;
        leftClick.isEnabled = false;
    }
    function createGuide() {
        guideLocation();
        advancedTexture.addControl(rightClick);
        advancedTexture.addControl(leftClick);

    }
    function getPicker(mesh) {
        const PICKER_HEIGHT = 200, PICKER_WIDTH = 200;

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
        picker.top = - (canvas.height / 2) + (PICKER_HEIGHT * 1.2);
        picker.left = (canvas.width / 2) - (PICKER_WIDTH / 2) - 20;
        pickerTitle.top = `${window.innerHeight / 2 - ((PICKER_HEIGHT * 2.6))}px`;

        picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        picker.onValueChangedObservable.clear();
        if (mesh != null) {
            pickerTitle.text = mesh.material.name;

            picker.value = mesh.material.albedoColor;
            picker.onValueChangedObservable.add(function (value) { // value is a color3
                mesh.material.albedoColor.copyFrom(value);
                gltf.materials.forEach(material => {
                    if (material.name == mesh.material.name) {
                        material.pbrMetallicRoughness.baseColorFactor[0] = value.r;
                        material.pbrMetallicRoughness.baseColorFactor[1] = value.g;
                        material.pbrMetallicRoughness.baseColorFactor[2] = value.b;

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


    function resize() {
        guideLocation();
        getPicker();
    }
    let parent = null;

    async function importMesh(suka, historyItem) {
        for (let i = 0; i < scene.meshes.length; i++) {
            scene.meshes[i].dispose();
        }
        if (parent != null) {
            parent.dispose();
        }
        var gltfData = null;
        if (historyItem == null) {                      // Get the latest from the IPFS or Local
            if (localStorage.getItem(suka.name)==null) {
                gltf = await (await fetch(suka.gltf)).json();
            } else {
                const latestCID = localStorage.getItem(suka.name);
                const latestLedger = await getFromIPFS(latestCID);
                const latest = JSON.parse(latestLedger);
                gltf = JSON.parse(await getFromIPFS(latest.cid));
                currentSuka = suka;

            }
        } else {
            gltf = JSON.parse(await getFromIPFS(historyItem.cid));   
        }

        gltfData = `data:${JSON.stringify(gltf)}`;

        var result = await BABYLON.SceneLoader.ImportMesh('', '', gltfData, scene, function (newMeshes) {
            maxRadius = 0;
            max = null;
            min = null;
            biggestMesh = null;
            minMesh = null;
            parent = new BABYLON.Mesh("parent", scene);
            newMeshes.forEach(mesh => {
                meshBox = mesh.getBoundingInfo().boundingBox.maximumWorld;
                if (max == null) {
                    max = new BABYLON.Vector3(meshBox.x, meshBox.y, meshBox.z);
                }
                if (max.x < meshBox.x) {
                    max.x = meshBox.x;
                }
                if (max.y < meshBox.y) {
                    max.y = meshBox.y;
                }
                if (max.z < meshBox.z) {
                    max.z = meshBox.z;
                }
                minBox = mesh.getBoundingInfo().boundingBox.minimumWorld;
                if (min == null) {
                    min = new BABYLON.Vector3(minBox.x, minBox.y, minBox.z);
                }
                if (min.x > minBox.x) {
                    min.x = minBox.x;
                }
                if (min.y > minBox.y) {
                    min.y = minBox.y;
                }
                if (min.z > minBox.z) {
                    min.z = minBox.z;
                }


                if (mesh.name == "__root__") {
                    root = mesh;
                    // mesh.position.z -=1;
                }
                // console.log(mesh.getBoundingInfo().boundingBox);
                //mesh.showBoundingBox = true;
            })

            // console.log(max + " : " + min);

            // console.log(minLowestPoint + ":" + maxHighestPoint);

            parent.setBoundingInfo(new BABYLON.BoundingInfo(new BABYLON.Vector3(min.x, min.y, min.z), new BABYLON.Vector3(max.x, max.y, max.z)));
            // //parent.setBoundingInfo(minMesh, biggestMesh);
            var zoomFactor = 1.4;
            camera.lowerRadiusLimit = (max.y - min.y) * zoomFactor;
            camera.upperRadiusLimit = (max.y - min.y) * zoomFactor;
            console.log(min.y)
            console.log(max.y - min.y);
            root.position.y -= min.y;
            root.position.y -= ((max.y - min.y) / 2);
            // parent.showBoundingBox = true;  
            // parent.showBoundingBox = true;
        });

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
        camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 5, new BABYLON.Vector3(0, 0, 0), scene);

        camera.lowerRadiusLimit = 9;
        camera.upperRadiusLimit = 9;
        camera.panningSensibility = 0;
        //importMesh("https://cloudflare-ipfs.com/ipfs/bafybeicicnm2sf6udivx6jquvndfw3t4wodhq2b7t6s44svqruykqoz3je/howdy.gltf");
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
        console.log(camera.fov);
        // advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        scene.clearColor = new BABYLON.Color4(0.03, 0.03, 0.03, 0.5);

        return scene;
    };

    await createScene();
    createGuide();
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();

    });
    function saveToDisk() {
        var blob = new Blob([JSON.stringify(gltf)]);
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = `suka.gltf`;
        document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
        a.click();
        a.remove();
    }
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
    async function getFromIPFS(cid) {
        let data = '';
        for await (const file of node.cat(cid)) {
            //const buf = Buffer.from(file, 'utf8');
            //data = buf.toString();

            buffer = new Uint16Array(file);
            buffer.forEach( code => {
                data += String.fromCharCode(code);
               // console.log(String.fromCharCode)
            });
        }
        return data;
    }
    async function microLedgerToList(cid, cids=[]) {
        const data =  JSON.parse(await getFromIPFS(cid));
        cids.push(data);
        if (data.prev != null) {
            await microLedgerToList(data.prev, cids);
        } 
        return cids;
    }

    async function updateHistoryList() {
        var historyList = [];

        while (dropdown.getElementsByClassName("item-history").length >0) {
            dropdown.removeChild(dropdown.getElementsByClassName("item-history")[0]);
        }

        if (localStorage.getItem(currentSuka.name) != null) {
            historyList = await microLedgerToList(localStorage.getItem(currentSuka.name));
        };

        historyList.forEach(historyItem => {
            const para = document.createElement("p");
            const node = document.createTextNode(historyItem.ts);
            para.appendChild(node);
            para.classList.add("dropdown-item");
            para.classList.add("item-history");
            para.style.marginBottom="0rem";
            para.onclick = async function () {
                console.log(historyItem);
                await importMesh(null, historyItem) 
            }
            dropdown.appendChild(para);
        });
    }
    async function saveToIPFS() {
        const results = await node.add(JSON.stringify(gltf));
        const cid = results.path
        // localStorage.setItem(currentSuka.name, cid);

        microLedger = {
            prev: localStorage.getItem(currentSuka.name),
            ts:  new Date(new Date().getTime()).toLocaleString(),
            cid: cid
        };
        const updateLedger = await node.add(JSON.stringify(microLedger));

        console.log('CID created via ipfs.add:', cid)
        localStorage.setItem(currentSuka.name, updateLedger.path);

        updateHistoryList();

    }
    document.getElementById("btn-save").onclick = saveToDisk; // Get the canvas element
    document.getElementById("ipfs-save").onclick = saveToIPFS;
    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
        resize();
    });
    window.addEventListener("auxclick", function () {
        // We try to pick an object
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        // We try to pick an object
        if (pickResult.hit) {
            // pickResult.pickedMesh.name;
            showPicker(pickResult.pickedMesh);
        } else {
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



    // A function is used for dragging and moving
    function dragElement(element, direction) {
        var md; // remember mouse down info
        const first = document.getElementById("first");
        const second = document.getElementById("second");

        element.onmousedown = onMouseDown;

        function onMouseDown(e) {
            //console.log("mouse down: " + e.clientX);
            md = {
                e,
                offsetLeft: element.offsetLeft,
                offsetTop: element.offsetTop,
                firstWidth: first.offsetWidth,
                secondWidth: second.offsetWidth
            };

            document.onmousemove = onMouseMove;
            document.onmouseup = () => {
                //console.log("mouse up");
                document.onmousemove = document.onmouseup = null;
            }
        }

        function onMouseMove(e) {
            //console.log("mouse move: " + e.clientX);
            var delta = {
                x: e.clientX - md.e.clientX,
                y: e.clientY - md.e.clientY
            };

            if (direction === "H") // Horizontal
            {
                // Prevent negative-sized elements
                delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
                    md.secondWidth);

                element.style.left = md.offsetLeft + delta.x + "px";
                first.style.width = (md.firstWidth + delta.x) + "px";
                second.style.width = (md.secondWidth - delta.x) + "px";
            }
            resize();
            engine.resize();
        }
    }


    dragElement(document.getElementById("separator"), "H");

});