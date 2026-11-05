/* Historical teacher-correction corpus: displayed ONLY in the vocabulary study area. */
(function(){
'use strict';
var archive=document.getElementById('grading-lexis-archive');
if(!archive)return;
var input=document.getElementById('grading-lexis-search'),results=document.getElementById('grading-lexis-results'),status=document.getElementById('grading-lexis-status');
var more=document.getElementById('grading-lexis-more'),partFilter='all',limit=12,visible=[],MAX=150;
var source=Array.isArray(window.IELTSQuestionDetailLexis)?window.IELTSQuestionDetailLexis:[];
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clean(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function countTerms(){return source.reduce(function(n,row){return n+(Array.isArray(row.terms)?row.terms.length:0)},0)}
function contains(row,q){
 if(!q)return true;
 var text=[row.title,row.question,row.part].concat((row.terms||[]).flatMap(function(t){return [t.en,t.zh]})).join(' ').toLowerCase();
 return text.indexOf(q)!==-1;
}
function current(){
 var q=clean(input.value);
 return source.filter(function(row){
  return (!partFilter||partFilter==='all'||row.part===partFilter)&&contains(row,q);
 }).slice(0,MAX);
}
function inPersonal(phrase){
 var api=window.IELTSMyVocabulary;
 return !!(api&&api.items().some(function(x){return clean(x.phrase)===clean(phrase)}));
}
function termRow(row,term,i,j){
 var saved=inPersonal(term.en);
 return '<div class="gradingLexisTerm"><div class="gradingLexisTermText"><strong>'+esc(term.en)+'</strong><span>'+esc(term.zh||'暂无中文使用场景')+'</span></div>'+
 '<button type="button" data-gl-save="'+i+':'+j+'" '+(saved?'disabled':'')+' aria-label="收藏 '+esc(term.en)+'">'+(saved?'✓ 已收藏':'＋ 收藏')+'</button></div>';
}
function draw(){
 visible=current();
 var total=visible.length,shown=Math.min(limit,total);
 status.textContent='本库共 '+source.length+' 道题、'+countTerms()+' 条词伙 · 当前匹配 '+total+' 道题。';
 if(!source.length){results.innerHTML='<p class="gradingLexisEmpty">语料尚未加载。请稍后刷新此页。</p>';more.hidden=true;return}
 if(!total){results.innerHTML='<p class="gradingLexisEmpty">没有找到相关题目或词伙。试试话题、关键词或中文使用场景。</p>';more.hidden=true;return}
 results.innerHTML=visible.slice(0,shown).map(function(row,i){
  return '<details class="gradingLexisQuestion"><summary><div><span class="gradingLexisPart">'+esc((row.part||'').toUpperCase())+'</span><span class="gradingLexisTopic">'+esc(row.title)+'</span><b>'+esc(row.question)+'</b></div><small>'+row.terms.length+' 条词伙</small></summary>'+
  '<div class="gradingLexisTerms">'+row.terms.map(function(term,j){return termRow(row,term,i,j)}).join('')+'</div></details>';
 }).join('');
 more.hidden=shown>=total;more.textContent='再查看 '+Math.min(12,total-shown)+' 道题';
}
archive.addEventListener('toggle',function(){if(archive.open)draw()});
input.addEventListener('input',function(){limit=12;draw()});
document.querySelectorAll('[data-gl-part]').forEach(function(btn){
 btn.addEventListener('click',function(){
  partFilter=btn.getAttribute('data-gl-part');
  document.querySelectorAll('[data-gl-part]').forEach(function(b){b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});
  limit=12;draw();
 });
});
more.addEventListener('click',function(){limit+=12;draw();});
results.addEventListener('click',function(ev){
 var button=ev.target.closest('[data-gl-save]');if(!button)return;
 var parts=button.getAttribute('data-gl-save').split(':'),
 row=visible[Number(parts[0])],term=row&&row.terms[Number(parts[1])];
 if(!term)return;
 var api=window.IELTSMyVocabulary;
 if(!api){status.textContent='个人词库还没加载成功，请刷新页面再收藏。';return}
 var response=api.save({phrase:term.en,zh:term.zh,level:'待分级',topic:row.title,example:'',source:'历史批改语料（非个人专属批改）'});
 if(response.ok){button.disabled=true;button.textContent=response.existing?'✓ 已在词库':'✓ 已收藏';status.textContent='已收藏到你的进步词库。建议先确认具体用法，再自己造句复习。'}
 else status.textContent='未能保存，请检查浏览器存储权限。';
});
if(archive.open)draw();
})();