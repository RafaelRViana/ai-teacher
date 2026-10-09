from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json,base64,pdfplumber
R=Path('tmp/recortes');rows=json.loads((R/'recortes.json').read_text());anchors=json.loads((R/'anchors.json').read_text())
for q in rows:
 year,phase,n=q['year'],q['phase'],q['number'];changed=False
 if phase==2 and year==2021:q['box'][1]=34;changed=True
 if phase==1:
  if (year,n) in {(2015,13),(2016,13),(2017,6),(2017,14),(2018,4),(2018,14),(2019,12),(2022,1),(2022,3),(2023,3)}:
   q['box'][1]=next(a['y'] for a in anchors[str(year)] if a['n']==n)-3;changed=True
  if year<=2019 and q['page']==4:q['box'][3]=min(q['box'][3],730);changed=True
 if not changed:continue
 im=Image.open(R/f'{year}-f{phase}'/f"p-{q['page']}.png").convert('RGB')
 with pdfplumber.open(f'tmp/acervo/{year}-f{phase}-prova.pdf') as doc:
  pg=doc.pages[q['page']-1];pw,ph=float(pg.width),float(pg.height)
 crop=im.crop(tuple(round(v*(im.width/pw if i%2==0 else im.height/ph)) for i,v in enumerate(q['box'])))
 bbox=ImageOps.grayscale(crop).point(lambda v:255 if v<235 else 0).getbbox()
 crop=ImageOps.expand(crop.crop(bbox),border=14,fill='white');crop.save(R/(q['id']+'.webp'),'WEBP',quality=90,method=6);q['size']=[crop.width,crop.height]
assets={}
for q in rows:
 out=R/(q['id']+'.webp');w,h=Image.open(out).size
 assets[q['id']]={'src':'data:image/webp;base64,'+base64.b64encode(out.read_bytes()).decode(),'width':w,'height':h}
Path('questoes-imagens.js').write_text('window.OBMEP_IMAGES='+json.dumps(assets,separators=(',',':'))+';\n');(R/'recortes.json').write_text(json.dumps(rows,indent=2))
for year,phase in sorted({(q['year'],q['phase']) for q in rows}):
 subset=[q for q in rows if (q['year'],q['phase'])==(year,phase)]
 cols=4 if phase==1 else 3;cw,ch=(400,480) if phase==1 else (450,630)
 sheet=Image.new('RGB',(cols*cw,((len(subset)+cols-1)//cols)*ch),'#d8e3e1');draw=ImageDraw.Draw(sheet)
 for i,q in enumerate(subset):
  tile=Image.open(R/(q['id']+'.webp'));tile.thumbnail((cw-12,ch-35));x,y=(i%cols)*cw,(i//cols)*ch;draw.text((x+8,y+4),q['id'],fill='black');sheet.paste(tile,(x+(cw-tile.width)//2,y+27))
 sheet.save(R/f'contato-{year}-f{phase}.jpg',quality=90)
print('Recortes corrigidos e reexportados')
