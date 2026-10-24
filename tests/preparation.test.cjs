// Run with NODE_PATH pointing to a jsdom installation; no recording is started or submitted.
const {JSDOM, VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const path=require('node:path');
const http=require('node:http');
let server;
(async()=>{
 const root=path.resolve(__dirname,'..');
 const original=cp.execFileSync('git',['show','2eb9ecee2d2483b86cf18718592169909d187476:index.html'],{cwd:root,encoding:'utf8',maxBuffer:4000000});
 const changed=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.equal(changed.replace('<script src="speaking-preparation.js?v=20261024"></script>',''),original,'Original HTML, including all recording code, must remain byte-for-byte unchanged');
 const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/HTMLMediaElement|scrollIntoView/.test(e.message))errors.push(e.message)});
 server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(data);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const dom=await JSDOM.fromURL(`http://127.0.0.1:${server.address().port}/`,{resources:'usable',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};w.HTMLMediaElement.prototype.pause=function(){};}});
 const w=dom.window;const tick=()=>new Promise(r=>setTimeout(r,25));
 for(let i=0;i<100 && (!w.IELTSTopicVocabulary || !w.IELTSQuestionMaterials);i++)await tick();
 assert(w.IELTSTopicVocabulary && w.IELTSQuestionMaterials,'Asynchronous learning banks loaded');
 w.HTMLElement.prototype.scrollIntoView=function(){};
 const d=w.document;
 async function enter(part,q){
   w.MODE='practice';w.PG=w.G.find(g=>g.part===part && g.lines.some(l=>l.t===q));assert(w.PG,q);
   w.PITEM=[w.PG.lines.find(l=>l.t===q)];w.PIDX=0;w.PSCORE=0;w.renderQ();await tick();
   assert.equal(d.querySelector('#prep-panel'),null,'No help before listening attempt');
   const rec=d.getElementById('recStep'), html=rec.innerHTML;
   const answer=[...d.querySelectorAll('.opt')].find(b=>b.textContent===w.label(w.PCUR));answer.click();await tick();
   assert(d.querySelector('#prep-panel'));assert.equal(d.querySelectorAll('#prep-panel').length,1);
   assert.equal(d.getElementById('recStep'),rec,'Recording DOM identity preserved');
   assert.equal(rec.innerHTML,html,'Recording markup unchanged');
   assert.equal(d.querySelector('.prep-legacy').open,false);
 }
 await enter('p1','What would you do if you feel bored?');
 d.querySelector('[data-route="ideas"]').click();await tick();assert(d.querySelector('#prep-help').textContent.includes('独自在家'));
 d.getElementById('prep-idea').value='联系朋友';d.getElementById('prep-idea').dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('.prep-vocabulary').open=true;await tick();assert.equal(d.querySelectorAll('#prep-words > .prep-grid .prep-word').length,3);
 d.querySelector('[data-prep-action="word"]').click();assert(d.getElementById('prep-selected').textContent.includes('message my friends'));
 d.getElementById('prep-search').value='散步';d.getElementById('prep-search').dispatchEvent(new w.Event('input',{bubbles:true}));assert(d.getElementById('prep-words').textContent.includes('go for a walk'));
 d.querySelector('[data-prep-action="ready"]').click();assert(d.getElementById('recStep').classList.contains('on'));assert.equal(d.activeElement.id,'srecname');
 await enter('p3','Do you think a good teacher should be popular?');
 d.querySelector('[data-route="understand"]').click();assert(d.getElementById('prep-help').textContent.includes('学生听懂了'));
 d.getElementById('prep-idea').value='教学效果更重要';d.getElementById('prep-idea').dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('.prep-legacy').open=true;await tick();
 w.p3SetMode('challenge');await tick();assert.equal(d.getElementById('prep-idea').value,'教学效果更重要');assert(d.querySelector('.prep-legacy').open,'Expanded legacy practice survives a mode change');
 assert.equal(d.querySelectorAll('#recStep').length,1);
 await enter('p1','What would you do if you feel bored?');assert.equal(d.getElementById('prep-idea').value,'联系朋友');
 // Exercise all current Part 1 / Part 3 questions, including sparse banks and missing legacy training data.
 let count=0;
 for(const g of (process.env.PREP_QUICK ? [] : w.G).filter(g=>['p1','p3'].includes(g.part))){for(const line of g.lines){
   w.PG=g;w.PITEM=[line];w.PIDX=0;w.renderQ();
   const rec=d.getElementById('recStep');
   const b=[...d.querySelectorAll('.opt')].find(x=>x.textContent===w.label(w.PCUR));b.click();await tick();
   assert.equal(d.querySelectorAll('#prep-panel').length,1,line.t);
   assert.equal(d.getElementById('recStep'),rec);
   for(const route of d.querySelectorAll('[data-route]'))route.click();
   d.querySelector('.prep-vocabulary').open=true;await tick();
   assert(d.getElementById('prep-words').textContent.trim(),line.t);count++;if(count%100===0)console.log(`Checked ${count} questions`);
 }}
 // Part 2 and browsing remain on their original paths.
 w.PG=w.G.find(g=>g.part==='p2');w.PITEM=[{t:w.PG.cue||w.PG.title,zh:w.PG.title,a:w.PG.a}];w.PIDX=0;w.renderQ();await tick();assert.equal(d.querySelector('#prep-panel'),null);assert(d.getElementById('recStep'));
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${count} Part 1/3 questions; vocabulary, search, draft restoration, recording DOM identity, Part 2; original HTML unchanged except new script tag.`);
 dom.window.close();server.close();
})().catch(e=>{console.error(e);if(server)server.close();process.exit(1)});
