export class AssetManager {
  constructor(){this.cache=new Map();this.loading=new Map()}
  async image(src){if(this.cache.has(`image:${src}`))return this.cache.get(`image:${src}`);if(this.loading.has(`image:${src}`))return this.loading.get(`image:${src}`);const p=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.cache.set(`image:${src}`,img);this.loading.delete(`image:${src}`);resolve(img)};img.onerror=()=>{this.loading.delete(`image:${src}`);reject(new Error(`Failed to load image: ${src}`))};img.src=src});this.loading.set(`image:${src}`,p);return p}
  async json(src,fetcher=globalThis.fetch){if(this.cache.has(`json:${src}`))return this.cache.get(`json:${src}`);if(this.loading.has(`json:${src}`))return this.loading.get(`json:${src}`);if(typeof fetcher!=='function')throw new Error('fetch is unavailable');const p=fetcher(src).then(r=>{if(!r.ok)throw new Error(`Failed to load JSON ${src}: ${r.status}`);return r.json()}).then(data=>{this.cache.set(`json:${src}`,data);this.loading.delete(`json:${src}`);return data}).catch(err=>{this.loading.delete(`json:${src}`);throw err});this.loading.set(`json:${src}`,p);return p}
  has(type,src){return this.cache.has(`${type}:${src}`)}
  get(type,src){return this.cache.get(`${type}:${src}`)}
  clear(prefix=null){if(prefix===null){this.cache.clear();return}for(const key of this.cache.keys())if(key.startsWith(`${prefix}:`))this.cache.delete(key)}
  clearAll(){this.cache.clear();this.loading.clear()}
}
