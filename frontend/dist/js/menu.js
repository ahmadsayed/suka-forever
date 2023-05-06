const items = [
    {
        id: "menu_title",
        text: "",
        enabled: false
    },
    {
        id: "delete_token",
        text: "Delete",
        enabled: true
    }
];
const MENU_ITEM_WIDTH = 160;
const MENU_ITEM_HEIGHT = 35;
var selectedTokenName = null;
function initMenu() {

    items.forEach((item) => {
        var button = BABYLON.GUI.Button.CreateSimpleButton(item.id, item.text);
        button.isVisible = false;
        button.width = `${MENU_ITEM_WIDTH}px`;
        button.height = `${MENU_ITEM_HEIGHT}px`;
        button.color = "white";
        item.enabled ? button.background = " #34495e" : button.background = "#696969";
        item.enabled ? button.fontSize = 17 : button.fontSize = 15;
        advancedTexture.addControl(button);
        if (item.enabled) {
            button.onPointerClickObservable.add(async () => {
                if (button.name == "delete_token") {
                    const value = addedObjects.get(selectedTokenName);
                    for (let i = 0; i < value.length; i++) {
                        value[i].dispose();
                    }    
                }
                addedObjects.delete(selectedTokenName)
                hideMenu();
            });
        }
        item.button = button;

    })
}
function showMenu(token_name) {
    var pos = 0;
    items.forEach((item) => {
        item.button.top = `${scene.pointerY - (canvas.height / 2 - ((MENU_ITEM_HEIGHT / 2) + pos))}px`;
        item.button.left = `${scene.pointerX - (canvas.width / 2 - ( MENU_ITEM_WIDTH / 2))}px`;
        pos += MENU_ITEM_HEIGHT;
        item.button.isVisible = true;
        if (item.button.name == "menu_title") {
            selectedTokenName = token_name;
            item.button._textBlock.text = convertNumberToString(BigInt(token_name.split("_")[0]));
        }
    });
}


function hideMenu() {
    items.forEach((item) => {
        item.button.isVisible = false;
        if (item.hasOwnProperty('items')) {
            item.items.forEach((subItem) => {
                subItem.button.isVisible = false;
            });
        }
    });
}