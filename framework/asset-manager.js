export class AssetManager {
  constructor(){this.images=new Map();this.audio=new Map();}
  image(src){if(this.images.has(src))return this.images.get(src);const img=new Image();img.decoding='async';img.src=src;this.images.set(src,img);return img;}
  loaded(src){const img=this.images.get(src);return !!(img?.complete&&img.naturalWidth);}
  clear(){this.images.clear();this.audio.clear();}
}
