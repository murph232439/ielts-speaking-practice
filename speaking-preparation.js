/* Optional preparation only. Recording, scoring and submission remain owned by index.html. */
(function () {
  'use strict';
  var list = document.getElementById('list');
  if (!list) return;
  var drafts = Object.create(null), pending = false;
  try { drafts = JSON.parse(sessionStorage.getItem('ielts-preparation-v1') || '{}') || {}; } catch (_) {}
  function escape(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function normal(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function key() { return JSON.stringify([PG.part, PG.title, PCUR.t]); }
  function draft() { var k = key(); return drafts[k] || (drafts[k] = {route:'', idea:'', reason:'', example:'', selected:[]}); }
  function save() { try { sessionStorage.setItem('ielts-preparation-v1', JSON.stringify(drafts)); } catch (_) {} }
  function button(action, text, extra) { return '<button type="button" data-prep-action="'+action+'" '+(extra || '')+'>'+escape(text)+'</button>'; }
  function material() { return window.IELTSQuestionMaterials && IELTSQuestionMaterials.find(PG.part, PG.title, PCUR.t); }
  var cases = {
    'Do you think a good teacher should be popular?': {
      scenes:['A老师很受欢迎，学生敢提问，也愿意参与课堂。','B老师同样受欢迎，但学生经常聊天，课堂任务很难完成。'],
      question:'两位老师都受欢迎，为什么教学效果可能不同？',
      groups:'可以按课堂情况区分：受欢迎让学生更愿意参与；受欢迎却伴随纪律问题。选择一个情况展开也可以。',
      define:'good：你用什么判断教得好？例如学生听懂了，或能独立完成任务。popular：学生愿意接近老师、提问或参与课堂。两个判断不一定相同。',
      words:[['feel comfortable asking questions','敢于提问','Students feel comfortable asking questions in her class.'],['explain things clearly','把内容讲清楚','A good teacher can explain things clearly.'],['maintain classroom discipline','维持课堂纪律','Teachers also need to maintain classroom discipline.']]
    },
    'Why do some students want to become popular?': {
      scenes:['一位学生刚进入新班级，希望有人一起吃午饭。','另一位学生正在竞选学生会，希望同学支持自己。'],
      question:'两个人都希望受欢迎，他们想得到的东西一样吗？',
      groups:'可以按目的区分：希望融入同学的学生；希望获得支持的学生。分别说清他们需要什么。',
      define:'popular：这里可以理解为受到同学欢迎或支持。想一想：谁欢迎他？表现为愿意和他相处，还是愿意支持他的提议？',
      words:[['feel included','感到被接纳','New students may want to feel included.'],['make friends','交朋友','They hope to make friends more easily.'],['gain support','获得支持','Students running for a position may want to gain support.']]
    },
    'What kinds of students are more popular at school?': {
      scenes:['一位同学会主动邀请新同学加入小组。','另一位同学在校队比赛中表现突出，大家经常谈到他。'],
      question:'他们分别因为什么受到关注或欢迎？',
      groups:'可以按行为或特点区分：友善助人；擅长运动；幽默开朗。选两类即可，也可以提出其他扣题的分类。',
      define:'popular：注意“受到关注”和“大家愿意相处”可能不同。选择一个具体表现来说明。',
      words:[['include others','让其他人加入','Friendly students include others in group activities.'],['be easy to get along with','容易相处','They are easy to get along with.'],['attract attention','吸引注意','Talented athletes can attract attention at school.']]
    },
    'What would you do if you feel bored?': {
      scenes:['你独自在家，想找人聊一聊。','你已经看了很久手机，想换一种活动。'],
      question:'你更接近哪种情况？你会做什么，为什么？',
      words:[['message my friends','给朋友发消息','I would message my friends and have a chat.'],['go for a walk','散步','I would go for a walk near my home.'],['break the routine','打破日常惯例','Trying something different helps me break the routine.']]
    }
  };
  function specific() { return cases[normal(PCUR.t)]; }
  function opening() {
    var q = normal(PCUR.t).toLowerCase();
    if (/^why\b/.test(q)) return ['先说一个主要原因。','One reason is that …'];
    if (/^how often\b/.test(q)) return ['先说频率，再补一个具体情况。','I usually …'];
    if (/^how\b/.test(q)) return ['先说一种做法或一种影响，再解释怎样发生。','One way is to … / It can …'];
    if (/^what (kinds|types|sorts)\b/.test(q)) return ['先指出一种具体的人或事物，再解释。','One example is …'];
    if (/\bprefer\b/.test(q)) return ['先说自己的选择，再解释选择的原因。','I prefer … because …'];
    if (/^do you think|^should|^is it|^are there/.test(q)) return ['先说你的判断；如果取决于情况，也可以直接说。','I think … / It depends on …'];
    if (PG.part === 'p1') return ['先直接回答题目问的事情，再补自己的经历或原因。','I … because …'];
    return ['先说一个直接回应题目的意思，再解释原因或具体情况。','I think … / One example is …'];
  }
  function definitionHint() {
    var q = PCUR.t, c = specific();
    if (c && c.define) return c.define;
    var rules = [
      [/\b(good|successful|effective)\b/i,'用什么结果判断？例如谁完成了什么，或谁得到了什么帮助。'],
      [/\b(important|useful|necessary)\b/i,'对谁重要或有用？帮助他完成什么？缺少它会有什么影响？'],
      [/\b(difficult|easy|challenging)\b/i,'具体哪一步难或容易？对缺少什么经验、时间或资源的人尤其如此？'],
      [/\b(popular)\b/i,'受谁欢迎？具体表现是愿意购买、使用、支持，还是与他相处？'],
      [/\b(better|best)\b/i,'按什么标准比较？例如时间、费用、效果或体验。先选择与本题有关的一项。']
    ];
    for (var i=0; i<rules.length; i++) { var match=q.match(rules[i][0]); if(match) return match[0]+'：'+rules[i][1]; }
    return '先说清题目中的动作：谁做什么？在什么情况下？如果没有需要解释的评价词，可以直接继续。';
  }
  function groupingHint() {
    var c=specific(); if(c && c.groups) return c.groups;
    var g=typeof p3GrammarFor==='function' ? p3GrammarFor(PCUR.t) : null;
    var subject=g && ((g.subjects||[])[0] || (g.nouns||[])[0]);
    return (subject?'本题涉及“'+subject+'”。':'先圈定题目正在讨论的人或事物。')+'想两种具体情况：目的不同、经验不同，或可用的时间和资源不同，会改变你的答案吗？只选择能解释本题的差异；如果不会改变答案，就不必分类。';
  }
  function helpHtml(route) {
    var c=specific(), m=material(), o=opening();
    if(route==='start') return '<h3>先确定你最想说的一点</h3><p>'+escape(o[0])+'</p><p class="prep-example" lang="en">'+escape(o[1])+'</p><p>接着问自己：为什么？能举出一个具体情况吗？在下面只记关键词，也可以直接说。</p>';
    if(route==='ideas') {
      if(c) return '<h3>从具体情况找一个理由</h3><p class="prep-muted">以下是帮助思考的假设情境，可以提出不同看法。</p><ul>'+c.scenes.map(function(s){return '<li>'+escape(s)+'</li>';}).join('')+'</p><p><b>'+escape(c.question)+'</b></p>';
      if(m && m.idea) return '<h3>从本题的一条思路开始</h3><p>'+escape(m.idea)+'</p><p>你同意其中哪一点？想一个人在什么情况下会这样，随后说出原因。也可以提出不同立场。</p>';
      return '<h3>先想一个具体的人和情境</h3><p>想想你自己、一个熟悉的人或一个假设的人：他什么时候会遇到题目中的事情？做了什么？结果怎样？从最容易说的一点开始。</p><p class="prep-muted">这是找内容的方法，不需要编造真实经历。</p>';
    }
    if(route==='understand') return '<h3>把题目变成具体的问题</h3>'+(PCUR.zh?'<p>'+escape(PCUR.zh)+'</p>':'')+'<h4>讨论对象：什么差异会改变答案？</h4><p>'+escape(groupingHint())+'</p><h4>判断标准：具体是什么意思？</h4><p>'+escape(definitionHint())+'</p><p class="prep-muted">这是准备时的思考，不必在回答里逐项解释；也不要求每题都分类。</p>';
    return '';
  }
  function entries() {
    var c=specific(), rows=[];
    if(c) c.words.forEach(function(w){rows.push({en:w[0],zh:w[1],example:w[2],source:'本题可用',angle:''});});
    var exact=(window.IELTSQuestionDetailLexis || []).filter(function(x){return x.part===PG.part && normal(x.title)===normal(PG.title) && normal(x.question)===normal(PCUR.t);});
    exact.forEach(function(x){(x.terms||[]).forEach(function(t){rows.push({en:t.en,zh:t.zh,example:t.example||'',source:'本题批改语料',angle:''});});});
    var bank=window.IELTSTopicVocabulary;
    if(bank) bank.entriesFor(bank.topicMap[PCUR.t]?PCUR.t:PG.title).forEach(function(t){rows.push(Object.assign({},t,{source:'话题补充 · 请按自己的意思选择'}));});
    rows.forEach(function(t){if(!t.example){var match=rows.find(function(other){return normal(other.en).toLowerCase()===normal(t.en).toLowerCase() && other.example;});if(match)t.example=match.example;}});
    var seen=new Set();
    return rows.filter(function(t){var k=normal(t.en).toLowerCase();if(!k || seen.has(k))return false;seen.add(k);return true;});
  }
  function vocabHtml() {
    var rows=entries(), angles=window.IELTSTopicVocabulary ? IELTSTopicVocabulary.angles : {};
    var options=Array.from(new Set(rows.map(function(t){return t.angle;}).filter(Boolean)));
    return '<details class="prep-vocabulary"><summary>有了意思，需要英语表达时打开</summary><div class="prep-vocab-body"><p>先看中文意思，挑一两条符合你想法的表达。例句供改写，不必全部使用。</p>'+(options.length?'<label for="prep-filter">按表达目的找词</label><select id="prep-filter"><option value="">本题优先 / 所有目的</option>'+options.map(function(id){return '<option value="'+escape(id)+'">'+escape(angles[id]?angles[id][0]:id)+'</option>';}).join('')+'</select>':'')+'<label for="prep-search">也可以输入想表达的意思</label><input id="prep-search" type="search" placeholder="例如：放松、支持、朋友；也可以搜英文"><div id="prep-words"></div><p id="prep-selected" role="status"></p></div></details>';
  }
  function renderWords() {
    var target=document.getElementById('prep-words');if(!target)return;
    var select=document.getElementById('prep-filter'), filter=select?select.value:'', all=entries(), chosen=draft().selected||[];
    var search=document.getElementById('prep-search'), query=normal(search?search.value:'').toLowerCase();
    var rows=all.filter(function(t){return (!filter || t.angle===filter) && (!query || (t.en+' '+t.zh+' '+(t.example||'')).toLowerCase().indexOf(query)>=0);});
    function card(t){return '<div class="prep-word"><span class="prep-source">'+escape(t.source)+'</span><b>'+escape(t.zh||'结合下方例句理解用法')+'</b><strong lang="en">'+escape(t.en)+'</strong>'+(t.example?'<p lang="en">'+escape(t.example)+'</p>':'<p class="prep-muted">先确定谁做什么，再把这个词组放进自己的完整句子。</p>')+button('word',chosen.indexOf(t.en)>=0?'已选入关键词':'这条我用得上','data-word="'+escape(t.en)+'" aria-pressed="'+(chosen.indexOf(t.en)>=0)+'"')+'</div>';}
    target.innerHTML=rows.length?'<div class="prep-grid">'+rows.slice(0,3).map(card).join('')+'</div>'+(rows.length>3?'<details><summary>还没找到合适的？再看 '+(rows.length-3)+' 条</summary><div class="prep-grid">'+rows.slice(3).map(card).join('')+'</div></details>':''):'<p>没有找到对应词组。可以换一个关键词、清除筛选，或先用熟悉的简单词表达。</p>';
    document.getElementById('prep-selected').textContent=chosen.length?'我准备使用：'+chosen.join(' · '):'选择是可选的；表达准确比数量重要。';
  }
  function panelHtml() {
    var d=draft();
    return '<section class="prep-panel" id="prep-panel" aria-label="回答准备"><div class="prep-heading"><span>听懂以后 · 准备自己的回答</span><h2>你现在需要哪一点帮助？</h2><p>能回答就直接录音；需要帮助时任选一项。各分数段都可以使用。</p></div><div class="prep-routes">'+[['start','有想法，不知道从哪里说'],['ideas','暂时没有想法'],['understand','需要弄清对象或关键词']].map(function(x){return button('route',x[1],'data-route="'+x[0]+'" aria-pressed="'+(d.route===x[0])+'"');}).join('')+'</div><div id="prep-help" aria-live="polite">'+helpHtml(d.route)+'</div><div class="prep-notes"><label for="prep-idea">我最想说的一点 <small>中文或英文关键词均可，也可以直接口头准备</small></label><textarea id="prep-idea" data-prep-field="idea" placeholder="先记一个意思，不必写完整答案">'+escape(d.idea)+'</textarea><details><summary>需要时，补一个理由或具体情况</summary><label for="prep-reason">为什么？</label><textarea id="prep-reason" data-prep-field="reason" placeholder="这会怎样影响题目中的人或事情？">'+escape(d.reason)+'</textarea><label for="prep-example">例如什么情况？</label><textarea id="prep-example" data-prep-field="example" placeholder="可以是真实经历，也可以明确说是假设情境">'+escape(d.example)+'</textarea></details></div>'+vocabHtml()+'<details class="prep-stretch"><summary>已经能说清楚？再推敲一步</summary><p>什么情况下你的判断可能不同？选一个条件或例外，解释为什么会改变答案。没有必要时，不用强加转折。</p><p lang="en" class="prep-example">This may depend on … / However, for …</p></details><div class="prep-footer">'+button('ready','准备好了，去录音')+'<p>录音时用自己的话说，不必复述范例。下方沿用原来的录音提交区。</p></div></section>';
  }
  function mount() {
    if(window.MODE!=='practice' || !window.PG || !window.PCUR || PG.part==='p2')return;
    var box=document.getElementById('trainBox');
    if(!box || !box.children.length)return;
    var panel=document.getElementById('prep-panel');
    if(!panel) {
      var legacy=document.createElement('details');legacy.className='prep-legacy';legacy.open=!!draft().legacyOpen;legacy.innerHTML='<summary>需要逐步选择句子？展开原有分步练习</summary>';
      while(box.firstChild)legacy.appendChild(box.firstChild);
      box.appendChild(legacy);
      box.insertAdjacentHTML('afterbegin',panelHtml());
      renderWords();
    }
    // Async vocabulary/material wrappers may prepend content after the panel mounts.
    // Move only learning material, never recording elements or their event handlers.
    var library=box.querySelector('.prep-library');
    var nodes=Array.from(box.querySelectorAll('.b1Vocab,.qmMaterial'));
    if(nodes.length && !library){library=document.createElement('details');library.className='prep-library';library.innerHTML='<summary>完整话题词库与参考思路 · 按需查阅</summary>';box.appendChild(library);}
    nodes.forEach(function(n){if(n.parentNode!==library){n.open=false;library.appendChild(n);}});
    // Hide answer-specific lexical hints until the listening choice has been made.
    var extra=list.querySelector('.practiceDetailLexis');
    if(extra && library && extra.parentNode!==library)library.appendChild(extra);
  }
  function schedule() { if(pending)return;pending=true;Promise.resolve().then(function(){pending=false;mount();}); }
  new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
  list.addEventListener('click',function(e){
    var b=e.target.closest('[data-prep-action]');if(!b)return;
    var d=draft(), action=b.dataset.prepAction;
    if(action==='route') {d.route=b.dataset.route;document.querySelectorAll('[data-route]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});document.getElementById('prep-help').innerHTML=helpHtml(d.route);}
    if(action==='word') {var w=b.dataset.word,i=d.selected.indexOf(w);if(i>=0)d.selected.splice(i,1);else d.selected.push(w);b.setAttribute('aria-pressed',String(i<0));b.textContent=i<0?'已选入关键词':'这条我用得上';document.getElementById('prep-selected').textContent=d.selected.length?'我准备使用：'+d.selected.join(' · '):'选择是可选的；表达准确比数量重要。';}
    if(action==='ready'){showRecordingStep();var rec=document.getElementById('recStep');if(rec){rec.scrollIntoView({behavior:'smooth',block:'start'});var name=document.getElementById('srecname');if(name)name.focus({preventScroll:true});}}
    save();
  });
  list.addEventListener('input',function(e){if(e.target.id==='prep-search')renderWords();if(e.target.dataset.prepField){draft()[e.target.dataset.prepField]=e.target.value;save();}});
  list.addEventListener('change',function(e){if(e.target.id==='prep-filter')renderWords();});
  list.addEventListener('toggle',function(e){if(e.target.classList.contains('prep-legacy')){draft().legacyOpen=e.target.open;save();}if(e.target.classList.contains('prep-vocabulary') && e.target.open)renderWords();},true);
  // Prevent vocabulary from revealing the question before the listening task is answered.
  var style=document.createElement('style');
  style.textContent='.practiceDetailLexis{display:none}.prep-library .practiceDetailLexis{display:block}.prep-panel{background:#fff;border:1px solid #cfdbed;border-radius:14px;margin:16px 0;padding:20px;color:#26364b;line-height:1.7}.prep-heading>span{font-size:12px;color:#2456a6;font-weight:700}.prep-panel h2{font-size:21px;margin:4px 0 8px}.prep-panel h3{font-size:17px;margin:12px 0 6px}.prep-panel h4{font-size:14px;margin-top:12px}.prep-panel p{font-size:14px;margin:8px 0}.prep-panel ul{padding-left:22px}.prep-panel li{margin:8px 0}.prep-routes{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.prep-panel button{font:inherit;font-size:14px;cursor:pointer;border:1px solid #b6c9e1;background:#f5f8fd;color:#244e81;border-radius:8px;padding:10px 12px;text-align:left}.prep-panel button[aria-pressed=true]{background:#2456a6;color:white;border-color:#2456a6}.prep-panel button:focus-visible,.prep-panel summary:focus-visible{outline:3px solid #4e89cf;outline-offset:3px}.prep-panel label{display:block;font-size:14px;font-weight:600;margin:12px 0 6px}.prep-panel small{display:block;font-size:12px;font-weight:400;color:#58677b}.prep-panel textarea,.prep-panel select,.prep-panel input{width:100%;border:1px solid #bdccdf;border-radius:8px;padding:10px;font:inherit;font-size:14px;background:#fff;color:#26364b}.prep-panel textarea{min-height:65px;resize:vertical}.prep-panel details{margin:12px 0;border-top:1px solid #e1e8f1;padding-top:10px}.prep-panel summary,.prep-library>summary,.prep-legacy>summary{cursor:pointer;font-size:14px;font-weight:600;padding:8px 0}.prep-muted,.prep-panel .prep-muted{color:#637285;font-size:12px}.prep-example{background:#eef5fc;padding:10px;border-radius:8px}.prep-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}.prep-word{border:1px solid #d8e3f0;border-radius:10px;padding:12px;overflow-wrap:anywhere;background:#f8fbff}.prep-word b,.prep-word strong{display:block;font-size:14px}.prep-word strong{color:#2456a6;margin:5px 0}.prep-source{display:block;font-size:11px;color:#637285;margin-bottom:8px}.prep-word p{font-size:13px}.prep-word button{font-size:12px;padding:6px 8px}.prep-footer{margin-top:18px;padding-top:14px;border-top:1px solid #d8e3f0}.prep-footer button{background:#2456a6;color:white}.prep-footer p{font-size:12px;color:#637285}.prep-library,.prep-legacy{margin:12px 0;padding:10px 14px;border:1px solid #d8e3f0;border-radius:10px;background:#f7f9fc}.prep-legacy>summary{color:#52677f}@media(max-width:700px){.prep-grid{grid-template-columns:1fr}.prep-panel{padding:14px}.prep-routes{flex-direction:column}.prep-routes button{width:100%}}';
  document.head.appendChild(style);
  schedule();
})();
