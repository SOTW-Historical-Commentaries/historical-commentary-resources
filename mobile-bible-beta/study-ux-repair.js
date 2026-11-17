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
      return {word:a.tagged_surface||'',secondary:'KJV source-tagged English',morph:'',kind:'Native KJV word tag'};
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
  function renderSourceList(){
    openStudyLayer('source-forms','Original-language word study');
    currentSourceWord=null;
    const container=document.createElement('div');
    const subtitle=document.createElement('p');
    subtitle.className='modern-panel-desc';
    subtitle.textContent=state.edition==='BSB'
      ?'Original-language source forms with available grammar. These rows are not aligned to particular English words.'
      :state.edition==='KJV1769'
      ?'Source-tagged words. Their sequence is not an exact position in the English verse.'
      :'Edition-supported word associations. Select a form for its lexical details.';
    container.append(subtitle);
    for(const row of languageEvidence.filter(sourceValidity)){
      const descriptor=sourceLabel(row),id=row.strongs_ids.find(x=>/^strongs:[HG]\d+$/.test(x));
      const button=document.createElement('button');
      button.type='button';button.className='language-choice';
      const left=document.createElement('div');
      const head=document.createElement('strong');head.textContent=descriptor.word;
      const sub=document.createElement('span');sub.textContent=descriptor.secondary+
        (descriptor.morph?' · '+descriptor.morph:'');
      left.append(head,document.createElement('div'),sub);
      const number=document.createElement('span');number.className='lexical-strongs';
      number.textContent=id.replace('strongs:','');
      button.append(left,number);
      button.addEventListener('click',()=>renderSourceDetail(row));
      container.append(button);
    }
    studyOverlayBody.append(container);
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
