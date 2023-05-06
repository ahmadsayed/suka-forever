
var clearAll = null;
var gltf = null;
var currentSuka = null;
var microLedger = {};
var scene = null;
var engine = null;
let parent = null;

var picker = null;
var pickerTitle = null;
var advancedTexture = null;
var canvas = null;
var camera = null;
var dropArea = null;
var containerGltf = null;


var startingPoint;

const DARG_BOX_NAME = "bound_drag_box"

var totalTokens = 0;

function showPicker(mesh) {
    getPicker(mesh).isVisible = true;
    pickerTitle.isVisible = true;
}

function hidePicker(mesh) {
    getPicker(mesh).isVisible = false;
    pickerTitle.isVisible = false;
}

function screendownload() {
    BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 512);
}
function screenshot() {
    return new Promise((resolve, reject) => {
        BABYLON.Tools.CreateScreenshotUsingRenderTarget(engine, camera, 512,
            function (data) {
                resolve(data);
            });
    })
}

function modal() {
    $('.modal').modal('show');
    setTimeout(function () {
        $('.modal').modal('hide');
    }, 3000);
}


async function updateHistoryList() {
    const dropdown = document.querySelector("#drop-ipfs");

    var historyList = [];

    while (dropdown.getElementsByClassName("item-history").length > 0) {
        dropdown.removeChild(dropdown.getElementsByClassName("item-history")[0]);
    }
    const latestCID = localStorage.getItem(currentSuka.name);
    if (latestCID != null && typeof latestCID != 'undefined') {
        historyList = await remoteMicroLedgerToList(latestCID);
    }
    // if (localStorage.getItem(currentSuka.name) != null) {
    //     historyList = await microLedgerToList(localStorage.getItem(currentSuka.name));
    // };

    historyList.forEach(historyItem => {
        const para = document.createElement("p");
        const node = document.createTextNode(historyItem.ts);
        para.appendChild(node);
        para.classList.add("dropdown-item");
        para.classList.add("item-history");
        para.style.marginBottom = "0rem";
        para.onclick = async function () {
            await importMesh(null, historyItem)
        }
        dropdown.appendChild(para);
    });
}
var addedObjects = new Map();
var tokens = [];

async function appendMesh(draggedToken, index) {
    const tokeGLTF = await getTokenGltf(draggedToken.name);
    let gltf = await convertToDataURI(await (await fetch(tokeGLTF)).json());
    let gltfString = JSON.stringify(gltf);
    let gltfData = `data:${gltfString}`;
    tokens.push(draggedToken);

    addedObjects.set( `${draggedToken.name}_${index}`,[]);
    await BABYLON.SceneLoader.ImportMesh('', '', gltfData, scene, function (newMeshes) {
        newMeshes.forEach(mesh => {
            console.log(mesh.name);
            if (mesh.name == "__root__") {
                if (draggedToken.scale) {
                    mesh.scaling.x = draggedToken.scale.x;
                    mesh.scaling.y = draggedToken.scale.y;
                    mesh.scaling.z = -1 * draggedToken.scale.z;
                }
            }
        })
        newMeshes.forEach(mesh => {
            addedObjects.get(`${draggedToken.name}_${index}`).push(mesh);
            maxRadius = 0;
            max = null;
            min = null;
            biggestMesh = null;
            minMesh = null;
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
                }

            })

            if (mesh.name == "__root__") {
                let scale = (draggedToken.scale) ? draggedToken.scale.y : 1;
                mesh.position = (new BABYLON.Vector3(
                    draggedToken.location.x,
                    draggedToken.location.y - (((max.y - min.y) * scale) / 2),
                    draggedToken.location.z));
                if (draggedToken.rotation) {
                    mesh.rotationQuaternion.x = draggedToken.rotation.x;
                    mesh.rotationQuaternion.y = draggedToken.rotation.y;
                    mesh.rotationQuaternion.z = draggedToken.rotation.z;
                    mesh.rotationQuaternion.w = (draggedToken.rotation.w) ? draggedToken.rotation.w : 0;

                }
                var boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(mesh)
                boundingBox.name = `${DARG_BOX_NAME}_${draggedToken.name}_${index}`;
                var gizmo = new BABYLON.BoundingBoxGizmo(BABYLON.Color3.FromHexString("#0984e3"), utilLayer)
                gizmo.rotationSphereSize = 0.3;
                gizmo.scaleBoxSize = 0.3;
                gizmo.attachedMesh = boundingBox;
                gizmo.onRotationSphereDragObservable.add((event) => {
                    if (!draggedToken.rotation) {
                        draggedToken.rotation = { x: 0, y: 0, z: 0, w: 0 };
                    }
                    draggedToken.rotation.x = gizmo._tmpQuaternion.x;
                    draggedToken.rotation.y = gizmo._tmpQuaternion.y;
                    draggedToken.rotation.z = gizmo._tmpQuaternion.z;
                    draggedToken.rotation.w = gizmo._tmpQuaternion.w;
                });
                let currentScale = {};
                if (draggedToken.scale) {
                    currentScale.x = gizmo._existingMeshScale.x / draggedToken.scale.x;
                    currentScale.y = gizmo._existingMeshScale.y / draggedToken.scale.y;

                    currentScale.z = gizmo._existingMeshScale.z / draggedToken.scale.z;
                } else {
                    currentScale.x = gizmo._existingMeshScale.x;
                    currentScale.y = gizmo._existingMeshScale.y;

                    currentScale.z = gizmo._existingMeshScale.z;
                }


                gizmo.onScaleBoxDragObservable.add((event) => {
                    console.log(gizmo._existingMeshScale);
                    if (!draggedToken.scale) {
                        draggedToken.scale = { x: 0, y: 0, z: 0 };
                    }
                    draggedToken.scale.x = gizmo._existingMeshScale.x / currentScale.x;
                    draggedToken.scale.y = gizmo._existingMeshScale.y / currentScale.y;
                    draggedToken.scale.z = gizmo._existingMeshScale.z / currentScale.z;
                });
                // Create behaviors to drag and scale with pointers in VR
                var sixDofDragBehavior = new BABYLON.SixDofDragBehavior()
                boundingBox.addBehavior(sixDofDragBehavior)
                var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior()
                boundingBox.addBehavior(multiPointerScaleBehavior)
                // Optionally, add some events to listen to drag events

                sixDofDragBehavior.onDragObservable.add((event) => {
                    if (!draggedToken.location) {
                        draggedToken.location = { x: 0, y: 0, z: 0 };
                    }
                    draggedToken.location.x = event.position.x;
                    draggedToken.location.y = event.position.y;
                    draggedToken.location.z = event.position.z;
                });

            }
        });
    });
}
var utilLayer = null;
let rawGLTF = null;
async function importMesh(suka, historyItem, latest = false) {
    $('.modal').modal('show');
    for (const [key, value] of addedObjects.entries()) {
        for (let i = 0; i < value.length; i++) {
            value[i].dispose();
        }    
    }
    addedObjects.clear();

    for (let i = 0; i < scene.meshes.length; i++) {
        scene.meshes[i].dispose();
    }

    if (parent != null) {
        parent.dispose();
    }
    if (utilLayer != null) {
        utilLayer.dispose();

    }
    tokens = [];
    utilLayer = new BABYLON.UtilityLayerRenderer(scene)
    utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
    hidePicker();
    var gltfData = null;
    var gltfString = null;
    totalTokens = 0;
    if (historyItem == null || typeof historyItem === 'undefined') {                      // Get the latest from the IPFS or Local
        if (!latest || localStorage.getItem(suka.name) == null) {
            rawGLTF = await (await fetch(suka.gltf)).json();
            gltf = await convertToDataURI(rawGLTF);
            gltfString = JSON.stringify(gltf);
        } else {
            const latestCID = localStorage.getItem(suka.name);
            const latestLedger = await getFromRemoteIPFS(latestCID);
            //const latest = JSON.parse(latestLedger);
            gltf = await convertToDataURI(await getFromRemoteIPFS(latestLedger.cid))
            gltfString = JSON.stringify(gltf);
            currentSuka = suka;

        }
    } else {
        suka = historyItem;
        gltf = await convertToDataURI(await getFromRemoteIPFS(historyItem.cid));
        gltfString = JSON.stringify(gltf);
    }

    gltfData = `data:${gltfString}`;

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
            }

        })


        parent.setBoundingInfo(new BABYLON.BoundingInfo(new BABYLON.Vector3(min.x, min.y, min.z), new BABYLON.Vector3(max.x, max.y, max.z)));


        var zoomFactor = 1.4;
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.panningSensibility = 1000 / 2;
        camera.wheelPrecision = 500 / camera.radius;
        camera.radius = (max.y - min.y) * zoomFactor;
        camera.targetScreenOffset.x = 0;
        camera.targetScreenOffset.y = 0;
        camera.lowerRadiusLimit = camera.radius / 20;
        camera.upperRadiusLimit = camera.radius * 3;
        root.position.y -= ((max.y - min.y) / 2);
        console.log(suka);
        if (suka.tokens) {
            suka.tokens.forEach(token => {
                appendMesh(token, totalTokens++);
            })
        }
    });
    $('.modal').modal('hide');


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

        hideMenu();
        pickerTitle.text = mesh.material.name;

        picker.value = mesh.material.albedoColor;
        picker.onValueChangedObservable.add(function (value) { // value is a color3
            document.getElementById("remote-save").disabled = false;

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
// Retrieve this list from smart Contract public projects

function initSamples() {
    const template = document.querySelector("#suka-template");
    const sukaList = document.querySelector("#sukas-list");
    const sukas = [
        {
            name: "howdy",
            image: "https://ipfs.sukaverse.club/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/howdy/images/300x300.jpg",
            gltf: "https://ipfs.sukaverse.club/ipfs/bafybeigugzrqjel5vpcj3h3s5bxgodslgt3tlushdpierdqpcjeqrhe5b4/howdy.gltf"
        },
        {
            name: "laith",
            image: "https://ipfs.sukaverse.club/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/laith/images/300x300.jpg",
            gltf: "https://ipfs.sukaverse.club/ipfs/bafybeicujgm5buwdqsimy4hcusu452tzcochimmjwdxmtviid3krccei2y/laith.gltf"

        },
        // {
        //     name: "muka",
        //     image: "https://ipfs.sukaverse.club/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/muka/images/300x300.jpg",
        //     gltf: "https://ipfs.sukaverse.club/ipfs/bafybeicnj5rimppcis7cx4npppm4udvy472u7ur2r75thux7y4sgcbrbeq/muka.gltf"
        // },
        // {
        //     name: "tota",
        //     image: "https://ipfs.sukaverse.club/ipfs/QmbF3HDrbbJFEwLLuNsLGdmXeiKSsQ13VvdXgtNivwXK1n/tota/images/300x300.jpg",
        //     gltf: "https://ipfs.sukaverse.club/ipfs/bafybeigmxe4gjjmkhmwesihscc25arx3e7wczxaywstvd4nmwa4qg4byzu/tota.gltf"
        // },

    ]

    sukas.forEach(suka => {
        const clone = template.content.cloneNode(true);
        clone.querySelector(".my-suka").src = suka.image;
        clone.querySelector(".my-suka").addEventListener("dragstart", (event) => {
            // store a ref. on the dragged elem
            if (!suka.location) {
                suka.location = {
                    x: 0,
                    y: 0,
                    z: 0
                };
                suka.rotation = {
                    x: 0,
                    y: 0,
                    z: 0,
                    w: 0
                }
            }
            draggedToken = suka;

        });
        clone.querySelector(".my-suka").onclick = async function () {
            currentSuka = suka;
            switchToView();

            importMesh(suka);
            updateHistoryList();

        }
        sukaList.appendChild(clone);
    })
}

function switchToView() {
    dropArea.style.display = "none";

    containerGltf.style.display = "block";
    engine.resize();
    resize()
}
// https://sukaverse.club/builder.html?cid=QmZ7vPBBN18bvnyeTfVmGRgzFGEzqTAo53FXfymKGyZRyx&name=untitled&token=rffrfrfrfr

function importMeshFromURL() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('cid')) {
        const urlCID = searchParams.get('cid')
        switchToView();
        currentSuka = {
            name: searchParams.has('name') ? searchParams.get('name') : 'blender',
            gltf: `https://ipfs.sukaverse.club/ipfs/${urlCID}`
        };
        //localStorage.removeItem(currentSuka.name);

        importMesh(currentSuka);
        updateHistoryList();
    }
}
window.addEventListener('DOMContentLoaded', async event => {


    function supportDragAndDrop(area) {
        //If user Drag File Over DropArea
        area.addEventListener("dragover", (event) => {
            event.preventDefault(); //preventing from default behaviour
            area.classList.add("active");
            dragText.textContent = "Release to Upload File";
        });
        //If user leave dragged File from DropArea
        area.addEventListener("dragleave", () => {
            area.classList.remove("active");
            dragText.textContent = "Drag & Drop to Upload File";
        });
        //If user drop File on DropArea
        area.addEventListener("drop", (event) => {
            event.preventDefault(); //preventing from default behaviour
            //getting user select file and [0] this means if user select multiple files then we'll select only the first one
            if (event != null && event.dataTransfer != null) {
                file = event.dataTransfer.files[0];
                if (file != null) {
                    showFile(); //calling function
                }
            }
            if (draggedToken != null) {
                appendMesh(draggedToken, totalTokens++);

            }

        });
    }

    //selecting all required elements
    dropArea = document.querySelector(".drag-area");
    containerGltf = document.querySelector(".intro");
    dragText = dropArea.querySelector("header");
    button = dropArea.querySelector("button");
    input = dropArea.querySelector("input");
    canvas = document.getElementById("renderCanvas"); // Get the canvas element
    canvas.addEventListener('wheel', evt => evt.preventDefault());
    let file; //this is a global variable and we'll use it inside multiple functions
    button.onclick = () => {
        input.click(); //if user click on the button then the input also clicked
    }
    input.addEventListener("change", function () {
        //getting user select file and [0] this means if user select multiple files then we'll select only the first one
        file = this.files[0];
        dropArea.classList.add("active");
        showFile(); //calling function
    });

    supportDragAndDrop(dropArea);
    supportDragAndDrop(canvas);

    function showFile() {
        let fileType = file.type; //getting selected file type
        let validExtensions = ["gltf"]; //adding some valid image extensions in array
        let fileExtention = file.name.split(".")[1];
        if (validExtensions.includes(fileExtention)) { //if user selected file is an image file
            let fileReader = new FileReader(); //creating new FileReader object
            fileReader.onload = () => {
                let fileURL = fileReader.result; //passing user file source in fileURL variable
                switchToView();

                currentSuka = {
                    name: currentSuka == null ? file.name.split(".")[0] : currentSuka.name,
                    gltf: fileURL
                };
                importMesh(currentSuka);
            }
            const dataURL = fileReader.readAsDataURL(file);
        } else {
            alert("This is not a GLTF file, only GLTF file supported!");
            dropArea.classList.remove("active");
            dragText.textContent = "Drag & Drop to Upload File";
        }
    }


    engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    scene = new BABYLON.Scene(engine);
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const TOP_FACTOR = 0.8;
    var root = null;
    const dropdown = document.querySelector(".dropdown-menu");

    var node;
    var isIPFSReady = false;
    function enableSave() {
        // document.getElementById("ipfs-save").disabled = false;
        // document.getElementById("ipfs-drop").disabled = false;
    }

    function disableSave() {
        // document.getElementById("ipfs-save").disabled = true;
        // document.getElementById("ipfs-drop").disabled = true;

    }

    initSamples();


    clearAll = async function () {

        // localStorage.removeItem(currentSuka.name);
        localStorage.removeItem(currentSuka.name);
        importMesh(currentSuka);
        updateHistoryList();
        document.getElementById("remote-save").disabled = !isIPFSReady;

    };


    var rightClick = BABYLON.GUI.Button.CreateImageButton("rightClick", "Edit Color", "assets/img/rightClick.png");
    var leftClick = BABYLON.GUI.Button.CreateImageButton("leftClick", "Explore 360", "assets/img/leftClick.png");
    var button = BABYLON.GUI.Button.CreateImageButton("Save", "Save to disk", "assets/img/save.png");
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



    resize = function () {
        guideLocation();
        getPicker();
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

        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        scene.clearColor = new BABYLON.Color4(0.08, 0.08, 0.08, 0.5);

        return scene;
    };

    await createScene();
    createGuide();
    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();

    });
    async function saveToDisk() {
        var blob = new Blob([JSON.stringify(await convertToDataURI(gltf))]);
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
            buffer.forEach(code => {
                data += String.fromCharCode(code);
            });
        }
        return data;
    }
    async function microLedgerToList(cid, cids = []) {
        const data = JSON.parse(await getFromIPFS(cid));
        cids.push(data);
        if (data.prev != null) {
            await microLedgerToList(data.prev, cids);
        }
        return cids;
    }


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
            if (pickResult.pickedMesh && pickResult.pickedMesh.name.startsWith(DARG_BOX_NAME)) {
                const token_name = pickResult.pickedMesh.name.replace(`${DARG_BOX_NAME}_`, '')
                showMenu(token_name);
                hidePicker();
                return null;
            } else {
                showPicker(pickResult.pickedMesh);
            }

        } else {
            hidePicker();
        }
    });

    scene.onKeyboardObservable.add((kbInfo) => {

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
            md = {
                e,
                offsetLeft: element.offsetLeft,
                offsetTop: element.offsetTop,
                firstWidth: first.offsetWidth,
                secondWidth: second.offsetWidth
            };

            document.onmousemove = onMouseMove;
            document.onmouseup = () => {
                document.onmousemove = document.onmouseup = null;
            }
        }

        function onMouseMove(e) {
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


    /**
     *  Wallet Connection Button 
     */
    document.querySelector("#btn-connect").addEventListener("click", onConnect);
    document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);

    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";


    /**
     *  Editor Menu
     */

    document.getElementById("btn-save").onclick = saveToDisk; // Get the canvas element
    // document.getElementById("ipfs-save").onclick = saveToIPFS;
    document.getElementById("remote-save").onclick = saveLedgerToRemoteIPFS;


    importMeshFromURL();
    initMenu();

});