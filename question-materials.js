/* Exact cue-card and individual-question materials. No topic-level fallback. */
(function () {
  'use strict';
  if (window.IELTSQuestionMaterialsLoading || !Array.isArray(window.G)) return;
  window.IELTSQuestionMaterialsLoading = true;
  var paths = [1,2,3,4].map(function(n){return 'question-materials-'+n+'.js?v=20261122a';});
  function script(path) { return new Promise(function(resolve,reject){var s=document.createElement('script');s.src=path;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);}); }
  var ready = Array.isArray(window.IELTSQuestionMaterialChunks) && window.IELTSQuestionMaterialChunks.flat().length === 346;
  (ready ? Promise.resolve() : Promise.all(paths.map(script))).then(initialise).catch(function(){
    var list=document.getElementById('list');if(!list)return;
    var p=document.createElement('p');p.setAttribute('role','status');p.textContent='逐题素材暂时未能加载，请刷新重试。';list.prepend(p);
  });
  function initialise() {
    var data=window.IELTSQuestionMaterialChunks.flat(), materials=new Map();
    function normal(s){return String(s||'').replace(/\s+/g,' ').trim();}
    function key(part,title,q){return JSON.stringify([part,normal(title),normal(q)]);}
    data.forEach(function(item){materials.set(key(item.part,item.title,item.question),item);});
    function find(part,title,q){return materials.get(key(part,title,q));}
    function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
    var adTerms={
      'pop-up ads':'弹窗广告','app-open ads / splash ads':'开屏广告','pre-roll ads':'正片前的视频广告',
      'celebrity endorsements':'名人代言','a target audience':'目标受众','a slogan':'广告标语',
      'targeted ads':'定向广告','billboards':'户外广告牌','brand awareness':'品牌知名度'
    };
    function termsFor(item){
      var q=item.question.toLowerCase();
      if(item.part==='p2'&&item.title==='An advertisement with a famous person in it')return ['celebrity endorsements','pre-roll ads','billboards'];
      if(!/advertis/.test(q))return [];
      if(/online|offline/.test(q))return ['targeted ads','billboards'];
      if(/endorsed|celebrit/.test(q))return ['celebrity endorsements','a target audience'];
      if(/boring/.test(q))return ['pre-roll ads','a slogan'];
      if(/factor/.test(q))return ['a target audience','a slogan'];
      if(/company/.test(q))return ['brand awareness','a target audience'];
      if(/disadvantages/.test(q))return ['pop-up ads','app-open ads / splash ads'];
      return ['targeted ads','celebrity endorsements','brand awareness'];
    }
    function html(item,open){
      if(!item)return '';
      var is2=item.part==='p2', terms=termsFor(item);
      var body='<p class="qmNote">'+(is2?'示例经历供改写：请替换人物、地点、时间和实际结果。':'下面是一条可展开的思路，允许提出其他立场；举例时请说明是个人观察还是假设。')+'</p>';
      if(is2){
        body+='<ol class="qmPoints">'+item.points.map(function(p){return '<li><b>'+esc(p.prompt)+'</b><p>'+esc(p.idea)+'</p></li>';}).join('')+'</ol>';
        body+='<p class="qmAngles">适合的展开角度：'+esc(item.angles.join(' · '))+'</p>';
      }else{
        body+='<p class="qmQuestion">'+esc(item.question)+'</p>'+(item.zh?'<p class="qmTranslation">'+esc(item.zh)+'</p>':'');
        body+='<h4>紧扣这道题的内容</h4><ul class="qmIdeas">'+item.idea.split('；').map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ul>';
      }
      if(terms.length)body+='<h4>这道题用得上的话题词</h4><div class="qmTerms">'+terms.map(function(t){return '<span><b>'+esc(t)+'</b> '+esc(adTerms[t])+'</span>';}).join('')+'</div>';
      body+='<h4>表达升级 · B1 / B2 / C1</h4><div class="qmLevels">'+['B1','B2','C1'].map(function(level){return '<section><b>'+level+'</b><p lang="en">'+esc(item.expressions[level])+'</p></section>';}).join('')+'</div><p class="qmNote">等级是表达练习的梯度参考。先用 B1 说清上面的内容，再选贴合自己意思的表达；不要为了升级改变题意。</p>';
      if(!is2&&typeof window.p3AnswerFor==='function'){
        var answer=window.p3AnswerFor(item.question);
        if(answer&&answer.answer)body+='<details class="qmReference"><summary>查看原题库英文参考回答（另一种展开方式）</summary><p lang="en">'+esc(answer.answer)+'</p></details>';
      }
      body+='<p class="qmTask">'+(is2?'练习：用 30 秒选出四条提示的关键词，再围绕这些细节连续讲述。':'练习：直接回答问题 → 从上面选一个理由 → 补一个具体例子 → 需要时加一句限制。')+'</p>';
      return '<details class="qmMaterial" data-part="'+item.part+'"'+(open?' open':'')+'><summary>'+ (is2?'本题扣题素材 · 逐条回应题卡':'这道问题的扣题素材')+'</summary><div class="qmBody">'+body+'</div></details>';
    }
    var css=document.createElement('style');css.textContent='.qmMaterial{border:1px solid #b9cde1;border-radius:10px;margin:10px 0;background:#f0f6fb;color:#24364a}.qmMaterial>summary{cursor:pointer;padding:12px 14px;font-size:14px;font-weight:700}.qmMaterial summary:focus-visible{outline:3px solid #2456a6;outline-offset:2px}.qmBody{padding:0 14px 14px;font-size:14px;line-height:1.75}.qmBody h4{font-size:14px;margin:14px 0 8px}.qmNote,.qmTask,.qmAngles{font-size:12px;color:#516176}.qmQuestion{font-weight:700;margin:5px 0}.qmTranslation{color:#516176;margin:0 0 10px}.qmPoints{padding-left:22px}.qmPoints li{margin:12px 0}.qmPoints p{margin:3px 0}.qmPoints b{font-size:13px;color:#315777}.qmIdeas{padding-left:20px}.qmIdeas li{margin:7px 0}.qmTerms{display:flex;flex-wrap:wrap;gap:8px}.qmTerms span{background:white;border:1px solid #d4dfeb;border-radius:8px;padding:7px 10px;font-size:13px}.qmTerms b{color:#2456a6}.qmLevels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.qmLevels section{background:white;border:1px solid #d4dfeb;border-radius:8px;padding:10px;min-width:0}.qmLevels b{color:#2456a6;font-size:12px}.qmLevels p{margin:4px 0;overflow-wrap:anywhere}.qmReference{margin-top:10px}.qmReference summary{cursor:pointer;font-size:13px}.qmReference p{background:white;padding:12px;border-radius:8px}.qmTask{padding-top:10px;border-top:1px solid #d4dfeb}@media(max-width:650px){.qmLevels{grid-template-columns:1fr}.qmBody{padding:0 12px 12px}}';document.head.appendChild(css);
    function heading(card){var el=card.querySelector('.ptitle');if(!el)return '';var clone=el.cloneNode(true);clone.querySelectorAll('.badge').forEach(function(x){x.remove();});return normal(clone.textContent);}
    function browseMaterials(){
      document.querySelectorAll('#list .qmMaterial').forEach(function(el){el.remove();});
      document.querySelectorAll('#list .card').forEach(function(card){
        var title=heading(card),cue=card.querySelector('.cue');
        if(cue){var item=find('p2',title,cue.textContent);if(item)cue.insertAdjacentHTML('afterend',html(item,false));return;}
        card.querySelectorAll('.qrow').forEach(function(row){
          var text=row.querySelector('.qtxt');if(!text)return;var clone=text.cloneNode(true);clone.querySelectorAll('.zhs').forEach(function(el){el.remove();});
          var item=find('p3',title,clone.textContent);if(item)row.insertAdjacentHTML('afterend',html(item,false));
        });
      });
    }
    function practiceMaterials(){
      var box=document.getElementById('trainBox');if(!box||!window.PG||!window.PCUR||PG.part!=='p3')return;
      box.querySelectorAll('.qmMaterial').forEach(function(el){el.remove();});
      var item=find('p3',PG.title,PCUR.t);if(item)box.insertAdjacentHTML('afterbegin',html(item,window.P3MODE!=='challenge'));
    }
    var browse=window.renderBrowse;window.renderBrowse=function(){browse.apply(this,arguments);browseMaterials();};
    // Append after existing render wrappers, preserving draft and recording behaviour.
    ['renderTrainStep','renderP3Step'].forEach(function(name){var original=window[name];if(typeof original!=='function')return;window[name]=function(){var result=original.apply(this,arguments);practiceMaterials();return result;};});
    window.IELTSQuestionMaterials={data:data,find:find,renderHtml:html,refreshBrowse:browseMaterials,refreshPractice:practiceMaterials};
    if(window.MODE==='browse')browseMaterials();else practiceMaterials();
  }
})();
