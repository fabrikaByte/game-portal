export const hit=(a,b,pad=0)=>a.x+pad<b.x+b.w&&a.x+a.w-pad>b.x&&a.y+pad<b.y+b.h&&a.y+a.h-pad>b.y;
export const circle=(a,b)=>{const dx=a.x-b.x,dy=a.y-b.y;const r=a.r+b.r;return dx*dx+dy*dy<=r*r};
export const pointInRect=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
