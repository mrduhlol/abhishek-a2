export const SEGMENT = 48;
export const START_X = -17;
export const END_X = 322;
export const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
export function pathZ(x) { return 3.8*Math.sin(x*.045) + 1.4*Math.sin(x*.087); }
export function pathY(x) { return 3.6*Math.sin((x+15)*.026) + 1.8*Math.sin(x*.061); }
export function groundHeight(x,z) {
 const distance = Math.abs(z-pathZ(x));
 const shoulder = Math.min(1, Math.max(0,(distance-1.7)/7));
 return pathY(x) + shoulder*(Math.sin(x*.18+z*.24)*1.3+Math.cos(z*.3-x*.08)*1.1);
}
export function routeAt(progress) { const x=START_X+clamp(progress)*(END_X-START_X); return {x,y:pathY(x)+.06,z:pathZ(x)}; }
export function chapterAt(progress) { return clamp(Math.round(routeAt(progress).x/SEGMENT),0,6); }
export function projectProgress(index) { return clamp((index*SEGMENT-START_X)/(END_X-START_X)); }
