/* Keep recordings recoverable; verify the normal multipart FormSubmit redirect.
 * A service acknowledgement is not proof of mailbox delivery.
 */
(function(){
'use strict';
if(window.IELTSRecordingDelivery)return;
var MAX_BYTES=10000000,MAX_BACKUPS=10,WAIT_MS=45000,dbPromise=null,pending=new Map();
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
function renderScores(s,comments,name,title,transcript,sample){return '<div class="recCongrat"><h2>本次练习结果</h2><p>'+esc(name)+' · '+esc(title)+'。以下为本机练习估算；邮件发送状态请看上方提示。</p></div><div class="recScores">'+[['流利度',s.fluency],['扣题程度',s.relevance],['词汇',s.vocabulary],['语法',s.grammar]].map(function(x){return '<div class="recScore"><b>'+esc(x[1])+'</b><span>'+x[0]+'</span></div>';}).join('')+'</div><div class="recOverall">综合估算 '+esc(s.overall)+'（非官方评分）</div><div class="recComments">'+comments.map(function(x){return '<div>• '+esc(x)+'</div>';}).join('')+'</div><div class="recTranscript"><b>逐字稿：</b><br>'+esc(transcript||'未识别到文字')+'</div>'+(sample?'<div class="recSample"><b>示范答案</b>'+sample+'</div>':'');}
function setStatus(attempt,text){if(window.SPEAK_REC!==attempt.record)return;var s=el('srecstatus');if(s)s.textContent=text;}
function releaseButton(a,accepted){if(window.SPEAK_REC!==a.record)return;a.record.submitting=false;var b=el('srecsubmit');if(b){b.disabled=!!accepted;b.textContent=accepted?'发送服务已接收':'重试提交';}var start=el('srecstart');if(start)start.disabled=false;}
function uncertain(a,reason){if(a.accepted||a.record.deliveryAccepted)return;clearTimeout(a.timer);a.uncertain=true;releaseButton(a,false);setStatus(a,reason+' 未确认发送成功。录音仍可下载，请先保存；重试前向老师确认收件，避免重复提交。编号：'+a.record.submissionId);a.details.open=true;}
function accept(a){if(a.accepted)return;a.accepted=true;clearTimeout(a.timer);a.record.deliveryAccepted=true;releaseButton(a,true);setStatus(a,'发送服务已返回接收回执，老师邮箱是否收到仍需确认。请保留录音下载备份。提交编号：'+a.record.submissionId);a.details.open=false;pending.delete(a.token);setTimeout(function(){a.form.remove();a.details.remove();},1000);}
function onMessage(e){if(e.origin!==window.location.origin||!e.data||e.data.type!=='ielts-speaking-service-receipt')return;var a=pending.get(e.data.token);if(!a||e.source!==a.frame.contentWindow)return;accept(a);}
window.addEventListener('message',onMessage);
function submit(){
 var r=window.SPEAK_REC,st=el('srecstatus');if(!r||r.submitting||r.deliveryAccepted)return;
 if(!r.blob||!r.blob.size){if(st)st.textContent='录音内容为空，请重新录一遍再提交。';return;}
 if(!requireSpeakingName())return;
 keepRecording(r);
 if(r.blob.size>MAX_BYTES){if(st)st.textContent='录音超过发送服务的 10 MB 附件限制，尚未提交。请点击「下载录音」保存后交给老师。';return;}
 if(!window.DataTransfer||!window.File){if(st)st.textContent='当前浏览器无法自动附加音频。请先下载录音，使用 Chrome、Edge 或较新的 Safari 提交。';return;}
 var name=speakingStudentName(),scores=speakingScores(),comments=speakingComments(scores),title=speakingQuestionTitle(),part=window.PG&&PG.part?PG.part.toUpperCase():'P',transcript=speakingSubmissionTranscript(),sample=getSampleAnswerHtml();
 var nonce=token(),receipt=new URL('submission-receipt.html',window.location.href);receipt.searchParams.set('receipt',nonce);
 r.submissionId=r.submissionId||'HW-'+new Date().toISOString().slice(0,10).replace(/-/g,'')+'-'+token().slice(0,10).toUpperCase();
 var details=document.createElement('details');details.className='recordingTransport';details.innerHTML='<summary>查看发送服务的处理页面</summary><p>若这里显示激活提示或错误，请截图交给老师。不要把该页面加载完成当作收件成功。</p>';
 var frame=document.createElement('iframe');frame.name='speakingSend-'+nonce;frame.title='录音发送服务处理结果';frame.style.cssText='width:100%;height:260px;border:1px solid #e5ddea;border-radius:8px;background:white';details.appendChild(frame);details.id='send-'+nonce;var outbox=el('speakingDeliveryOutbox');if(!outbox){outbox=document.createElement('div');outbox.id='speakingDeliveryOutbox';outbox.style.cssText='max-width:860px;margin:16px auto;padding:0 16px';document.body.appendChild(outbox);}outbox.appendChild(details);
 var form=document.createElement('form');form.method='POST';form.action=window.SPEAK_FORM_ACTION;form.enctype='multipart/form-data';form.target=frame.name;form.acceptCharset='UTF-8';form.hidden=true;
 var fields={'_next':receipt.href,'_url':window.location.href,'_subject':'雅思口语录音 · '+name+' · '+part+' · '+title+' · '+r.submissionId,'_template':'table','_captcha':'false','提交编号':r.submissionId,'学生姓名':name,'口语部分':part,'话题':window.PG&&PG.title||'','题目':window.PCUR&&PCUR.t||'','转写结果':transcript||'未提供逐字稿，请老师收听音频','逐字稿':transcript||'未提供逐字稿，请老师收听音频','流利度':String(scores.fluency),'扣题程度':String(scores.relevance),'词汇':String(scores.vocabulary),'语法':String(scores.grammar),'综合估算':String(scores.overall),'简易评语':comments.join('\n')};
 Object.keys(fields).forEach(function(k){var input=document.createElement('input');input.type='hidden';input.name=k;input.value=fields[k];form.appendChild(input);});
 try{var input=document.createElement('input');input.type='file';input.name='attachment';var dt=new DataTransfer();dt.items.add(new File([r.blob],filename(r.backupMeta||snapshot(r)),{type:r.blob.type||'audio/webm'}));input.files=dt.files;form.appendChild(input);}catch(e){details.remove();if(st)st.textContent='音频附件准备失败，尚未提交。请下载录音保存后再试。';return;}
 document.body.appendChild(form);
 var a={token:nonce,record:r,form:form,frame:frame,details:details,accepted:false};pending.set(nonce,a);
 r.submitting=true;var b=el('srecsubmit');b.disabled=true;b.textContent='等待发送回执…';if(el('srecstart'))el('srecstart').disabled=true;
 if(st)st.textContent='正在发送录音和逐字稿，等待服务回执。你可以先下载录音；请暂时保留当前页面。提交编号：'+r.submissionId;
 if(el('srecresult'))el('srecresult').innerHTML='<p class="recStatus"><a href="#send-'+nonce+'">查看发送服务的处理页面</a></p>'+renderScores(scores,comments,name,title,transcript,sample);
 hideSpeakingOverlay();
 frame.onerror=function(){uncertain(a,'发送服务页面未能加载。');};
 a.timer=setTimeout(function(){uncertain(a,'等待发送回执超时。');},WAIT_MS);
 try{form.submit();}catch(e){uncertain(a,'发送请求未能发出。');}
}
function wireBackups(){refreshBackups();}
var show=window.showRecordingStep;if(typeof show==='function')window.showRecordingStep=function(){var v=show.apply(this,arguments);wireBackups();return v;};
document.addEventListener('click',function(e){var button=e.target.closest('button');if(!button)return;var id=button.dataset.audioBackup;if(id)rows().then(function(all){var p=owner(),row=all.find(function(x){return x.id===id&&x.name===p.name&&x.profile===p.profile;});if(row)download(row.blob,filename(row));}).catch(function(){if(el('srecbackupstatus'))el('srecbackupstatus').textContent='无法读取本机备份，请直接下载当前录音。';});});
document.addEventListener('change',function(e){if(e.target.id==='srecname')refreshBackups();});
window.addEventListener('beforeunload',function(e){if(Array.from(pending.values()).some(function(a){return !a.accepted&&!a.uncertain;})||(window.SPEAK_REC&&SPEAK_REC.recorder&&SPEAK_REC.recorder.state==='recording')){e.preventDefault();e.returnValue='';}});
window.IELTSRecordingDelivery={keepRecording:keepRecording,downloadCurrent:downloadCurrent,refreshBackups:refreshBackups,submit:submit};
window.submitSpeakingRecord=submit;
})();
