from pathlib import Path
import json,re,subprocess,concurrent.futures,io,base64
import pdfplumber
from PIL import Image,ImageChops,ImageOps,ImageDraw
BASE=Path('tmp/acervo'); R=Path('tmp/recortes');R.mkdir(exist_ok=True)
qs=json.loads(Path('output/banco-questoes.json').read_text())
if isinstance(qs,dict): qs=qs['questions']
def analyze(year):
 rows=[]
 with pdfplumber.open(BASE/f'{year}-f1-prova.pdf') as doc:
  for pi,p in enumerate(doc.pages):
   words=p.extract_words()
   if not words:
    img=sorted((BASE/f'{year}-f1-prova-ocr').glob('p-*.png'))[pi]
    w,h=Image.open(img).size
    tsv=subprocess.run(['tesseract',str(img),'stdout','--psm','3','tsv'],capture_output=True,check=True).stdout.decode()
    import csv
    words=[{'text':r['text'],'x0':float(r['left'])*p.width/w,'top':float(r['top'])*p.height/h} for r in csv.DictReader(io.StringIO(tsv),delimiter='\t') if r['text'].strip()]
   anchors=[]
   for w in words:
    m=re.fullmatch(r'(\d{1,2})[.]',w['text'])
    if m and (abs(w['x0']-28)<5 or abs(w['x0']-(296 if year==2019 else 303))<5) and (pi>0 or w['top']>390):
     n=int(m[1]);
     if 1<=n<=20:anchors.append({'n':n,'x':w['x0'],'y':w['top'],'page':pi+1,'width':p.width,'height':p.height})
   rows.extend(anchors)
 return year,rows
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex: anchors=dict(ex.map(analyze,sorted({q['year'] for q in qs if q['phase']==1})))
Path('tmp/recortes/anchors.json').write_text(json.dumps(anchors,indent=2))
for year,rows in anchors.items():print(year,[(r['n'],r['page'],round(r['x']),round(r['y'])) for r in rows],flush=True)
for year,rows in anchors.items():
 assert sorted(a['n'] for a in rows)==list(range(1,21)),(year,'Faltam âncoras')

def render(pair):
 year,phase=pair
 folder=R/f'{year}-f{phase}';folder.mkdir(exist_ok=True)
 if not (folder/'p-1.png').exists():
  subprocess.run(['pdftoppm','-r','180','-png',str(BASE/f'{year}-f{phase}-prova.pdf'),str(folder/'p')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 print('Renderizado',year,phase,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:list(ex.map(render,sorted({(q['year'],q['phase']) for q in qs})))
assets={};metadata=[]
for q in qs:
 year,phase,n=q['year'],q['phase'],q['number']
 with pdfplumber.open(BASE/f'{year}-f{phase}-prova.pdf') as doc:
  pg=doc.pages[q['page']-1];pw,ph=float(pg.width),float(pg.height)
 im=Image.open(R/f'{year}-f{phase}'/f"p-{q['page']}.png").convert('RGB');sx,sy=im.width/pw,im.height/ph
 if phase==1:
  a=next(x for x in anchors[year] if x['n']==n);assert a['page']==q['page'],q
  isleft=a['x']<100;mid=290 if year==2019 else 297
  following=[x['y'] for x in anchors[year] if x['page']==a['page'] and (x['x']<100)==isleft and x['y']>a['y']]
  box=[20 if isleft else mid,a['y']-12,mid if isleft else pw-18,min(following)-12 if following else ph-19]
   if (year,n) in {(2015,13),(2016,13),(2017,6),(2017,14),(2018,4),(2018,14),(2019,12),(2022,1),(2022,3),(2023,3)}:box[1]=a['y']-3
  if year<=2019 and q['page']==4:box[3]=min(box[3],730)
 else:box=[20,34 if year==2021 else 55,pw-20,ph-23]
 crop=im.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(box)))
 # Trim only exterior white margins, retaining a white safety border.
 mask=ImageOps.grayscale(crop).point(lambda v:255 if v<235 else 0)
 bbox=mask.getbbox();assert bbox,q
 crop=ImageOps.expand(crop.crop(bbox),border=14,fill='white')
 out=R/(q['id']+'.webp');crop.save(out,'WEBP',quality=90,method=6)
 assets[q['id']]={'src':'data:image/webp;base64,'+base64.b64encode(out.read_bytes()).decode(),'width':crop.width,'height':crop.height}
 metadata.append({'id':q['id'],'year':year,'phase':phase,'number':n,'page':q['page'],'box':box,'size':[crop.width,crop.height]})
Path('questoes-imagens.js').write_text('window.OBMEP_IMAGES='+json.dumps(assets,separators=(',',':'))+';\n')
(R/'recortes.json').write_text(json.dumps(metadata,indent=2))
for year,phase in sorted({(q['year'],q['phase']) for q in qs}):
 subset=[q for q in qs if (q['year'],q['phase'])==(year,phase)]
 cols=4 if phase==1 else 3;cw,ch=(400,480) if phase==1 else (450,630)
 sheet=Image.new('RGB',(cols*cw,((len(subset)+cols-1)//cols)*ch),'#d8e3e1');draw=ImageDraw.Draw(sheet)
 for i,q in enumerate(subset):
  tile=Image.open(R/(q['id']+'.webp'));tile.thumbnail((cw-12,ch-35))
  x,y=(i%cols)*cw,(i//cols)*ch;draw.text((x+8,y+4),q['id'],fill='black');sheet.paste(tile,(x+(cw-tile.width)//2,y+27))
 sheet.save(R/f'contato-{year}-f{phase}.jpg',quality=90)
print('Concluído:',len(assets),'recortes;',Path('questoes-imagens.js').stat().st_size,'bytes',flush=True)
