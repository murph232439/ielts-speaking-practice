/* Self-contained Word export: real OOXML .docx, one selected story only. */
(function(root){
'use strict';
var encoder=new TextEncoder();
function xml(s){return String(s==null?'':s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c];});}
function paragraph(text,style){return '<w:p><w:pPr><w:pStyle w:val="'+(style||'Normal')+'"/></w:pPr><w:r><w:t xml:space="preserve">'+xml(text)+'</w:t></w:r></w:p>';}
function lines(text){var s=String(text||'').trim();return (s?s.split(/\r?\n/):['（尚未填写）']).map(function(x){return paragraph(x);}).join('');}
function documentXml(story,topics){
 var body=paragraph(story.title||'未命名故事','Title')+paragraph('雅思口语 Part 2 单个故事素材','Subtitle')
 +paragraph('本文件整理当前故事的核心素材、串题路线、共用表达及关联题目的独立切入点。')
 +paragraph('故事类型：'+(story.kind||'其他')+'    关联题目：'+topics.length+' 道')
 +paragraph('核心故事素材','Heading1')+lines(story.notes)
 +paragraph('串题路线','Heading1')+lines(story.outline)
 +paragraph('共用词伙与英文表达','Heading1')+lines(story.chunks)
 +paragraph('关联题目与独立切入点','Heading1');
 if(!topics.length)body+=paragraph('当前故事尚未关联题目。');
 topics.forEach(function(q,i){
  body+=paragraph((i+1)+' '+(q.zhTitle||q.title),'Heading2');
  if(q.zhTitle&&q.title!==q.zhTitle)body+=paragraph(q.title);
  body+=paragraph('原题与 cues','Heading3')+lines(q.cue||q.title);
  body+=paragraph('这道题如何使用这个故事','Heading3')+lines((story.topicIdeas||{})[q.id]);
  var cues=String(q.cue||'').split(/\n/).map(function(x){return x.trim();}).filter(function(x){return x&&!/^describe\b|^you should say\b/i.test(x);});
  var checked=(story.checks||{})[q.id]||[];
  if(checked.length)body+=paragraph('已核对的 cue 序号：'+checked.map(function(n){return Number(n)+1;}).join('、'));
 });
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1360" w:right="1360" w:bottom="1360" w:left="1360" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
function stylesXml(){
 function style(id,name,size,bold,after){return '<w:style w:type="paragraph" w:styleId="'+id+'"><w:name w:val="'+name+'"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr>'+(id.indexOf('Heading')===0?'<w:keepNext/>':'')+'<w:spacing w:before="'+(id==='Title'?0:180)+'" w:after="'+after+'"/></w:pPr><w:rPr><w:color w:val="000000"/><w:sz w:val="'+size+'"/>'+(bold?'<w:b/>':'')+'</w:rPr></w:style>';}
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Microsoft YaHei"/><w:color w:val="000000"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="330" w:lineRule="auto"/><w:widowControl/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>'+style('Title','Title',44,true,200)+style('Subtitle','Subtitle',22,false,160)+style('Heading1','heading 1',30,true,120)+style('Heading2','heading 2',26,true,100)+style('Heading3','heading 3',22,true,80)+'</w:styles>';
}
var crcTable=Array.from({length:256},function(_,n){for(var j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(bytes){var c=0xffffffff;bytes.forEach(function(b){c=crcTable[(c^b)&255]^(c>>>8);});return (c^0xffffffff)>>>0;}
function pack(files){
 var local=[],central=[],offset=0;
 function block(n){return new Uint8Array(n);}
 files.forEach(function(f){
  var name=encoder.encode(f[0]),bytes=encoder.encode(f[1]),sum=crc(bytes),head=block(30+name.length),v=new DataView(head.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(12,33,true);v.setUint32(14,sum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);head.set(name,30);local.push(head,bytes);
  var c=block(46+name.length),d=new DataView(c.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(14,33,true);d.setUint32(16,sum,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);c.set(name,46);central.push(c);offset+=head.length+bytes.length;
 });
 var centralSize=central.reduce(function(n,c){return n+c.length;},0),end=block(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
 var result=new Uint8Array(offset+centralSize+22),pos=0;local.concat(central,[end]).forEach(function(b){result.set(b,pos);pos+=b.length;});return result;
}
function build(story,topics){
 var files=[
 ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
 ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
 ['word/document.xml',documentXml(story,topics)],
 ['word/styles.xml',stylesXml()],
 ['word/_rels/document.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>']
 ];return pack(files);
}
function download(story,topics){var bytes=build(story,topics),blob=new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(String(story.title||'未命名故事').replace(/[\\/:*?"<>|]/g,'_').slice(0,100)||'未命名故事')+'.docx';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},30000);}
root.StoryDocx={build:build,download:download,documentXml:documentXml};
})(window);
