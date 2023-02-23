import bpy
from datetime import datetime
import platform, os, time
from multiprocessing import Process
import webbrowser
import requests
import json
  

bl_info = {
    "name": "SukaVerse Integration",
    "category": "Web3",
    "version": (1, 0, 0),
    "blender": (2, 80, 0),
    'location': 'File > Export > glTF 2.0',
    'description': 'Example addon to add a custom extension to an exported glTF file.',
    'tracker_url': "https://github.com/KhronosGroup/glTF-Blender-IO/issues/",  # Replace with your issue tracker
    'isDraft': False,
    'developer': "SukaVerse", 
    'url': 'https://sukaverse.club',  # Replace this
}

# glTF extensions are named following a convention with known prefixes.
# See: https://github.com/KhronosGroup/glTF/tree/main/extensions#about-gltf-extensions
# also: https://github.com/KhronosGroup/glTF/blob/main/extensions/Prefixes.md
glTF_extension_name = "EXT_web3_extension"
IPFS_HOST_NAME= "ipfs.sukaverse.club"
# Support for an extension is "required" if a typical glTF viewer cannot be expected
# to load a given model without understanding the contents of the extension.
# For example, a compression scheme or new image format (with no fallback included)
# would be "required", but physics metadata or app-specific settings could be optional.
extension_is_required = False

class ExampleExtensionProperties(bpy.types.PropertyGroup):
    enabled: bpy.props.BoolProperty(
        name=bl_info["name"],
        description='Include this extension in the exported glTF file.',
        default=True
        )
    string_property: bpy.props.StringProperty(
        name='TokenID StringProperty',
        description='Token ID a globally unique identifier for specific object',
        default=""
        )

def register():
    bpy.utils.register_class(ExampleExtensionProperties)
    bpy.types.Scene.ExampleExtensionProperties = bpy.props.PointerProperty(type=ExampleExtensionProperties)

def register_panel():
    # Register the panel on demand, we need to be sure to only register it once
    # This is necessary because the panel is a child of the extensions panel,
    # which may not be registered when we try to register this extension
    try:
        bpy.utils.register_class(GLTF_PT_UserExtensionPanel)
    except Exception:
        pass

    # If the glTF exporter is disabled, we need to unregister the extension panel
    # Just return a function to the exporter so it can unregister the panel
    return unregister_panel


def unregister_panel():
    # Since panel is registered on demand, it is possible it is not registered
    try:
        bpy.utils.unregister_class(GLTF_PT_UserExtensionPanel)
    except Exception:
        pass


def unregister():
    unregister_panel()
    bpy.utils.unregister_class(ExampleExtensionProperties)
    del bpy.types.Scene.ExampleExtensionProperties

class GLTF_PT_UserExtensionPanel(bpy.types.Panel):

    bl_space_type = 'FILE_BROWSER'
    bl_region_type = 'TOOL_PROPS'
    bl_label = "Enabled"
    bl_parent_id = "GLTF_PT_export_user_extensions"
    bl_options = {'DEFAULT_CLOSED'}

    @classmethod
    def poll(cls, context):
        sfile = context.space_data
        operator = sfile.active_operator
        return operator.bl_idname == "EXPORT_SCENE_OT_gltf"

    def draw_header(self, context):
        props = bpy.context.scene.ExampleExtensionProperties
        self.layout.prop(props, 'enabled')

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False  # No animation.

        props = bpy.context.scene.ExampleExtensionProperties
        layout.active = props.enabled

        box = layout.box()
        box.label(text=glTF_extension_name)

        props = bpy.context.scene.ExampleExtensionProperties
        layout.prop(props, 'string_property', text="TOKEN ID")

token_id = None
now = time.time()
class glTF2ExportUserExtension:

    def __init__(self):
        # We need to wait until we create the gltf2UserExtension to import the gltf2 modules
        # Otherwise, it may fail because the gltf2 may not be loaded yet
        from io_scene_gltf2.io.com.gltf2_io_extensions import Extension
        self.Extension = Extension
        self.properties = bpy.context.scene.ExampleExtensionProperties

    def gather_node_hook(self, gltf2_object, blender_object, export_settings):
        if self.properties.enabled:
            if gltf2_object.extensions is None:
                gltf2_object.extensions = {}
            gltf2_object.extensions[glTF_extension_name] = self.Extension(
                name=glTF_extension_name,
                extension={"string": self.properties.string_property},
                required=extension_is_required
            )
            print("KEEYEYYYYYYYS")
            print(self.properties.string_property)
            global token_id
            token_id = self.properties.string_property
            print(token_id)

def creation_date(path_to_file):
    if platform.system() == 'Windows':
        return os.path.getctime(path_to_file)
    else:
        stat = os.stat(path_to_file)
        try:
            return stat.st_birthtime
        except AttributeError:
            # We're probably on Linux. No easy way to get creation dates here,
            # so we'll settle for when its content was last modified.
            return stat.st_mtime

def push_to_blockchain(ts, filename, token_id):

    while True:
        time.sleep(1)
        check_file = os.path.isfile(filename)
        if check_file and creation_date(filename) > ts:
            break
    print("File Found wihth correct Timestamp")
    # Opening JSON file
    f = open(filename)
    headers = ('authorization: Bearer ' + token_id)
    # returns JSON object as 
    # a dictionary
    data = json.load(f)

    files = {
        'file': open(filename, 'rb'),
    }

    response = requests.post(
        'https://{IPFS_HOST_NAME}/api/v0/add?quiet=true&pin=true'.format(IPFS_HOST_NAME=IPFS_HOST_NAME),
        files=files, headers=headers
    )

    cid = (response.json()['Hash'])

    files = {
        'data': (None, token_id),
    }

    response = requests.post('https://{IPFS_HOST_NAME}/api/v0/multibase/encode'.format(IPFS_HOST_NAME=IPFS_HOST_NAME), 
        files=files, headers=headers)
    topic = response.content.decode("utf-8")
    print("Publish to topic {topic_name}, mutlibase {multibase}".format(topic_name=token_id, multibase=topic    ))
    params = {
    'arg': topic,
    }

    files = {
        'data': (None, cid),
    }

    response = requests.post('https://{IPFS_HOST_NAME}/api/v0/pubsub/pub'.format(IPFS_HOST_NAME=IPFS_HOST_NAME), params=params
        , files=files, headers=headers)

    
    # target_url = "https://sukaverse.club/builder.html?cid={cid}&name={model_name}&token={token_id}".format(cid=cid, model_name=model_name, token_id=token_id)
    # webbrowser.open(target_url, new=0)

def glTF2_post_export_callback(settings):
    print("POST SAVE CALLBACK")
    print(settings)
    filepath = settings['gltf_filepath']
    p = Process(target=push_to_blockchain, args=(now, filepath, token_id))
    p.start()
 