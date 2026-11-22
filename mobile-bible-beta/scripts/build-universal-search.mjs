#!/usr/bin/env node
/* Rebuild approved, pinned unfoldingWord v91 Bible Questions search shards.
   NO general web crawl, content rewriting, data enrichment or source approval.
   --verify (default) checks committed bytes; --write explicitly regenerates. */
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
const PIN="b4a7702a8bb1f7410514b7f44663c49ecfd25d33";
const BASE="https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/"+PIN+"/data/unfoldingword/v91/qa/";
const TARGET=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../data/universal-search/v1");
const WRITE=process.argv.includes("--write");
const groups=[
 ["GEN","EXO","LEV","DEU","JOS","JDG","RUT","1SA"],
 ["2SA","1KI","2KI","EZR","NEH","EST","JOB","PSA"],
 ["PRO","SNG","LAM","DAN","HOS","JOL","AMO","OBA"],
 ["JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL"],
 ["MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO"],
 ["GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI"],
 ["TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN"],
 ["3JN","JUD","REV"]
];
async function source(name){
 const response=await fetch(BASE+name,{signal:AbortSignal.timeout(45000)});
 assert(response.ok,"Published pinned source unavailable "+name+" HTTP "+response.status);
 return response.json();
}
async function main(){
 const idx=await source("index.json");
 assert.equal(idx.schema,"sotw-unfoldingword-qa-index/1.0.0");
 assert.equal(idx.total,12139);
 assert.equal(idx.books.length,59);
 assert.deepEqual(groups.flat(),idx.books.map(x=>x.book),"Approved source book inventory changed");
 const all=new Set(),counts=[];
 for(let i=0;i<groups.length;i++){
  const books=groups[i];
  const payloads=await Promise.all(books.map(b=>source("books/"+b+".json")));
  const records=payloads.flatMap((book,index)=>{
   assert.equal(book.schema,"sotw-unfoldingword-qa-book/1.0.0");
   assert.equal(book.resource,"en_tq");assert.equal(book.version,"91");
   assert.equal(book.book,books[index]);assert.equal(book.count,book.records.length);
   assert.equal(book.count,idx.books.find(b=>b.book===book.book).count);
   return book.records.map(row=>{
    assert.equal(row.reviewStatus,"SOURCE_RECORD_UNALTERED_NOT_INDEPENDENTLY_FACT_CHECKED");
    assert(!all.has(row.id),"Duplicate Q&A ID "+row.id);all.add(row.id);
    const t=(row.scriptureTargets||[])
     .filter(p=>p.book&&Number.isInteger(p.chapter)&&Number.isInteger(p.verse)&&p.chapter>0&&p.verse>0)
     .map(p=>[p.book,p.chapter,p.verse,p.endVerse??0]);
    assert(t.length,"No verified passage for "+row.id);
    return [row.id,row.question,row.answer,t,row.reference,row.source?.sourceLine||0];
   });
  });
  const name="questions-"+String(i+1).padStart(2,"0")+".json";
  const bytes=JSON.stringify({schema:"sotw-reader-qa-search-shard/1.0.0",version:"91",books,records});
  if(WRITE){await mkdir(TARGET,{recursive:true});await writeFile(path.join(TARGET,name),bytes);}
  else assert.equal(await readFile(path.join(TARGET,name),"utf8"),bytes,"Stale Q&A shard "+name);
  counts.push({path:name,count:records.length});
  console.log(name+" "+records.length+" published, reference-linked Q&A verified");
 }
 assert.equal(all.size,12139);
 const manifest=JSON.parse(await readFile(path.join(TARGET,"manifest.json"),"utf8"));
 assert.equal(manifest.schema,"sotw-reader-universal-search-manifest/1.0.0");
 assert.equal(manifest.source.commit,PIN);assert.equal(manifest.source.version,"91");
 assert.equal(manifest.source.reviewStatus,"SOURCE_RECORD_UNALTERED_NOT_INDEPENDENTLY_FACT_CHECKED");
 assert.deepEqual(manifest.shards,counts);
 assert.equal(manifest.indexedRecords,all.size);
 console.log("PASS: all 12,139 published v91 questions unchanged; exact source refs and pinned version");
}
main().catch(e=>{console.error(e);process.exitCode=1;});
