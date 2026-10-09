export class ErrorReporter {
  constructor({limit=100}={}){this.limit=Math.max(1,Math.floor(limit));this.errors=[];this._attached=false;this._onError=e=>this.capture(e.error||new Error(e.message||'Unknown error'),{source:'window.error'});this._onReject=e=>this.capture(e.reason||new Error('Unhandled promise rejection'),{source:'unhandledrejection'})}
  capture(error,meta={}){const normalized=error instanceof Error?error:new Error(String(error));const item={error:normalized,message:error?.message||String(error),stack:error?.stack||'',time:Date.now(),meta};this.errors.push(item);if(this.errors.length>this.limit)this.errors.splice(0,this.errors.length-this.limit);return item}
  attach(){if(this._attached||typeof window==='undefined')return this;window.addEventListener('error',this._onError);window.addEventListener('unhandledrejection',this._onReject);this._attached=true;return this}
  detach(){if(!this._attached||typeof window==='undefined')return this;window.removeEventListener('error',this._onError);window.removeEventListener('unhandledrejection',this._onReject);this._attached=false;return this}
  clear(){this.errors.length=0}
  latest(){return this.errors[this.errors.length-1]||null}
  get count(){return this.errors.length}
}
