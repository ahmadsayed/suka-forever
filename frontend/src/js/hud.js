"use strict";

import fetchScene from './fetchScene.js';

export default class HudGui {
    constructor(scene) {
        this.width = 160;
        this.height = 35;
        this.scene = scene;
        this.pickedModel = null;
        this.sceneUser = null;
        this.activeScene = null;
        this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.initToast();
        this.sideMenu();
        this.items = [
            {
                id: "menu_title",
                text: "",
                enabled: false
            },
            {
                id: "import_mesh",
                text: "Merge mesh",
                enabled: true
            },
            {
                id: "comment",
                text: "Add comment",
                enabled: true

            },
            {
                id: "review_comments",
                text: "Review comments",
                enabled: true
            },
            {
                id: "versions",
                text: "History ...",
                enabled: true,
            }
        ];
        //this.menu = [];
        this.items.forEach((item) => {
            var button = BABYLON.GUI.Button.CreateSimpleButton(item.id, item.text);
            if (item.hasOwnProperty('items')) {
                item.items.forEach((subItem) => {
                    var subButton = BABYLON.GUI.Button.CreateSimpleButton(subItem.id, subItem.text);
                    subButton.isVisible = false;
                    subButton.width = `${this.width}px`;
                    subButton.height = `${this.height}px`;
                    subButton.color = "white";
                    item.enabled ? subButton.background = " #34495e" : subButton.background = "#696969";
                    item.enabled ? subButton.fontSize = 17 : subButton.fontSize = 15;
                    this.advancedTexture.addControl(subButton);
                    subItem.button = subButton;
                    subButton.onPointerEnterObservable.add(() => {
                        subButton.background = "blue";
                        subButton.color = "white";
                    });
                    subButton.onPointerOutObservable.add(function () {
                        subButton.background = " #34495e";
                        subButton.color = "white";
                    });
                });
            }
            if (item.enabled) {
                button.onPointerClickObservable.add(async () => {
                    if (button.name == "import_mesh") {
                        if (this.sceneUser != 'dan') {
                            const response = await fetch("/api/model", {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(
                                    {
                                        "modelName": this.pickedModel,
                                        "user": this.sceneUser
                                    }
                                )
                            });
                            const data = await response.json();
                            this.statusText.text = `${this.pickedModel}  mesh imported successfully`;
                        } else {
                            this.statusText.text = `${this.pickedModel}  can not import model to your own scene`;
                        }
                    } else if (button.name == "comment") {
                        let comment = prompt(`Add Comment to ${this.pickedModel}`);
                        if (comment != null && comment != "") {
                            await fetch("/api/comment", {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(
                                    {
                                        user: this.sceneUser,
                                        model: this.pickedModel,
                                        comment: comment
                                    }
                                )
                            });
                            this.statusText.text = `${this.pickedModel}  Comment submitted`;

                        }


                    } else if (button.name == "review_comments") {
                        //                        this.statusText.text = "TODO: REVIEW COMMENTS";
                        const response = await fetch(`/api/comment/user/${this.sceneUser}/model/${this.pickedModel}`);
                        const data = await response.json();
                        if (data.length > 0) {
                            this.statusText.text = `${data[0].model}: ${data[0].comment}`

                        }
                    } else {
                        this.statusText.text = "TODO: NOT YET IMPLEMENTED SORRY";//`${pickedModel} ${button.name}`;

                    }

                    this.flashToast();
                });
                button.onPointerEnterObservable.add(async () => {
                    button.background = "blue";
                    button.color = "white";
                    this.hideSubItem();
                    if (button.name == "versions") {
                        const response = await fetch(`/api/user/${this.sceneUser}/model/${this.pickedModel}/versions`);
                        const data = await response.json();
                        item.items = [];
                        data.forEach((version) => {
                            var date = new Date(version.ts);
                            var year = date.getFullYear();
                            var month = date.getMonth() + 1;      // "+ 1" becouse the 1st month is 0
                            var day = date.getDate();
                            var hour = date.getHours();
                            var minutes = date.getMinutes();
                            var secconds = date.getSeconds();
                            var assetTime = day + '-' + month + '-' + year + '  ' + hour + ':' + minutes + ':' + secconds;
                            item.items.push({
                                id: version.cid,
                                text: assetTime,
                                enabled: true
                            })
                        });
                        var pos = 0;
                        item.items.forEach((subItem) => {
                            var subButton = BABYLON.GUI.Button.CreateSimpleButton(subItem.id, subItem.text);
                            subButton.isVisible = false;
                            subButton.width = `${this.width}px`;
                            subButton.height = `${this.height}px`;
                            subButton.color = "white";
                            item.enabled ? subButton.background = " #34495e" : subButton.background = "#696969";
                            item.enabled ? subButton.fontSize = 14 : subButton.fontSize = 12;
                            this.advancedTexture.addControl(subButton);
                            subItem.button = subButton;
                            subButton.onPointerEnterObservable.add(() => {
                                subButton.background = "blue";
                                subButton.color = "white";
                            });
                            subButton.onPointerOutObservable.add(() => {
                                subButton.background = " #34495e";
                                subButton.color = "white";
                            });
                            subButton.onPointerClickObservable.add(async () => {

                                await fetch("/api/revert", {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(
                                        {
                                            "modelName": this.pickedModel,
                                            "user": this.sceneUser,
                                            "version": subItem.id
                                        }
                                    )
                                });

                                this.statusText.text = `${this.pickedModel}  mesh imported successfully`;

                            });

                            var subButton = subItem.button;
                            subButton.top = parseInt(button.top) + pos;
                            subButton.left = parseInt(button.left) + parseInt(button.width);
                            pos += parseInt(button.height);
                            subButton.isVisible = true;
                        });

                    }

                });
                button.onPointerOutObservable.add(function () {
                    button.background = " #34495e";
                    button.color = "white";
                });
            }

            button.isVisible = false;
            button.width = `${this.width}px`;
            button.height = `${this.height}px`;
            button.color = "white";
            item.enabled ? button.background = " #34495e" : button.background = "#696969";
            item.enabled ? button.fontSize = 17 : button.fontSize = 15;
            this.advancedTexture.addControl(button);
            item.button = button;
            // this.menu.push(button);



        });
    }
    flashToast() {
        this.statusText.isVisible = true;
        this.statusText.top = 20 - (window.innerHeight / 2);

        setTimeout(() => {
            this.statusText.text = "";
            this.statusText.isVisible = false;
        }, 2000);
    }
    initToast() {
        this.statusText = new BABYLON.GUI.TextBlock();
        this.statusText.color = "black";
        this.statusText.fontSize = 24;
        this.statusText.isVisible = false;

        this.advancedTexture.addControl(this.statusText);
    }
    #locationSearchtoMap() {
        const queryString = window.location.search;
        const urlParams = [...new URLSearchParams(queryString)];
        const paramMaps = new Map();
        urlParams.forEach((param) => {
            paramMaps.set(param[0], param[1])
        });
        return paramMaps;
    }

    #mapToLocationSearch(map) {
        var search = "?";
        for (const [key, value] of map.entries()) {
            search += `${key}=${value}&`
        }
        return search;
    }
    #isFirstPerson() {
        var map = this.#locationSearchtoMap();
        return map.get("view") == "first_person"
    }
    sideMenu() {
        const width = 100;
        const height = 50;
        // Change View from first person to 3D view
        const paramMaps = this.#locationSearchtoMap();
        // var isFirstPerson = (paramMaps.has('view') && paramMaps.get('view') == 'first_person');
        this.viewButton = BABYLON.GUI.Button.CreateImageButton("view_type", this.#isFirstPerson() ? "3D view" : "First person", "/images/vr.png");
        this.viewButton.width = `${width}px`;
        this.viewButton.height = `${height}px`;
        this.viewButton.color = "white";
        this.viewButton.fontSize = 15;
        this.viewButton.background = "gray";
        this.viewButton.top = (window.innerHeight / 2) - height * 3;
        this.viewButton.left = -width;
        this.viewButton.onPointerClickObservable.add(() => {
            if (this.#isFirstPerson()) {
                paramMaps.delete('view');
                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + this.#mapToLocationSearch(paramMaps);
            } else {
                paramMaps.set('view', 'first_person')
                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + this.#mapToLocationSearch(paramMaps);
            }
        });
        this.advancedTexture.addControl(this.viewButton);
        // Reload scene
        this.reloadButton = BABYLON.GUI.Button.CreateImageButton("relooad", "Reload", "/images/refresh.svg");
        this.reloadButton.width = `${width}px`;
        this.reloadButton.height = `${height}px`;
        this.reloadButton.color = "white";
        this.reloadButton.fontSize = 15;
        this.reloadButton.background = "gray";
        this.reloadButton.top = (window.innerHeight / 2) - height * 3;
        this.reloadButton.left = 0//(width / 2)
        this.reloadButton.onPointerClickObservable.add(() => {
            if (this.#isFirstPerson()) {
                window.location.reload();
            } else {
                fetchScene(this.sceneUser, this.activeScene, 'user', this.scene);

            }

        });
        this.advancedTexture.addControl(this.reloadButton);

        // Download Scene
        this.downloadButton = BABYLON.GUI.Button.CreateImageButton("downlaod", "Download", "/images/download.png");
        this.downloadButton.width = `${width}px`;
        this.downloadButton.height = `${height}px`;
        this.downloadButton.color = "white";
        this.downloadButton.fontSize = 15;
        this.downloadButton.background = "gray";
        this.downloadButton.top = (window.innerHeight / 2) - height * 3;
        this.downloadButton.left = width
        this.downloadButton.onPointerClickObservable.add(() => {
            //  window.location.reload();
            fetch(`/api/binary/${this.sceneUser}`)
                .then(res => res.blob())
                .then((blob) => {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = "scene.glb";
                    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                    a.click();
                    a.remove();  //afterwards we remove the element again   
                })
        });
        this.advancedTexture.addControl(this.downloadButton);

    }

    initComment() {

    }
    hide() {
        this.items.forEach((item) => {
            item.button.isVisible = false;
            if (item.hasOwnProperty('items')) {
                item.items.forEach((subItem) => {
                    subItem.button.isVisible = false;
                });
            }
        });
    }

    resize() {
        const width = 100;
        const height = 50;

        this.viewButton.top = (window.innerHeight / 2) - height * 3;
        this.viewButton.left = -width;

        this.reloadButton.top = (window.innerHeight / 2) - height * 3;
        this.reloadButton.left = 0//(width / 2)

        this.downloadButton.top = (window.innerHeight / 2) - height * 3;
        this.downloadButton.left = width


    }
    hideSubItem() {
        this.items.forEach((item) => {
            if (item.hasOwnProperty('items')) {
                item.items.forEach((subItem) => {
                    subItem.button.isVisible = false;
                });
            }
        });
    }
    show() {
        var pos = 0;
        this.items.forEach((item) => {
            item.button.top = this.scene.pointerY - (window.innerHeight / 2 - ((this.height / 2) + pos));
            item.button.left = this.scene.pointerX - (window.innerWidth / 2 - (this.width / 2));
            pos += this.height;
            item.button.isVisible = true;
            if (item.button.name == "menu_title") {
                item.button._textBlock.text = `model: ${this.pickedModel}`;
            }
        });
    }

}
