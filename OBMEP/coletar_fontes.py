"""Coleta arquivos públicos para conferência; não os inclui no aplicativo distribuído."""
from pathlib import Path
import urllib.request,re,json,concurrent.futures,html
BASE=Path('tmp/acervo');BASE.mkdir(parents=True,exist_ok=True)
def fetch(url,path):
 if path.exists() and path.stat().st_size>100:return path.read_bytes()
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 data=urllib.request.urlopen(req,timeout=60).read();path.write_bytes(data);return data
def run(year):
 url=f'https://www.obmep.org.br/provas-{year}.htm'
 text=fetch(url,BASE/f'{year}.html').decode('utf-8',errors='replace')
 result=[]
 for phase in [1,2]:
  sections=re.findall(r'<h2[^>]*>(.*?)</h2>(.*?)(?=<h2|\Z)',text,re.S)
  matches=[body for title,body in sections if re.search(str(phase)+r'\s*[ªa.]+\s*FASE',title,re.I) and not re.search('MIRIM|CARIOCA',title,re.I)]
  if not matches:
   print(year,phase,'ausente no acervo correto',flush=True);continue
  part=matches[0]
  for kind,icon in [('prova','provas'),('solucao','solucoes')]:
   links=[html.unescape(u) for u,body in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>',part,re.S) if re.search(r'icon-'+icon+r'-n1|level-1',body) and (('PROVA' in body.upper()) if kind=='prova' else ('SOLU' in body.upper() or 'icon-solucoes' in body))]
   if not links:
    links=[html.unescape(u) for u,body in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>',part,re.S) if f'icon-{icon}-n1' in body]
   if not links and kind=='solucao':
    m=re.search(r"window.open\('(https?[^']+)'[^<]*<div[^>]*level-1",part,re.S)
    if m:
     surl=m[1].replace('http:','https:')
     st=fetch(surl,BASE/f'{year}-f{phase}-solucao.html').decode('utf-8',errors='replace')
     pdfs=re.findall(r'(?:href|src)=[\"\']([^\"\']+\.pdf)[\"\']',st,re.I)
     if pdfs:links=[urllib.parse.urljoin(surl,pdfs[0])]
     else:
      result.append(dict(year=year,phase=phase,kind=kind,url=surl,direct=surl,path=str(BASE/f'{year}-f{phase}-solucao.html'),variants=1,source=url));continue
   if not links:raise ValueError((year,phase,kind,'sem link'))
   link=links[0]
   link=urllib.parse.urljoin(url,link)
   m=re.search(r'/file/d/([^/]+)',link)
   direct=f'https://drive.google.com/uc?export=download&id={m[1]}' if m else link
   path=BASE/f'{year}-f{phase}-{kind}.pdf'
   data=fetch(direct,path)
   if not data.startswith(b'%PDF'):raise ValueError((str(path),'não PDF',data[:60]))
   result.append(dict(year=year,phase=phase,kind=kind,url=link,direct=direct,path=str(path),variants=len(links),source=url))
 return result
if __name__=='__main__':
 out=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
  future={ex.submit(run,y):y for y in [2015,2016,2017,2018,2019,2021,2022,2023,2024,2025]}
  for f in concurrent.futures.as_completed(future):
   try:r=f.result();out+=r;print(future[f],len(r),'arquivos',flush=True)
   except Exception as e:print('ERRO',future[f],repr(e),flush=True)
 (BASE/'manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
