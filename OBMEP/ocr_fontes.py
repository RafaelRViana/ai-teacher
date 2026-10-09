from pathlib import Path
import subprocess,concurrent.futures
BASE=Path('tmp/acervo')
def run(stem):
 folder=BASE/(stem+'-ocr');folder.mkdir(exist_ok=True)
 subprocess.run(['pdftoppm','-r','130','-png',str(BASE/(stem+'.pdf')),str(folder/'p')],check=True,stdout=subprocess.DEVNULL)
 pages=[]
 for p in sorted(folder.glob('p-*.png')):
  out=subprocess.run(['tesseract',str(p),'stdout','-l','eng'],capture_output=True,check=True).stdout.decode();pages.append(out)
 (BASE/(stem+'-ocr.txt')).write_text('\n\f\n'.join(pages));print(stem,'OCR pronto',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:list(ex.map(run,['2022-f1-prova','2022-f2-prova','2023-f1-prova','2023-f2-prova']))
