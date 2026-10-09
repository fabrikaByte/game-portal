export class LoopbackTransport{
  constructor(){this.handlers=new Set();this.opened=false}
  connect(){this.opened=true;return Promise.resolve(this)}
  onMessage(fn){this.handlers.add(fn);return()=>this.handlers.delete(fn)}
  send(payload){for(const fn of this.handlers)fn(payload,this)}
  close(){this.opened=false;this.handlers.clear()}
}
export class WebSocketTransport{
  constructor({url,protocols}={}){if(!url)throw new Error('WebSocketTransport requires url');this.url=url;this.protocols=protocols;this.socket=null;this.handlers=new Set();this.status='idle'}
  connect(){if(typeof WebSocket==='undefined')return Promise.reject(new Error('WebSocket is unavailable'));this.status='connecting';return new Promise((resolve,reject)=>{const ws=new WebSocket(this.url,this.protocols);this.socket=ws;ws.addEventListener('open',()=>{this.status='open';resolve(this)});ws.addEventListener('message',e=>{let data=e.data;try{data=JSON.parse(data)}catch{}for(const fn of this.handlers)fn(data,this)});ws.addEventListener('close',()=>{this.status='closed'});ws.addEventListener('error',err=>{this.status='error';reject(err)})})}
  onMessage(fn){this.handlers.add(fn);return()=>this.handlers.delete(fn)}
  send(payload){if(this.socket?.readyState!==WebSocket.OPEN)throw new Error('WebSocket is not connected');this.socket.send(typeof payload==='string'?payload:JSON.stringify(payload))}
  close(){this.socket?.close();this.socket=null;this.status='closed'}
}
export class MultiplayerSession{
  constructor({transport,id='local',tickRate=10}={}){if(!transport)throw new Error('MultiplayerSession requires transport');this.transport=transport;this.id=id;this.tickRate=Math.max(1,tickRate);this.peers=new Map();this.state={tick:0,players:{}};this.listeners=new Set();this.timer=null;this.unsubscribe=this.transport.onMessage?.((m)=>this._receive(m))}
  async connect(){await this.transport.connect();this.transport.send({type:'join',id:this.id});this.timer=setInterval(()=>this._tick(),1000/this.tickRate);return this}
  _tick(){this.state.tick++;this.transport.send({type:'state',id:this.id,tick:this.state.tick,state:this.state});}
  _receive(msg){if(!msg)return;if(msg.type==='join'&&msg.id!==this.id)this.peers.set(msg.id,{id:msg.id});if(msg.type==='leave')this.peers.delete(msg.id);for(const fn of this.listeners)fn(msg,this)}
  onMessage(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
  updateLocalState(partial){this.state={...this.state,...partial};this.transport.send({type:'state',id:this.id,tick:this.state.tick,state:this.state})}
  leave(){this.transport.send({type:'leave',id:this.id});if(this.timer)clearInterval(this.timer);this.transport.close?.();this.unsubscribe?.();this.listeners.clear()}
}
