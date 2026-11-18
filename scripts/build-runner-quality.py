"""Optimize an existing licensed runner into an explicit, immutable new version.
Geometry and UVs stay authored; material consolidation and shared 1024px textures
reduce transfer and draw calls. Shopify CC BY 4.0 source credit is preserved in
public/models/source/shopify-source.md. Blender --background --python this.py --
--source public/models/runner-v1.glb --model-output public/models/runner-v2.glb
--poster-prefix public/editorial/runner-v2
"""
import argparse,sys,runpy
from pathlib import Path
h=runpy.run_path(str(Path(__file__).with_name('build-assets.py')))
bpy=h['bpy'];new_output=h['new_output'];stage_render=h['stage_render']
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--source',required=True);p.add_argument('--model-output',required=True);p.add_argument('--poster-prefix',required=True)
a=p.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
output=new_output(a.model_output);prefix=Path(a.poster_prefix).resolve()
new_output(str(prefix)+'.png');new_output(str(prefix)+'-detail.png')
stage_render.__globals__['OUT']=prefix.parent
h['clean']();bpy.ops.import_scene.gltf(filepath=str(Path(a.source).resolve()))
# Fit shallow rubber grip ribs to the original sole's underside. Rays sample
# authored geometry, so the tread follows the runner's heel/toe rocker instead
# of floating on a flat plane. Existing body, UVs and licensed source stay intact.
from mathutils import Vector
sole=next(m for m in bpy.data.materials if m.name.split('.')[0]=='sole')
grip=h['material']('sole.grip',h['BASE']['sole'],.9)
deps=bpy.context.evaluated_depsgraph_get()
for x in [-1.20+i*.19 for i in range(13)]:
    for side in [-1,1]:
        hit,point,normal,_,obj,_=bpy.context.scene.ray_cast(deps,Vector((x,side*.22,-2)),Vector((0,0,1)))
        if not hit or not obj.data.materials or obj.data.materials[0]!=sole:continue
        if normal.z>0:normal=-normal
        rib=h['cube']('rubber grip',tuple(point+normal*.004),(.075,.25,.022),grip,.008)
        rib.modifiers['soft construction'].segments=2
        rib.rotation_euler=Vector((0,0,1)).rotation_difference(normal).to_euler()
# Merge disconnected pieces only within one material, retaining part picking.
for material in list(bpy.data.materials):
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and len(o.data.materials)==1 and o.data.materials[0]==material]
    if not objects:continue
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join();bpy.context.object.name=material.name.split('.')[0]
for image in bpy.data.images:
    if image.type=='IMAGE' and max(image.size)>1024:
        ratio=1024/max(image.size);image.scale(max(1,round(image.size[0]*ratio)),max(1,round(image.size[1]*ratio)));image.pack()
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT',export_copyright='© 2021 Shopify. Adapted under CC BY 4.0; source/credits: public/models/source/shopify-source.md')
# The exported neutral albedo is tinted by the interactive editor. Apply the
# identical default palette for posters instead of rendering neutral white.
for mat in bpy.data.materials:
    part=mat.name.split('.')[0]
    if part not in h['BASE'] or not mat.use_nodes:continue
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    color=(*h['rgb'](h['BASE'][part]),1)
    links=list(bsdf.inputs['Base Color'].links)
    if links:
        mix=mat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=color
        mat.node_tree.links.new(links[0].from_socket,mix.inputs[1]);mat.node_tree.links.new(mix.outputs[0],bsdf.inputs['Base Color'])
    else:bsdf.inputs['Base Color'].default_value=color
stage_render(prefix.name+'.png');stage_render(prefix.name+'-detail.png',True)
print('RUNNER_NEW_VERSION_COMPLETE',output)
