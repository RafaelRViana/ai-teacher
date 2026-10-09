const {chromium}=require('/Users/rafaelviana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
const assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Chromium.app/Contents/MacOS/Chromium'});
 const page=await browser.newPage({viewport:{width:1100,height:850}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///Users/rafaelviana/Documents/ChatGPT/OBMEP/index.html');
 await page.locator('[data-tab="study"]').click();assert.equal(await page.locator('.lesson').count(),8);assert.equal(await page.locator('.exercise').count(),24);
 await page.locator('[data-tab="games"]').click();
 await page.locator('#coin-a').fill('1');await page.locator('#game form button').click();assert((await page.locator('.answer').innerText()).includes('Faltam'));
 for(const [a,b] of [[6,0],[3,2],[0,4]]){await page.locator('#coin-a').fill(String(a));await page.locator('#coin-b').fill(String(b));await page.locator('#game form button').click();}
 assert((await page.locator('.answer').innerText()).includes('todas as 3'));
 await page.locator('#game-select').selectOption('fractions');for(let i=0;i<4;i++)await page.locator('.cell').nth(i).click();await page.locator('.check').click();assert((await page.locator('.answer').innerText()).includes('Isso!'));
 await page.locator('#game-select').selectOption('area');for(const i of [0,1,2,6,7,8])await page.locator('.cell').nth(i).click();await page.locator('.check').click();assert((await page.locator('.answer').innerText()).includes('concluída'));
 await page.locator('#game-select').selectOption('nim');for(let i=0;i<4;i++)await page.locator('[data-take="3"]').click();assert((await page.locator('.answer').innerText()).includes('venceu!'));assert(await page.locator('[data-take="1"]').isDisabled());
 await page.locator('.next').click();await page.locator('[data-take="1"]').click();assert((await page.locator('.answer').innerText()).includes('retirou 3'));
 await page.setViewportSize({width:390,height:844});await page.locator('#game-select').selectOption('area');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
 fs.mkdirSync('tmp/pdfs',{recursive:true});await page.screenshot({path:'tmp/pdfs/jogo-mobile.png',fullPage:true});
 await page.setViewportSize({width:1100,height:850});await page.locator('[data-tab="study"]').click();await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
 await page.addStyleTag({content:'@media print { #plan,#sources{display:block!important} #sources{break-before:page} .solutions details{break-inside:avoid} #study>h2{break-before:page} }'});
 fs.mkdirSync('output/pdf',{recursive:true});await page.pdf({path:'output/pdf/obmep-nivel-1-estudo.pdf',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:9px;width:100%;text-align:center;color:#526971">Laboratório de matemática · Nível 1 · <span class="pageNumber"></span> / <span class="totalPages"></span></div>'});
 assert.deepEqual(errors,[]);await browser.close();console.log('Verificado: 8 lições, 24 exercícios, erros e acertos dos jogos, término de partida, estratégia do computador, largura móvel e ausência de erros JavaScript. PDF gerado.');
})();
