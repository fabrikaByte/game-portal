export function rectsOverlap(a,b,padding=0){const p=Math.max(0,Number(padding)||0);return a.x+p<b.x+b.width-p&&a.x+a.width-p>b.x+p&&a.y+p<b.y+b.height-p&&a.y+a.height-p>b.y+p}export function circleHit(a,b){const dx=a.x-b.x,dy=a.y-b.y,r=a.radius+b.radius;return dx*dx+dy*dy<=r*r}export function clamp(v,min,max){return Math.max(min,Math.min(max,v))}export function moveToward(c,t,d){return Math.abs(t-c)<=d?t:c+Math.sign(t-c)*d}

export const rectanglesOverlap = rectsOverlap;
