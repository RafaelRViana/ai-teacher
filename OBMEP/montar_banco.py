from pathlib import Path
import json,re,collections
base=Path('tmp/acervo');manifest=json.loads((base/'manifest.json').read_text())
sources={(r['year'],r['phase'],r['kind']):r for r in manifest}
old={2015:'E C A C D A E C E E B C B B D D E D A D'.split(),2016:'B B B C C B E A A B C D E D D A A D C E'.split(),2017:'A B C D E C D B D B E B A D C A D A C E'.split()}
keys={};solpages={}
for year in [2015,2016,2017,2018,2019,2022,2023,2024,2025]:
 if year in old:keys[year]={i+1:a for i,a in enumerate(old[year])};continue
 text=(base/f'{year}-f1-solucao.txt').read_text();answers={}
 for page,body in enumerate(text.split('\f'),1):
  # Some layouts put a figure caption on the same line as the question heading.
  for m in re.finditer(r'QUEST[ÃA]O\s*(\d+)(.*?)ALTERNATIVA\s*([ABCDE])',body,re.I|re.S):
   if len(m[2])<200:answers[int(m[1])]=m[3].upper();solpages[(year,int(m[1]))]=page
 assert len(answers)==20,(year,answers)
 keys[year]=answers
bounds={2015:[3,9,15,20],2016:[4,10,16,20],2017:[4,10,16,20],2018:[4,10,16,20],2019:[3,8,14,20],2022:[4,11,15,20],2023:[3,9,15,20],2024:[3,10,16,20],2025:[4,10,16,20]}
rows=[];counts=collections.Counter()
for line in Path('classificacao.txt').read_text().splitlines():
 if not line or line.startswith('#'):continue
 year,phase,topics,sub,title=line.split(';');year=int(year);phase=int(phase)
 counts[year,phase]+=1;q=counts[year,phase]
 source=sources[year,phase,'prova'];sol=sources[year,phase,'solucao']
 record=dict(id=f'{year}-f{phase}-q{q:02}',year=year,phase=phase,number=q,topics=list(map(int,topics.split(','))),subtopic=sub,title=title,page=next(i+1 for i,b in enumerate(bounds[year]) if q<=b) if phase==1 else q+1,source=source['url'],solution=sol['url'],answer=keys[year][q] if phase==1 else None,solutionPage=solpages.get((year,q)) if phase==1 else None)
 if year in old:
  text=(base/f'{year}-f{phase}-solucao.html').read_text()
  videos=re.findall(r'<question\s+img="([^"]+)"\s+video="([^"]+)"',text)
  if q<=len(videos):record['video']='https://www.youtube.com/watch?v='+videos[q-1][1]
 rows.append(record)
assert len(rows)==240
assert all(c==(20 if p==1 else 6) for (y,p),c in counts.items())
assert len({x['id'] for x in rows})==240
assert all(re.fullmatch('[ABCDE]',x['answer']) for x in rows if x['phase']==1)
payload={'checked':'2026-10-08','questions':rows,'coverage':{'window':'2016–2025','main':214,'extra2015':26,'total':240,'unavailable':['2020: nenhuma edição separada no acervo','2021: primeira fase do Nível 1 não localizada no acervo público oficial consultado'],'variants':'Um caderno por ano/fase. Em 2024 e 2025, primeiro caderno listado; não agregamos versões alternativas.'}}
Path('banco-dados.js').write_text('window.OBMEP_BANK = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
Path('output/banco-questoes.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2))
print('Banco validado:',len(rows),'questões;',sum(x['phase']==1 for x in rows),'objetivas;',sum(x['phase']==2 for x in rows),'discursivas.')
print('Temas:',dict(collections.Counter(t for x in rows for t in x['topics'])))
