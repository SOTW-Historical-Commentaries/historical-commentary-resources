/* Verify SOTW-only page works from its own path while sharing published resources. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  for(const dir of ['mobile-bible-beta','mobile-bible-sotw']){
   await page.goto('http://127.0.0.1:8765/'+dir+'/?book=ROM&chapter=12&verse=17&translation=BSB',{waitUntil:'domcontentloaded'});
   await page.locator('#verses .reader-verse[data-verse="17"]').waitFor({state:'visible'});
   const state=await page.evaluate(async()=>{
    const m=await fetch(document.querySelector('link[rel=manifest]').href).then(r=>r.json());
    const icon=new URL(m.icons[0].src,document.querySelector('link[rel=manifest]').href);
    const iconResult=await fetch(icon);
    return {appName:m.name,shortName:m.short_name,icon:icon.href,iconStatus:iconResult.status,
      apple:document.querySelector('link[rel=apple-touch-icon]').href,
      title:document.querySelector('meta[name=apple-mobile-web-app-title]').content,
      logo:document.querySelector('.reader-brandmark img').src,
      site:location.pathname};
   });
   assert.equal(state.appName,'Study Bible');
   assert.equal(state.shortName,'Study Bible');
   assert.equal(state.title,'Study Bible');
   assert.equal(state.iconStatus,200);
   assert(state.apple.includes(dir+'/icons/'));
   assert(state.icon.includes(dir+'/icons/'));
   assert(state.logo.includes(dir==='mobile-bible-beta'?'cgbc-sotw-full-header':'mobile-bible-sotw/branding/v1/SOTW_Bible_and_Name_Transparent.png'));
   if(dir==='mobile-bible-sotw'){
    const branding=await page.evaluate(async()=>{
      const primary=document.querySelector('.sotw-header-art.dark');
      const alternate=document.querySelector('.sotw-header-art.light');
      const first=await fetch(primary.src);
      const second=await fetch(alternate.src);
      const initial={visible:getComputedStyle(primary).display!=='none',width:primary.getBoundingClientRect().width,
         height:primary.getBoundingClientRect().height,alternateHidden:getComputedStyle(alternate).display==='none',
         fits:primary.getBoundingClientRect().right<=document.querySelector('.brand-line').getBoundingClientRect().right};
      document.body.classList.add('beta-light');
      const switched={darkHidden:getComputedStyle(primary).display==='none',
       lightVisible:getComputedStyle(alternate).display!=='none',width:alternate.getBoundingClientRect().width};
      document.body.classList.remove('beta-light');
      return {initial,switched,firstStatus:first.status,secondStatus:second.status};
    });
    assert.equal(branding.firstStatus,200);
    assert.equal(branding.secondStatus,200);
    assert(branding.initial.visible&&branding.initial.alternateHidden&&branding.initial.width>150&&branding.initial.height>35&&branding.initial.fits,
      'Wide supplied header must be visible and fit the phone '+JSON.stringify(branding));
    assert(branding.switched.darkHidden&&branding.switched.lightVisible&&branding.switched.width>150,
      'Light theme must switch to supplied dark-gray wordmark '+JSON.stringify(branding));
   }
   assert(state.site.includes(dir));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: both 390px reader instances load published Romans verse, own manifest/icon, proper branded header and Study Bible label');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
