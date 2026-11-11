/**
 * Google Apps Script Web App
 * Deploy: Execute as Me, Access: Anyone (server-to-server requests use a secret).
 * Script Properties: INBOX_SECRET = same secret as the Cloudflare Worker's GAS_SHARED_SECRET.
 * Endpoint is NOT for direct use from the browser.
 */
const RECIPIENT = 'wuxi232439@gmail.com';
const MAX_AUDIO_BYTES = 10000000;
function json_(data) {
 return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function safe_(v,n) {return String(v==null?'':v).slice(0,n);}
function doGet() {return json_({ok:true,service:'ielts-email-relay'});}
function doPost(e) {
 try {
  const data=JSON.parse(e.postData.contents||'{}');
  const secret=PropertiesService.getScriptProperties().getProperty('INBOX_SECRET');
  if(!secret||secret.length<32||data.secret!==secret)return json_({ok:false,error:'Unauthorized'});
  const m=data.meta||{};
  if(!/^HW-[0-9]{8}-[A-F0-9]{10}$/.test(m.id||'')||!m.name||!data.audio||!Number.isInteger(m.bytes)||m.bytes<1||m.bytes>MAX_AUDIO_BYTES)return json_({ok:false,error:'Invalid submission'});
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))return json_({ok:false,error:'Service busy, retry'});
  try {
   const props=PropertiesService.getScriptProperties();
   const key='SENT_'+m.id;
   if(props.getProperty(key)==='sent')return json_({ok:true,state:'accepted',id:m.id,duplicate:true});
   const audio=Utilities.base64Decode(data.audio);
   if(audio.length!==m.bytes)return json_({ok:false,error:'Audio size mismatch'});
   const type=safe_(m.mime,100)||'audio/webm';
   const extension=/wav/i.test(type)?'wav':/mp4|m4a/i.test(type)?'m4a':/ogg/i.test(type)?'ogg':'webm';
   const filename=safe_(m.name,70).replace(/[\\/:*?"<>|\r\n]/g,'_')+'-'+m.id;
   const body=['雅思口语作业','提交编号：'+m.id,'姓名：'+safe_(m.name,90),
      '学习编号：'+safe_(m.profile,100),'Part：'+safe_(m.part,30),
      '话题：'+safe_(m.topic,200),'题目：'+safe_(m.question,400),'',
      '逐字稿：','',safe_(m.transcript,4000)].join('\n');
   if(MailApp.getRemainingDailyQuota()<1)return json_({ok:false,error:'Daily email quota exhausted'});
   MailApp.sendEmail({
      to:RECIPIENT,
      subject:'雅思口语作业｜'+safe_(m.name,60).replace(/[\r\n]/g,' ')+'｜'+safe_(m.part,20),
      body:body,
      name:'IELTS Speaking Homework',
      attachments:[
       Utilities.newBlob(audio,type,filename+'.'+extension),
       Utilities.newBlob(body,'text/plain',filename+'-transcript.txt')
      ]
   });
   props.setProperty(key,'sent');
   return json_({ok:true,state:'accepted',id:m.id});
  }finally{lock.releaseLock();}
 }catch(err){return json_({ok:false,error:'Mail relay failed: '+String(err.message||err).slice(0,160)});}
}
