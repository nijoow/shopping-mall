"""Original low-top v2: continuous collar topology and fitted construction.
Run: Blender --background --factory-startup --python scripts/build-low-v2.py
"""
import runpy, sys, math
from pathlib import Path
sys.argv = [__file__, '--', 'helpers-only']
h = runpy.run_path(str(Path(__file__).with_name('build-assets.py')))
globals().update({k: h[k] for k in ['bpy','Vector','ROOT','MODELS','clean','material','mesh','curve','stage_render']})
clean()
mats = {p: material(p,c,r) for p,c,r in [('upper','#e6e1d7',.48),('panel','#e6e1d7',.55),('sole','#bc9b73',.78),('laces','#e6e1d7',.85)]}
lining = material('lining','#aaa397',.95)
thread = material('stitch','#c5bfb2',.85)
metal = material('eyelet','#b4afa3',.4,.3)
N=160

def signed(v,p): return math.copysign(abs(v)**p,v)
def outline(a):
    return (1.47*signed(math.cos(a),.77), (.455+.035*math.cos(a))*signed(math.sin(a),.8))
def surf(a,t,offset=0):
    x,y=outline(a)
    cx=-.85+.43*math.cos(a);cy=.255*math.sin(a)
    # Smoothly loft the entire last into a real opening; no deleted-grid edge.
    z=-.235+(.655+.04*math.cos(a))*t**.38
    return (x*(1-t)+cx*t,y*(1-t)+cy*t,z+offset)

def sheet(name,fn,nu,nv,mat,wrap=False,thickness=0):
    vs=[fn(i/nu if wrap else i/(nu-1),j/(nv-1)) for i in range(nu) for j in range(nv)]
    fs=[]
    for i in range(nu if wrap else nu-1):
        for j in range(nv-1):
            a=i*nv+j;b=((i+1)%nu)*nv+j
            fs.append((a,b,b+1,a+1))
    obj=mesh(name,vs,fs,mat)
    # Recalculate normals so backface culling and engraving raycasts agree.
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');obj.select_set(False)
    if name in ('upper','quarter panel'):
        outward=sum(p.normal.x*(p.center.x+.7)+p.normal.y*p.center.y for p in obj.data.polygons)
        if outward<0:obj.data.flip_normals()
    if thickness:
        mod=obj.modifiers.new('leather thickness','SOLIDIFY');mod.thickness=thickness;mod.offset=-1
    return obj

sheet('upper',lambda u,t:surf(u*2*math.pi,t),N,36,mats['upper'],True,.022)
# Collar binding follows an exact continuous boundary.
curve('padded collar',[surf(i*2*math.pi/N,1,.001) for i in range(N+1)],.022,mats['panel'])
sheet('inner lining',lambda u,t:(-.85+(.43-.035*t)*math.cos(u*2*math.pi),(.255-.03*t)*math.sin(u*2*math.pi),.420+.04*math.cos(u*2*math.pi)-.42*t),N,12,lining,True,.012)
# Insole visible through the collar.
mesh('insole',[(-.85,0,.015)]+[(-.85+.40*math.cos(i*2*math.pi/N),.225*math.sin(i*2*math.pi/N),.015) for i in range(N)],[(0,i+1,(i+1)%N+1) for i in range(N)],lining)
# Rounded cupsole, closed underneath with a restrained rubber foxing line.
rings=[(-.445,.978),(-.435,1.007),(-.40,1.022),(-.255,1.022),(-.22,1.006),(-.213,.989)]
vs=[(outline(i*2*math.pi/N)[0]*s,outline(i*2*math.pi/N)[1]*s,z) for z,s in rings for i in range(N)]
fs=[tuple(range(N-1,-1,-1)),tuple((len(rings)-1)*N+i for i in range(N))]
for j in range(len(rings)-1):
    for i in range(N):a=j*N+i;b=j*N+(i+1)%N;fs.append((a,b,b+N,a+N))
mesh('cupsole',vs,fs,mats['sole'])
for z in [-.265,-.396]:
    curve('rubber foxing',[(outline(i*2*math.pi/N)[0]*1.024,outline(i*2*math.pi/N)[1]*1.024,z) for i in range(N+1)],.005,mats['sole'])
# Quarter overlays hug the last and taper towards the vamp.
for side in [-1,1]:
    def panel(u,v):
        a=side*(.78+2.34*u);top=.56+.38*math.sin(u*math.pi/2)
        t=top*v
        p=Vector(surf(a,t));da=Vector(surf(a+.0001,t))-p
        dt=Vector(surf(a,t+.0001))-p
        normal=da.cross(dt).normalized()
        return tuple(p+normal*.006)
    sheet('quarter panel',panel,64,16,mats['panel'],False,.003)
    curve('quarter seam',[panel(i/80,.97) for i in range(81)],.0028,thread)
# A rounded tongue on the vamp. Its height follows the same last.
def vamp(x,y=0):
    # Invert the loft's XY coordinates so tongue and lace stays follow its actual
    # surface even off-centre, instead of hovering over a centreline estimate.
    a=y/.4;t=(1.47-x)/1.89
    for _ in range(18):
        p=surf(a,t);pa=surf(a+.0001,t);pt=surf(a,min(1,t+.0001))
        ax=(pa[0]-p[0])/.0001;ay=(pa[1]-p[1])/.0001
        tx=(pt[0]-p[0])/.0001;ty=(pt[1]-p[1])/.0001
        det=ax*ty-ay*tx
        if abs(det)<1e-9:break
        dx=x-p[0];dy=y-p[1]
        a+=(dx*ty-dy*tx)/det
        t=max(.001,min(.999,t+(ax*dy-ay*dx)/det))
    return surf(a,t)[2]
sheet('tongue',lambda u,v:(-.40+.99*u,(v*2-1)*(.16+.02*math.sin(math.pi*u)),vamp(-.40+.99*u,(v*2-1)*.16)+.010),40,12,mats['upper'],False,.018)
# Lace stays and eyelets lie on the sloping vamp, not on flat horizontal rings.
for side in [-1,1]:
    sheet('lace stay',lambda u,v:(-.36+.94*u,side*(.16+.085*v),vamp(-.36+.94*u,side*(.16+.085*v))+.016),40,6,mats['panel'],False,.012)
    curve('lace stay seam',[(x,side*.232,vamp(x,side*.232)+.020) for x in [-.35+i*.91/40 for i in range(41)]],.0028,thread)
for i in range(6):
    x=-.30+i*.145
    for side in [-1,1]:
        y=side*.191;z=vamp(x,y)+.030
        bpy.ops.mesh.primitive_torus_add(major_radius=.020,minor_radius=.004,major_segments=20,minor_segments=8,location=(x,y,z))
        obj=bpy.context.object;obj.name='eyelet';obj.data.materials.append(metal)
        obj.rotation_euler.y=.25
    if i<5:
        for side in [-1,1]:
            pts=[(x,side*.19,vamp(x,side*.19)+.041),(x+.072,0,vamp(x+.072)+.048+(0.012 if side==1 else 0)),(x+.145,-side*.19,vamp(x+.145,side*.19)+.041)]
            curve('crossed lace',pts,.014,mats['laces'])
# Small tied bow near the tongue head, with short naturally curved ends.
z=vamp(-.28)+.086
for side in [-1,1]:
    curve('lace bow',[(-.28,0,z),(-.38,side*.14,z+.055),(-.22,side*.19,z+.020),(-.28,0,z)],.012,mats['laces'])
    curve('lace end',[(-.28,0,z),(-.15,side*.10,z+.01),(-.04,side*.16,vamp(-.04,side*.16)+.06)],.012,mats['laces'])
# Fine interrupted cupsole stitching rather than thick continuous cords.
for i in range(180):
    a=i*2*math.pi/180;b=a+.017
    curve('sole stitch',[(outline(t)[0]*1.024,outline(t)[1]*1.024,-.244) for t in [a,b]],.0022,thread)
# All original model components use the same physical coordinates.
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bpy.ops.object.convert(target='MESH')
# Consolidate construction details by material to avoid a draw call per stitch.
for mat in list(mats.values())+[lining,thread,metal]:
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==mat]
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join();bpy.context.object.name=mat.name
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(MODELS/'low-v2.glb'),export_format='GLB',use_selection=True,export_apply=True,export_materials='EXPORT')
stage_render('low-v2.png')
stage_render('low-detail-v2.png',True)
print('LOW_V2_COMPLETE')
