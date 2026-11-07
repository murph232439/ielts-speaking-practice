/**
 * IELTS Speaking Homework Inbox — Cloudflare Worker + PRIVATE R2.
 * No credentials are embedded in the website. Deploy via Wrangler with two secrets.
 */
const MAX_BYTES = 10_000_000;
const ORIGIN = 'https://murph232439.github.io';
const enc = new TextEncoder();
const dec = new TextDecoder();
const json = (body, status=200, more={}) => new Response(JSON.stringify(body), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...more}});
const safe = (s, n=300) => String(s??'').slice(0,n);
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const from64 = s => Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
const hex = a => [...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('');
function cors(request) {
 const origin=request.headers.get('Origin');
 return origin===ORIGIN ? {'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Content-Type, Authorization','vary':'Origin'} : {};
}
function err(request,message,status=400){return json({error:message},status,cors(request));}
async function sign(data,secret) {
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return b64u(await crypto.subtle.sign('HMAC',key,enc.encode(data)));
}
async function verify(token,secret) {
 if(typeof token!=='string'||token.length>20000)return null;
 const i=token.lastIndexOf('.');if(i<0)return null;
 const p=token.slice(0,i),sig=token.slice(i+1);
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 try{
  if(!await crypto.subtle.verify('HMAC',key,from64(sig),enc.encode(p)))return null;
  const data=JSON.parse(dec.decode(from64(p)));
  if(Date.now()>data.exp||data.exp-Date.now()>11*60*1000)return null;
  return data;
 }catch{return null;}
}
const validId = id => /^HW-[0-9]{8}-[A-F0-9]{10}$/.test(id);
const metaKey = id => 'meta/'+id+'.json';
const audioKey = id => 'audio/'+id;
function auth(request,env){
 const h=request.headers.get('Authorization')||'';
 if(!h.startsWith('Basic '))return false;
 try {
  const [user,...pass]=atob(h.slice(6)).split(':');
  return user==='teacher' && pass.join(':')===env.ADMIN_PASSWORD && env.ADMIN_PASSWORD?.length>=16;
 }catch{return false;}
}
function unauthorized(){return new Response('教师后台需要登录', {status:401,headers:{'www-authenticate':'Basic realm="IELTS Homework Inbox"','cache-control':'no-store'}});}

function mimeExt(mime) {return /wav/i.test(mime)?'wav':/mp4|m4a/i.test(mime)?'m4a':/ogg/i.test(mime)?'ogg':'webm';}
function fileName(name) {return safe(name,90).replace(/[\\/:*?"<>|\r\n]/g,'_');}
function toBase64(bytes) {
 const b=new Uint8Array(bytes);let out='';
 for(let i=0;i<b.length;i+=8192)out+=String.fromCharCode(...b.subarray(i,i+8192));
 return btoa(out);
}
async function emailHomework(env,m,audio) {
 if(!env.GAS_WEB_APP_URL||!env.GAS_SHARED_SECRET)return {error:'Google 邮件转发服务尚未配置'};
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(env.GAS_WEB_APP_URL))return {error:'Google 邮件转发地址无效'};
 let response,result;
 try{
  response=await fetch(env.GAS_WEB_APP_URL,{method:'POST',redirect:'follow',headers:{'content-type':'text/plain;charset=utf-8'},
   body:JSON.stringify({secret:env.GAS_SHARED_SECRET,meta:m,audio:toBase64(audio)})});
  result=await response.json();
 }catch{return {error:'Google 邮件发送接口连接失败'};}
 if(!response.ok||!result.ok||result.state!=='accepted'||result.id!==m.id)return {error:'Google 邮件发送服务未确认接收'};
 return {id:m.id};
}

const adminPage = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>雅思口语 · 作业收件箱</title>
<style>body{font:15px/1.6 system-ui,sans-serif;margin:auto;max-width:960px;padding:24px;background:#f8f5fb;color:#40364e}h1{font-size:25px}button,a{font:inherit;color:#715394}button{border:1px solid #d9c9e5;background:white;border-radius:9px;padding:7px 13px;cursor:pointer}.row{background:white;border:1px solid #e5daed;padding:16px;margin:12px 0;border-radius:12px}small{color:#81718e}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#faf8fc;padding:9px;border-radius:8px}audio{max-width:100%;display:block;margin:10px 0}</style></head><body>
<h1>雅思口语 · 作业收件箱</h1><p>录音保存在私有 R2 存储中。仅教师账号可以查看、试听、下载。</p><button onclick="load()">刷新收件箱</button><p id="status">正在读取…</p><main id="list"></main>
<script>
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function load(){
 const status=document.querySelector('#status'),out=document.querySelector('#list');status.textContent='正在读取…';
 try {const res=await fetch('/api/admin/list',{cache:'no-store'});if(!res.ok)throw Error('访问失败：'+res.status);
 const data=await res.json();status.textContent='最近 '+data.items.length+' 条（最多显示 100 条）';
 out.innerHTML=data.items.map(x=>'<section class="row"><strong>'+escapeHTML(x.name)+'</strong> · '+escapeHTML(x.part)+' · '+escapeHTML(x.topic)+'<br><small>'+escapeHTML(x.createdAt)+' · '+escapeHTML(x.id)+' · '+Number(x.bytes/1024/1024).toFixed(2)+'MB</small><p>'+escapeHTML(x.question)+'</p><audio controls preload="none" src="/api/admin/audio/'+encodeURIComponent(x.id)+'"></audio><a href="/api/admin/audio/'+encodeURIComponent(x.id)+'?download=1">下载录音</a><details><summary>展开逐字稿</summary><pre>'+escapeHTML(x.transcript||'无逐字稿')+'</pre></details></section>').join('')||'<p>还没有收到作业。</p>';
 }catch(e){status.textContent=e.message;}
}load();
</script></body></html>`;
export default {
 async fetch(request,env) {
  const url=new URL(request.url),path=url.pathname;
  if(!env.BUCKET||!env.SIGNING_KEY||!env.ADMIN_PASSWORD)return json({error:'Server is not configured'},503);
  if(request.method==='OPTIONS'&&(path==='/api/ticket'||path==='/api/submissions'))return new Response(null,{status:204,headers:cors(request)});
  if(path==='/health'&&request.method==='GET')return json({ok:true,service:'ielts-homework-inbox',storage:'configured'});
  if(path.startsWith('/api/admin/')||path==='/admin'){
   if(!auth(request,env))return unauthorized();
   if(path==='/admin'&&request.method==='GET')return new Response(adminPage,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
   if(path==='/api/admin/list'&&request.method==='GET'){
    const list=await env.BUCKET.list({prefix:'meta/',limit:1000});
    const objects=list.objects.sort((a,b)=>b.uploaded-a.uploaded).slice(0,100);
    const items=(await Promise.all(objects.map(async o=>{const x=await env.BUCKET.get(o.key);try{return x?JSON.parse(await x.text()):null;}catch{return null;}}))).filter(Boolean);
    return json({items});
   }
   const match=path.match(/^\/api\/admin\/audio\/(HW-[0-9]{8}-[A-F0-9]{10})$/);
   if(match&&request.method==='GET'){
    const obj=await env.BUCKET.get(audioKey(match[1]));
    if(!obj)return new Response('Not found',{status:404});
    const mime=obj.httpMetadata?.contentType||'application/octet-stream';
    const headers={'content-type':mime,'cache-control':'private, no-store','x-content-type-options':'nosniff'};
    if(url.searchParams.has('download'))headers['content-disposition']='attachment; filename="'+match[1]+'.'+(/wav/i.test(mime)?'wav':/mp4|m4a/i.test(mime)?'m4a':/ogg/i.test(mime)?'ogg':'webm')+'"';
    return new Response(obj.body,{headers});
   }
   return json({error:'Not found'},404);
  }
  if(path==='/api/ticket'&&request.method==='POST'){
   if(request.headers.get('Origin')!==ORIGIN)return err(request,'Origin not allowed',403);
   let m;try{m=await request.json();}catch{return err(request,'Invalid JSON');}
   if(!m||!validId(m.id)||!m.name||m.name.length>90||!Number.isInteger(m.bytes)||m.bytes<1||m.bytes>MAX_BYTES||!/^[0-9a-f]{64}$/.test(m.sha256||'')||!m.retryKey||m.retryKey.length>128)return err(request,'Invalid submission');
   const meta={id:m.id,name:safe(m.name,90),profile:safe(m.profile,100),part:safe(m.part,30),topic:safe(m.topic,200),question:safe(m.question,400),transcript:safe(m.transcript,4000),bytes:m.bytes,mime:safe(m.mime,100),sha256:m.sha256,retryKey:safe(m.retryKey,128)};
   const payload=b64u(enc.encode(JSON.stringify({meta,exp:Date.now()+10*60*1000})));
   return json({token:payload+'.'+await sign(payload,env.SIGNING_KEY)},200,cors(request));
  }
  if(path==='/api/submissions'&&request.method==='POST'){
   if(request.headers.get('Origin')!==ORIGIN)return err(request,'Origin not allowed',403);
   const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
   const verified=await verify(token,env.SIGNING_KEY);if(!verified)return err(request,'Upload ticket expired or invalid',401);
   const m=verified.meta,existing=await env.BUCKET.get(metaKey(m.id));
   let old=null;
   if(existing) {
    try{old=JSON.parse(await existing.text());}catch{return err(request,'Stored metadata unavailable',500);}
    if(old.sha256!==m.sha256||old.retryKey!==m.retryKey)return err(request,'ID already used',409);
    if(old.emailStatus==='accepted')return json({ok:true,state:'emailed',id:m.id,emailId:old.emailId,duplicate:true},200,cors(request));
   }
   if(Number(request.headers.get('Content-Length')||0)>MAX_BYTES)return err(request,'Audio exceeds 10 MB',413);
   const buf=await request.arrayBuffer();
   if(buf.byteLength!==m.bytes||buf.byteLength>MAX_BYTES)return err(request,'Audio size mismatch',400);
   if(hex(await crypto.subtle.digest('SHA-256',buf))!==m.sha256)return err(request,'Audio checksum mismatch',400);
   if(!old||!await env.BUCKET.head(audioKey(m.id))){
    await env.BUCKET.put(audioKey(m.id),buf,{httpMetadata:{contentType:m.mime}});
   }
   const base=old||{...m,createdAt:new Date().toISOString()};
   await env.BUCKET.put(metaKey(m.id),JSON.stringify({...base,emailStatus:'pending'}),{httpMetadata:{contentType:'application/json'}});
   const sent=await emailHomework(env,m,buf);
   if(sent.error) {
    await env.BUCKET.put(metaKey(m.id),JSON.stringify({...base,emailStatus:'pending',emailError:sent.error}),{httpMetadata:{contentType:'application/json'}});
    return err(request,'录音已在服务器备份，但'+sent.error+'。可重试邮件发送',502);
   }
   await env.BUCKET.put(metaKey(m.id),JSON.stringify({...base,emailStatus:'accepted',emailId:sent.id,emailAcceptedAt:new Date().toISOString()}),{httpMetadata:{contentType:'application/json'}});
   return json({ok:true,state:'emailed',id:m.id,emailId:sent.id},200,cors(request));
  }
  return json({error:'Not found'},404);
 }
};
