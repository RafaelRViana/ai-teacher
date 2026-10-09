from pathlib import Path
import re,urllib.request,urllib.parse,json,subprocess,concurrent.futures
base=Path('tmp/acervo');jobs=[]
for y in [2015,2016,2017]:
 text=(base/f'{y}-f1-solucao.html').read_text()
 for i,src in enumerate(re.findall(r'<question\s+img="([^"]+)"',text),1):
  jobs.append((y,i,urllib.parse.urljoin(f'https://www.obmep.org.br/provas_static/{y}/',src)))
def run(j):
 y,q,url=j;p=base/f'{y}-f1-q{q}-solucao.png'
 if not p.exists():p.write_bytes(urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40).read())
 txt=subprocess.run(['tesseract',str(p),'stdout','-l','eng'],capture_output=True,check=True).stdout.decode()
 p.with_suffix('.txt').write_text(txt)
 m=re.search(r'ALTERNATIVA\s*[:\-–]?\s*([ABCDE])',txt,re.I)
 return {'year':y,'question':q,'answer':m[1].upper() if m else None,'url':url,'header':txt[:120]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:out=list(ex.map(run,jobs))
(base/'respostas-antigas.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
for x in out: print(x['year'],x['question'],x['answer'],x['header'][:55].replace('\n',' '))
