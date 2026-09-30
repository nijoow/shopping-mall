"""Build inspectable local assets. Runner: adapted Shopify CC-BY-4.0 sample.
Low-top and apparel: original procedural meshes. No generated raster stand-ins.
Run through Blender; resulting GLBs and PNGs share the same geometry/materials.
"""
import bpy, math, os, json
import numpy as np
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public'/'editorial'; OUT.mkdir(exist_ok=True)
MODELS=ROOT/'public'/'models'
BASE={'upper':'#a6a9ac','panel':'#343639','sole':'#e6e1d7','laces':'#e6e1d7'}

def rgb(hex):
    channels=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in channels)
def clean():
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color,rough=.6,metal=.0,texture=False):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb(color),1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    if texture:
        n=m.node_tree.nodes.new('ShaderNodeTexNoise');n.inputs['Scale'].default_value=160;n.inputs['Detail'].default_value=2
        bump=m.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.012
        m.node_tree.links.new(n.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
    return m
def assign(obj,mat):
    obj.data.materials.clear();obj.data.materials.append(mat)
    for slot in obj.material_slots:slot.link='DATA';slot.material=mat
def smooth(obj):
    for p in obj.data.polygons:p.use_smooth=True
def mesh(name,verts,faces,mat):
    m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update()
    if verts:
        lo=[min(v[i] for v in verts) for i in range(3)];span=[max(v[i] for v in verts)-lo[i] for i in range(3)];axes=sorted(range(3),key=lambda i:span[i],reverse=True)[:2]
        uv=m.uv_layers.new(name='SurfaceUV')
        for poly in m.polygons:
            for loop in poly.loop_indices:
                co=m.vertices[m.loops[loop].vertex_index].co;uv.data[loop].uv=tuple((co[a]-lo[a])/max(span[a],.001) for a in axes)
    o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);assign(o,mat);smooth(o);return o
def curve(name,points,radius,mat):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=12;c.bevel_depth=radius;c.bevel_resolution=3
    s=c.splines.new('BEZIER');s.bezier_points.add(len(points)-1)
    for b,p in zip(s.bezier_points,points):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(mat);return o
def cube(name,loc,scale,mat,bevel=.08):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    assign(o,mat);mod=o.modifiers.new('soft construction','BEVEL');mod.width=bevel;mod.segments=5
    o.modifiers.new('weighted normals','WEIGHTED_NORMAL');smooth(o);return o
def export_model(name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in bpy.context.scene.objects:
        if o.type in ('MESH','CURVE','FONT'):o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(MODELS/(name+'-v1.glb')),export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT')

def runner():
    clean();bpy.ops.import_scene.gltf(filepath=str(MODELS/'source'/'shopify-shoe.glb'))
    o=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='LOOSE');bpy.ops.object.mode_set(mode='OBJECT')
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
    coords=[o.matrix_world@v.co for o in objects for v in o.data.vertices]
    lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)));hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
    center=(lo+hi)/2;scale=3/(hi.x-lo.x)
    original=objects[0].material_slots[0].material
    # A grayscale source texture keeps the authored fabric detail while allowing
    # per-part tinting. The CC-BY attribution remains with the adapted model.
    gray=None
    for node in original.node_tree.nodes:
        if node.type=='TEX_IMAGE' and node.image and any(link.to_socket.name=='Base Color' for link in node.outputs['Color'].links):
            image=node.image;w,h=image.size;pixels=np.empty(w*h*4,dtype=np.float32);image.pixels.foreach_get(pixels);pixels=pixels.reshape(-1,4)
            light=np.max(pixels[:,:3],axis=1);light=.58+.42*light
            pixels[:,:3]=light[:,None]
            gray=bpy.data.images.new('runner-fabric-neutral',width=w,height=h);gray.pixels.foreach_set(pixels.ravel());gray.pack();break
    mats={}
    for part,color in BASE.items():
        m=original.copy();m.name=part
        p=m.node_tree.nodes.get('Principled BSDF')
        if p:
            for link in list(p.inputs['Base Color'].links):m.node_tree.links.remove(link)
            p.inputs['Base Color'].default_value=(*rgb(color),1)
            if gray:
                tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=gray
                mix=m.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*rgb(color),1)
                m.node_tree.links.new(tex.outputs['Color'],mix.inputs[1]);m.node_tree.links.new(mix.outputs[0],p.inputs['Base Color'])
            p.inputs['Metallic'].default_value=0;p.inputs['Roughness'].default_value=.72 if part=='upper' else .55
        mats[part]=m
    for index,obj in enumerate(objects):
        part='panel'
        if index in list(range(0,10))+list(range(19,25)):part='laces'
        if index in [10,16,17,18,25,26,27,28]:part='upper'
        if index==11 or 49<=index<=57:part='sole'
        matworld=obj.matrix_world.copy()
        for v in obj.data.vertices:v.co=(matworld@v.co-center)*scale
        obj.parent=None;obj.matrix_world.identity();obj.name=f'{part}_{index:02d}';assign(obj,mats[part])
        if hasattr(obj.data,'gltf2_variant_mesh_data'):obj.data.gltf2_variant_mesh_data.clear()
        if hasattr(obj.data,'gltf2_variant_default_materials'):obj.data.gltf2_variant_default_materials.clear()
    for obj in list(bpy.context.scene.objects):
        if obj.type not in ('MESH','CURVE'):bpy.data.objects.remove(obj,do_unlink=True)
    export_model('runner')

def lowtop():
    clean()
    mats={p:material(p,c,.58 if p!='sole' else .8,texture=p in ('upper','panel')) for p,c in {'upper':'#e6e1d7','panel':'#e6e1d7','sole':'#bc9b73','laces':'#e6e1d7'}.items()}
    lining=material('lining','#44413b',.95);stitch=material('stitch','#c5c0b4',.8)
    stations=[(-1.48,.015,.12),(-1.34,.29,.62),(-1.08,.405,.79),(-.77,.44,.78),(-.39,.46,.66),(.02,.51,.47),(.48,.555,.37),(.91,.505,.31),(1.25,.36,.25),(1.44,.08,.10),(1.48,.006,.025)]
    def profile(x):
        for i in range(len(stations)-1):
            a,b=stations[i],stations[i+1]
            if a[0]<=x<=b[0]:
                t=(x-a[0])/(b[0]-a[0]);t=t*t*(3-2*t)
                return a[1]*(1-t)+b[1]*t,a[2]*(1-t)+b[2]*t
        return stations[-1][1:]
    def surface(x,y,offset=0):
        width,height=profile(x)
        return (x,y,-.24+height*max(0,1-(y/width)**2)**.34+offset)
    verts=[];faces=[];NX=72;NT=48
    for i in range(NX):
        x=-1.48+2.96*i/(NX-1);w,h=profile(x)
        for j in range(NT):
            theta=math.pi*j/(NT-1);verts.append((x,w*math.cos(theta),-.24+h*max(0,math.sin(theta))**.68))
    for i in range(NX-1):
        for j in range(NT-1):
            a=i*NT+j;center=(Vector(verts[a])+Vector(verts[a+1])+Vector(verts[a+NT]))/3
            if ((center.x+.91)/.35)**2+(center.y/.255)**2<1 and center.z>.39:continue
            faces.append((a,a+1,a+NT+1,a+NT))
    faces += [tuple(range(NT-1,-1,-1)),tuple((NX-1)*NT+j for j in range(NT))]
    upper=mesh('upper',verts,faces,mats['upper']);sub=upper.modifiers.new('leather shape','SUBSURF');sub.levels=1;sub.render_levels=2
    solid=upper.modifiers.new('leather thickness','SOLIDIFY');solid.thickness=.022
    collar=[]
    for i in range(65):
        t=2*math.pi*i/64;x=-.91+.35*math.cos(t);y=.255*math.sin(t);collar.append(surface(x,y,.006))
    curve('collar',collar,.026,mats['panel'])
    cube('lining',(-.91,0,.16),(.69,.48,.10),lining,.12)
    outline=[(-1.49,.10),(-1.40,.30),(-1.06,.43),(-.55,.47),(.10,.53),(.70,.57),(1.16,.46),(1.40,.26),(1.47,0)]
    contour=outline+[(x,-y) for x,y in reversed(outline[:-1])]
    for name,z0,z1,mat in [('sole',-.43,-.23,mats['sole']),('sole-rim',-.255,-.205,mats['upper'])]:
        vs=[(x,y,z) for z in [z0,z1] for x,y in contour];n=len(contour);fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        sole=mesh(name,vs,fs,mat);b=sole.modifiers.new('rounded sole','BEVEL');b.width=.038;b.segments=5;sole.modifiers.new('weighted normal','WEIGHTED_NORMAL')
    # Quarter overlays follow the last surface instead of spanning it as flat plates.
    for side in [-1,1]:
        vs=[];fs=[];n=30;m=6
        for i in range(n):
            x=-1.30+1.53*i/(n-1);w,h=profile(x)
            for j in range(m):
                theta=.17+(.66+.07*math.sin(i/(n-1)*math.pi))*j/(m-1)
                y=side*w*math.cos(theta)*1.01;z=-.24+h*max(0,math.sin(theta))**.68+.009;vs.append((x,y,z))
        for i in range(n-1):
            for j in range(m-1):a=i*m+j;fs.append((a,a+m,a+m+1,a+1))
        overlay=mesh('panel',vs,fs,mats['panel']);solid=overlay.modifiers.new('panel thickness','SOLIDIFY');solid.thickness=.011
        curve('stitch',[vs[i*m+m-1] for i in range(n)],.006,stitch)
        curve('sole stitching',[(x,side*y*1.02,-.205) for x,y in outline if y>.1],.007,stitch)
    # Tongue and laces sit on the actual upper surface.
    tongue_vs=[]
    for i in range(12):
        x=-.59+1.1*i/11
        for y in [-.155,.155]:tongue_vs.append(surface(x,y,.025))
    tongue=mesh('tongue',tongue_vs,[(2*i,2*i+1,2*i+3,2*i+2) for i in range(11)],mats['upper']);solid=tongue.modifiers.new('tongue thickness','SOLIDIFY');solid.thickness=.025
    for i in range(5):
        x=-.46+i*.18
        p0=surface(x,-.20,.047);p1=surface(x+.11,.20,.047);mid=surface(x+.06,0,.065)
        curve('laces',[p0,mid,p1],.020,mats['laces'])
        curve('laces',[surface(x,.20,.044),surface(x+.07,0,.045),surface(x+.12,-.20,.044)],.017,mats['laces'])
        for side in [-1,1]:
            pos=surface(x,side*.20,.038)
            bpy.ops.mesh.primitive_torus_add(major_radius=.030,minor_radius=.006,major_segments=16,minor_segments=6,location=pos);assign(bpy.context.object,stitch);bpy.context.object.name='eyelet'
    for x in [.69,.87,1.02]:
        for y in [-.11,0,.11]:
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.009,location=surface(x,y,.003));o=bpy.context.object;o.scale.z=.20;assign(o,lining);o.name='toe-perforation'
    export_model('low')

def garment(kind):
    clean()
    colors={'jacket':'#464b45','knit':'#b8ac97','trouser':'#4c4c4a','bag':'#272b2b','cap':'#7d816e'}
    fabric=material('cloth',colors[kind],.8,texture=True);trim=material('trim','#292b29',.75);seam=material('stitch','#a7a396',.8)
    if kind in ('jacket','knit'):
        outline=[(-.48,0,1.12),(-.73,0,.96),(-1.06,0,.13),(-.76,0,-.02),(-.57,0,.48),(-.55,0,-1.00),(.55,0,-1.00),(.57,0,.48),(.76,0,-.02),(1.06,0,.13),(.73,0,.96),(.48,0,1.12),(.27,0,.93),(-.27,0,.93)]
        vs=[(x,y+depth,z) for depth in [-.10,.10] for x,y,z in outline];n=len(outline);fs=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
        o=mesh(kind,vs,fs,fabric);be=o.modifiers.new('fabric edges','BEVEL');be.width=.065;be.segments=5;o.modifiers.new('cloth normals','WEIGHTED_NORMAL')
        if kind=='jacket':
            for sign in [-1,1]:
                pts=[(sign*.02,-.15,.86),(sign*.25,-.18,1.12),(sign*.47,-.17,.82),(sign*.15,-.18,.57)]
                mesh('collar',pts,[(0,1,2,3)],fabric)
                cube('pocket',(sign*.30,-.17,-.16),(.34,.045,.40),fabric,.025)
            curve('zipper',[(0,-.155,-.92),(0,-.165,.75)],.012,trim)
            for z in [-.75,-.35,.05,.45]:cube('zipper tab',(.02,-.18,z),(.04,.025,.05),trim,.01)
        else:
            curve('crew collar',[(-.27,-.15,.96),(-.19,-.19,.81),(0,-.21,.76),(.19,-.19,.81),(.27,-.15,.96)],.045,fabric)
        curve('hem',[(-.52,-.145,-.94),(0,-.15,-.96),(.52,-.145,-.94)],.025,fabric)
    elif kind=='trouser':
        for sign in [-1,1]:
            o=cube('wide leg',(sign*.31,0,-.21),(.53,.20,2.15),fabric,.06);o.rotation_euler.y=sign*.035
            curve('crease',[(sign*.30,-.13,.75),(sign*.32,-.14,-.4),(sign*.35,-.13,-1.23)],.006,trim)
        cube('waist',(0,0,.93),(1.03,.21,.17),fabric,.025)
    elif kind=='bag':
        cube('main body',(0,0,-.12),(1.58,.43,.92),fabric,.17)
        cube('front pocket',(0,-.24,-.15),(1.28,.05,.48),fabric,.09)
        curve('zip',[(-.56,-.28,.08),(0,-.29,.11),(.56,-.28,.08)],.014,trim)
        curve('strap',[(-.74,0,.19),(-.49,.08,.9),(.17,.12,1.03),(.66,.04,.52),(.74,0,.20)],.065,fabric)
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=(0,0,.05));o=bpy.context.object;o.scale=(.70,.72,.54);assign(o,fabric);smooth(o)
        cube('brim',(0,-.69,-.19),(1.24,.87,.05),fabric,.18)
        for sign in [-1,1]:curve('panel seam',[(0,0,.59),(sign*.35,-.30,.48),(sign*.60,-.49,.09)],.007,seam)

def stage_render(filename,detail=False,clothing=False):
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
    scene.render.resolution_x=1100;scene.render.resolution_y=900;scene.render.resolution_percentage=100
    scene.render.film_transparent=True;scene.world.color=(.35,.35,.35)
    scene.view_settings.view_transform='AgX'
    center=Vector((.2,0,.0)) if not clothing else Vector((0,0,0))
    loc=(5.4,-7.8,3.4) if not clothing else (2.2,-9,2.1)
    bpy.ops.object.camera_add(location=loc);cam=bpy.context.object;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.7 if not clothing else 3.1
    if detail:cam.data.ortho_scale=2.35;center=Vector((.25,0,.08));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.camera=cam
    for pos,power,size in [((1,-4,6),850,5),((-4,-1,3),550,4),((3,4,4),950,4)]:
        bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(OUT/filename);bpy.ops.render.render(write_still=True)
    for o in list(scene.objects):
        if o.type in ('CAMERA','LIGHT'):bpy.data.objects.remove(o,do_unlink=True)

import sys
targets=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else ['runner','low']
if 'runner' in targets:runner();stage_render('runner.png');stage_render('runner-detail.png',True)
if 'low' in targets:lowtop();stage_render('low.png');stage_render('low-detail.png',True)
for name in ['jacket','knit','trouser','bag','cap']:
    if name in targets:garment(name);stage_render(name+'.png',clothing=True)
print('Editorial assets built.')
