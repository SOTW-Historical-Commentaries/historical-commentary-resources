#!/usr/bin/env python3
"""Test the four patched test readers with a local HTTP staging root.
Default port 8765. Standard playwright Python, system Chromium.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE='http://127.0.0.1:8765/'
TESTS=[
 ('NUM 31 excludes KD Sinai','review-numbers-v3.html?chapter=31&verse=31&a=jamieson-fausset-brown&b=keil-delitzsch',{'right':['Introduction · Numbers'], 'right_absent':['Preparations at Sinai'], 'left':['Numbers 31 · passage heading']}),
 ('NUM 5 includes KD Sinai','review-numbers-v3.html?chapter=5&verse=1&a=jamieson-fausset-brown&b=keil-delitzsch',{'right':['Preparations at Sinai']}),
 ('NUM out-of-range deep link falls back','review-numbers-v3.html?chapter=31&verse=31&a=jamieson-fausset-brown&b=keil-delitzsch&rightSection=nav%3Akeil-delitzsch%3ANUM%3AP%3Apreparations-at-sinai',{'right_absent':['Preparations at Sinai'],'right_selected_verse':True}),
 ('LEV 6 excludes general rules but includes laws','review-leviticus-v3.html?chapter=6&verse=1&a=john-gill&b=keil-delitzsch',{'right':['Sacrificial laws'],'right_absent':['General sacrificial rules']}),
 ('LEV 4 includes rules','review-leviticus-v3.html?chapter=4&verse=1&a=john-gill&b=keil-delitzsch',{'right':['General sacrificial rules']}),
 ('EXO 13:3 excludes early heading','review-exodus-v3.html?chapter=13&verse=3&a=jamieson-fausset-brown&b=john-gill',{'left_absent':['Exodus 13 · passage heading'],'left':['Exodus 13 · chapter heading']}),
 ('EXO 13:2 includes early heading','review-exodus-v3.html?chapter=13&verse=2&a=jamieson-fausset-brown&b=john-gill',{'left':['Exodus 13 · passage heading']}),
 ('GEN 2:3 cross-chapter KD creation','review-v3.html?chapter=2&verse=3&a=keil-delitzsch&b=john-gill',{'left':['The Creation of the World']}),
 ('GEN 2:4 excludes KD creation','review-v3.html?chapter=2&verse=4&a=keil-delitzsch&b=john-gill',{'left_absent':['The Creation of the World']}),
 ('GEN no foreign group intros','review-v3.html?chapter=1&verse=1&a=jamieson-fausset-brown&b=john-gill',{'left_absent':['poetical books','prophetical books','restoration'],'left':['Pentateuch and historical books']}),
]
def main():
 results=[]
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
   page=browser.new_page(viewport={'width':1350,'height':900})
   for name,uri,cases in TESTS:
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    response=page.goto(BASE+uri,wait_until='networkidle',timeout=15000)
    page.wait_for_timeout(100)
    body=page.locator('#pane-left').inner_text()+page.locator('#pane-right').inner_text()
    selects={side:[x.inner_text() for x in page.locator(f'#{side}-mode option').all()] for side in ('left','right')}
    selected={side:page.locator(f'#{side}-mode').input_value() for side in ('left','right')}
    success=response.status==200 and not errors and 'Unable to' not in page.locator('body').inner_text()
    detail=[]
    for k,v in cases.items():
     if k in ('left','right','left_absent','right_absent'):
      side='left' if k.startswith('left') else 'right'; opt='\n'.join(selects[side]).lower();
      for term in v:
       hit=term.lower() in opt
       okay=not hit if k.endswith('_absent') else hit
       detail.append({'check':k+' '+term,'pass':okay});success=success and okay
     elif k=='right_selected_verse':
      okay=selected['right']=='verse';detail.append({'check':k,'pass':okay});success=success and okay
    results.append({'test':name,'status':'PASS' if success else 'FAIL','details':detail,'errors':errors})
    if name=='NUM 5 includes KD Sinai':
     sel=page.locator('#right-mode')
     options=sel.locator('option').all()
     match=[o.get_attribute('value') for o in options if 'Preparations at Sinai' in o.inner_text()]
     if match:
      sel.select_option(match[0]);page.wait_for_timeout(200)
      s=page.locator('#pane-right').inner_text()
      okay='Preparations for the Departure of Israel from Sinai' in s
      results.append({'test':'NUM 5 KD overview fetched from NUM chapter 1','status':'PASS' if okay else 'FAIL','details':[{'check':'source text appears','pass':okay}]})
    if name=='GEN 2:3 cross-chapter KD creation':
     sel=page.locator('#left-mode');opt=[o.get_attribute('value') for o in sel.locator('option').all() if 'Creation of the World' in o.inner_text()]
     if opt:
      sel.select_option(opt[0]);page.wait_for_timeout(200)
      text=page.locator('#pane-left').inner_text();okay='The account of the creation' in text
      results.append({'test':'GEN 2:3 KD overview retrieved from GEN chapter 1','status':'PASS' if okay else 'FAIL','details':[{'check':'source text appears','pass':okay}]})
   page.screenshot(path='/mnt/data/SOTW_Navigation_Scope_Correction_v1/tests/NUMBER_SCOPE_CORRECTION_BROWSER.png',full_page=True)
   browser.close()
 except Exception as e:
  results.append({'test':'browser runtime','status':'BLOCKED','exception':str(e)})
 report={'status':'PASS' if all(x['status']=='PASS' for x in results) else 'FAIL','kind':'sotw_four_book_navigation_scope_browser_test','tests':results}
 Path('/mnt/data/SOTW_Navigation_Scope_Correction_v1/tests/BROWSER_SCOPE_SMOKE_REPORT.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report,indent=2)[:18000])
 if report['status']!='PASS':raise SystemExit(1)
if __name__=='__main__':main()
