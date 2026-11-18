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
  let resumeWordByWord=false;
  let dictionaryReturnToAtlas=false;
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
      if(!languageEvidence.length){
        if(resumeWordByWord){resumeWordByWord=false;renderSourceList();}
        return;
      }
      const greek=BOOKS.findIndex(b=>b.code===book)>=39;
      const name=document.createElement('span');
      name.textContent='Word-by-Word';
      const meta=document.createElement('small');
      meta.textContent='Explore this verse ›';
      languageButton.replaceChildren(name,meta);
      languageButton.hidden=false;
      if(resumeWordByWord){resumeWordByWord=false;renderSourceList();}
    }catch{
      if(!noLongerCurrent(request,generation,book,chapter,verse,edition)&&resumeWordByWord){
        resumeWordByWord=false;renderSourceList();
      }
    }
  }
  function sourceLabel(row){
    const a=row.source_locator||{};
    if(row.source_location_kind==='source_table_original_language_row_not_english_token')
      return {word:a.original_form||'',secondary:a.transliteration||'',morph:a.parsing_compact||'',kind:'BSB original-language source form'};
    if(row.source_location_kind==='tagged_word_ordinal_not_full_verse_token')
      return {word:a.tagged_surface||'',secondary:'',morph:'',kind:'Native KJV word tag'};
    if(row.source_location_kind==='source_verified_target_english_token_index_zero_based')
      return {word:a.target_surface||'',secondary:'',morph:'',kind:'Verified edition word link'};
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
  // Word-by-Word reads the selected English verse in its actual order.
  // Unsupported English positions are plain, while original forms that cannot
  // be confidently aligned still appear in their own authoritative sequence.
  function normalizeAtlasWord(value){
    return String(value||'').toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,'');
  }
  function englishAtlasRows(pieces){
    const rows=languageEvidence.filter(sourceValidity);
    const assigned=new Map(),used=new Set();
    const words=pieces.filter(piece=>!(/^\s+$/u.test(piece)));
    if(['ASV1901','WEBSTER1833'].includes(state.edition)){
      for(const row of rows){
        if(row.source_location_kind!=='source_verified_target_english_token_index_zero_based')continue;
        const index=row.source_locator?.target_token_index_zero_based;
        if(!Number.isInteger(index)||!words[index]||
          normalizeAtlasWord(words[index])!==normalizeAtlasWord(row.source_locator?.target_surface))continue;
        if(!assigned.has(index)){assigned.set(index,row);used.add(row);}
      }
    }else if(state.edition==='KJV1769'){
      const groups=new Map(),counts=new Map();
      for(const row of rows){
        if(row.source_location_kind!=='tagged_word_ordinal_not_full_verse_token')continue;
        const key=normalizeAtlasWord(row.source_locator?.tagged_surface);
        if(!key)continue;
        if(!groups.has(key))groups.set(key,[]);
        groups.get(key).push(row);
      }
      // SOTW's tagged records are already ordered. For repeated English
      // words, pair first-to-first only when occurrence counts agree exactly.
      // No browser linguistics, guesses or token matches on unequal counts.
      const positions=new Map();
      words.forEach((word,index)=>{
        const key=normalizeAtlasWord(word);
        if(!key)return;
        if(!positions.has(key))positions.set(key,[]);
        positions.get(key).push(index);
      });
      for(const [key,records] of groups){
        const englishPositions=positions.get(key)||[];
        if(englishPositions.length!==records.length)continue;
        englishPositions.forEach((index,i)=>{assigned.set(index,records[i]);used.add(records[i]);});
      }
    }
    return {words,assigned,unpositioned:rows.filter(row=>!used.has(row))};
  }
  function makeAtlasCard(row,displayWord){
    const descriptor=sourceLabel(row);
    const id=row.strongs_ids.find(x=>/^strongs:[HG]\d+$/.test(x));
    // Card is a container with two sibling actions. Never nest a dictionary
    // button inside the word button; that causes unreliable mobile taps.
    const wrapper=document.createElement('div');wrapper.className='word-sequence-card';
    const card=document.createElement('button');card.type='button';
    card.className='language-choice word-sequence-main';
    const left=document.createElement('div');left.className='word-atlas-text';
    const top=document.createElement('div');top.className='word-atlas-head';
    const word=document.createElement('strong');
    word.textContent=displayWord||descriptor.word;
    const number=document.createElement('span');number.className='lexical-strongs';
    number.textContent=id.replace('strongs:','');
    top.append(word,number);left.append(top);
    if(descriptor.secondary){
      const trans=document.createElement('span');trans.textContent=descriptor.secondary;left.append(trans);
    }
    if(descriptor.morph){
      const grammar=document.createElement('span');grammar.className='word-atlas-grammar';
      grammar.textContent=descriptor.morph;left.append(grammar);
    }
    const original=document.createElement('span');original.className='word-atlas-original';
    const short=document.createElement('span');short.className='word-atlas-short';
    left.append(original,short);card.append(left);wrapper.append(card);
    card.setAttribute('aria-label','Study '+(displayWord||descriptor.word)+' '+id.replace('strongs:',''));
    card.addEventListener('click',()=>renderSourceDetail(row));
    const match=id.match(/^strongs:([HG])(\d+)$/),lang=match[1],num=Number(match[2]);
    if(Number.isInteger(num)&&num>0&&num<=(lang==='H'?8674:5624)){
      const first=Math.floor((num-1)/250)*250+1,last=Math.min(first+249,lang==='H'?8674:5624);
      const pad=n=>String(n).padStart(5,'0');
      const url='https://raw.githubusercontent.com/SOTW-Original-Languages/original-language-resources/main/study-data/v1/lexicon/'+lang+'/'+lang+pad(first)+'-'+pad(last)+'.json';
      getJson(url).then(data=>{
        if(!card.isConnected||studyView!=='source-forms')return;
        const entry=data.entries?.[id];
        if(entry?.headword){
          original.textContent=[entry.headword,entry.transliteration].filter(Boolean).join(' · ');
        }
        const definition=entry?.definitions?.concise_source_authored;
        if(typeof definition==='string'&&definition.trim()){
          short.textContent=sotwQuickDisplayMeaning(definition,id);
        }
      }).catch(()=>{});
    }
    // Show a secondary Webster control ONLY if a real, nonempty exact
    // English headword is published in SOTW's 1828 dictionary.
    // Original-only BSB Greek/Hebrew rows have no claimed English token link.
    const englishWord=displayWord || (row.source_location_kind==='tagged_word_ordinal_not_full_verse_token' ||
      row.source_location_kind==='source_verified_target_english_token_index_zero_based'
        ?descriptor.word:'');
    if(englishWord&&typeof getSotwWebster1828==='function'){
      getSotwWebster1828().then(()=>{
        if(!wrapper.isConnected||studyView!=='source-forms')return;
        if(!websterDefinitionsFor(englishWord).length)return;
        const dictionary=document.createElement('button');dictionary.type='button';
        dictionary.className='word-sequence-dictionary';
        dictionary.textContent='Webster 1828  ›';
        dictionary.setAttribute('aria-label','Read Webster’s 1828 dictionary definition for '+englishWord);
        dictionary.addEventListener('click',event=>{
          event.stopPropagation();
          if(!websterDefinitionsFor(englishWord).length)return;
          dictionaryReturnToAtlas=true;
          showWebsterDictionary(englishWord);
        });
        wrapper.append(dictionary);
      }).catch(()=>{/* Absent dictionary data must not display a dead control. */});
    }
    return wrapper;
  }
  function makeWordLine(word){
    const line=document.createElement('div');line.className='word-sequence-plain';
    const content=document.createElement('span');content.textContent=word;
    const rule=document.createElement('span');rule.className='word-sequence-rule';
    rule.setAttribute('aria-hidden','true');line.append(content,rule);return line;
  }
  function makeVerseNavigation(){
    const bar=document.createElement('nav');bar.className='word-sequence-nav';
    bar.setAttribute('aria-label','Navigate verses in Word-by-Word');
    const prev=document.createElement('button'),next=document.createElement('button');
    prev.type=next.type='button';prev.textContent='‹';next.textContent='›';
    const max=Number(state.index?.verse_count||state.bible?.verses?.length||0);
    prev.disabled=modernStudyVerse<=1;next.disabled=modernStudyVerse>=max;
    prev.setAttribute('aria-label','Previous verse');next.setAttribute('aria-label','Next verse');
    const label=document.createElement('span');
    label.textContent=bookInfo().name+' '+state.chapter+':'+modernStudyVerse;
    prev.addEventListener('click',()=>moveWordByWord(-1));
    next.addEventListener('click',()=>moveWordByWord(1));
    bar.append(prev,label,next);return bar;
  }
  function moveWordByWord(delta){
    const verse=modernStudyVerse+delta;
    if(!modernSourceVerse(verse))return;
    // Let the normal read-only reader refresh every scope, then restore atlas.
    resumeWordByWord=true;modernStudyVerse=verse;chooseVerse(verse);betaOpen();
  }
  function renderSourceList(){
    openStudyLayer('source-forms','Word-by-Word');
    currentSourceWord=null;
    for(const child of Array.from(studyOverlayBody.children)){
      if(child.id!=='voices')child.remove();
    }
    studyOverlayBody.append(makeVerseNavigation());
    const selected=modernSourceVerse(modernStudyVerse);
    const raw=(selected?.spans||[]).map(x=>x.text||'').join('').replace(/^\s*[¶§]+\s*/u,'');
    const verse=document.createElement('p');verse.className='word-sequence-verse';
    verse.textContent=raw;studyOverlayBody.append(verse);
    const section=document.createElement('p');section.className='word-sequence-caption';
    section.textContent='Read the verse word by word';studyOverlayBody.append(section);
    const sequence=document.createElement('div');sequence.className='word-sequence-list';
    const pieces=raw.match(/\s+|\S+/gu)||[];
    const {words,assigned,unpositioned}=englishAtlasRows(pieces);
    words.forEach((word,index)=>{
      const row=assigned.get(index);
      sequence.append(row?makeAtlasCard(row,word):makeWordLine(word));
    });
    studyOverlayBody.append(sequence);
    if(unpositioned.length&&state.edition==='BSB'){
      const sourceTitle=document.createElement('p');sourceTitle.className='word-sequence-caption';
      sourceTitle.textContent=BOOKS.findIndex(b=>b.code===state.book)>=39
        ?'Greek words in source order':'Hebrew words in source order';
      studyOverlayBody.append(sourceTitle);
      if(state.edition==='BSB'){
        const note=document.createElement('p');note.className='word-sequence-note';
        note.textContent='These original-language forms belong to this verse; their exact English word positions are not supplied by the source.';
        studyOverlayBody.append(note);
      }
      for(const row of unpositioned)studyOverlayBody.append(makeAtlasCard(row));
    }
    if(!words.length){
      const none=document.createElement('p');none.className='word-sequence-note';
      none.textContent='Verse text is not available in this edition.';studyOverlayBody.append(none);
    }
    studyOverlayBody.append(makeVerseNavigation());
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
      def.textContent=sotwQuickDisplayMeaning(found.definitions.concise_source_authored,id);
      box.append(def);
      currentLexical={row:found,id,english:descriptor.word};
      // Longer digital-source material is not exposed in this quick reader.
      if(typeof offerWebster1828==='function'){
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
    modernCommentaryMenu,
    // Original ASV 1901 printed scans are a niche source reference.
    // Keep the entry available, but put it after the main study tools.
    document.getElementById('asvSourceEntry')
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
    if(studyView==='dictionary'&&dictionaryReturnToAtlas){
      event.stopImmediatePropagation();
      dictionaryReturnToAtlas=false;
      renderSourceList();
      return;
    }
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
    ++languageGeneration;languageEvidence=[];currentSourceWord=null;dictionaryReturnToAtlas=false;
    languageButton.hidden=true;
    earlierClose();
  };
})();
