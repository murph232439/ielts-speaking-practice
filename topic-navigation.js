/* Responsive topic navigation. Reuses the existing bank, filters and practice flow. */
(function () {
  'use strict';
  if(window.IELTSTopicNavigation || !Array.isArray(window.G))return;
  var list=document.getElementById('list'),bar=document.getElementById('browseBar');
  if(!list || !bar)return;
  var small=window.matchMedia('(max-width: 800px)'),active=null,collapsed=false,open=false,navQuery='',lastFocus=null,savedOverflow='';
  var shell=document.createElement('div');shell.className='topicWorkspace';
  list.parentNode.insertBefore(shell,list);
  var aside=document.createElement('aside');aside.id='topicSidebar';aside.className='topicSidebar';aside.setAttribute('aria-label','话题导航');
  aside.innerHTML='<div class="topicNavHeading"><h2 id="topicNavTitle">选择话题</h2><button type="button" class="topicNavClose" aria-label="关闭话题导航">×</button></div><label class="topicNavSearch"><span>搜索话题</span><input type="search" id="topicNavSearch" placeholder="话题名称或中文关键词" autocomplete="off"></label><div class="topicNavParts" aria-label="按 Part 筛选话题"></div><div class="topicNavItems" id="topicNavItems"></div>';
  var content=document.createElement('section');content.className='topicContent';content.setAttribute('aria-label','题目与练习');
  var toolbar=document.createElement('div');toolbar.className='topicToolbar';toolbar.innerHTML='<button type="button" id="topicNavToggle" class="topicNavToggle" aria-controls="topicSidebar" aria-expanded="true">收起话题</button><span class="topicCurrent" id="topicCurrent">全部话题</span><button type="button" class="topicShowAll" hidden>显示全部话题</button>';
  var backdrop=document.createElement('button');backdrop.type='button';backdrop.className='topicNavBackdrop';backdrop.setAttribute('aria-label','关闭话题选择面板');backdrop.tabIndex=-1;
  shell.append(aside,content,backdrop);content.append(toolbar,bar,list);document.body.classList.add('topicNavReady');
  var toggle=toolbar.querySelector('#topicNavToggle'),current=toolbar.querySelector('#topicCurrent'),all=toolbar.querySelector('.topicShowAll'),search=aside.querySelector('input'),items=aside.querySelector('.topicNavItems'),parts=aside.querySelector('.topicNavParts');
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function partLabel(p){return {p1:'Part 1',p2:'Part 2',p3:'Part 3'}[p]||'全部';}
  function syncLayout(){
    var practice=window.MODE!=='browse';
    shell.classList.toggle('topicPractice',practice);shell.classList.toggle('topicCollapsed',collapsed);shell.classList.toggle('topicDrawerOpen',open&&small.matches&&!practice);
    var expanded=!practice&&(small.matches?open:!collapsed);
    toggle.textContent=small.matches?'选择话题':(collapsed?'展开话题':'收起话题');toggle.setAttribute('aria-expanded',String(expanded));
    aside.inert=!expanded;aside.setAttribute('aria-hidden',String(!expanded));
    if(small.matches&&open&&!practice){aside.setAttribute('role','dialog');aside.setAttribute('aria-modal','true');aside.setAttribute('aria-labelledby','topicNavTitle');}
    else {aside.removeAttribute('role');aside.removeAttribute('aria-modal');aside.removeAttribute('aria-labelledby');}
    content.inert=!!(small.matches&&open&&!practice);
    var header=document.querySelector('header'),dog=document.getElementById('studyCompanion');
    if(header)header.inert=content.inert;if(dog)dog.inert=content.inert;
    document.body.classList.toggle('topicDrawerLocked',!!(small.matches&&open&&!practice));
  }
  function closeDrawer(restore){
    if(!open)return;open=false;syncLayout();document.body.style.overflow=savedOverflow;
    if(restore&&lastFocus&&lastFocus.isConnected)lastFocus.focus();
  }
  function showDrawer(){lastFocus=document.activeElement;savedOverflow=document.body.style.overflow;open=true;document.body.style.overflow='hidden';syncLayout();search.focus();}
  function cards(){return Array.from(list.querySelectorAll('.card[data-topic-id]'));}
  function selectTopic(id){
    active=id;window.stop();
    if(window.KW){window.KW='';document.getElementById('q').value='';}
    if(small.matches)closeDrawer(false);
    window.renderBrowse();
    if(small.matches)toggle.focus();
    bar.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function update(){
    if(window.MODE!=='browse'){closeDrawer(false);syncLayout();return;}
    if(active!==null && window.PART!=='all' && window.G[active].part!==window.PART)active=null;
    var rows=cards(),available=rows.map(function(c){return Number(c.dataset.topicId);});
    // A global question search starts a fresh view; changing Part also clears incompatible selections.
    if(active!==null&&available.indexOf(active)<0)active=null;
    rows.forEach(function(c){c.hidden=active!==null&&Number(c.dataset.topicId)!==active;});
    var cats=list.querySelectorAll(':scope > .cat');cats.forEach(function(cat){var node=cat.nextElementSibling,visible=false;while(node&&!node.classList.contains('cat')){if(node.matches('.card')&&!node.hidden)visible=true;node=node.nextElementSibling;}cat.hidden=!visible;});
    current.textContent=active===null?(window.PART==='all'?'全部话题':partLabel(window.PART)+' · 全部话题'):partLabel(window.G[active].part)+' · '+window.G[active].title;
    all.hidden=active===null;
    if(active!==null)document.getElementById('cnt').textContent='当前话题 · '+((window.G[active].lines||[]).length||1)+' 道题';
    parts.innerHTML=['all','p1','p2','p3'].map(function(p){return '<button type="button" data-nav-part="'+p+'" aria-pressed="'+String(window.PART===p)+'">'+partLabel(p)+'</button>';}).join('');
    var query=navQuery.trim().toLowerCase();
    var shown=available.filter(function(i){var g=window.G[i];return !query||(g.title+' '+g.cat+' '+(g.cue||'')+' '+(g.lines||[]).map(function(l){return l.zh||'';}).join(' ')).toLowerCase().includes(query);});
    var out='<button type="button" class="topicNavItem topicNavAll" data-topic="all" aria-current="'+(active===null?'true':'false')+'">'+(window.PART==='all'?'全部话题':partLabel(window.PART)+' · 全部话题')+'<small>'+available.length+'</small></button>';
    ['p1','p2','p3'].forEach(function(p){var ids=shown.filter(function(i){return window.G[i].part===p;});if(!ids.length)return;out+='<h3>'+partLabel(p)+' <span>'+ids.length+'</span></h3>';ids.forEach(function(i){var g=window.G[i];out+='<button type="button" class="topicNavItem" data-topic="'+i+'" aria-current="'+String(active===i)+'"><span>'+esc(g.title)+'</span><small>'+((g.lines||[]).length||1)+'</small></button>';});});
    if(!shown.length)out+='<p class="topicNavEmpty">没有匹配的话题，换个关键词试试。</p>';
    items.innerHTML=out;syncLayout();
  }
  var browse=window.renderBrowse;window.renderBrowse=function(){var result=browse.apply(this,arguments);update();return result;};
  toggle.addEventListener('click',function(){if(small.matches){if(open)closeDrawer(true);else showDrawer();}else{collapsed=!collapsed;syncLayout();}});
  aside.querySelector('.topicNavClose').addEventListener('click',function(){if(small.matches)closeDrawer(true);else{collapsed=true;syncLayout();toggle.focus();}});
  backdrop.addEventListener('click',function(){closeDrawer(true);});
  all.addEventListener('click',function(){selectTopic(null);});
  items.addEventListener('click',function(e){var b=e.target.closest('[data-topic]');if(!b)return;selectTopic(b.dataset.topic==='all'?null:Number(b.dataset.topic));});
  parts.addEventListener('click',function(e){var b=e.target.closest('[data-nav-part]');if(!b)return;active=null;document.querySelector('#tabs [data-p="'+b.dataset.navPart+'"]').click();});
  search.addEventListener('input',function(){navQuery=this.value;update();});
  document.getElementById('q').addEventListener('input',function(){active=null;},true);
  document.getElementById('mode').addEventListener('click',function(){if(window.MODE!=='browse')closeDrawer(false);syncLayout();});
  small.addEventListener('change',function(){closeDrawer(false);syncLayout();});
  document.addEventListener('keydown',function(e){
    if(!open||!small.matches)return;
    if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeDrawer(true);return;}
    if(e.key==='Tab'){var focusables=Array.from(aside.querySelectorAll('button,input')).filter(function(x){return !x.disabled&&x.getClientRects().length;});var first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  },true);
  // Navigate the topic list only; leave microphone, submission and grading handlers untouched.
  window.IELTSTopicNavigation={refresh:update};update();
})();
