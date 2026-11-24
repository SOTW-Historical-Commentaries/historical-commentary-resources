/* SOTW Bible Topics UI. The only discovery adapter in the public reader.
   Nave/Torrey is an attributed historical index, not doctrine. The
   People/Places/Events research collection remains published separately,
   but is NOT loaded into the reader, searched or shown in verse study.
   BSB publisher interlinear belongs to the existing Word-by-Word view. */
(function(root){
'use strict';
const TOPICS='https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/c173df6faf9b2dc0c6fbcd38d8fdeb0bcec28fce/data/topics/nave-torrey/reader/v1/';
const SOURCE='https://github.com/Stewards-of-the-Way/bible-foundation/tree/c173df6faf9b2dc0c6fbcd38d8fdeb0bcec28fce/data/topics/nave-torrey/reader/v1';
const asText=x=>String(x??'').trim();
const norm=x=>asText(x).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
// Reusable evidence bridge: any source-published Q&A citation may lead to
// original historical topics indexed to the SAME exact verse. Topic title
// terms must be present in the source Q&A (with the shared lexical matcher).
// No biblical person, event, topic, or passage is hardcoded here.
function rankTopics(rows,query,limit=8,linked=[],core=null){
 const q=norm(query);
 if(q.length<2||!Array.isArray(rows))return [];
 const rank=x=>{const t=norm(x.title);
  const direct=t===q?0:t.startsWith(q)?1:t.includes(' '+q)?2:t.includes(q)?3:99;
  return Math.min(direct,...(Array.isArray(x.search_aliases)?x.search_aliases:[]).map(a=>norm(a)===q?4:99));};
 const valid=x=>x&&typeof x.id==='string'&&x.title&&
  Number.isInteger(x.verse_link_count)&&x.verse_link_count>0;
 const literal=rows.filter(x=>valid(x)&&rank(x)<99)
  .sort((a,b)=>rank(a)-rank(b)||a.title.localeCompare(b.title));
 const result=literal.slice(0,limit),ids=new Set(result.map(t=>t.id));
 // Prioritize published Q&A-linked topics only when their original indexed
 // verse and title evidence was independently verified by the adapter.
 for(const t of linked){
  if(result.length>=limit)break;
  if(valid(t)&&!ids.has(t.id)){result.push(t);ids.add(t.id)}
 }
 // A question without a matching Q&A still has access to Nave directly.
 // Match indexed source TITLES conservatively, not fabricated verse links.
 // Reserve room for linked evidence during the earlier asynchronous pass.
 const terms=typeof core?.words==='function'?core.words(query):[];
 if(terms.length>1&&typeof core?.tokenMatch==='function'){
  const candidates=[];
  for(const t of rows){
   if(!valid(t)||ids.has(t.id))continue;
   const titleTerms=core.words(t.title),nameWords=new Set(titleTerms);
   if(!titleTerms.length)continue;
   let count=0,strength=0;
   for(const term of terms){
    const match=core.tokenMatch(term,nameWords);
    if(match>=.7){count++;strength+=match;}
   }
   // A single generic word may match a one-word topic; longer titles
   // require at least two independently matching terms.
   if(count<(titleTerms.length>1?2:1))continue;
   candidates.push({topic:t,score:strength*10+count/titleTerms.length});
  }
  candidates.sort((a,b)=>b.score-a.score||a.topic.title.localeCompare(b.topic.title));
  // Do not swamp historical source-linked candidates with broad lexical hits.
  const ceiling=linked.length?limit:Math.min(limit,4);
  for(const {topic} of candidates){
   if(result.length>=ceiling)break;
   result.push(topic);ids.add(topic.id);
  }
 }
 return result;
}
function evidenceLinkedTopics(topics,questionMatches,byBook,core,limit=8){
 if(!Array.isArray(topics)||!Array.isArray(questionMatches)||
    !byBook||typeof byBook!=='object'||typeof core?.words!=='function'||
    typeof core?.tokenMatch!=='function')return [];
 const eligible=new Map(topics.filter(t=>t&&typeof t.id==='string'&&
  Number.isInteger(t.verse_link_count)&&t.verse_link_count>0&&t.title)
  .map(t=>[t.id,t]));
 const ranked=new Map();
 const high=questionMatches[0]?.score||0;
 for(const {row,score} of questionMatches.slice(0,8)){
  if(!Array.isArray(row)||!row[0]?.startsWith('utq:v91:')||
     !Array.isArray(row[3])||score<Math.max(17,high*.55))continue;
  const context=new Set(core.words(row[1]+' '+row[2]));
  for(const target of row[3]){
   if(!Array.isArray(target)||target.length<3)continue;
   const [book,chapter,first,last]=target,idx=byBook[book];
   if(idx?.schema!=='sotw-topics-scripture-index/1.0.0'||
      idx.book_code!==book||!idx.verses||
      !Number.isInteger(chapter)||!Number.isInteger(first)||
      chapter<1||first<1||first>176)continue;
   const end=Number.isInteger(last)&&last>=first?Math.min(last,first+3):first;
   for(let verse=first;verse<=end;verse++){
    for(const id of idx.verses[book+'.'+chapter+'.'+verse]||[]){
     const topic=eligible.get(id);
     if(!topic)continue;
     const terms=core.words(topic.title);
     if(!terms.length)continue;
     const count=terms.filter(t=>core.tokenMatch(t,context)>=.7).length;
     if(count<Math.max(1,Math.ceil(terms.length*.75)))continue;
     const relevance=score*(count/terms.length);
     if(relevance>(ranked.get(id)?.score||0))ranked.set(id,{topic,score:relevance});
    }
   }
  }
 }
 return [...ranked.values()].sort((a,b)=>b.score-a.score||
    a.topic.title.localeCompare(b.topic.title)).slice(0,limit).map(x=>x.topic);
}
function requiredTopicBooks(matches,limit=3){
 const result=[];
 for(const {row} of (matches||[]).slice(0,8)){
  for(const ref of row[3]||[]){
   const book=ref?.[0];
   if(typeof book==='string'&&!result.includes(book))result.push(book);
   if(result.length>=limit)return result;
  }
 }
 return result;
}
function parseScope(scope,bookRows){
 const m=/^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+))?$/.exec(asText(scope));
 if(!m||!Array.isArray(bookRows))return null;
 const book=bookRows.find(b=>b.code===m[1]);
 const chapter=Number(m[2]),verse=Number(m[3]||1);
 if(!book||!Number.isInteger(chapter)||chapter<1||chapter>book.chapterCount||
  !Number.isInteger(verse)||verse<1||verse>176)return null;
 return {book,chapter,verse,hasVerse:!!m[3]};
}
function verseTopicIds(index,scope){
 const verses=index?.verses;
 if(!verses||typeof verses!=='object'||Array.isArray(verses))return [];
 return Array.isArray(verses[scope])?verses[scope]:[];
}
// Owner-protected divine names: only these published captions have been
// checked against their topic identity and an original mapped Scripture citation.
// Preserve all publisher bytes; repair display text only, retaining sourceLabel.
const VERIFIED_SACRED_CAPTIONS=Object.freeze([
 ["NEUU:TOPIC:bereavement","From Go","From God","Exodus 12:29"],
 ["NEUU:TOPIC:church","HOUSE OF THE LOR","HOUSE OF THE LORD","Exodus 23:19"],
 ["NEUU:TOPIC:curiosity","To see Go","To see God","Exodus 19:21,24"],
 ["NEUU:TOPIC:deafness","Inflicted by Go","Inflicted by God","Exodus 4:11"],
 ["NEUU:TOPIC:decalogue","Written by Go","Written by God","Exodus 24:12"],
 ["NEUU:TOPIC:disease","Healing of, from Go","Healing of, from God","Exodus 15:26"],
 ["NEUU:TOPIC:dumb__deafness__mute_","Stricken of Go","Stricken of God","Exodus 4:11"],
 ["NEUU:TOPIC:firstborn","Of man and beast, reserved to himself by Go","Of man and beast, reserved to himself by God","Exodus 13:2,12-16"],
 ["NEUU:TOPIC:gospel","THE DISPENSATION OF THE GRACE OF GO","THE DISPENSATION OF THE GRACE OF GOD","Ephesians 3:2"],
 ["NEUU:TOPIC:heaven","THE KINGDOM OF CHRIST AND OF GO","THE KINGDOM OF CHRIST AND OF GOD","Ephesians 5:5"],
 ["NEUU:TOPIC:jealousy","Attributed to Go","Attributed to God","Exodus 20:5"],
 ["NEUU:TOPIC:love","OF MAN FOR GO","OF MAN FOR GOD","Deuteronomy 6:5"],
 ["NEUU:TOPIC:mocking","The Ammonites mock Go","The Ammonites mock God","Ezekiel 25:3"],
 ["NEUU:TOPIC:murmuring","AGAINST GO","AGAINST GOD","Exodus 16:8,12"],
 ["NEUU:TOPIC:vision","Of the glory of Go","Of the glory of God","Exodus 24:9-11"],
 ["NEUU:TOPIC:vision","Of the manifestation of the glory of Go","Of the manifestation of the glory of God","Exodus 24:10,17"],
 ["NEUU:TOPIC:voice","OF GO","OF GOD","John 5:37"]
]);
// Unverified trailing divine-name fragments must not reach readers. Do not
// extrapolate automatic corrections from a partial word or rewrite the source.
function isTruncatedSacredNameHeading(title){
 return /(?:^|[\s,;:.])(?:Go|GO|Lor|LOR|Jes|JES|Jesu|JESU|Chri|CHRI|Chris|CHRIS|(?:Holy|HOLY)\s+(?:Spi|Spir|Spiri|SPI|SPIR|SPIRI))\s*$/u.test(asText(title));
}

function sourceHeading(label,context={}){
 const original=asText(label);
 const cleaned=original.replace(/^[.\s·]+/,'').replace(/\s+/g,' ').trim();
 const repair=VERIFIED_SACRED_CAPTIONS.find(([id,old])=>id===context.topicId&&old===cleaned);
 if(repair&&context.source==='NAV'&&Array.isArray(context.mappedReferences)&&
    context.mappedReferences.includes(repair[3]))
  return {title:repair[2],sourceLabel:original,verifiedSacredName:true};
 if(isTruncatedSacredNameHeading(cleaned))
  return {title:'Unclear historical index heading',sourceLabel:original};
 // Historical index fragments may contain bare chapter:verse ranges
 // (e.g. "18:5-7,9;" or "5:8,16;6:18;"), not subject headings.
 // Retain the literal source label separately for provenance.
 const numericReferences=/^\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?(?:[,;]\s*(?:\d{1,3}:)?\d{1,3}(?:[-–]\d{1,3})?)*;?$/;
 if(!cleaned||/^\d{2,5}\s*:?$/.test(cleaned)||/^\d+[.)]$/.test(cleaned)||numericReferences.test(cleaned)||/^[.,:;]+$/.test(cleaned)||
  /(?:of|from|in)\s*[1-3]?\s*(?:Ge|Gen|Ex|Exo)\s*\d/i.test(cleaned))
  return {title:'Other indexed passages',sourceLabel:original};
 // A visibly truncated source fragment must not become an invented subject.
 if(/^intoxi$/i.test(cleaned))return {title:'Unclear historical index heading',sourceLabel:original};
 return {title:cleaned,sourceLabel:''};
}
function displaySectionPath(path){
 return path.slice(1).map(x=>asText(x).replace(/^\d+[.)]\s+/,'')).filter(x=>x&&!/^miscellany of minor sub[- ]topics$/i.test(x)).join(' › ');
}
function groupVerseTopics(rows){
 const groups=new Map();
 for(const topic of orderVerseTopics(rows)){
  const key=norm(readerTopicTitle(topic.title));
  if(!groups.has(key))groups.set(key,{title:readerTopicTitle(topic.title),members:[]});
  groups.get(key).members.push(topic);
 }
 return [...groups.values()];
}
function topicSections(topic){
 const mapped=new Map((topic?.references||[]).filter(x=>x?.status==='mapped'&&
  asText(x.raw)&&Array.isArray(x.verse_ids)&&x.verse_ids.length).map(x=>[x.raw,x]));
 return (topic?.aspects||[]).filter(aspect=>
  !aspect?.source||aspect.source==='NAV'||aspect.source==='TOR').map(aspect=>{
  const seen=new Set();
  const refs=(aspect.references||[]).filter(raw=>{
   if(!mapped.has(raw)||seen.has(raw))return false;
   seen.add(raw);return true;
  }).map(raw=>({raw,scopes:mapped.get(raw).verse_ids,scopeMetadata:mapped.get(raw).scopes||[]}));
  const reviewed=Array.isArray(aspect.display_path)&&aspect.display_path.length>1&&Array.isArray(aspect.source_key);
  const heading=reviewed?{title:displaySectionPath(aspect.display_path),sourceLabel:aspect.source_heading||aspect.label,sourcePath:aspect.display_path.slice()}:sourceHeading(aspect.label,{topicId:topic.id,source:aspect.source,mappedReferences:refs.map(r=>r.raw)});
  return {...heading,reviewed,source:aspect.source,topicId:topic.id,references:refs};
 }).filter(section=>section.references.length);
}
// Presentation filters only. Preserve the complete source shards, reference
// IDs and raw aspect captions for historical/provenance use.
function isReaderLabel(label){
 const value=norm(label).replace(/[_,:;/.-]+/g,' ').replace(/\s+/g,' ').trim();
 if(!value||/^(?:unknown|uncategorized|uncategorised|unclassified|unclear|n a)(?:\s+(?:unknown|uncategorized|uncategorised|unclassified|unclear))*$/.test(value))return false;
 return !/\b(?:ai\s*only|only\s*ai|ai\s*derived|derived\s*by\s*ai|ai\s*generated)\b/.test(value);
}
function isReaderTopic(topic){
 if(!topic||!isReaderLabel(topic.title)||isTruncatedSacredNameHeading(topic.title))return false;
 return !Array.isArray(topic.sources)||!topic.sources.length||
  topic.sources.some(source=>source==='NAV'||source==='TOR');
}
// Conservative display curation: no source data is changed or inferred.
// Contextual short labels remain visible; high-confidence fragments are omitted.
function isMeaningfulSection(section){
 const title=asText(section?.title);
 const words=title.match(/[\p{L}\p{N}]+/gu)||[];
 if(!isReaderLabel(title)||/^(?:Other indexed passages|Unclear historical index heading|general references?|general scriptures? concerning|scriptures? generally|miscellaneous(?: references?)?|other references?|references? generally)$/i.test(title))return false;
 if(isGeneralSection(section)||isTruncatedSacredNameHeading(title))return false;
 if(section?.reviewed)return true;
 if(/^(?:of|from|in|at|near)\s+[\p{Lu}][\p{L}.'’-]+$/u.test(title))return true;
 if(words.length===1)return false;
 if(words.length===2&&words.every(w=>w.length<=3)&&!section?.verifiedSacredName)return false;
 if(/^(?:Re|Ma|Es|Il|A|B|C)$/i.test(title))return false;
 if(/\b(?:of|to|for|from|with|by|in|and|the|his|her|their|a|an)\s*$/iu.test(title))return false;
 if(/^(?:and|or|with|by|to)\s+/iu.test(title)&&!section?.verifiedSacredName)return false;
 return true;
}
function isAmbiguousSection(section){return !isMeaningfulSection(section);}
function readerSections(topic){
 const seen=new Set();
 return topicSections(topic).filter(section=>{
  if(!isMeaningfulSection(section))return false;
  const key=section.title.toLocaleLowerCase()+'|'+section.references.map(r=>r.raw).join('|');
  if(seen.has(key))return false;
  seen.add(key);return true;
 }).sort((a,b)=>Number(isGeneralSection(a))-Number(isGeneralSection(b)));
}
function isGeneralSection(section){
 return /^(?:general(?: scriptures? concerning| references?)?|scriptures? generally)$/i.test(asText(section?.title));
}
function orderVerseTopics(rows){
 // A narrower published Scripture-link footprint is a transparent, stable
 // focus proxy, not a machine-inferred theological or semantic relationship.
 return rows.filter(isReaderTopic).sort((a,b)=>
  (Number.isInteger(a.verse_link_count)&&a.verse_link_count>0?a.verse_link_count:Infinity)-
  (Number.isInteger(b.verse_link_count)&&b.verse_link_count>0?b.verse_link_count:Infinity)||
  a.title.localeCompare(b.title));
}
function readerTopicTitle(title){
 const text=asText(title);
 // Safely unfold simple inverted index adjectives for natural reading.
 // Both the original published title and source ID remain untouched.
 const inverted=/^([^,]+),\s*(false|true)$/iu.exec(text);
 if(inverted)return readerTopicTitle(inverted[2])+' '+readerTopicTitle(inverted[1]);
 return text===text.toLocaleUpperCase()?
  text.toLocaleLowerCase().replace(/(^|[\s,(/-])([\p{L}])/gu,(_,lead,letter)=>lead+letter.toLocaleUpperCase()):text;
}
function readerSectionTitle(section){
 if(/^general scriptures concerning$/i.test(section?.title||''))return 'General references';
 if(section?.title==='Other indexed passages'||section?.title==='Unclear historical index heading')
  return 'Other references';
 return section?.title||'References';
}
root.SOTWDiscoveryCore={isTruncatedSacredNameHeading,rankTopics,evidenceLinkedTopics,requiredTopicBooks,parseScope,verseTopicIds,sourceHeading,topicSections,readerTopicTitle,readerSectionTitle,readerSections,isMeaningfulSection,isAmbiguousSection,isReaderLabel,isReaderTopic,isGeneralSection,orderVerseTopics,groupVerseTopics,displaySectionPath};
if(typeof document==='undefined')return;
if(typeof state==='undefined'||typeof searchInput==='undefined'||
 typeof betaOpen==='undefined'||typeof modernCommentaryMenu==='undefined')return;

const cache=new Map();
function sourceJson(url){
 if(!cache.has(url)){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
  const pending=fetch(url,{cache:'no-store',signal:controller.signal}).then(r=>{
   if(!r.ok)throw Error('HTTP '+r.status);
   return r.json();
  }).catch(e=>{cache.delete(url);throw e}).finally(()=>clearTimeout(timeout));
  cache.set(url,pending);
 }
 return cache.get(url);
}
let topicIndex=null;
async function reverseIndex(book){
 const path='index/by-scripture/'+book+'.json';
 const manifest=await sourceJson(TOPICS+'manifest.json');
 if(manifest.schema!=='sotw-topics-neuu-manifest/1.0.0'||!Array.isArray(manifest.files))throw Error('Unexpected topic manifest');
 if(!manifest.files.some(f=>f.path===path))return {schema:'sotw-topics-scripture-index/1.0.0',book_code:book,verses:{},chapter_scopes:{}};
 const data=await sourceJson(TOPICS+path);
 if(data.schema!=='sotw-topics-scripture-index/1.0.0'||data.book_code!==book||!data.verses)throw Error('Unexpected reverse index');
 return data;
}
async function topicsIndex(){
 if(topicIndex)return topicIndex;
 const data=await sourceJson(TOPICS+'index/topics.json');
 if(data.schema!=='sotw-topics-search-index/1.0.0'||!Array.isArray(data.topics))
  throw Error('Unexpected topics index');
 topicIndex=data.topics.filter(isReaderTopic);return topicIndex;
}
function el(tag,cls,value){
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(value!==undefined)node.textContent=value;
 return node;
}
function note(parent,value,cls='discovery-note'){
 const p=el('p',cls,value);parent.append(p);return p;
}
function button(parent,label,action,cls='discovery-ref'){
 const b=el('button',cls,label);b.type='button';
 b.addEventListener('click',action);parent.append(b);return b;
}
function sourceLink(parent){
 const a=el('a','discovery-link','About the Nave/Torrey historical source');
 a.title='NEUU Bible Topics Dataset, CC BY 4.0; Nave and Torrey; CCEL digitisation; SOTW editorial selection and navigation';
 a.href=SOURCE;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
}
const detail=modalLayer('sotwDiscoveryDetail','Bible Topic');
detail.panel.classList.add('discovery-dialog');
function showDetail(heading){
 // A topic opened from search retains a return route to that exact result list.
 const fromSearch=searchModal.veil.classList.contains('is-open');
 const query=searchInput.value,scroll=searchResults.scrollTop;
 detail.panel.querySelectorAll('.discovery-detail-body').forEach(node=>node.remove());
 const body=el('div','discovery-detail-body');
 body.append(el('h3','discovery-heading',heading));
 if(fromSearch&&query.trim()){
  const back=button(body,'‹ Back to search results',()=>{
   detail.veil.classList.remove('is-open');
   if(searchInput.value!==query)return;
   searchModal.veil.classList.add('is-open');
   if(typeof positionSearchViewport==='function')positionSearchViewport();
   requestAnimationFrame(()=>{searchResults.scrollTop=scroll;});
  },'discovery-back-search');
  back.setAttribute('aria-label','Return to search results for '+query.slice(0,90));
 }
 detail.panel.append(body);
 searchModal.veil.classList.remove('is-open');
 detail.veil.classList.add('is-open');detail.panel.scrollTop=0;
 return body;
}
// Shared topic citation renderer: display mapped verses only; no inferred range.
const shortBooks={GEN:'Gen',EXO:'Exo',LEV:'Lev',NUM:'Num',DEU:'Deu',JOS:'Jos',JDG:'Jdg',RUT:'Rut','1SA':'1 Sam','2SA':'2 Sam','1KI':'1 Kin','2KI':'2 Kin','1CH':'1 Chr','2CH':'2 Chr',EZR:'Ezr',NEH:'Neh',EST:'Est',JOB:'Job',PSA:'Psa',PRO:'Pro',ECC:'Ecc',SNG:'Son',ISA:'Isa',JER:'Jer',LAM:'Lam',EZK:'Eze',DAN:'Dan',HOS:'Hos',JOL:'Joe',AMO:'Amo',OBA:'Oba',JON:'Jon',MIC:'Mic',NAM:'Nah',HAB:'Hab',ZEP:'Zep',HAG:'Hag',ZEC:'Zec',MAL:'Mal',MAT:'Mat',MRK:'Mar',LUK:'Luk',JHN:'Joh',ACT:'Act',ROM:'Rom','1CO':'1 Cor','2CO':'2 Cor',GAL:'Gal',EPH:'Eph',PHP:'Phi',COL:'Col','1TH':'1 The','2TH':'2 The','1TI':'1 Tim','2TI':'2 Tim',TIT:'Tit',PHM:'Phm',HEB:'Heb',JAS:'Jam','1PE':'1 Pet','2PE':'2 Pet','1JN':'1 Joh','2JN':'2 Joh','3JN':'3 Joh',JUD:'Jud',REV:'Rev'};
function shortBook(book){return shortBooks[book.code]||book.name.replace(/^(\d)\s*(\w{3}).*$/,'$1 $2').replace(/^([A-Za-z]{3})[A-Za-z]+$/,'$1');}
function citationLabel(ref,targets){
 let label=asText(ref.raw);
 const books=[...new Set(targets.map(t=>t.book))].sort((a,b)=>b.name.length-a.name.length);
 for(const book of books)label=label.split(book.name).join(shortBook(book));
 return label;
}
function resetTopicDisclosure(details){
 details.addEventListener('toggle',()=>{
  if(details.open)return;
  details.querySelectorAll('.discovery-inline-close').forEach(b=>b.click());
  details.querySelectorAll('details[open]').forEach(d=>{d.open=false;});
  details.querySelectorAll('.discovery-more[aria-expanded="true"]').forEach(b=>b.click());
 });
}
async function readTopicScope(targets,edition){
 const groups=new Map();
 for(const t of targets){
  const key=t.book.code+'.'+t.chapter;
  if(!groups.has(key))groups.set(key,{book:t.book,chapter:t.chapter,verses:new Set(),whole:false});
  const g=groups.get(key);if(t.hasVerse)g.verses.add(t.verse);else g.whole=true;
 }
 const output=[];
 for(const g of groups.values()){
  const {book,chapter}=g,code=book.code,entry=EDITIONS[edition];
  if(!entry)throw Error('Edition unavailable');
  const url='https://raw.githubusercontent.com/'+entry[1]+'/main/data/'+entry[2]+'/'+book.slug+'/chapters/'+String(chapter).padStart(2,'0')+'.json';
  const [idx,bib]=await Promise.all([getJson(snapshotRoot(book)+'index/'+code+'/'+chapter+'.json'),fetchTranslationWithFallback(url)]);
  if(idx?.canonical_chapter!==code+'.'+chapter||bib.book_code!==code||Number(bib.chapter)!==chapter||bib.edition_id!==edition)throw Error('Source identity mismatch');
  const count=Number(idx.verse_count);
  const verses=g.whole?Array.from({length:count},(_,i)=>i+1):[...g.verses].sort((a,b)=>a-b);
  if(!count||verses.some(v=>v>count))throw Error('Invalid scope');
  for(const verse of verses){
   const row=(bib.verses||[]).find(v=>Number(v.verse)===verse);
   const value=(row?.spans||[]).map(p=>p.text||'').join('').trim();
   if(!value)throw Error('Missing verse');
   output.push({label:shortBook(book)+' '+chapter+':'+verse,text:value});
  }
 }
 return output;
}
function referenceButton(parent,ref){
 const targets=(ref.scopes||[]).map(s=>parseScope(s,BOOKS)).filter(Boolean);
 if(!targets.length)return false;
 const first=targets[0],label=citationLabel(ref,targets);
 const wrapper=el('div','discovery-reference-entry');
 const heading=el('div','discovery-inline-heading');
 const trigger=button(heading,label,()=>{if(!wrapper.querySelector('.discovery-inline-preview'))openPreview();},'discovery-citation discovery-inline-trigger');
 trigger.setAttribute('aria-expanded','false');
 trigger.dataset.rawCitation=ref.raw;
 wrapper.append(heading);parent.append(wrapper);
 async function openPreview(){
  const edition=state.edition;
  trigger.setAttribute('aria-expanded','true');
  const close=button(heading,'×',()=>{panel.remove();close.remove();trigger.setAttribute('aria-expanded','false');},'discovery-inline-close');
  close.setAttribute('aria-label','Close '+label+' preview');
  const panel=el('div','discovery-inline-preview');
  const body=el('div','discovery-inline-text','Loading Scripture…');panel.append(body);
  wrapper.append(panel);
  try{
   const rows=await readTopicScope(targets,edition);
   if(!panel.isConnected)return;
   body.replaceChildren();
   rows.forEach(row=>{const p=el('p','');p.append(el('strong','',row.label+' '),document.createTextNode(row.text));body.append(p);});
   const link=el('a','discovery-citation jacob-passage-link discovery-inline-book');
   link.href=location.pathname+'?'+new URLSearchParams({book:first.book.code,chapter:String(first.chapter),verse:String(first.verse),translation:edition});
   link.setAttribute('aria-label','Open '+label+' in Bible');
   link.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1v14"/></svg>';
   panel.append(link);
  }catch(_){if(panel.isConnected)body.textContent='This citation cannot be verified in the active Scripture translation right now.';}
 }
 return true;
}
function renderCollapsibleReferences(parent,section,render){
 const details=el('details','discovery-subtopic-references');
 const summary=el('summary','discovery-subtopic-summary',readerSectionTitle(section));
 details.append(summary);
 const inner=el('div','discovery-subtopic-body');details.append(inner);
 details.addEventListener('toggle',()=>{
  if(details.open&&!inner.childElementCount)expandList(inner,section.references,render,4);
 });
 resetTopicDisclosure(details);
 parent.append(details);
}
function renderSharedSection(content,section){
 const sectionBox=el('section','discovery-verse-topic-section');content.append(sectionBox);
 if(section.sourceLabel)sectionBox.dataset.originalSourceHeading=section.sourceLabel;
 if(section.sourcePath)sectionBox.dataset.originalSourcePath=JSON.stringify(section.sourcePath);
 sectionBox.dataset.topicId=section.topicId;
 if(section.source)sectionBox.dataset.source=section.source;
 renderCollapsibleReferences(sectionBox,section,referenceButton);
}
function expandList(parent,rows,render,visibleCount=4){
 const list=el('div','discovery-passage-list');parent.append(list);
 rows.slice(0,visibleCount).forEach(x=>render(list,x));
 const remaining=rows.length-visibleCount;
 if(remaining>0){
  const more=button(parent,'Show '+remaining+' more '+(remaining===1?'passage':'passages'),
   ()=>{const expanded=more.getAttribute('aria-expanded')==='true';
    if(expanded){
     while(list.children.length>visibleCount)list.lastElementChild.remove();
     more.textContent='Show '+remaining+' more '+(remaining===1?'passage':'passages');
     more.setAttribute('aria-expanded','false');
    }else{
     rows.slice(visibleCount).forEach(x=>render(list,x));
     more.textContent='Show fewer passages';
     more.setAttribute('aria-expanded','true');
    }
   },'discovery-more');
  more.setAttribute('aria-expanded','false');
 }
}
async function showTopic(topic){
 const body=showDetail('Historical Bible Topic · '+readerTopicTitle(topic.title));
 note(body,'Historical index associations are not doctrinal rulings.');
 const busy=note(body,'Loading source references…');
 try{
  const shard=await sourceJson(TOPICS+topic.shard);
  const row=shard?.topics?.find(t=>t.id===topic.id);
  if(!body.isConnected||!detail.veil.classList.contains('is-open'))return;
  if(shard.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)throw Error('Topic not found');
  busy.remove();
  const sections=readerSections(row);
  if(!sections.length){note(body,'No displayable, source-labeled Scripture references.');sourceLink(body);return;}
  note(body,sections.length+' groups of Scripture references.','discovery-guide');
  const host=el('div','discovery-topic-groups');body.append(host);
  sections.forEach(section=>renderSharedSection(host,section));
  sourceLink(body);
 }catch{
  if(body.isConnected){busy.textContent='Topic references are unavailable right now.';busy.className='discovery-error';}
 }
}
// The reader's own Scripture results remain at the top. No Person, Place or
// Event index is fetched here: its directory awaits a future evidence-led UI.
searchNote.textContent='Scripture references and current-chapter text first. Published Jacob Lannom commentary and Historical Bible Topics appear in clearly labeled results. Whole-Bible word search is not yet available.';
searchInput.placeholder='John 3:16, Lannom Romans, Revenge Lannom, or Bible topic';
const pending=el('p','discovery-search-loading');pending.hidden=true;
searchResults.after(pending);
let seq=0,timer=0;
async function appendTopicSearch(query,current){
 try{
  const indexed=await topicsIndex();
  const valid=()=>current===seq&&norm(searchInput.value)===norm(query)&&
   searchModal.veil.classList.contains('is-open');
  if(!valid())return;
  const direct=rankTopics(indexed,query,8,[],root.SOTWUniversalSearchCore);
  const displayed=new Set();
  let label=null;
  function addTopics(topics){
   if(!valid())return;
   for(const t of topics){
    if(displayed.size>=8||displayed.has(t.id))continue;
    if(!label)label=searchResults.appendChild(
     el('h4','discovery-search-label','Historical Bible Topics'));
    displayed.add(t.id);
    const hit=button(searchResults,t.title,()=>showTopic(t),'search-hit discovery-hit');
   // Fetch existing source shard, never guess Scripture links from a title.
   // Mapped citations are associations in a historical index, not doctrine.
   sourceJson(TOPICS+t.shard).then(shard=>{
    if(current!==seq||!hit.isConnected||
       norm(searchInput.value)!==norm(query)||!searchModal.veil.classList.contains('is-open'))return;
    const row=shard?.topics?.find(x=>x.id===t.id);
    if(shard?.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)return;
    const targets=[];
    for(const section of readerSections(row)){
     for(const ref of section.references){
      for(const scope of ref.scopes||[]){
       const p=parseScope(scope,BOOKS);
       if(p?.hasVerse)targets.push({book:p.book.code,chapter:p.chapter,verse:p.verse});
      }
     }
    }
    if(!targets.length)return;
    // The complete source article remains available in the topic detail.
    hit.dataset.searchEvidence=JSON.stringify([{type:'topic',id:t.id,
     relationship:'MAPPED_HISTORICAL_INDEX_REFERENCE',targets}]);
    root.SOTWSearchCoordinator?.refresh();
   }).catch(()=>{});
  }
  }
  addTopics(direct); // Preserve fast literal lookup even when remote reverse indexes are slow.
  pending.hidden=true;
  if(displayed.size>=8)return;
  try{
   // Reuse original, already checked Q&A records. Source citations are
   // evidence of an association, not a newly authored Bible reference.
   const matches=await root.SOTWUniversalSearch?.searchCandidates(query,8)||[];
   if(!valid())return;
   const books=requiredTopicBooks(matches,3);
   const responses=await Promise.allSettled(books.map(book=>
    reverseIndex(book)));
   if(!valid())return;
   const byBook={};
   books.forEach((book,i)=>{if(responses[i].status==='fulfilled')
    byBook[book]=responses[i].value;});
   const linked=evidenceLinkedTopics(indexed,matches,byBook,
    root.SOTWUniversalSearchCore,8);
   addTopics(rankTopics(indexed,query,8,linked,root.SOTWUniversalSearchCore));
  }catch(_){/* Only original literal topic results remain when unavailable. */}
 }catch{
  if(current===seq&&searchModal.veil.classList.contains('is-open')){
   pending.hidden=true;
   note(searchResults,'Historical topic source unavailable. Scripture search still works.','discovery-error');
  }
 }
}
searchInput.addEventListener('input',()=>{
 const current=++seq;clearTimeout(timer);pending.hidden=true;
 const query=searchInput.value.trim();
 if(query.length<2||modernParseReference(query))return;
 pending.textContent='Checking historical Bible Topics…';pending.hidden=false;
 timer=setTimeout(()=>appendTopicSearch(query,current),260);
});
searchModal.veil.addEventListener('click',()=>{
 if(!searchModal.veil.classList.contains('is-open')){
  ++seq;clearTimeout(timer);pending.hidden=true;
 }
});
// Verse-specific reverse index references. Never infer a separate link for
// every verse in a chapter or claim that historical topic tags are doctrine.
const verseDiscovery=el('section','discovery-study');
const topicsButton=button(verseDiscovery,'Related Bible Topics',()=>showVerseTopics(),'discovery-launch');
topicsButton.replaceChildren(el('span','discovery-launch-label','Related Bible Topics'),el('small','discovery-launch-meta','Explore topics ›'));
const verseBody=el('div','discovery-verse-body');verseBody.hidden=true;verseDiscovery.append(verseBody);
topicsButton.setAttribute('aria-expanded','false');
topicsButton.setAttribute('aria-controls','sotwVerseTopicsBody');
verseBody.id='sotwVerseTopicsBody';
modernCommentaryMenu.before(verseDiscovery);
let verseSeq=0;
function closeVerseTopics(restoreFocus=false){
 ++verseSeq; // Invalidate any pending historical shard response.
 verseBody.hidden=true;verseBody.replaceChildren();
 topicsButton.setAttribute('aria-expanded','false');
 topicsButton.querySelector('.discovery-launch-meta').textContent='Explore topics ›';
 if(restoreFocus){
  topicsButton.focus({preventScroll:true});
  topicsButton.scrollIntoView({block:'nearest'});
 }
}
async function showVerseTopics(){
 if(!verseBody.hidden){closeVerseTopics();return;}
 const book=state.book,chapter=state.chapter,verse=modernStudyVerse,current=++verseSeq;
 const scope=book+'.'+chapter+'.'+verse;
 verseBody.hidden=false;verseBody.replaceChildren();
 topicsButton.setAttribute('aria-expanded','true');
 topicsButton.querySelector('.discovery-launch-meta').textContent='Hide topics ↑';
 note(verseBody,'Loading topic references…');
 const [indexResult,reverseResult]=await Promise.allSettled([
  topicsIndex(),reverseIndex(book)
 ]);
 if(current!==verseSeq||!document.body.classList.contains('study-open')||
    state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse)return;
 verseBody.replaceChildren();
 if(indexResult.status!=='fulfilled'||reverseResult.status!=='fulfilled'){
  note(verseBody,'Historical topics are temporarily unavailable. The Bible text is unaffected.','discovery-error');
  const dismiss=button(verseBody,'Close topics ↑',()=>closeVerseTopics(true),'discovery-close-topics');
  dismiss.setAttribute('aria-label','Close Related Bible Topics');
  return;
 }
 const ids=verseTopicIds(reverseResult.value,scope);
 const named=new Map(indexResult.value.map(t=>[t.id,t]));
 const titles=groupVerseTopics(Array.from(new Set(ids)).map(id=>named.get(id)).filter(Boolean));
 if(titles.length){
  // Let the reader survey all topics before choosing which one to expand.
  const host=el('div','discovery-topic-groups');verseBody.append(host);
  for(const [index,topic] of titles.slice(0,6).entries()){
   const group=el('details','discovery-topic-group discovery-verse-topic');
   group.open=false;host.append(group);resetTopicDisclosure(group);
   const summary=el('summary','discovery-topic-summary');
   summary.append(el('span','',readerTopicTitle(topic.title)));
   group.append(summary);
   const content=el('div','discovery-topic-content');group.append(content);
   const loading=note(content,'Loading Scripture references…');
   try{
    const results=await Promise.allSettled(topic.members.map(async member=>{
     const shard=await sourceJson(TOPICS+member.shard);
     const row=shard?.topics?.find(t=>t.id===member.id);
     if(shard.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)throw Error('Missing topic');
     return readerSections(row);
    }));
    if(current!==verseSeq||!group.isConnected)return;
    loading.remove();
    const sections=results.flatMap(result=>result.status==='fulfilled'?result.value:[]);
    if(results.some(result=>result.status==='rejected')){
     note(content,'Some historical source references are unavailable.','discovery-error');
     if(!sections.length)continue;
    }
    if(!sections.length){group.remove();continue;}
    const primary=sections;
    function renderSection(section){renderSharedSection(content,section);}
    primary.slice(0,5).forEach(renderSection);
    if(primary.length>5){
     const rest=primary.length-5;
     const more=button(content,'Show '+rest+' more '+(rest===1?'section':'sections'),
      ()=>{const expanded=more.getAttribute('aria-expanded')==='true';
       if(expanded){
        for(const section of Array.from(content.querySelectorAll(':scope > .discovery-verse-topic-section')).slice(5))
         section.remove();
        more.textContent='Show '+rest+' more '+(rest===1?'section':'sections');
        more.setAttribute('aria-expanded','false');
        more.classList.remove('discovery-show-fewer');
       }else{
        primary.slice(5).forEach(renderSection);
        more.textContent='↑ Show fewer sections';more.setAttribute('aria-expanded','true');
        more.classList.add('discovery-show-fewer');
        // Put the collapse control before the extra sections, not after a long list.
        const extra=content.querySelectorAll(':scope > .discovery-verse-topic-section')[5];
        if(extra)content.insertBefore(more,extra);
       }
      },'discovery-more');
     more.setAttribute('aria-expanded','false');
    }
   }catch{
    if(group.isConnected){loading.textContent='Topic references are unavailable.';loading.className='discovery-error';}
   }
  }
  if(titles.length>6)note(verseBody,'Showing the first six indexed topics for this verse.');
 }else note(verseBody,'No historical topic entry is indexed for this exact verse.');
 sourceLink(verseBody);
 const dismiss=button(verseBody,'Close topics ↑',()=>closeVerseTopics(true),'discovery-close-topics');
 dismiss.setAttribute('aria-label','Close Related Bible Topics');
}
// Reuse exactly the same published reverse-index pathway when returning to a
// verse-study topic. No parallel topic cache or invented association.
root.SOTWDiscoveryCore.openVerseTopics=showVerseTopics;
// Keep the existing study lifecycle; no separate original-order panel, no
// People/Places section. BSB Word-by-Word continues in study-ux-repair.js.
const earlierOpen=betaOpen,earlierClose=betaCloseSheet;
betaOpen=function(){
 closeVerseTopics();earlierOpen();
};
betaCloseSheet=function(){
 closeVerseTopics();earlierClose();
};
})(typeof globalThis==='object'?globalThis:this);
