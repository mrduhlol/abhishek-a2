import * as THREE from 'three';

const INK = '#29271f';
const PAPER = '#f4efdf';
const OLIVE = '#6f7952';

// Every scene is composed in the same 100 × 80 drawing space. Batched line
// segments keep the pencil detail inexpensive even on mobile GPUs.
export function createTerrain(type = 'mountain', drawOverride) {
  const group = new THREE.Group();
  const batches = new Map();
  const disposable = new Set();
  let seed = 2173;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  function line(points, color = INK, opacity = .78, z = 0) {
    const key = `${color}:${opacity}:${z}`;
    if (!batches.has(key)) batches.set(key, { color, opacity, z, points: [] });
    const data = batches.get(key).points;
    for (let i = 1; i < points.length; i++) {
      data.push(points[i - 1][0], points[i - 1][1], z, points[i][0], points[i][1], z);
    }
  }
  function curve(points, color = INK, opacity = .65, z = 0) {
    const c = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, z)));
    line(c.getPoints(Math.max(points.length * 8, 24)).map(p => [p.x, p.y]), color, opacity, z);
  }
  function shape(points, color = OLIVE, opacity = .13, z = -.15) {
    const path = new THREE.Shape();
    points.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y));
    path.closePath();
    const geometry = new THREE.ShapeGeometry(path);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z;
    mesh.renderOrder = z;
    group.add(mesh);
    disposable.add(geometry); disposable.add(material);
  }
  function ring(x, y, r, color = INK, opacity = .7, z = 0) {
    const pts = Array.from({ length: 73 }, (_, i) => {
      const a = i / 72 * Math.PI * 2;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r];
    });
    line(pts, color, opacity, z);
  }
  function inkShape(points, fill = PAPER, opacity = 1, z = 0) {
    shape(points, fill, opacity, z);
    line([...points, points[0]], INK, .8, z + .1);
  }
  function grass(x, y, size = 1.5) {
    curve([[x - size, y], [x - size * .2, y + size * 1.5], [x, y]], OLIVE, .7);
    curve([[x, y], [x + size * .6, y + size * 2], [x + size * .5, y]], INK, .45);
  }
  function bird(x, y, s = 1) {
    curve([[x - s * 2, y], [x - s, y + s * .5], [x, y - s * .15], [x + s, y + s * .5], [x + s * 2, y]], INK, .65, -1);
  }
  function cloud(x, y, scale = 1) {
    const pts = [[-9,0],[-8,2],[-5,3],[-3,6],[0,6.5],[3,3.7],[6,4],[8,2],[10,1],[11,0],[-9,0]].map(([a,b])=>[x+a*scale,y+b*scale]);
    curve(pts, INK, .3, -3);
    line([[x - 6 * scale, y - 1.2 * scale], [x + 8 * scale, y - 1.2 * scale]], INK, .18, -3);
  }
  function sun(x, y, r = 5) {
    ring(x, y, r, '#b49b58', .7, -4);
    ring(x + .2, y - .2, r + .4, '#b49b58', .25, -4);
    for (let i=0;i<12;i++) {
      const a=i*Math.PI/6;
      line([[x+Math.cos(a)*(r+1.8),y+Math.sin(a)*(r+1.8)],[x+Math.cos(a)*(r+3),y+Math.sin(a)*(r+3)]], '#b49b58', .45, -4);
    }
  }
  function hatch(a, b, count = 12, lean = -3, color = INK, opacity = .22) {
    for(let i=0;i<count;i++) {
      const t=i/count;
      const x=a[0]+(b[0]-a[0])*t;
      const y=a[1]+(b[1]-a[1])*t;
      line([[x,y],[x+lean*(.4+random()*.6),y-2-random()*3]],color,opacity);
    }
  }
  function pine(x, y, height = 15, z = 0) {
    const pts=[[x,y+height],[x-height*.18,y+height*.66],[x-height*.1,y+height*.66],[x-height*.29,y+height*.35],[x-height*.16,y+height*.35],[x-height*.36,y+2],[x+height*.36,y+2],[x+height*.16,y+height*.35],[x+height*.29,y+height*.35],[x+height*.1,y+height*.66],[x+height*.18,y+height*.66]];
    inkShape(pts, PAPER,1,z);
    shape([[x,y+height],[x,y+2],[x+height*.36,y+2],[x+height*.16,y+height*.35],[x+height*.29,y+height*.35],[x+height*.1,y+height*.66],[x+height*.18,y+height*.66]],OLIVE,.17,z+.01);
    line([[x,y],[x,y+height-1]],INK,.6,z+.2);
    for(let n=0;n<5;n++) {
      const h=height*(.15+n*.13);
      line([[x-height*(.28-n*.04),y+h],[x,y+h+1.5],[x+height*(.25-n*.04),y+h+.5]],INK,.25,z+.2);
    }
  }
  function rock(x,y,r=3){inkShape([[x-r,y],[x-r*.7,y+r*.65],[x+r*.1,y+r],[x+r,y+r*.35],[x+r*.9,y]], PAPER,1,.3);line([[x-r*.7,y+r*.65],[x+r*.2,y+r*.3],[x+r*.9,y]],INK,.25,.4);}
  function ground() {
    curve([[-44,-25],[-34,-24],[-21,-25],[-4,-23],[12,-24],[26,-23],[43,-25]],INK,.55,.8);
    for(let i=0;i<38;i++) {
      const x=-40+random()*80,y=-26-random()*5;
      line([[x,y],[x+1+random()*3,y+.15]],INK,.15,.8);
    }
  }
  function mountain() {
    sun(24,24,5); cloud(-27,23,.75); bird(7,28,.8); bird(12,25,.5);
    const back=[[-45,-15],[-27,13],[-18,3],[-6,24],[8,2],[18,15],[42,-15]];
    line(back,INK,.35,-3);
    hatch([-27,13],[-39,-7],12,2,INK,.13);hatch([18,15],[32,-5],10,-2,INK,.13);
    const left=[[-43,-24],[-15,26],[13,-24]];
    inkShape(left,PAPER,1,0);
    shape([[-15,26],[-10,8],[2,-5],[13,-24],[-7,-24],[-12,-1]],OLIVE,.15,.1);
    line([[-15,26],[-12,13],[-15,8],[-9,1],[-10,-6],[-4,-15],[-7,-24]],INK,.7,.3);
    line([[-24,10],[-19,12],[-16,8],[-12,13],[-9,9],[-5,9]],INK,.75,.3);
    hatch([-22,8],[-38,-20],22,4);hatch([-10,8],[8,-21],24,-3);
    const right=[[-8,-24],[17,17],[41,-24]];
    inkShape(right,PAPER,1,1);
    shape([[17,17],[18,3],[27,-5],[41,-24],[21,-24],[22,-7]],OLIVE,.15,1.05);
    line([[17,17],[14,7],[18,4],[17,-3],[23,-10],[21,-24]],INK,.7,1.2);
    line([[10,5],[14,7],[16,3],[18,4],[22,2],[25,2]],INK,.65,1.2);
    hatch([14,1],[0,-20],16,3);hatch([22,1],[34,-21],16,-3);
    pine(-33,-24,8,2);pine(36,-24,11,2);pine(31,-24,7,2);ground();
    curve([[-8,-24],[-13,-28],[-3,-31],[7,-35]],INK,.45,2);
    curve([[-3,-24],[-6,-28],[5,-31],[11,-35]],INK,.25,2);
  }
  function forest() {
    sun(-7,21,5); cloud(23,23,.8);
    [-37,-24,-11,8,22,36].forEach((x,i)=>pine(x,-20,19+(i%3)*5,-2));
    // Old tree trunks and branching crowns frame a suspended rope bridge.
    function oldTree(x,mirror=1) {
      inkShape([[x-3,-25],[x-2,12],[x-7*mirror,25],[x-5*mirror,26],[x+1,14],[x+7*mirror,28],[x+9*mirror,27],[x+3,9],[x+4,-25]],PAPER,1,1);
      curve([[x,-24],[x-.5,-8],[x+1,9]],INK,.4,1.2);
      curve([[x-1,11],[x-11*mirror,18],[x-14*mirror,17]],INK,.7,1.2);
      for(let i=0;i<15;i++) {
        const a=i*2.4, rad=5+random()*6;
        const cx=x+Math.cos(a)*rad,cy=24+Math.sin(a)*rad*.6;
        curve([[cx-3,cy],[cx-2,cy+2],[cx+1,cy+2.5],[cx+3,cy]],OLIVE,.55,1);
      }
      hatch([x-1,-20],[x,8],15,-1,INK,.2);
    }
    oldTree(-28,1);oldTree(29,-1);
    curve([[-26,3],[-12,-1],[0,-3],[15,-1],[28,3]],INK,.85,2);
    curve([[-26,-4],[-12,-8],[0,-10],[15,-8],[28,-4]],INK,.85,2);
    for(let x=-25;x<=27;x+=3) {
      const y=-10+7*(x/28)**2;
      line([[x,y],[x,y+7]],INK,.5,2);
      line([[x-.5,y],[x+1,y-1.2]],INK,.7,2);
    }
    curve([[-4,25],[-7,16],[-6,7],[-9,1]],OLIVE,.6,1);
    curve([[17,26],[13,13],[15,4]],OLIVE,.5,1);
    for(let i=0;i<19;i++)grass(-42+random()*84,-24-random()*4,1+random());
    ground();rock(-16,-25,3);rock(17,-26,2);
  }
  function grassland(){
    sun(-26,25,5);cloud(11,24,1);cloud(33,15,.55);bird(-3,21,.7);bird(2,18,.5);
    const hills=[[-45,-6],[-29,4],[-15,7],[0,2],[16,7],[32,5],[45,-3]];
    curve(hills,INK,.45,-2);
    curve([[-44,-15],[-29,-5],[-10,-4],[8,-12],[29,-5],[44,-8]],OLIVE,.7,-1);
    shape([[-44,-15],[-29,-5],[-10,-4],[8,-12],[29,-5],[44,-8],[44,-25],[-44,-25]],OLIVE,.1,-1.5);
    curve([[-8,1],[-4,-5],[6,-11],[3,-16],[-11,-21],[-8,-29],[7,-35]],'#5e7b80',.65,.5);
    curve([[-5,1],[0,-5],[11,-11],[8,-17],[-5,-22],[-2,-28],[15,-35]],'#5e7b80',.65,.5);
    for(let i=0;i<65;i++) {
      const x=-42+random()*84,y=-10-random()*18;
      if(Math.abs(x)<13)continue;
      grass(x,y,.5+random()*1.2);
    }
    // Quiet windmill at the horizon and a small fence on the near hillside.
    inkShape([[23,-5],[25,8],[28,8],[30,-5]],PAPER,1,.5);
    ring(26.5,9,.8,INK,.8,1);
    [[-7,8],[8,7],[7,-8],[-8,-7]].forEach(([x,y])=>{
      line([[26.5,9],[26.5+x,9+y]],INK,.65,1);
      line([[26.5+x*.45,9+y*.45],[26.5+x-2,9+y+1],[26.5+x,9+y]],INK,.65,1);
    });
    for(let i=0;i<6;i++){const x=-36+i*3;line([[x,-20],[x,-14]],INK,.7,2);}
    line([[-36,-16],[-21,-16]],INK,.65,2);line([[-36,-18],[-21,-18]],INK,.5,2);
    rock(18,-24,2);rock(22,-25,3);ground();
  }
  function desert(){
    sun(22,23,8);bird(-14,23,.75);
    curve([[-45,-2],[-31,8],[-16,13],[0,5],[18,0],[32,8],[45,6]],INK,.35,-3);
    curve([[-45,-13],[-29,-8],[-12,2],[4,5],[22,-4],[45,-8]],INK,.65,-1);
    shape([[-45,-13],[-29,-8],[-12,2],[4,5],[22,-4],[45,-8],[45,-28],[-45,-28]],'#b69a61',.12,-1.2);
    curve([[-45,-24],[-23,-10],[-4,-12],[13,-17],[30,-13],[45,-19]],INK,.8,1);
    for(let i=0;i<10;i++)curve([[-37+i*.3,-19-i*.65],[-24,-13-i*.8],[-10,-15-i*.7],[5,-20-i*.5]],'#a38e66',.25,1);
    function cactus(x,y,h){
      const s=h/20;
      const pts=[[-2,0],[-2,8],[-7,8],[-8,10],[-8,16],[-6,17],[-5,16],[-5,11],[-2,11],[-2,20],[0,22],[2,20],[2,5],[5,5],[5,13],[7,14],[9,13],[9,5],[7,2],[2,2],[2,0]].map(([a,b])=>[x+a*s,y+b*s]);
      inkShape(pts,PAPER,1,2);
      curve([[x,y+1],[x,y+h]],OLIVE,.65,2.2);
      hatch([x-1,y+1],[x-1,y+h-2],10,-.5,INK,.25);
    }
    cactus(-28,-22,24);cactus(32,-23,15);
    rock(15,-24,4);rock(21,-25,2);
    for(let i=0;i<65;i++){const x=-38+random()*76,y=-23-random()*8;line([[x,y],[x+.15,y+.15]],INK,.35,2);}
    curve([[-7,-19],[-3,-22],[0,-23]],INK,.4,2);
    line([[-2,-24],[-1,-24.8]],INK,.6,2);line([[1,-26],[2,-26.8]],INK,.6,2);line([[4,-28],[5,-28.8]],INK,.6,2);
  }
  function ocean(){
    cloud(-22,24,.7);sun(22,24,5);bird(-1,23,.7);
    for(let row=0;row<5;row++){
      const y=6-row*3;
      const pts=Array.from({length:20},(_,i)=>[-44+i*4.6,y+Math.sin(i*.8+row*.65)*1.2]);
      curve(pts,'#5e7b80',row===0?.75:.35,-1+row*.1);
    }
    // Sailboat sits above a layered cross section of the reef.
    line([[-15,10],[-15,26]],INK,.8,1);
    inkShape([[-15,26],[-15,11],[-3,11]],PAPER,1,1);
    inkShape([[-17,23],[-26,11],[-17,11]],PAPER,1,1);
    inkShape([[-28,9],[-24,5],[-9,5],[-5,9]],PAPER,1,1.5);
    curve([[-43,-25],[-30,-22],[-15,-27],[1,-23],[20,-26],[43,-21]],INK,.6,1);
    function coral(x,y,h){
      curve([[x,y],[x-1,y+h*.5],[x,y+h]],OLIVE,.8,2);
      [[-1,0],[1,3],[-1,6],[1,8]].forEach(([d,dy])=>curve([[x,y+3+dy],[x+d*4,y+6+dy],[x+d*5,y+9+dy]],OLIVE,.7,2));
    }
    coral(-31,-24,16);coral(28,-24,18);coral(34,-23,12);
    for(let i=0;i<8;i++)ring(-23+random()*48,-20+random()*23,.3+random()*.7,'#5e7b80',.45,1);
    [[-8,-10,1],[14,-16,.8],[6,-4,.65]].forEach(([x,y,s])=>{
      curve([[x-4*s,y],[x-1*s,y+2*s],[x+3*s,y],[x-s,y-2*s],[x-4*s,y]],INK,.65,2);
      line([[x-4*s,y],[x-6*s,y+2*s],[x-6*s,y-2*s],[x-4*s,y]],INK,.65,2);
      ring(x+1.3*s,y+.3*s,.15,INK,.8,2);
    });
    rock(-13,-27,4);rock(11,-26,3);
    for(let i=0;i<15;i++)line([[-38+i*5,-29-random()*2],[-36+i*5,-29-random()*2]],INK,.2,1);
  }
  function cave(){
    const outer=[[-44,-25],[-44,5],[-38,20],[-25,30],[-8,33],[10,30],[26,32],[40,23],[44,4],[44,-25]];
    const inner=[[-33,-25],[-33,3],[-28,15],[-15,22],[1,24],[18,20],[31,16],[34,0],[33,-25]];
    curve(outer,INK,.8,0);curve(inner,INK,.65,0);
    for(let i=0;i<7;i++)curve([[-44+i*.8,-17],[-42+i*.8,3],[-36+i*.8,19],[-25+i*.8,27]],INK,.18,0);
    for(let i=0;i<7;i++)curve([[43-i*.7,-17],[42-i*.7,5],[37-i*.7,20],[30-i*.7,27]],INK,.18,0);
    [[-24,21,12],[-13,25,8],[7,24,14],[24,20,9]].forEach(([x,y,h])=>{
      inkShape([[x-3,y],[x,y-h],[x+3,y]],PAPER,1,1);line([[x,y],[x,y-h]],INK,.3,1.1);
    });
    function crystal(x,y,h,w=4){
      inkShape([[x-w,y],[x-w,y+h*.7],[x,y+h],[x+w,y+h*.7],[x+w,y]],PAPER,1,1);
      shape([[x,y],[x,y+h],[x+w,y+h*.7],[x+w,y]],OLIVE,.2,1.01);
      line([[x,y],[x,y+h]],INK,.5,1.2);line([[x-w,y+h*.7],[x,y+h*.58],[x+w,y+h*.7]],INK,.4,1.2);
    }
    crystal(-23,-25,17,3);crystal(-30,-25,9,2.5);crystal(-17,-25,11,2.5);
    crystal(24,-25,22,4);crystal(16,-25,12,3);crystal(32,-25,11,3);
    // A narrow subterranean pool reflects the crystal shapes.
    for(let i=0;i<6;i++)curve([[-13+i*.5,-26-i*1.4],[-4,-25-i*1.4],[6,-26-i*1.4],[16-i,-25-i*1.4]],'#5e7b80',.3,1.5);
    for(let i=0;i<13;i++){
      const x=-20+random()*40,y=-10+random()*27;
      line([[x-.55,y],[x+.55,y]],'#a38e66',.65,1);line([[x,y-.55],[x,y+.55]],'#a38e66',.65,1);
    }
    rock(-37,-25,4);rock(39,-25,4);ground();
  }
  function volcano(){
    cloud(-29,25,.7);bird(27,25,.6);
    curve([[-8,17],[-14,24],[-9,29],[-14,34]],INK,.3,-2);
    curve([[3,17],[11,24],[5,28],[9,34]],INK,.3,-2);
    curve([[-1,19],[2,24],[-1,30],[1,35]],'#a87252',.4,-2);
    line([[-44,-20],[-29,1],[-14,-18]],INK,.3,-2);line([[14,-18],[31,5],[44,-20]],INK,.3,-2);
    const ridge=[[-40,-24],[-25,-7],[-11,16],[-4,13],[4,15],[11,12],[21,-6],[41,-24]];
    inkShape(ridge,PAPER,1,0);
    shape([[4,15],[11,12],[21,-6],[41,-24],[14,-24],[12,-4]],'#a87252',.12,.1);
    curve([[-11,16],[-5,10],[4,11],[11,12]],INK,.7,.4);
    curve([[-4,10],[-6,4],[-2,-3],[-5,-10],[2,-18],[-2,-24]],'#a87252',.9,.5);
    curve([[1,11],[-1,4],[3,-3],[0,-10],[6,-18],[3,-24]],'#a87252',.9,.5);
    hatch([-15,7],[-33,-22],24,4);hatch([15,5],[32,-23],24,-3);
    for(let i=0;i<10;i++){const x=-7+random()*14,y=18+random()*13;line([[x,y],[x+.4,y+1]],'#a87252',.6,1);}
    rock(-31,-26,4);rock(26,-27,4);rock(34,-25,2);ground();
  }
  const scenes={mountain,forest,grassland,desert,ocean,cave,volcano};
  const baseline = () => (scenes[type] || mountain)();
  const api = { line, curve, shape, inkShape, ring, hatch, grass, pine, cloud, sun, bird, rock, ground, random, group, baseline };
  if (drawOverride) drawOverride(api);
  else baseline();
  // Contour batches are grouped by paint and depth, not by individual stroke.
  for(const {color,opacity,points} of batches.values()){
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    const material=new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false});
    const strokes=new THREE.LineSegments(geometry,material);
    strokes.renderOrder=points[2] || 0;
    group.add(strokes);
    disposable.add(geometry);disposable.add(material);
  }
  return {group,dispose(){disposable.forEach(item=>item.dispose());}};
}

export const TERRAIN_ASCII = {
  mountain: '      /\\       .       /\\\n  /\\ /  \\    /\\     /  \\\n /  /    \\__/  \\___/    \\\n/__/  /\\    /    \\    /\\ \\',
  forest: '    /|\\        /|\\\n   //|\\\\     //|\\\\\n  ///|\\\\\\   ///|\\\\\\\n     |    ~~~    |\n_____|___________|_____',
  grassland: '      .        ~     .\n   __/ \\____       ___\n__/        \\_____/   \\__\n   ,|,   ,|,     ,|,\n~~~~~~~     ~~~~~~~~~~~~~',
  desert: '             .-.-.\n            (     )\n  __          `-.-\'\n_/  \\____      ____/\\\n         \\____/       \\_',
  ocean: '          |\\\n          | \\\n       ___|__\\\n       \\_____/\n~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~\n  ><(((°>       o   o\n      ~ ~ ~ ~ ~ ~ ~',
  cave: '  /\\____/\\____/\\\n /  \\  /  \\  /  \\\n|    \\/    \\/    |\n|  /\\        /\\  |\n|_/||\\______/||\\_|',
  volcano: '          . : .\n        .  :  .\n         /~~\\\n        / :: \\\n     __/  ::  \\__\n____/     ::     \\____',
};
