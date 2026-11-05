/* Personal speaking vocabulary — local-only, separated by current device profile. */
(function(){
'use strict';
var PROFILE_KEY='ielts-soft-study-profile-v6', STORE_PREFIX='ielts-personal-vocabulary-v1:';
var STATES=['new','learning','mastered'];
var STATE_LABELS={new:'待练习',learning:'练习中',mastered:'已掌握'};
var curated=[
 {phrase:'cut down on the time I spend doing something',zh:'减少花在某件事上的时间',example:'This app helps me cut down on the time I spend reviewing vocabulary.',level:'B2',tags:['app','technology','online','computer','time','website','smartphone']},
 {phrase:'come in handy',zh:'派上用场；很实用',example:'My phone comes in handy when I need to find my way around a new city.',level:'B2',tags:['technology','phone','app','website','tool','computer']},
 {phrase:'make everyday tasks easier',zh:'让日常事务更轻松',example:'Technology can make everyday tasks easier for busy people.',level:'B1–B2',tags:['technology','app','computer','time','device','website']},
 {phrase:'keep in touch with someone',zh:'与某人保持联系',example:'Social media helps me keep in touch with friends who live abroad.',level:'B1',tags:['friend','social','communication','phone','family','relationship']},
 {phrase:'get along well with someone',zh:'与某人相处融洽',example:'I get along well with my classmates because we share similar interests.',level:'B1–B2',tags:['friend','person','classmate','relationship','family','people']},
 {phrase:'be there for someone',zh:'在某人需要时支持对方',example:'A good friend is someone who is there for you when things get difficult.',level:'B2',tags:['friend','person','family','support','happy','relationship']},
 {phrase:'have a lot in common',zh:'有很多共同点',example:'We have a lot in common, especially when it comes to music.',level:'B1–B2',tags:['friend','person','hobby','relationship','interest','people']},
 {phrase:'make a lasting impression on someone',zh:'给某人留下持久的印象',example:'That teacher made a lasting impression on me.',level:'B2',tags:['teacher','person','lesson','school','child','memory','experience']},
 {phrase:'look up to someone',zh:'敬佩、仰慕某人',example:'I look up to my grandfather because he is patient and knowledgeable.',level:'B2',tags:['person','admire','athlete','teacher','parent','successful','grandfather']},
 {phrase:'step outside my comfort zone',zh:'走出舒适区',example:'Speaking English in public helped me step outside my comfort zone.',level:'B2',tags:['challenge','skill','language','study','learn','experience','decision']},
 {phrase:'pick up a new skill',zh:'学会一项新技能',example:'I picked up a new skill by watching short tutorials.',level:'B2',tags:['skill','learn','study','school','teacher','child','language']},
 {phrase:'put what I have learned into practice',zh:'把学到的东西付诸实践',example:'I try to put what I have learned into practice during group discussions.',level:'B2–C1',tags:['study','learn','school','language','skill','lesson','teacher']},
 {phrase:'take my mind off something',zh:'暂时转移注意力；不再一直想着某件事',example:'Listening to music helps me take my mind off work.',level:'B2',tags:['music','relax','hobby','stress','free time','tired','evening']},
 {phrase:'unwind after a long day',zh:'忙碌一天后放松',example:'I usually unwind after a long day by going for a walk.',level:'B2',tags:['relax','evening','work','tired','hobby','time','music']},
 {phrase:'give me a sense of achievement',zh:'带给我成就感',example:'Finishing a difficult task gives me a sense of achievement.',level:'B2',tags:['goal','ambition','challenge','skill','study','work','success']},
 {phrase:'make a real difference',zh:'产生实质性的积极影响',example:'Small changes in daily habits can make a real difference.',level:'B2',tags:['important','change','help','environment','health','society','community']},
 {phrase:'play an important role in',zh:'在……中发挥重要作用',example:'Parents play an important role in developing children’s habits.',level:'B2',tags:['child','education','health','family','society','government','school']},
 {phrase:'have a positive impact on',zh:'对……产生积极影响',example:'Regular exercise can have a positive impact on mental health.',level:'B2',tags:['environment','health','education','society','technology','exercise','research']},
 {phrase:'raise awareness of',zh:'提高对……的认识',example:'Schools can raise awareness of environmental protection.',level:'B2–C1',tags:['environment','government','public','society','health','law','education']},
 {phrase:'reduce the amount of waste',zh:'减少垃圾产生量',example:'Using reusable bags can reduce the amount of waste we produce.',level:'B2',tags:['environment','rubbish','plastic','pollution','recycle','nature']},
 {phrase:'take responsibility for',zh:'为……承担责任',example:'Everyone should take responsibility for keeping public spaces clean.',level:'B2',tags:['government','environment','law','people','public','work','decision']},
 {phrase:'a convenient way to get around',zh:'便捷的出行方式',example:'The subway is a convenient way to get around the city.',level:'B1–B2',tags:['travel','transport','trip','city','car','place']},
 {phrase:'broaden my horizons',zh:'开阔眼界',example:'Travelling to different places can broaden my horizons.',level:'B2',tags:['travel','trip','culture','city','study','history','museum']},
 {phrase:'worth visiting at least once',zh:'值得至少去一次',example:'This museum is worth visiting at least once.',level:'B1–B2',tags:['place','building','museum','city','trip','travel','park']},
 {phrase:'one of the main reasons is that',zh:'一个主要原因是……',example:'One of the main reasons is that it is convenient for students.',level:'B1–B2',tags:['why','reason','benefit','prefer','important']},
 {phrase:'from my own experience',zh:'根据我自己的经历',example:'From my own experience, practising regularly makes a big difference.',level:'B1–B2',tags:['experience','opinion','learn','study']},
 {phrase:'to give a specific example',zh:'举一个具体例子',example:'To give a specific example, my classmates often study together.',level:'B1–B2',tags:['example','opinion','think']},
 {phrase:'it depends on the situation',zh:'这取决于具体情况',example:'It depends on the situation, but I usually prefer face-to-face conversations.',level:'B1–B2',tags:['compare','prefer','different','better']}
];
var fallback=['one of the main reasons is that','from my own experience','to give a specific example'];
var activeSuggestions=[];
function escapeHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function profile(){try{var p=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');return p&&p.id&&p.name?p:null}catch(e){return null}}
function key(){var p=profile();return STORE_PREFIX+(p?p.id:'guest')}
function items(){try{var d=JSON.parse(localStorage.getItem(key())||'[]');return Array.isArray(d)?d.filter(function(x){return x&&typeof x.phrase==='string'}).slice(0,500):[]}catch(e){return []}}
function persist(data){try{localStorage.setItem(key(),JSON.stringify(data.slice(0,500)));return true}catch(e){return false}}
function normalizePhrase(s){return String(s||'').trim().replace(/\s+/g,' ').toLowerCase().replace(/[.!?。]+$/,'')}
function save(item){
 var phrase=String(item.phrase||'').trim().replace(/\s+/g,' ').slice(0,150);
 if(!phrase)return {ok:false,reason:'empty'};
 var data=items(),found=data.find(function(x){return normalizePhrase(x.phrase)===normalizePhrase(phrase)});
 if(found)return {ok:true,existing:true};
 var x={id:'mv-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),phrase:phrase,zh:String(item.zh||'').trim().slice(0,250),example:String(item.example||'').trim().slice(0,400),topic:String(item.topic||'').trim().slice(0,180),level:String(item.level||'B1–B2').slice(0,30),source:String(item.source||'手动收录').slice(0,80),state:'new',savedAt:new Date().toISOString(),reviewed:0};
 data.unshift(x);
 return {ok:persist(data),existing:false};
}
function recommend(context){
 var title=String(context.title||'').toLowerCase(),transcript=String(context.transcript||'').toLowerCase();
 var ranked=curated.map(function(x,i){
  var score=0;
  x.tags.forEach(function(tag){if(title.indexOf(tag)>=0)score+=5;if(transcript.indexOf(tag)>=0)score+=1});
  return {x:x,score:score,index:i};
 }).sort(function(a,b){return b.score-a.score||a.index-b.index});
 var relevant=ranked.filter(function(x){return x.score>=3}).slice(0,3).map(function(x){return x.x});
 fallback.forEach(function(phrase){if(relevant.length<3){var x=curated.find(function(i){return i.phrase===phrase});if(x&&!relevant.some(function(i){return i.phrase===x.phrase}))relevant.push(x)}});
 return relevant.slice(0,3).map(function(x){return {phrase:x.phrase,zh:x.zh,example:x.example,level:x.level,topic:String(context.title||'口语练习'),source:'站内本题建议（非教师批改）'}});
}
function feedbackHTML(context){
 activeSuggestions=recommend(context);
 var result='<section class="mv-feedback"><div class="mv-feedback-head"><div><h3>今天可以带走的表达</h3><p>根据本题主题推荐的词伙，供你选择使用；并非逐句人工批改。</p></div><a href="my-vocabulary.html">我的进步词库 →</a></div><div class="mv-feedback-grid">';
 activeSuggestions.forEach(function(x,i){
  var saved=items().some(function(e){return normalizePhrase(e.phrase)===normalizePhrase(x.phrase)});
  result+='<article class="mv-feedback-item"><div class="mv-feedback-level">'+escapeHtml(x.level)+'</div><strong>'+escapeHtml(x.phrase)+'</strong><p>'+escapeHtml(x.zh)+'</p><small>'+escapeHtml(x.example)+'</small><button type="button" data-mv-add="'+i+'" '+(saved?'disabled':'')+'>'+(saved?'✓ 已收藏':'＋ 收藏到我的词库')+'</button></article>';
 });
 return result+'</div><p class="mv-feedback-note">老师后续通过邮件给你的建议，也可以手动收入个人词库。当前词库仅保存在本机浏览器。</p></section>';
}
document.addEventListener('click',function(ev){
 var btn=ev.target.closest('[data-mv-add]');if(!btn)return;
 var idx=Number(btn.getAttribute('data-mv-add')),entry=activeSuggestions[idx];if(!entry)return;
 var response=save(entry);
 if(response.ok){btn.textContent='✓ 已收藏';btn.disabled=true}
 else btn.textContent='存储失败，请检查浏览器设置';
});
function renderPage(){
 var list=document.getElementById('mv-list');if(!list)return;
 var p=profile(),owner=document.getElementById('mv-owner');
 owner.textContent=p?'Hi, '+p.name+' · 这是你在此浏览器上的进步词库':'未检测到本机学习档案 · 当前收藏将存入访客词库';
 var all=items(),input=document.getElementById('mv-search'),filter=document.querySelector('[data-mv-filter].active');
 var search=input?input.value.trim().toLowerCase():'',state=filter?filter.getAttribute('data-mv-filter'):'all';
 var selected=all.filter(function(x){return(state==='all'||x.state===state)&&(!search||[x.phrase,x.zh,x.example,x.topic,x.source].join(' ').toLowerCase().indexOf(search)>=0)});
 document.getElementById('mv-count').textContent='已收藏 '+all.length+' 条 · 练习中 '+all.filter(function(x){return x.state==='learning'}).length+' 条 · 已掌握 '+all.filter(function(x){return x.state==='mastered'}).length+' 条';
 if(!selected.length){list.innerHTML='<div class="mv-empty">这里还没有符合条件的表达。<br>练习后收藏建议词伙，或者从下方手动添加吧。</div>';return}
 list.innerHTML=selected.map(function(x){
 return '<article class="mv-card"><div class="mv-card-head"><span class="mv-chip">'+escapeHtml(x.level)+'</span><span class="mv-chip neutral">'+escapeHtml(STATE_LABELS[x.state]||'待练习')+'</span></div>'+
 '<h3>'+escapeHtml(x.phrase)+'</h3><p class="mv-zh">'+escapeHtml(x.zh||'未填写中文释义')+'</p>'+
 (x.example?'<p class="mv-example">'+escapeHtml(x.example)+'</p>':'')+
 '<p class="mv-meta">'+escapeHtml(x.topic||'未分类')+' · '+escapeHtml(x.source||'手动收录')+'</p>'+
 '<div class="mv-actions"><button type="button" data-mv-next="'+escapeHtml(x.id)+'">'+(x.state==='new'?'开始练习':x.state==='learning'?'标记已掌握':'重新练习')+'</button><button class="mv-delete" type="button" data-mv-remove="'+escapeHtml(x.id)+'">删除</button></div></article>'
 }).join('');
}
function initPage(){
 var root=document.getElementById('mv-page');if(!root)return;
 renderPage();
 document.getElementById('mv-search').addEventListener('input',renderPage);
 root.addEventListener('click',function(ev){
  var f=ev.target.closest('[data-mv-filter]');if(f){root.querySelectorAll('[data-mv-filter]').forEach(function(b){b.classList.remove('active')});f.classList.add('active');renderPage();return}
  var advance=ev.target.closest('[data-mv-next]'),remove=ev.target.closest('[data-mv-remove]');if(!advance&&!remove)return;
  var id=(advance||remove).getAttribute(advance?'data-mv-next':'data-mv-remove'),data=items(),target=data.find(function(x){return x.id===id});if(!target)return;
  if(remove){if(!confirm('从个人词库删除这条表达？'))return;data=data.filter(function(x){return x.id!==id})}
  else {target.state=target.state==='new'?'learning':target.state==='learning'?'mastered':'learning';target.reviewed=(target.reviewed||0)+1}
  if(persist(data))renderPage();else document.getElementById('mv-message').textContent='浏览器保存失败，请检查隐私浏览模式或存储空间。';
 });
 document.getElementById('mv-form').addEventListener('submit',function(ev){
  ev.preventDefault();
  var f=ev.currentTarget,entry={phrase:f.elements.phrase.value,zh:f.elements.zh.value,example:f.elements.example.value,topic:f.elements.topic.value,level:f.elements.level.value,source:'手动录入（可记录老师的建议）'};
  var result=save(entry),msg=document.getElementById('mv-message');
  if(result.ok){msg.textContent=result.existing?'这条表达已经收藏过啦。':'已收藏到你的进步词库！';if(!result.existing)f.reset();renderPage()}
  else msg.textContent='添加失败，请确认表达非空且浏览器允许保存。';
 });

 document.getElementById('mv-import').addEventListener('click',function(){document.getElementById('mv-import-file').click()});
 document.getElementById('mv-import-file').addEventListener('change',function(ev){
  var file=ev.target.files&&ev.target.files[0],message=document.getElementById('mv-message');
  if(!file)return;
  if(file.size>1048576){message.textContent='备份文件过大，请选择小于 1MB 的 JSON 文件。';ev.target.value='';return}
  var reader=new FileReader();
  reader.onload=function(){
   try{
    var saved=JSON.parse(String(reader.result||'')),rows=saved&&saved.items;
    if(!Array.isArray(rows))throw Error('invalid');
    if(!confirm('将备份中的表达合并到当前本机词库？已有表达会保留。'))return;
    var existing=items(),seen=new Set(existing.map(function(x){return normalizePhrase(x.phrase)})),count=0;
    rows.slice(0,500).forEach(function(raw){
     if(!raw||typeof raw.phrase!=='string')return;
     var phrase=raw.phrase.trim().replace(/\s+/g,' ').slice(0,150),norm=normalizePhrase(phrase);
     if(!norm||seen.has(norm)||existing.length>=500)return;
     seen.add(norm);count++;
     existing.push({id:'mv-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),phrase:phrase,zh:String(raw.zh||'').slice(0,250),example:String(raw.example||'').slice(0,400),topic:String(raw.topic||'').slice(0,180),level:String(raw.level||'B1–B2').slice(0,30),source:String(raw.source||'导入备份').slice(0,80),state:STATES.indexOf(raw.state)>=0?raw.state:'new',savedAt:String(raw.savedAt||new Date().toISOString()),reviewed:Number(raw.reviewed)||0});
    });
    if(!persist(existing))throw Error('storage');
    message.textContent='成功导入 '+count+' 条新表达，重复词伙已跳过。';renderPage();
   }catch(e){message.textContent='导入失败：请检查文件格式或浏览器存储权限。'}
   finally{ev.target.value=''}
  };
  reader.onerror=function(){message.textContent='读取文件失败。';ev.target.value=''};
  reader.readAsText(file,'UTF-8');
 });
 document.getElementById('mv-export').addEventListener('click',function(){
  var data=JSON.stringify({version:1,profile:profile()?profile().name:'访客',exportedAt:new Date().toISOString(),items:items()},null,2);
  var url=URL.createObjectURL(new Blob([data],{type:'application/json;charset=utf-8'})),a=document.createElement('a');
  a.href=url;a.download='my-ielts-vocabulary.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000);
 });
}
window.IELTSMyVocabulary={feedbackHTML:feedbackHTML,save:save,items:items,recommend:recommend};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initPage);else initPage();
})();