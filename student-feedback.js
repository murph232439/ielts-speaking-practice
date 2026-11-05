(function(){
'use strict';
var PREFIX='ielts-student-teacher-feedback-v1:',PROFILE='ielts-soft-study-profile-v6';
var status=document.getElementById('sf-status'),list=document.getElementById('sf-list');
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function profile(){try{var x=JSON.parse(localStorage.getItem(PROFILE)||'null');return x&&x.name&&x.id?x:null}catch(e){return null}}
function key(){return PREFIX+profile().id}
function read(){if(!profile())return [];try{var x=JSON.parse(localStorage.getItem(key())||'[]');return Array.isArray(x)?x:[]}catch(e){return []}}
function write(a){try{localStorage.setItem(key(),JSON.stringify(a.slice(0,50)));return true}catch(e){return false}}
function normal(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}
function checkFile(data){
 var p=profile();if(!p)throw Error('请先返回练习首页建立学习档案。');
 if(!data||data.schema!=='ielts-speaking-teacher-feedback-v1'||!data.recipient||!data.lesson||!Array.isArray(data.suggestions))throw Error('这不是老师工作台生成的批改文件。');
 if(data.recipient.studentId!==p.id||normal(data.recipient.studentName)!==normal(p.name))throw Error('这份批改对应另一份学习档案。请检查学生姓名与本机编号，避免导入别人的反馈。');
 if(data.suggestions.length<1||data.suggestions.length>12)throw Error('文件中建议数量不符合要求。');
 if(typeof data.feedbackId!=='string'||data.feedbackId.length>80)throw Error('批改编号无效。');
 var hints=data.suggestions.map(function(x){
  if(!x||typeof x.phrase!=='string'||!x.phrase.trim()||x.phrase.length>150)throw Error('文件中存在不完整的词伙。');
  return {phrase:x.phrase.trim().slice(0,150),zh:String(x.zh||'').slice(0,240),example:String(x.example||'').slice(0,400),original:String(x.original||'').slice(0,350),reason:String(x.reason||'').slice(0,400),level:String(x.level||'B1–B2').slice(0,30)}
 });
 return {feedbackId:data.feedbackId,createdAt:String(data.createdAt||new Date().toISOString()).slice(0,60),part:String(data.lesson.part||'').slice(0,20),topic:String(data.lesson.topic||'').slice(0,160),question:String(data.lesson.question||'').slice(0,300),comment:String(data.comment||'').slice(0,1200),suggestions:hints,receivedAt:new Date().toISOString()};
}
function render(){
 var p=profile(),chip=document.getElementById('sf-profile'),btn=document.getElementById('sf-select');
 if(!p){chip.innerHTML='还没有学习档案。请先在 <a href="preview-v6.html">口语练习首页</a> 完成注册，再导入老师的批改文件。';btn.disabled=true;list.innerHTML='<p class="empty">完成注册后，你的批改将按照学习编号归档。</p>';document.getElementById('sf-count').textContent='';return}
 btn.disabled=false;
 chip.innerHTML='Hi, '+esc(p.name)+' · 你的本机学习编号：<strong>'+esc(p.id)+'</strong> <span class="count">（非云端账号，切换设备后编号可能不同）</span>';
 var records=read();document.getElementById('sf-count').textContent='共 '+records.length+' 份';
 if(!records.length){list.innerHTML='<div class="empty">目前还没有导入老师的批改。<br>收到文件后，来这里看看有什么表达值得收藏。</div>';return}
 list.innerHTML=records.map(function(r,i){
  var lessons=esc(r.part)+' · '+esc(r.topic);
  var header='<article class="card"><div class="cardhead"><div><h3>'+lessons+'</h3><p class="count">'+esc((r.createdAt||'').slice(0,10))+'</p></div><span class="pill">'+r.suggestions.length+' 条建议</span></div>';
  if(r.question)header+='<p class="muted">题目：'+esc(r.question)+'</p>';
  if(r.comment)header+='<div class="review"><strong>老师的建议：</strong>'+esc(r.comment)+'</div>';
  header+='<div class="suggestions">';
  r.suggestions.forEach(function(x,j){
   var saved=window.IELTSMyVocabulary&&window.IELTSMyVocabulary.items().some(function(s){return String(s.phrase).trim().replace(/\s+/g,' ').toLowerCase()===x.phrase.trim().replace(/\s+/g,' ').toLowerCase()});
   header+='<section class="phrase"><div class="phrasetop"><div><span class="pill">'+esc(x.level)+'</span><h4>'+esc(x.phrase)+'</h4><p class="zh">'+esc(x.zh)+'</p></div><button class="btnsmall" type="button" data-sf-save="'+i+':'+j+'" '+(saved?'disabled':'')+'>'+(saved?'✓ 已收藏':'＋ 收藏进词库')+'</button></div>'+
   (x.original?'<p class="original">原表达：'+esc(x.original)+'</p>':'')+(x.example?'<p class="example">'+esc(x.example)+'</p>':'')+(x.reason?'<p class="reason">为什么推荐：'+esc(x.reason)+'</p>':'')+'</section>';
  });
  return header+'</div></article>';
 }).join('');
}
document.getElementById('sf-select').addEventListener('click',function(){document.getElementById('sf-file').click()});
document.getElementById('sf-file').addEventListener('change',function(ev){
 var file=ev.target.files&&ev.target.files[0];if(!file)return;
 if(file.size>131072){status.textContent='文件超过 128KB，请联系老师确认。';ev.target.value='';return}
 var reader=new FileReader();
 reader.onload=function(){
  try{
   var record=checkFile(JSON.parse(String(reader.result||''))),records=read();
   if(records.some(function(x){return x.feedbackId===record.feedbackId})){status.textContent='这份批改已经导入过啦。';return}
   records.unshift(record);
   if(!write(records))throw Error('浏览器存储失败，未能保存。请检查私密浏览模式或空间。');
   status.textContent='批改导入成功！挑选想练习的词伙，点击收藏即可。';render();
  }catch(e){status.textContent='导入失败：'+e.message}
  finally{ev.target.value=''}
 };
 reader.onerror=function(){status.textContent='无法读取文件，请重新选择。';ev.target.value=''};
 reader.readAsText(file,'UTF-8');
});
list.addEventListener('click',function(ev){
 var btn=ev.target.closest('[data-sf-save]');if(!btn||!profile())return;
 var pair=btn.getAttribute('data-sf-save').split(':'),r=read()[Number(pair[0])],x=r&&r.suggestions[Number(pair[1])];if(!x)return;
 if(!window.IELTSMyVocabulary){status.textContent='词库加载失败，请刷新后重试。';return}
 var saved=window.IELTSMyVocabulary.save({phrase:x.phrase,zh:x.zh,example:x.example,topic:r.topic,level:x.level,source:'老师批改 · '+r.part});
 if(saved.ok){btn.disabled=true;btn.textContent=saved.existing?'✓ 已在词库':'✓ 已收藏';status.textContent='已经加入你的进步词库，可以继续练习。'}
 else status.textContent='收藏失败，请检查浏览器是否允许保存。';
});
render();
})();