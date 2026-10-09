from pathlib import Path
import re
s=Path('index.html').read_text()
s=s.replace('<link rel="stylesheet" href="banco.css">','<style>'+Path('banco.css').read_text()+'</style>')
for src in re.findall(r'<script src="([^"]+)"></script>',s):
 text=Path(src).read_text();assert '</script' not in text.lower(),src
 s=s.replace(f'<script src="{src}"></script>','<script>\n'+text+'\n</script>')
Path('output/banco-e-jogos.html').write_text(s)
Path('output/LEIA-ME.txt').write_text('''BANCO POR TEMAS — OBMEP NÍVEL 1

Abra banco-e-jogos.html em um navegador (Chrome, Edge, Firefox ou Safari).
O arquivo contém o programa, os metadados das questões, o material de estudo e os oito jogos.

SIMULADO NA TELA
Abra a aba Simulado na tela para resolver sem internet: oito questões adaptadas
de provas oficiais e 24 modelos autorais, com valores sorteados e soluções locais.
Escolha 5, 10 ou 20 questões, o tema e a origem. Filtros menores usam todos os
modelos disponíveis, sem repeti-los. A correção aparece somente ao finalizar.
No formato discursivo, os problemas são autorais e pedem justificativa; a
correção é uma autoavaliação. Não reproduz uma prova oficial da segunda fase.
Recarregar retoma o simulado salvo. Sortear nova prova cria outra versão.

COMO USAR
1. Escolha um tema e, se quiser, uma fase, ano, andamento ou palavra de busca.
2. Abra uma questão ou monte um treino de 5, 10 ou 20 questões.
3. Leia o recorte da questão na própria tela. Use Ampliar questão se necessário.
4. Resolva antes de consultar a solução. A primeira fase corrige a alternativa;
   a segunda pede comparação com a solução e autoavaliação das justificativas.
5. No filtro "Para revisar", retome os erros e as questões resolvidas com ajuda.

INTERNET E REGISTROS
Os 240 enunciados estão incorporados como recortes dos PDFs oficiais e podem
ser lidos sem internet, com as figuras e alternativas preservadas. As soluções
oficiais e os links externos precisam de internet. Jogos, lições e filtros são offline.
Os resultados e rascunhos ficam somente no navegador atual. Podem desaparecer ao
limpar os dados do navegador ou mudar o caminho do arquivo. Use "Baixar registro
do estudo" para guardar uma cópia de consulta (não há importador nesta versão).

COBERTURA
240 questões: 180 objetivas e 60 discursivas.
214 de 2016–2025 e 26 de 2015 como extra, desativado inicialmente.
2020: não há edição separada no acervo consultado.
2021: incluída a segunda fase; a primeira fase do Nível 1 não foi localizada
no acervo público oficial consultado. Provas Carioca e Mirim foram excluídas.
Um caderno por ano/fase. Em 2024 e 2025 usamos o primeiro caderno listado,
sem somar as versões alternativas. As letras do gabarito pertencem a essa versão.
Os itens a, b, c de uma questão discursiva permanecem reunidos na mesma questão.

AUTORIA E FONTES
Questões e soluções oficiais: OBMEP/IMPA — https://www.obmep.org.br/provas.htm
Classificação, títulos editoriais, lições e jogos: material de apoio independente.
Consulta e revisão: 08/10/2026. Sem vínculo ou endosso oficial da OBMEP/IMPA.
banco-questoes.json contém o catálogo em formato estruturado para uso futuro.
A apostila PDF da primeira entrega permanece como introdução. O material ampliado,
com 40 exercícios autorais e 16 exemplos, está no arquivo digital desta versão.
''')
print('Aplicativo exportado:',len(s.encode()),'bytes')
