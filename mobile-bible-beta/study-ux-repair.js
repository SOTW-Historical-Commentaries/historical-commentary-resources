/* SOTW Bible Reader v0.9. Read-only word study UI on accepted SOTW chapter data. */
(function(){
  const actualVerseTitle = () => {
    if(!modernStudyVerse)return;
    betaHeading.textContent=bookInfo().name+' '+state.chapter+' · Verse '+modernStudyVerse;
    betaHeading.setAttribute('aria-label',bookInfo().name+' chapter '+state.chapter+', verse '+modernStudyVerse);
  };

  // Move the single collapsed Commentary chooser next to the Scripture text,
  // rather than leaving it pinned at the foot of a mostly empty viewport.
  doctrineTags.after(modernCommentaryMenu);
  const languageButton=document.createElement('button');
  languageButton.id='originalLanguageEntry';
  languageButton.type='button';
  languageButton.hidden=true;
  modernStudyCard.after(languageButton);

  let languageEvidence=[];
  let languageGeneration=0;
  let currentSourceWord=null;
  function noLongerCurrent(request,generation,book,chapter,verse,edition){
    return request!==modernStudyRequest||generation!==languageGeneration||
      !document.body.classList.contains('study-open')||
      state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse||state.edition!==edition;
  }
  function chapterEvidenceUrl(book,chapter){
    const partition=BOOKS.findIndex(b=>b.code===book)<19
      ?'SOTW-Original-Languages/original-language-resources'
      :'SOTW-Original-Languages-2/original-language-resources';
    return 'https://raw.githubusercontent.com/'+partition+'/main/study-data/v1/chapters/'+book+'/'+String(chapter).padStart(2,'0')+'.json';
  }
  async function populateSourceForms(){
    const request=modernStudyRequest,generation=++languageGeneration;
    const book=state.book,chapter=state.chapter,verse=modernStudyVerse,edition=state.edition;
    languageButton.hidden=true;languageEvidence=[];
    if(!verse)return;
    try{
      const data=await getJson(chapterEvidenceUrl(book,chapter));
      if(noLongerCurrent(request,generation,book,chapter,verse,edition))return;
      if(data.book_code!==book||Number(data.chapter)!==Number(chapter))return;
      const rows=data.verses?.[book+'.'+chapter+'.'+verse]?.[edition]||[];
      languageEvidence=rows.filter(row=>
        Array.isArray(row.strongs_ids)&&row.strongs_ids.some(id=>/^strongs:[HG]\d+$/.test(id)) &&
        typeof row.source_location_kind==='string');
      if(!languageEvidence.length)return;
      const greek=BOOKS.findIndex(b=>b.code===book)>=39;
      const name=document.createElement('span');
      name.textContent=(greek?'Greek':'Hebrew')+' & word study';
      const meta=document.createElement('small');
      meta.textContent=languageEvidence.length+' source '+(languageEvidence.length===1?'form':'forms')+' ›';
      languageButton.replaceChildren(name,meta);
      languageButton.hidden=false;
    }catch{/* A missing mandatory chapter record cannot generate a link. */}
  }
  function sourceLabel(row){
    const a=row.source_locator||{};
    if(row.source_location_kind==='source_table_original_language_row_not_english_token')
      return {word:a.original_form||'',secondary:a.transliteration||'',morph:a.parsing_compact||'',kind:'BSB original-language source form'};
    if(row.source_location_kind==='tagged_word_ordinal_not_full_verse_token')
      return {word:a.tagged_surface||'',secondary:'',morph:'',kind:'Native KJV word tag'};
    if(row.source_location_kind==='source_verified_target_english_token_index_zero_based')
      return {word:a.target_surface||'',secondary:'Verified linked English',morph:'',kind:'Verified edition word link'};
    return {word:'',secondary:'',morph:'',kind:''};
  }
  function sourceValidity(row){
    const label=sourceLabel(row);
    return !!label.word&&!!label.kind&&
      row.verse_id===state.book+'.'+state.chapter+'.'+modernStudyVerse &&
      row.strongs_ids.some(id=>/^strongs:[HG]\d+$/.test(id));
  }

  /* Whole-verse optional source atlas. The first click exposes every attested
     form, actual Strong's number and any recorded morphology. Definitions
     arrive directly inside each word's card, without another tap. */
  function renderSourceList(){
    openStudyLayer('source-forms','Words in this verse');
    currentSourceWord=null;
    for(const child of Array.from(studyOverlayBody.children)){
      if(child.id!=='voices')child.remove();
    }
    const intro=document.createElement('p');intro.className='modern-panel-desc';
    intro.textContent='Tap any word below to bring its short definition back beside Scripture.';
    studyOverlayBody.append(intro);
    for(const row of languageEvidence.filter(sourceValidity)){
      const descriptor=sourceLabel(row);
      const id=row.strongs_ids.find(x=>/^strongs:[HG]\d+$/.test(x));
      const button=document.createElement('button');
      button.type='button';button.className='language-choice';
      const left=document.createElement('div');left.className='word-atlas-text';
      const top=document.createElement('div');top.className='word-atlas-head';
      const head=document.createElement('strong');head.textContent=descriptor.word;
      const number=document.createElement('span');number.className='lexical-strongs';
      number.textContent=id.replace('strongs:','');
      top.append(head,number);left.append(top);
      if(descriptor.secondary){
        const trans=document.createElement('span');trans.textContent=descriptor.secondary;left.append(trans);
      }
      if(descriptor.morph){
        const grammar=document.createElement('span');grammar.className='word-atlas-grammar';
        grammar.textContent=descriptor.morph;left.append(grammar);
      }
      const original=document.createElement('span');original.className='word-atlas-original';
      const short=document.createElement('span');short.className='word-atlas-short';
      left.append(original,short);button.append(left);
      button.addEventListener('click',()=>renderSourceDetail(row));
      studyOverlayBody.append(button);
      const lexMatch=id.match(/^strongs:([HG])(\d+)$/);
      const lang=lexMatch[1],num=Number(lexMatch[2]);
      if(!Number.isInteger(num)||num<1||num>(lang==='H'?8674:5624))continue;
      const first=Math.floor((num-1)/250)*250+1,last=Math.min(first+249,lang==='H'?8674:5624);
      const pad=n=>String(n).padStart(5,'0');
      const url='https://raw.githubusercontent.com/SOTW-Original-Languages/original-language-resources/main/study-data/v1/lexicon/'+lang+'/'+lang+pad(first)+'-'+pad(last)+'.json';
      getJson(url).then(data=>{
        if(!button.isConnected||studyView!=='source-forms')return;
        const entry=data.entries?.[id],definition=entry?.definitions?.concise_source_authored;
        if(entry?.headword){
          const forms=[entry.headword,entry.transliteration].filter(Boolean);
          original.textContent=forms.join(' · ');
        }
        if(typeof definition==='string'&&definition.trim())short.textContent=definition;
      }).catch(()=>{});
    }
  }
  /* A tap on an attested original-language source word puts its short Strong's
     explanation immediately below the verse, without requiring a second click
     or leaving the main study. Full lexical detail is a separate opt-in. */
  async function renderSourceDetail(row){
    const descriptor=sourceLabel(row);
    const id=row.strongs_ids.find(x=>/^strongs:[HG]\d+$/.test(x));
    if(!id||row.verse_id!==state.book+'.'+state.chapter+'.'+modernStudyVerse)return;
    const match=id.match(/^strongs:([HG])(\d+)$/),letter=match[1],number=Number(match[2]);
    const bound=letter==='H'?8674:5624;
    if(!Number.isInteger(number)||number<1||number>bound)return;
    const first=Math.floor((number-1)/250)*250+1,last=Math.min(first+249,bound);
    const pad=n=>String(n).padStart(5,'0');
    const url='https://raw.githubusercontent.com/SOTW-Original-Languages/original-language-resources/main/study-data/v1/lexicon/'+letter+'/'+letter+pad(first)+'-'+pad(last)+'.json';
    const request=modernStudyRequest,generation=languageGeneration;
    currentSourceWord=row;
    hideStudyLayer();
    betaWordDetail.replaceChildren();currentLexical=null;
    const box=document.createElement('div');box.className='language-detail';
    const heading=document.createElement('h3');heading.textContent=descriptor.word+' · '+id.replace('strongs:','');
    box.append(heading);
    if(descriptor.secondary){
      const sub=document.createElement('p');sub.className='morphology';sub.textContent=descriptor.secondary;
      box.append(sub);
    }
    if(descriptor.morph){
      const morph=document.createElement('p');morph.className='morphology';
      morph.textContent='Source morphology: '+descriptor.morph;box.append(morph);
    }
    const loading=document.createElement('p');loading.className='modern-panel-desc';
    loading.textContent='Loading short Strong’s definition…';
    box.append(loading);betaWordDetail.append(box);
    box.scrollIntoView({block:'nearest'});
    try{
      const data=await getJson(url);
      if(request!==modernStudyRequest||generation!==languageGeneration||currentSourceWord!==row||
         !document.body.classList.contains('study-open'))return;
      loading.remove();
      const found=data.entries?.[id];
      if(!found||!found.definitions?.concise_source_authored){
        const warning=document.createElement('p');warning.className='modern-panel-desc';
        warning.textContent='Short Strong’s source definition unavailable.';box.append(warning);
        return;
      }
      const original=document.createElement('p');original.className='word-summary-meta';
      original.textContent=[found.headword,found.transliteration].filter(Boolean).join(' · ');
      box.append(original);
      const def=document.createElement('p');def.className='definition';
      def.textContent=found.definitions.concise_source_authored;
      box.append(def);
      currentLexical={row:found,id,english:descriptor.word};
      const d=found.definitions;
      if(d.numbered_expanded_source_authored?.length||d.derivation_source_authored||
         d.kjv_renderings_source_authored||d.supplemental_source_authored){
        const full=document.createElement('button');full.type='button';full.className='word-expand';
        full.textContent='Read full Strong’s entry ›';
        full.addEventListener('click',renderFullLexical);box.append(full);
      }
      if(row.source_location_kind==='tagged_word_ordinal_not_full_verse_token'&&
         typeof offerWebster1828==='function'){
        if(sotwWebsterData)offerWebster1828(descriptor.word,request);
        else getSotwWebster1828().then(()=>{
          if(request===modernStudyRequest&&currentSourceWord===row&&
             document.body.classList.contains('study-open'))offerWebster1828(descriptor.word,request);
        }).catch(()=>{});
      }
    }catch{
      if(request===modernStudyRequest&&currentSourceWord===row)
        loading.textContent='The Strong’s source definition could not be loaded.';
    }
  }
  languageButton.addEventListener('click',renderSourceList);

  /* Requested visual order: passage, supported doctrine/aliases, verse,
     selected word lexical detail, optional original source forms/facsimile,
     and Commentary last. A single scrolling content region prevents the
     bottom panel from clipping lexical definitions on small iPhones. */
  const studyScroll=document.createElement('div');
  studyScroll.id='studyBodyScroll';
  betaSection.querySelector('.tools').after(studyScroll);
  const order=[
    betaHeading,
    doctrineTags,
    modernStudyCard,
    betaWords,
    betaWordDetail,
    languageButton,
    document.getElementById('asvSourceEntry'),
    modernCommentaryMenu
  ];
  for(const node of order){if(node)studyScroll.append(node);}
  // The nested lexical/author/PDF overlay stays fixed within the study panel.
  betaSection.append(studyOverlay);

  // Remove editorial paragraph symbols only in the displayed verse, never in
  // authoritative Scripture text files or passage source hashes.
  const previousPlainVerse=modernPlainVerse;
  modernPlainVerse=function(){
    previousPlainVerse();
    for(const textNode of Array.from(modernStudyCard.childNodes)){
      if(textNode.nodeType!==3)continue;
      if(/^\s*[¶§]/u.test(textNode.nodeValue||'')){
        textNode.nodeValue=textNode.nodeValue.replace(/^\s*[¶§]+\s*/u,'');
      }
      break;
    }
  };
  /* KJV tagged rows are not token offsets. On the displayed KJV verse only,
     match a unique, case-insensitive English surface that occurs exactly once
     in BOTH the source-tagged set and the verse. Never infer repeated words,
     morphology or Greek alignment from an ordinal. */
  const previouslyAligned=modernLoadAlignedWords;
  modernLoadAlignedWords=async function(request){
    if(state.edition!=='KJV1769')return previouslyAligned(request);
    const book=state.book,chapter=state.chapter,verse=modernStudyVerse;
    try{
      const evidence=await getJson(chapterEvidenceUrl(book,chapter));
      if(request!==modernStudyRequest||!document.body.classList.contains('study-open')||
         state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse)return;
      const rows=(evidence.verses?.[book+'.'+chapter+'.'+verse]?.KJV1769||[])
        .filter(r=>r.verse_id===book+'.'+chapter+'.'+verse&&
          r.source_location_kind==='tagged_word_ordinal_not_full_verse_token'&&
          (r.strongs_ids||[]).some(id=>/^strongs:[HG]\d+$/.test(id)));
      const raw=(modernSourceVerse(verse)?.spans||[]).map(x=>x.text||'').join('')
        .replace(/^\s*[¶§]+\s*/u,'');
      const pieces=raw.match(/\s+|\S+/gu)||[];
      const norm=x=>String(x||'').toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
      const grouped=new Map();
      for(const row of rows){const key=norm(row.source_locator?.tagged_surface);if(!key)continue;
        if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(row);}
      const occurrences=new Map();
      for(const piece of pieces){if(/^\s+$/u.test(piece))continue;
        const key=norm(piece);if(key)occurrences.set(key,(occurrences.get(key)||0)+1);}
      let position=0;const fragment=document.createDocumentFragment();
      for(const piece of pieces){
        if(/^\s+$/u.test(piece)){fragment.append(document.createTextNode(piece));continue;}
        const key=norm(piece),matches=grouped.get(key)||[];
        if(key&&occurrences.get(key)===1&&matches.length===1){
          fragment.append(modernWordButton(piece,matches[0],position,request));
        }else fragment.append(document.createTextNode(piece));
        position++;
      }
      modernStudyCard.replaceChildren(fragment);
      if(typeof addEnglishWordTargets==='function')addEnglishWordTargets();
    }catch{/* No proven match: Scripture remains unlinked, never guessed. */}
  };

  /* English word-to-Greek/Hebrew display only for ASV/Webster 1833 source-
     verified English token alignment. KJV and BSB word associations do not
     assert an English offset. Their original-language evidence is accessed
     through the separate source-forms control. */
  modernWordButton=function(token,row,index,request){
    const btn=document.createElement('button');btn.type='button';btn.className='word-target';
    btn.dataset.wordIndex=String(index);btn.textContent=token;
    btn.setAttribute('aria-label','Study source-linked word '+token);
    btn.addEventListener('click',async()=>{
      if(btn.classList.contains('is-open')){
        btn.classList.remove('is-open');currentLexical=null;
        betaWordDetail.replaceChildren();return;
      }
      modernStudyCard.querySelectorAll('.word-target.is-open,.webster-word.is-open').forEach(x=>x.classList.remove('is-open'));
      btn.classList.add('is-open');currentLexical=null;betaWordDetail.replaceChildren();
      const id=(row.strongs_ids||[]).find(x=>/^strongs:[HG]\d+$/.test(x));
      if(!id)return;
      // The selected Strong's identifier and contextual morphology are
      // source-controlled; lexical definition is fetched, not inferred.
      const summary=document.createElement('p');summary.className='word-summary-title';
      summary.textContent=token+' · '+id.replace('strongs:','');
      betaWordDetail.append(summary);
      const parsing=row.source_locator?.parsing_compact;
      if(typeof parsing==='string'&&parsing.trim()){
        const morphology=document.createElement('p');morphology.className='word-summary-meta';
        morphology.textContent='Source morphology: '+parsing;
        betaWordDetail.append(morphology);
      }
      await betaLexicon(id,request,token);
      if(request!==modernStudyRequest||!btn.classList.contains('is-open'))return;
      if(typeof parsing==='string'&&parsing.trim()&&currentLexical?.id===id){
        const morphology=document.createElement('p');morphology.className='word-summary-meta';
        morphology.textContent='Source morphology: '+parsing;
        const def=betaWordDetail.querySelector('.word-summary-short');
        if(def)def.before(morphology);else betaWordDetail.append(morphology);
      }
    });
    return btn;
  };

  studyOverlayBack.addEventListener('click',event=>{
    if(studyView==='source-word-detail'){
      event.stopImmediatePropagation();
      renderSourceList();
    }
  },{capture:true});

  const earlierOpen=betaOpen;
  betaOpen=function(){
    earlierOpen();
    actualVerseTitle();
    populateSourceForms();
  };
  const earlierClose=betaCloseSheet;
  betaCloseSheet=function(){
    ++languageGeneration;languageEvidence=[];currentSourceWord=null;
    languageButton.hidden=true;
    earlierClose();
  };
})();
