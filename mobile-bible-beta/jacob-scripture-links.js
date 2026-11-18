/* SOTW Jacob Scripture links: public destinations from the reconciled,
   owner-reviewed, published current-commentary.json only.
   This parser only formats/links source-provided canonical references. It never
   accepts, invents or publishes SPP review-only research. */
(function(root){
'use strict';
const bookRows=[
 ['GEN','Genesis',50],['EXO','Exodus',40],['LEV','Leviticus',27],['NUM','Numbers',36],['DEU','Deuteronomy',34],
 ['JOS','Joshua',24],['JDG','Judges',21],['RUT','Ruth',4],['1SA','1 Samuel',31],['2SA','2 Samuel',24],
 ['1KI','1 Kings',22],['2KI','2 Kings',25],['1CH','1 Chronicles',29],['2CH','2 Chronicles',36],
 ['EZR','Ezra',10],['NEH','Nehemiah',13],['EST','Esther',10],['JOB','Job',42],['PSA','Psalms',150],
 ['PRO','Proverbs',31],['ECC','Ecclesiastes',12],['SNG','Song of Solomon',8],['ISA','Isaiah',66],['JER','Jeremiah',52],
 ['LAM','Lamentations',5],['EZK','Ezekiel',48],['DAN','Daniel',12],['HOS','Hosea',14],['JOL','Joel',3],
 ['AMO','Amos',9],['OBA','Obadiah',1],['JON','Jonah',4],['MIC','Micah',7],['NAM','Nahum',3],
 ['HAB','Habakkuk',3],['ZEP','Zephaniah',3],['HAG','Haggai',2],['ZEC','Zechariah',14],['MAL','Malachi',4],
 ['MAT','Matthew',28],['MRK','Mark',16],['LUK','Luke',24],['JHN','John',21],['ACT','Acts',28],
 ['ROM','Romans',16],['1CO','1 Corinthians',16],['2CO','2 Corinthians',13],['GAL','Galatians',6],['EPH','Ephesians',6],
 ['PHP','Philippians',4],['COL','Colossians',4],['1TH','1 Thessalonians',5],['2TH','2 Thessalonians',3],
 ['1TI','1 Timothy',6],['2TI','2 Timothy',4],['TIT','Titus',3],['PHM','Philemon',1],['HEB','Hebrews',13],
 ['JAS','James',5],['1PE','1 Peter',5],['2PE','2 Peter',3],['1JN','1 John',5],['2JN','2 John',1],
 ['3JN','3 John',1],['JUD','Jude',1],['REV','Revelation',22]
];
const bookMap=new Map(bookRows.map(([code,name,chapterCount])=>[code,{code,name,chapterCount}]));
const translations=new Set(['ASV1901','KJV1769','BSB','WEBSTER1833']);
const labels={SUPPORTS:'Supports',PARALLEL:'Parallel',EXPLAINS:'Explains',QUALIFIES:'Qualifies',
 ILLUSTRATES:'Illustrates',CONTRASTS:'Contrasts',BACKGROUND:'Background',APPLIES:'Applies',RELATED:'Related'};
function parse(scope){
 const m=/^([1-3]?[A-Z]{2,3})(?:\.(\d+)(?:\.(\d+)(?:-(\d+))?)?)?$/.exec(String(scope||''));
 if(!m)return null;
 const b=bookMap.get(m[1]);if(!b)return null;
 const chapter=m[2]===undefined?1:Number(m[2]);
 const from=m[3]===undefined?1:Number(m[3]);
 const to=m[4]===undefined?from:Number(m[4]);
 if(!Number.isInteger(chapter)||chapter<1||chapter>b.chapterCount||
    !Number.isInteger(from)||from<1||from>176||
    !Number.isInteger(to)||to<from||to>176)return null;
 return {scope:String(scope),book:b.code,bookName:b.name,chapter,verse:from,endVerse:to,
  hasChapter:m[2]!==undefined,hasVerse:m[3]!==undefined,hasRange:m[4]!==undefined};
}
function label(scope){
 const s=parse(scope);if(!s)return String(scope||'');
 return s.bookName+(s.hasChapter?' '+s.chapter:'')+
  (s.hasVerse?':'+s.verse+(s.hasRange?'–'+s.endVerse:''):'');
}
function bibleHref(scope,edition,basePath){
 const s=parse(scope);if(!s)return null;
 const params=new URLSearchParams({book:s.book,chapter:String(s.chapter),
  verse:String(s.verse),translation:translations.has(edition)?edition:'KJV1769'});
 return (basePath||'./')+'?'+params.toString();
}
function relationshipName(relation){
 const raw=String(relation?.type||relation?.relationshipType||'RELATED').toUpperCase();
 return labels[raw]||raw.replace(/_/g,' ').toLowerCase();
}
function outbound(entry){
 return (Array.isArray(entry?.referenceTargets)?entry.referenceTargets:[])
 .map(r=>({scope:r?.reference||r?.targetScope||r?.to||'',relation:r}))
 .filter(r=>!!parse(r.scope)&&r.scope!==entry.scopeKey);
}
function inbound(entries,scope){
 const rows=[];
 for(const e of Array.isArray(entries)?entries:[]){
  if(!e||!parse(e.scopeKey)||e.scopeKey===scope)continue;
  for(const row of outbound(e)){
   if(row.scope===scope)rows.push({scope:e.scopeKey,relation:row.relation});
  }
 }
 return rows;
}
root.SOTWJacobLinks={parse,label,bibleHref,relationshipName,outbound,inbound};
})(typeof globalThis==='object'?globalThis:this);
