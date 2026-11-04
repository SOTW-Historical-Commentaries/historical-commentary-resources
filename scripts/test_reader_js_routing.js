#!/usr/bin/env node
// Executes the *actual* JavaScript filtering function embedded in each patched
// review page. No browser network access is required.
const fs=require('fs');const vm=require('vm');const path=require('path');
const root=path.resolve(__dirname,'..'),cases=[
 ['NUM','review-numbers-v3.html',31,31,'keil-delitzsch','NUM:P:preparations-at-sinai',false],
 ['NUM','review-numbers-v3.html',5,1,'keil-delitzsch','NUM:P:preparations-at-sinai',true],
 ['NUM','review-numbers-v3.html',10,11,'keil-delitzsch','NUM:P:preparations-at-sinai',false],
 ['LEV','review-leviticus-v3.html',6,1,'keil-delitzsch','LEV:P:sacrificial-laws-overview',true],
 ['LEV','review-leviticus-v3.html',6,1,'keil-delitzsch','LEV:P:general-sacrifice-rules',false],
 ['EXO','review-exodus-v3.html',13,3,'jamieson-fausset-brown','EXO.13:P:passage-overview',false],
 ['EXO','review-exodus-v3.html',13,2,'jamieson-fausset-brown','EXO.13:P:passage-overview',true],
 ['GEN','review-v3.html',2,3,'keil-delitzsch','GEN.1:P:creation-overview',true],
 ['GEN','review-v3.html',2,4,'keil-delitzsch','GEN.1:P:creation-overview',false],
 ['GEN','review-v3.html',1,1,'jamieson-fausset-brown','GROUP:POETICAL:P:poetical',false],
 ['GEN','review-v3.html',1,1,'jamieson-fausset-brown','GROUP:GEN-HISTORICAL:P:gen-historical',true],
 ['NUM','review-numbers-v3.html',31,31,'matthew-henry','GROUP:GEN-DEU:P:pentateuch-volume',true],
];const results=[];
for(const [book,page,chapter,verse,author,id,expected] of cases){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 const start=html.indexOf('function eligibleForCurrentVerse(s)');
 const end=html.indexOf('\nasync function render(){',start);
 if(start<0||end<0)throw Error(`Missing actual eligibility function in ${page}`);
 const fnCode=html.slice(start,end);
 const ctx={chapter,$:(selector)=>{if(selector!=='verse')throw Error('Unexpected selector');return {value:String(verse)};}};
 vm.createContext(ctx);vm.runInContext(fnCode,ctx,{filename:page});
 const object=JSON.parse(fs.readFileSync(path.join(root,'api/v3/navigation-coverage/v1/books',book+'.json'),'utf8'));
 const sections=object.author_sections[author]||[];
 const item=sections.find(s=>s.navigation_id===id);
 const actual=item?ctx.eligibleForCurrentVerse(item):false;
 results.push({test:`${book}.${chapter}.${verse} ${author}: ${id}`,expected,actual,status:expected===actual?'PASS':'FAIL'});
}
let report={kind:'sotw_actual_browser_javascript_filter_unit_checks',status:results.every(x=>x.status==='PASS')?'PASS':'FAIL',count:results.length,results};
fs.writeFileSync(path.join(root,'tests/ACTUAL_READER_JS_ROUTING_TESTS.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,checks:report.count,failed:results.filter(x=>x.status==='FAIL')},null,2));if(report.status!=='PASS')process.exit(1);
