(function(){
'use strict';
var form=document.getElementById('teacher-form'),entries=document.getElementById('teacher-entries');
var msg=document.getElementById('teacher-status');
function addEntry(){
 var node=document.getElementById('teacher-entry-tpl').content.cloneNode(true);
 entries.appendChild(node);renumber();
}
function renumber(){entries.querySelectorAll('.entry').forEach(function(x,i){x.querySelector('h3').textContent='词伙建议 '+(i+1)})}
function readField(node,name){var el=node.querySelector('[data-field="'+name+'"]');return el?(el.type==='checkbox'?el.checked:el.value.trim()):''}
function formValue(n){return form.elements[n].value.trim()}
function readData(){
 var name=formValue('studentName'),id=formValue('studentId').toUpperCase();
 if(!name||!/^SP-[0-9A-F]{8}$/.test(id))throw Error('请填写学生姓名，并从录音邮件中粘贴正确的 SP-XXXXXXXX 本机学习编号。');
 var suggestions=[];
 entries.querySelectorAll('.entry').forEach(function(node){
  var phrase=readField(node,'phrase');
  if(!phrase)return;
  suggestions.push({phrase:phrase,zh:readField(node,'zh'),level:readField(node,'level'),example:readField(node,'example'),original:readField(node,'original'),reason:readField(node,'reason'),approvedForPublic:readField(node,'approved')===true});
 });
 if(!suggestions.length)throw Error('至少填写一条建议词伙。');
 if(suggestions.length>12)throw Error('每份反馈最多 12 条建议。');
 var topic=formValue('topic');if(!topic)throw Error('请填写话题。');
 return {schema:'ielts-speaking-teacher-feedback-v1',feedbackId:'FB-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase(),createdAt:new Date().toISOString(),recipient:{studentName:name,studentId:id},lesson:{part:formValue('part'),topic:topic,question:formValue('question')},comment:formValue('comment'),suggestions:suggestions};
}
function download(name,text,type){
 var url=URL.createObjectURL(new Blob([text],{type:type||'application/json;charset=utf-8'})),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(url)},1000);
}
function printable(data){
 var out=['【雅思口语教师反馈】','学生：'+data.recipient.studentName,'话题：'+data.lesson.part+' / '+data.lesson.topic];
 if(data.lesson.question)out.push('题目：'+data.lesson.question);
 if(data.comment)out.push('总体建议：'+data.comment);
 data.suggestions.forEach(function(x,i){
  out.push('','建议 '+(i+1)+'：'+x.phrase+' ('+x.level+')',x.zh?('含义：'+x.zh):'',x.original?('原表达：'+x.original):'',x.example?('例句：'+x.example):'',x.reason?('为什么：'+x.reason):'');
 });
 return out.filter(function(x){return x!==''}).join('\n');
}
document.getElementById('teacher-add').addEventListener('click',function(){if(entries.querySelectorAll('.entry').length>=12){msg.textContent='每次最多 12 条建议。';return}addEntry()});
entries.addEventListener('click',function(ev){
 if(!ev.target.closest('[data-teacher-remove]'))return;
 if(entries.querySelectorAll('.entry').length===1){msg.textContent='至少保留一条建议词伙。';return}
 ev.target.closest('.entry').remove();renumber();
});
form.addEventListener('submit',function(ev){
 ev.preventDefault();
 try{var d=readData();download('IELTS-Feedback-'+d.recipient.studentId+'-'+d.createdAt.slice(0,10)+'.json',JSON.stringify(d,null,2));msg.textContent='文件已生成。请把这个 JSON 文件通过私密渠道发给对应学生。'}catch(e){msg.textContent=e.message}
});
document.getElementById('teacher-copy').addEventListener('click',async function(){
 try{
  var d=readData(),str=printable(d);
  if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(str);
  else {var pre=document.getElementById('teacher-summary');pre.hidden=false;pre.textContent=str;throw Error('浏览器未允许复制，请手动复制下面的文本。')}
  msg.textContent='可读版评语已复制，可直接发送文字给学生。';
 }catch(e){msg.textContent=e.message}
});
document.getElementById('teacher-public').addEventListener('click',function(){
 try{
  var d=readData(),approved=d.suggestions.filter(function(x){return x.approvedForPublic});
  if(!approved.length)throw Error('请先勾选已审核、可进入公共词库候选的表达。');
  if(!confirm('请再次确认：这些词伙和例句没有任何学生姓名、联系方式、个人事件等私密内容，确定导出匿名候选清单？'))return;
  var exported={schema:'ielts-public-vocabulary-candidates-v1',exportedAt:new Date().toISOString(),status:'pending_manual_publication',items:approved.map(function(x){return {phrase:x.phrase,zh:x.zh,level:x.level,example:x.example,topic:d.lesson.topic,part:d.lesson.part}})};
  download('public-vocabulary-candidates-'+d.createdAt.slice(0,10)+'.json',JSON.stringify(exported,null,2));
  msg.textContent='匿名候选文件已导出。注意：未发布到公共词库，还需老师审核与手动发布。';
 }catch(e){msg.textContent=e.message}
});
addEntry();addEntry();
})();