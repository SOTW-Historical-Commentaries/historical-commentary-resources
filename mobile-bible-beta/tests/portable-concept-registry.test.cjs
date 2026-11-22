'use strict';
/* SOTW public-safe Jacob concept mirror: no live CGBC runtime dependency. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const base='api/jacob-lannom/v1/concepts/v2/';
const manifest=JSON.parse(fs.readFileSync(path.join(root,base,'manifest.json'),'utf8'));
assert.equal(manifest.schemaVersion,'sotw-jacob-concepts-portable-snapshot/1.0.0');
assert.equal(manifest.holding,'SOTW_SELF_HOSTED_READ_ONLY_SOURCE_IDENTICAL_SNAPSHOT');
assert.equal(manifest.readerConceptDiscoveryStatus,'NOT_CONNECTED_EVIDENCE_JOIN_REQUIRED');
assert.equal(manifest.sourceMeaningEvidenceStatus,'REFERENCES_PRESERVED_NOT_MATERIALIZED_IN_THIS_SOTW_SNAPSHOT');
const file=(n,sha)=>{
 const bytes=fs.readFileSync(path.join(root,base,n));
 const gitBlob=crypto.createHash('sha1').update('blob '+bytes.length).update(Buffer.from([0])).update(bytes).digest('hex');
 assert.equal(gitBlob,sha,n+' changed from owner-approved source');
 return JSON.parse(bytes.toString('utf8'));
};
const registry=file('registry.json',manifest.sourceGitBlobSha.registry);
const schema=file('schema.json',manifest.sourceGitBlobSha.schema);
assert.equal(registry.registryVersion,manifest.sourceRegistryVersion);
assert.equal(registry.registryState,manifest.sourceRegistryState);
assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
assert.deepEqual(manifest.conceptIdsAtCapture,registry.concepts.map(x=>x.conceptId));
assert.equal(manifest.acceptedConceptCountAtCapture,registry.concepts.length);
assert.equal(new Set(registry.concepts.map(x=>x.conceptId)).size,registry.concepts.length,'unique stable IDs');
for(const c of registry.concepts){
 assert(c.conceptId&&c.label&&Array.isArray(c.aliases)&&c.definition);
 assert.equal(c.lifecycleStatus,'APPROVED');
 assert(Array.isArray(c.evidenceBasis)&&c.evidenceBasis.length,'source-based evidence required');
 for(const evidence of c.evidenceBasis){
  assert(evidence.sermonStableId&&Array.isArray(evidence.nodeRefs)&&evidence.nodeRefs.length);
  assert(Array.isArray(evidence.passageResearchRefs)&&Array.isArray(evidence.sourceRefs));
 }
}
assert.equal(manifest.updateContract.doNotAssumeFixedConceptCount,true);
assert.equal(manifest.updateContract.allowNewEntries,true);
console.log('PASS: self-hosted Jacob concepts, exact published Git blobs, current schema, IDs, evidence status, weekly-growth contract');
