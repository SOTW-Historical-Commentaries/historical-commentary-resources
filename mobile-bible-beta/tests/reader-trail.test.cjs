/* Reader-only search/topic return contracts, no source-data migration. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(dir,'reader-trail.js'),'utf8');
const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const discovery=fs.readFileSync(path.join(dir,'discovery-integrations.js'),'utf8');
const jacob=fs.readFileSync(path.join(dir,'jacob-search.js'),'utf8');
const returnScript=fs.readFileSync(path.join(dir,'reader-return.js'),'utf8');
const shell=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
assert(script.includes('SOTWReaderTrail={capture,commit,restore,clear'));
assert(script.includes('m15 18-6-6 6-6')&&script.includes('const openLabel='),'Use same left-chevron SVG as Back to Scripture');
assert(!script.includes('↩'),'The curved arrow is not used');
assert(script.includes("openLabel.textContent='Back to '+last.label"),'Changing label must preserve static chevron');
assert(script.includes("query:searchInput.value,scroll:results.scrollTop"),'Exact search state is saved');
assert(script.includes("heading:heading.textContent,scroll:panel.scrollTop"),'Topic scroll saved');
assert(script.includes("if(!heading||heading!==snap.heading){clear();return false;}"),'Never restore another topic under stale title');
assert(script.includes("if(searchInput.value!==snap.query){clear();return false;}"),'Avoid stale search result restoration');
assert(script.includes("dismiss.addEventListener('click',clear)"),'Dismissibility');
assert(discovery.includes("'discovery-citation jacob-passage-link'")&&discovery.includes('link.href=location.pathname'),'Topic citations must use verified passage links');
assert(returnScript.includes("closest('a.jacob-passage-link')")&&returnScript.includes('follow(anchor)'),'Reader return handler must intercept topic citation links');
assert(returnScript.includes("SOTWReaderTrail.capture(anchor.closest('#sotwVerseTopicsBody')?'study-topic':'topic',anchor)")&&
 returnScript.includes('SOTWReaderTrail.commit(trail)'),
 'Both inline Study Topics and Search topic dialogs must preserve the return trail');
assert(script.includes('function studyTopicSnapshot(anchor)')&&script.includes("kind:'study-topic'")&&
 script.includes('expandedReferences:')&&script.includes('openTopics:')&&script.includes('scroll:panel?.scrollTop'),
 'Store actual publisher topic, expanded citations and scroll before leaving the Study Tool');
assert(script.includes("root.SOTWDiscoveryCore?.openVerseTopics")&&
 script.includes('selected.open=true')&&script.includes('groups.forEach((g,i)=>'),
 'Restore the exact inline publisher topic and disclosures, not just original Scripture');
assert(returnScript.includes('returnToStudySource(snapshot)')&&returnScript.includes('return !!await goBack()&&matches()'),
 'Return to Study must reuse the existing source-verified Back to Scripture navigation');
assert(discovery.includes('root.SOTWDiscoveryCore.openVerseTopics=showVerseTopics'),
 'Existing original-source topic loader must be reused rather than another index');
assert(discovery.includes('Back to search results'),'Topic can return to its source results');
assert(index.includes("SOTWReaderTrail.capture('search')")&&index.includes('SOTWReaderTrail.commit(trail)'));
assert(jacob.includes("SOTWReaderTrail.capture('search')")&&jacob.includes('SOTWReaderTrail.commit(trail)'));
assert(index.includes('reader-trail.js?v=20261122-trail3'));
assert(returnScript.includes("sotwReturnToPassage"),'Original Back to Scripture remains intact');
assert(shell.includes("PREFIX='sotw-mobile-bible-beta-shell-'")&&shell.includes("CACHE=PREFIX+'v0209'")&&shell.includes('./reader-trail.js'),'PWA must preload the new return script');
assert(!script.includes('sessionStorage')&&!script.includes('localStorage'),'Trail is per-tab in-memory only');
console.log('PASS: one dismissible local trail, topic/search scroll and query preserved, original Scripture return intact');
