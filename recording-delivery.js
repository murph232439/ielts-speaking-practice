/* Direct private-storage uploads. Success requires the server persistence receipt. */
(function(){
'use strict';
if(window.IELTSRecordingDelivery)return;
var MAX_BYTES=10000000,MAX_BACKUPS=10,WAIT_MS=20000,dbPromise=null,pending=new Map();
function el(id){return document.getElementById(id);}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function token(){var a=new Uint32Array(4);crypto.getRandomValues(a);return Array.from(a,function(n){return n.toString(16).padStart(8,'0');}).join('');}
function owner(){var name=typeof speakingStudentName==='function'?speakingStudentName():'';var profile='';try{var p=JSON.parse(localStorage.getItem('ielts-soft-study-profile-v6')||'null');profile=p&&p.id||'';}catch(e){}return {name:name,profile:profile};}
function ext(type){return /mp4|m4a/i.test(type)?'m4a':/ogg/i.test(type)?'ogg':/wav/i.test(type)?'wav':'webm';}
function filename(row){return [row.name||'学生',row.part||'口语',row.topic||'录音',new Date(row.createdAt).toISOString().replace(/[:.]/g,'-')].join('-').replace(/[\\/:*?"<>|]/g,'_').slice(0,180)+'.'+ext(row.blob.type);}
function download(blob,name){var u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},30000);}
function openDB(){if(dbPromise)return dbPromise;dbPromise=new Promise(function(resolve,reject){if(!window.indexedDB){reject(Error('storage unavailable'));return;}var r=indexedDB.open('ielts-speaking-audio-backups-v1',1);r.onupgradeneeded=function(){if(!r.result.objectStoreNames.contains('recordings'))r.result.createObjectStore('recordings',{keyPath:'id'});};r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error||Error('storage failed'));};});return dbPromise;}
async function rows(){var db=await openDB();return new Promise(function(resolve,reject){var t=db.transaction('recordings','readonly'),r=t.objectStore('recordings').getAll();r.onsuccess=function(){resolve(r.result||[]);};r.onerror=function(){reject(r.error);};});}
async function saveRow(row){var db=await openDB();await new Promise(function(resolve,reject){var t=db.transaction('recordings','readwrite');t.objectStore('recordings').put(row);t.oncomplete=resolve;t.onerror=function(){reject(t.error);};t.onabort=function(){reject(t.error||Error('storage aborted'));};});var all=await rows(),own=all.filter(function(x){return x.profile===row.profile&&x.name===row.name;}).sort(function(a,b){return b.createdAt-a.createdAt;});if(own.length>MAX_BACKUPS)await new Promise(function(resolve,reject){var t=db.transaction('recordings','readwrite');own.slice(MAX_BACKUPS).forEach(function(x){t.objectStore('recordings').delete(x.id);});t.oncomplete=resolve;t.onerror=function(){reject(t.error);};});}
async function refreshBackups(){var box=el('srecbackuplist');if(!box)return;var person=owner();if(!person.name){box.textContent='填写姓名后，可查看这台设备上的录音备份。';return;}try{var all=await rows();if(!box.isConnected||owner().name!==person.name||owner().profile!==person.profile)return;var saved=all.filter(function(x){return x.name===person.name&&x.profile===person.profile;}).sort(function(a,b){return b.createdAt-a.createdAt;}).slice(0,MAX_BACKUPS);box.innerHTML=saved.length?saved.map(function(x){return '<div class="recordingBackupRow"><span>'+esc(x.topic)+'<small>'+esc(new Date(x.createdAt).toLocaleString('zh-CN'))+' · '+(x.blob.size/1024/1024).toFixed(2)+' MB</small></span><button type="button" class="recBtn recGhost" data-audio-backup="'+esc(x.id)+'">下载录音</button></div>';}).join(''):'这台设备上还没有当前姓名的录音备份。';}catch(e){box.textContent='本机备份不可用，请在停止录音后点击「下载录音」保存文件。';}}
function snapshot(record){var o=owner();return {id:record.backupId||(record.backupId='REC-'+token()),createdAt:record.stoppedAt||Date.now(),name:o.name,profile:o.profile,part:window.PG&&PG.part?PG.part.toUpperCase():'P',topic:typeof speakingQuestionTitle==='function'?speakingQuestionTitle():'口语录音',question:window.PCUR&&PCUR.t||'',blob:record.blob};}
async function keepRecording(record){if(!record||!record.blob||!record.blob.size)return;var button=el('srecdownload');if(button)button.disabled=false;var row=snapshot(record);record.backupMeta=row;var status=el('srecbackupstatus');if(status)status.textContent='正在保留本机备份…';try{await saveRow(row);if(window.SPEAK_REC===record&&el('srecbackupstatus'))el('srecbackupstatus').textContent='已保留本机录音备份（当前姓名最近 10 条）。可随时下载；清除浏览器数据会删除备份。';refreshBackups();}catch(e){if(window.SPEAK_REC===record&&el('srecbackupstatus'))el('srecbackupstatus').textContent='本机自动备份未成功，请立即点击「下载录音」保存文件。';}}
function downloadCurrent(){var r=window.SPEAK_REC;if(!r||!r.blob||!r.blob.size){if(el('srecstatus'))el('srecstatus').textContent='请先停止录音，再下载文件。';return;}var row=r.backupMeta||snapshot(r);download(r.blob,filename(row));}
/* Backup delivery uses the student's native share sheet; it never claims server receipt. */
async function shareCurrent(){
 var r=window.SPEAK_REC;
 if(!r||!r.blob||!r.blob.size){if(el('srecstatus'))el('srecstatus').textContent='请先完成录音，再选择备用发送。';return;}
 var row=r.backupMeta||snapshot(r),audio=new File([r.blob],filename(row),{type:r.blob.type||'application/octet-stream'});
 var transcript=typeof speakingSubmissionTranscript==='function'?speakingSubmissionTranscript():'';
 var note='雅思口语作业\\n姓名：'+row.name+'\\n题目：'+row.topic+'\\n逐字稿：\\n'+transcript+'\\n\\n请老师确认收到附件。';
 var files=[audio,new File([note],filename(row).replace(/\\.[^.]+$/,'.txt'),{type:'text/plain'})];
 if(navigator.share&&(!navigator.canShare||navigator.canShare({files:files}))){
  try{await navigator.share({title:'雅思口语作业 · '+row.name,text:'录音和逐字稿，请老师确认收到。',files:files});setStatus(r,'已打开系统分享流程。是否送达须以老师收到附件为准；本地录音仍可下载。');return;}
  catch(e){if(e.name==='AbortError'){setStatus(r,'已取消分享，录音仍保存在本机，可重新选择备用发送。');return;}}
 }
 downloadCurrent();download(new Blob([note],{type:'text/plain;charset=utf-8'}),filename(row).replace(/\\.[^.]+$/,'.txt'));
 setStatus(r,'设备不支持直接分享附件：已下载录音和逐字稿。请用微信、邮件或其他方式将两个文件发给老师，并让老师确认收到。');
}
function ensureShareButton(){
 var submitButton=el('srecsubmit');if(!submitButton||el('srecshare'))return;
 var b=document.createElement('button');b.type='button';b.id='srecshare';b.className=submitButton.className||'recBtn recGhost';
 b.textContent='备用发送（录音＋逐字稿）';b.style.marginLeft='8px';
 b.addEventListener('click',shareCurrent);submitButton.insertAdjacentElement('afterend',b);
}
function renderScores(s,comments,name,title,transcript,sample){return '<div class="recCongrat"><h2>本次练习结果</h2><p>'+esc(name)+' · '+esc(title)+'。以下为本机练习估算；作业保存状态请看上方提示。</p></div><div class="recScores">'+[['流利度',s.fluency],['扣题程度',s.relevance],['词汇',s.vocabulary],['语法',s.grammar]].map(function(x){return '<div class="recScore"><b>'+esc(x[1])+'</b><span>'+x[0]+'</span></div>';}).join('')+'</div><div class="recOverall">综合估算 '+esc(s.overall)+'（非官方评分）</div><div class="recComments">'+comments.map(function(x){return '<div>• '+esc(x)+'</div>';}).join('')+'</div><div class="recTranscript"><b>逐字稿：</b><br>'+esc(transcript||'未识别到文字')+'</div>'+(sample?'<div class="recSample"><b>示范答案</b>'+sample+'</div>':'');}
var UPLOAD_ORIGIN='https://speaking-homework-inbox.wuxi232439.chatgpt.site';
function setStatus(record,text){if(window.SPEAK_REC===record&&el('srecstatus'))el('srecstatus').textContent=text;}
async function post(path,options,signal){var response=await fetch(UPLOAD_ORIGIN+path,Object.assign({method:'POST',signal:signal,credentials:'omit'},options));var data;try{data=await response.json();}catch(e){throw Error('收件服务器返回异常');}if(!response.ok)throw Error(data.error||'收件服务器暂不可用');return data;}
async function submit(){
 var r=window.SPEAK_REC;if(!r||r.submitting||r.deliveryAccepted)return;
 if(!r.blob||!r.blob.size){setStatus(r,'录音内容为空，请先录音。');return;}
 if(!requireSpeakingName())return;
 keepRecording(r);
 if(r.blob.size>MAX_BYTES){setStatus(r,'录音超过 10 MB，尚未上传。请下载录音后交给老师。');return;}
 r.submissionId=r.submissionId||'HW-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+token().slice(0,10).toUpperCase();
 var name=speakingStudentName(),scores=speakingScores(),comments=speakingComments(scores),title=speakingQuestionTitle(),transcript=speakingSubmissionTranscript(),sample=getSampleAnswerHtml(),part=window.PG&&PG.part?PG.part.toUpperCase():'P',topic=window.PG&&PG.title||title,question=window.PCUR&&PCUR.t||title,profile=owner().profile;
 r.submitting=true;pending.set(r.submissionId,r);var button=el('srecsubmit');if(button){button.disabled=true;button.textContent='正在保存作业…';}if(el('srecstart'))el('srecstart').disabled=true;
 setStatus(r,'正在上传录音和逐字稿。收到服务器保存回执后才算提交成功；录音仍可下载。');
 if(el('srecresult'))el('srecresult').innerHTML=renderScores(scores,comments,name,title,transcript,sample);
 hideSpeakingOverlay();
 var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},WAIT_MS);
 try{
  if(!r.uploadMeta){var hash=await crypto.subtle.digest('SHA-256',await r.blob.arrayBuffer());r.uploadMeta={id:r.submissionId,name:name,profile:profile,part:part,topic:topic,question:question,transcript:transcript||'',bytes:r.blob.size,mime:r.blob.type||'audio/webm',sha256:Array.from(new Uint8Array(hash),function(n){return n.toString(16).padStart(2,'0');}).join(''),retryKey:token()};}
  var ticket=await post('/api/ticket',{headers:{'content-type':'application/json'},body:JSON.stringify(r.uploadMeta)},controller.signal);
  if(typeof ticket.token!=='string')throw Error('未取得有效上传凭证');
  var receipt=await post('/api/submissions',{headers:{authorization:'Bearer '+ticket.token,'content-type':r.blob.type||'audio/webm'},body:r.blob},controller.signal);
  if(!receipt.ok||receipt.state!=='stored'||receipt.id!==r.submissionId)throw Error('未取得有效保存回执');
  r.deliveryAccepted=true;
  setStatus(r,'作业已保存到老师收件后台。提交编号：'+receipt.id+'。可继续下载录音留底；当前不发送邮件通知。');
 }catch(e){setStatus(r,(e.name==='AbortError'?'等待保存回执超时':e.message)+'。未确认提交成功。请点「备用发送」通过系统分享录音和逐字稿，或下载后发给老师；也可以重试。编号：'+r.submissionId);}
 finally{clearTimeout(timer);pending.delete(r.submissionId);r.submitting=false;if(window.SPEAK_REC===r){var btn=el('srecsubmit');if(btn){btn.disabled=!!r.deliveryAccepted;btn.textContent=r.deliveryAccepted?'作业已保存':'重试提交';}if(el('srecstart'))el('srecstart').disabled=false;}}
}
function wireBackups(){refreshBackups();ensureShareButton();}
var show=window.showRecordingStep;if(typeof show==='function')window.showRecordingStep=function(){var v=show.apply(this,arguments);wireBackups();return v;};
document.addEventListener('click',function(e){var button=e.target.closest('button');if(!button)return;var id=button.dataset.audioBackup;if(id)rows().then(function(all){var p=owner(),row=all.find(function(x){return x.id===id&&x.name===p.name&&x.profile===p.profile;});if(row)download(row.blob,filename(row));}).catch(function(){if(el('srecbackupstatus'))el('srecbackupstatus').textContent='无法读取本机备份，请直接下载当前录音。';});});
document.addEventListener('change',function(e){if(e.target.id==='srecname')refreshBackups();});
window.addEventListener('beforeunload',function(e){if(Array.from(pending.values()).some(function(r){return r.submitting;})||(window.SPEAK_REC&&SPEAK_REC.recorder&&SPEAK_REC.recorder.state==='recording')){e.preventDefault();e.returnValue='';}});
window.IELTSRecordingDelivery={keepRecording:keepRecording,downloadCurrent:downloadCurrent,shareCurrent:shareCurrent,refreshBackups:refreshBackups,submit:submit};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureShareButton);else ensureShareButton();
window.submitSpeakingRecord=submit;
})();
