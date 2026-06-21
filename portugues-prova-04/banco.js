const ZONES = [
  { name: "Acampamento dos Numerais", topic: "num", diff: 1, goal: "Identifique quantidade, ordem, multiplicacao e fracao." },
  { name: "Trilha dos Cardinais", topic: "num", diff: 1, goal: "Separe numeral de algarismo e reconheca quantidades." },
  { name: "Ponte dos Ordinais", topic: "num", diff: 2, goal: "Reconheca posicao em sequencias." },
  { name: "Oficina dos Multiplos", topic: "num", diff: 2, goal: "Diferencie dobro, triplo, metade, terco e companhia." },
  { name: "Jardim dos Adjetivos", topic: "adj", diff: 1, goal: "Descubra a palavra que caracteriza o substantivo." },
  { name: "Laboratorio da Formacao", topic: "adj", diff: 2, goal: "Classifique adjetivos simples, compostos, primitivos e derivados." },
  { name: "Torre da Flexao", topic: "adj", diff: 2, goal: "Treine genero, numero, uniforme e biforme." },
  { name: "Escada dos Graus", topic: "adj", diff: 3, goal: "Compare igualdade, superioridade, inferioridade e superlativo." },
  { name: "Camara dos Sentidos", topic: "mix", diff: 3, goal: "Interprete numeral e adjetivo no contexto." },
  { name: "Portal da Prova", topic: "mix", diff: 3, goal: "Misture tudo em questoes de alto cuidado." }
];

const STUDY_DATA = [
  {
    title: "Numeral",
    html: `
      <div class="card">
        <h3>O que e numeral?</h3>
        <p>Numeral e a palavra que representa numero e pode indicar <b>quantidade</b>, <b>ordem/posicao</b>, <b>multiplicacao</b> ou <b>fracao</b>.</p>
        <div class="ex">O Brasil foi o <span class="hl">primeiro</span> pais a ganhar quatro Copas. / Joana comeu <span class="hl">um terco</span> da torta.</div>
      </div>
      <div class="card">
        <h3>Classificacao dos numerais</h3>
        <table class="tbl"><tr><th>Tipo</th><th>Ideia</th><th>Exemplo</th></tr>
        <tr><td>Cardinal</td><td>Quantidade exata</td><td>dois bilhoes, trinta dias</td></tr>
        <tr><td>Ordinal</td><td>Posicao em sequencia</td><td>primeiro, segundo, decimo</td></tr>
        <tr><td>Multiplicativo</td><td>Multiplicacao</td><td>dobro, triplo, quadruplo</td></tr>
        <tr><td>Fracionario</td><td>Divisao ou parte</td><td>meio, metade, terco</td></tr></table>
        <p><b>Zero</b> e <b>ambos</b> tambem podem funcionar como numerais. Algarismos como 30 sao simbolos; palavras como trinta sao numerais escritos por extenso.</p>
      </div>
      <div class="card">
        <h3>Armadilhas frequentes</h3>
        <ul><li><b>Primeiro</b> nao indica quantidade: indica posicao.</li><li><b>Dobro</b> e multiplicativo; <b>metade</b> e fracionario.</li><li>Um mesmo valor pode aparecer como algarismo ou por extenso.</li></ul>
      </div>`
  },
  {
    title: "Adjetivo",
    html: `
      <div class="card">
        <h3>O que e adjetivo?</h3>
        <p>Adjetivo e a palavra que caracteriza um substantivo, atribuindo qualidade, estado, modo de ser ou origem.</p>
        <div class="ex">uma estrela <span class="hl">enorme</span> e <span class="hl">reluzente</span>; um gato <span class="hl">fofo</span>; mar <span class="hl">feroz</span>.</div>
      </div>
      <div class="card">
        <h3>Formacao dos adjetivos</h3>
        <table class="tbl"><tr><th>Tipo</th><th>Como reconhecer</th><th>Exemplo</th></tr>
        <tr><td>Simples</td><td>Uma palavra</td><td>unica, enorme</td></tr>
        <tr><td>Composto</td><td>Mais de uma palavra ou radical</td><td>verde-azulado</td></tr>
        <tr><td>Primitivo</td><td>Nao vem de outra palavra</td><td>velho, bom</td></tr>
        <tr><td>Derivado</td><td>Vem de substantivo ou verbo</td><td>numeroso, brasileiro</td></tr></table>
      </div>
      <div class="card">
        <h3>Flexao e grau</h3>
        <p>Adjetivos variam em <b>genero</b>, <b>numero</b> e <b>grau</b>. Podem ser <b>biformes</b>, quando mudam para masculino e feminino, ou <b>uniformes</b>, quando mantem uma unica forma.</p>
        <ul><li>Biforme: frio/fria, rancoroso/rancorosa.</li><li>Uniforme: triste, reluzente, simples.</li><li>Comparativo: tao inteligente quanto; mais inteligente que; menos inteligente que.</li><li>Superlativo: muito inteligente, inteligentissima.</li></ul>
      </div>`
  }
];

const QUESTIONS = [];

function add(q) {
  QUESTIONS.push({ ...q, id: q.id || `q${QUESTIONS.length + 1}` });
}

function shuffleCopy(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function addMc(topic, diff, typeLabel, text, context, options, answer, explanation) {
  add({ type: "mc", topic, diff, typeLabel, text, context, options, answer, explanation });
}

function addType(topic, diff, typeLabel, text, context, answer, accepted, explanation) {
  add({ type: "type", topic, diff, typeLabel, text, context, answer, accepted: accepted || [answer], explanation });
}

const numeralExamples = [
  ["dois bilhoes", "cardinal", "Indica quantidade determinada."],
  ["quatro Copas", "cardinal", "Quantifica o substantivo Copas."],
  ["30 dias", "cardinal", "O valor informa a quantidade de dias."],
  ["primeiro dia", "ordinal", "Indica posicao em uma sequencia."],
  ["segundo pais", "ordinal", "Mostra a posicao do pais em uma ordem."],
  ["decimo capitulo", "ordinal", "Decimo marca posicao."],
  ["dobro da laranja", "multiplicativo", "Dobro indica multiplicacao por dois."],
  ["triplo de pontos", "multiplicativo", "Triplo indica multiplicacao por tres."],
  ["quadruplo de figurinhas", "multiplicativo", "Quadruplo indica multiplicacao por quatro."],
  ["um terco da torta", "fracionario", "Terco representa uma parte dividida em tres."],
  ["metade do bolo", "fracionario", "Metade representa uma parte de duas."],
  ["meio copo", "fracionario", "Meio indica fracao de uma unidade."],
  ["zero na serie", "cardinal", "Zero pode indicar quantidade inexistente."],
  ["ambos os alunos", "cardinal", "Ambos equivale a os dois."],
  ["centenas de fotos", "cardinal", "Centenas expressa quantidade."],
  ["mil vezes", "cardinal", "Mil quantifica a repeticao."],
  ["terceiro quadrinho", "ordinal", "Terceiro indica posicao na tirinha."],
  ["duplo sentido", "multiplicativo", "Duplo expressa ideia de dois."],
  ["quinto andar", "ordinal", "Quinto indica posicao."],
  ["um quarto da pizza", "fracionario", "Quarto indica uma parte de quatro."]
];

const numKinds = ["cardinal", "ordinal", "multiplicativo", "fracionario"];
for (const [expr, kind, exp] of numeralExamples) {
  addMc("num", kind === "cardinal" ? 1 : 2, "Numeral", `Que tipo de numeral aparece em: "${expr}"?`, "", shuffleCopy(numKinds), kind, exp);
  addMc("num", 2, "Funcao do numeral", `Qual e a funcao de "${expr}"?`, "", shuffleCopy(["indicar quantidade", "indicar posicao", "indicar multiplicacao", "indicar fracao"]), {
    cardinal: "indicar quantidade",
    ordinal: "indicar posicao",
    multiplicativo: "indicar multiplicacao",
    fracionario: "indicar fracao"
  }[kind], exp);
}

[
  ["Cardinal", "Indica quantidade determinada.", "Cardinal responde a quantos."],
  ["Ordinal", "Indica posicao em uma sequencia.", "Ordinal organiza em primeiro, segundo, terceiro..."],
  ["Multiplicativo", "Indica multiplicacao de uma quantidade.", "Dobro, triplo e quadruplo sao multiplicativos."],
  ["Fracionario", "Indica divisao ou parte de um todo.", "Meio, metade, terco e quarto sao fracionarios."]
].forEach(([answer, clue, exp]) => addMc("num", 1, "Conceito", clue, "", shuffleCopy(["Cardinal", "Ordinal", "Multiplicativo", "Fracionario"]), answer, exp));

[
  ["Escreva por extenso o numeral 30.", "trinta", ["trinta"], "30 e o algarismo; trinta e a forma por extenso."],
  ["Escreva por extenso o numeral 2.", "dois", ["dois", "duas"], "A forma por extenso pode variar em genero quando acompanha substantivo."],
  ["Qual palavra equivale a 'os dois'?", "ambos", ["ambos", "ambas"], "Ambos e ambas indicam duas pessoas ou coisas."],
  ["Complete: Joana comeu um ___ da torta.", "terco", ["terco", "1/3"], "Um terco e numeral fracionario."],
  ["Complete: Marta usa o ___ de ovos de Maria.", "dobro", ["dobro"], "Dobro e multiplicativo."],
  ["Complete: O Brasil foi o ___ pais a ganhar quatro Copas.", "primeiro", ["primeiro"], "Primeiro indica posicao."],
  ["Que numeral indica multiplicacao por tres?", "triplo", ["triplo"], "Triplo quer dizer tres vezes."],
  ["Que numeral fracionario indica uma parte de duas?", "metade", ["metade", "meio"], "Metade e meio indicam metade de um todo."]
].forEach(([text, answer, accepted, exp]) => addType("num", 2, "Resposta curta", text, "", answer, accepted, exp));

const adjectiveExamples = [
  ["unica", "simples", "E formado por uma unica palavra."],
  ["enorme", "simples", "E uma unica palavra."],
  ["reluzente", "simples", "E uma unica palavra."],
  ["verde-azulado", "composto", "Tem mais de um elemento de formacao."],
  ["bem-velho", "composto", "Apresenta composicao por mais de um elemento."],
  ["velho", "primitivo", "Nao se origina de outra palavra no exercicio."],
  ["bom", "primitivo", "E base para outras formas."],
  ["numeroso", "derivado", "Origina-se de numero."],
  ["brasileiro", "derivado", "Deriva de Brasil."],
  ["amoroso", "derivado", "Deriva de amor."],
  ["rancoroso", "derivado", "Deriva de rancor."],
  ["gentil", "simples", "Tem uma unica forma lexical."],
  ["fotogênico", "derivado", "Deriva de fotografia/foto."],
  ["inteligente", "simples", "E uma unica palavra."],
  ["azul-marinho", "composto", "Adjetivo composto por dois elementos."],
  ["infantil", "derivado", "Deriva de infancia/infante."]
];
const formKinds = ["simples", "composto", "primitivo", "derivado"];
for (const [expr, kind, exp] of adjectiveExamples) {
  addMc("adj", kind === "simples" ? 1 : 2, "Formacao do adjetivo", `Quanto a formacao, "${expr}" e um adjetivo:`, "", shuffleCopy(formKinds), kind, exp);
}

const genderExamples = [
  ["triste", "uniforme", "Uma unica forma serve para masculino e feminino."],
  ["reluzente", "uniforme", "Nao muda em o/a: menino reluzente, menina reluzente."],
  ["simples", "uniforme", "Mantem a mesma forma nos dois generos."],
  ["feliz", "uniforme", "Feliz serve para ele e ela."],
  ["jovem", "uniforme", "Jovem nao muda no feminino."],
  ["frio", "biforme", "Varia para fria."],
  ["rancoroso", "biforme", "Varia para rancorosa."],
  ["bom", "biforme", "Varia para boa."],
  ["maravilhoso", "biforme", "Varia para maravilhosa."],
  ["otimo", "biforme", "Varia para otima."]
];
for (const [expr, kind, exp] of genderExamples) {
  addMc("adj", 2, "Genero do adjetivo", `Quanto ao genero, "${expr}" e:`, "", shuffleCopy(["uniforme", "biforme"]), kind, exp);
}

const pluralExamples = [
  ["triste", "tristes"], ["mau", "maus"], ["feliz", "felizes"], ["elementar", "elementares"],
  ["cidadao", "cidadaos"], ["bom", "bons"], ["azul", "azuis"], ["espanhol", "espanhóis"],
  ["febril", "febris"], ["infantil", "infantis"], ["fertil", "ferteis"], ["portugues", "portugueses"],
  ["simples", "simples"], ["jovem", "jovens"], ["gentil", "gentis"], ["cruel", "crueis"]
];
for (const [singular, plural] of pluralExamples) {
  addType("adj", 3, "Plural dos adjetivos", `Escreva o plural de "${singular}".`, "", plural, [plural, plural.normalize("NFD").replace(/[\u0300-\u036f]/g, "")], `O plural esperado e "${plural}".`);
}

[
  ["Marcela e tao inteligente quanto Patricia.", "igualdade", "Tao... quanto indica comparativo de igualdade."],
  ["Marcela e mais inteligente que Patricia.", "superioridade", "Mais... que indica superioridade."],
  ["Marcela e menos inteligente que Patricia.", "inferioridade", "Menos... que indica inferioridade."],
  ["Marcela e muito inteligente.", "absoluto analitico", "Muito + adjetivo forma superlativo absoluto analitico."],
  ["Marcela e inteligentissima.", "absoluto sintetico", "O sufixo -issima marca superlativo absoluto sintetico."],
  ["Marcela e a mais inteligente da turma.", "relativo de superioridade", "A mais... da turma compara Marcela ao grupo."],
  ["Marcela e a menos inteligente da turma.", "relativo de inferioridade", "A menos... da turma indica inferioridade dentro do grupo."]
].forEach(([ctx, answer, exp]) => addMc("adj", 3, "Grau do adjetivo", "Que grau do adjetivo aparece no periodo?", ctx, shuffleCopy(["igualdade", "superioridade", "inferioridade", "absoluto analitico", "absoluto sintetico", "relativo de superioridade", "relativo de inferioridade"]).slice(0, 4).includes(answer) ? shuffleCopy(["igualdade", "superioridade", "inferioridade", answer]) : shuffleCopy(["igualdade", "superioridade", "inferioridade", answer]), answer, exp));

[
  ["Na frase 'Meu cachorro e encantador', qual palavra e adjetivo?", "encantador", ["encantador"], "Encantador caracteriza cachorro."],
  ["Na frase 'Me tira daqui!', ha adjetivo?", "nao", ["nao", "não"], "A frase expressa pedido, sem palavra caracterizando substantivo."],
  ["No meme do gato, quais adjetivos podem caracterizar o bicho?", "carinhoso", ["carinhoso", "delicado", "esperto", "engracado", "engraçado"], "A resposta deve atribuir uma caracteristica ao gato."],
  ["Na publicidade 'mar feroz', a palavra 'feroz' caracteriza qual substantivo?", "mar", ["mar"], "Feroz qualifica mar em sentido figurado."],
  ["Em 'planeta verde-azulado', o adjetivo e simples ou composto?", "composto", ["composto"], "Verde-azulado une dois elementos."],
  ["Em 'uma estrela enorme', qual e o substantivo caracterizado?", "estrela", ["estrela"], "Enorme caracteriza estrela."]
].forEach(([text, answer, accepted, exp]) => addType("adj", 2, "Contexto", text, "", answer, accepted, exp));

[
  ["O Facebook tem mais de dois bilhoes de usuarios.", "dois bilhoes", "numeral cardinal", "Dois bilhoes quantifica usuarios."],
  ["Havia uma unica estrela, enorme e reluzente.", "unica", "adjetivo", "Unica caracteriza estrela; embora tenha ideia de numero, funciona como qualidade no contexto."],
  ["O primeiro capitulo foi curto.", "primeiro", "numeral ordinal", "Primeiro indica posicao."],
  ["A noite era fria, mas rancorosa.", "fria", "adjetivo biforme", "Fria caracteriza noite e varia de frio."],
  ["Mais de um terco dos estudantes construiu tirinhas.", "um terco", "numeral fracionario", "Um terco indica parte."],
  ["O jogador marcou o triplo de pontos.", "triplo", "numeral multiplicativo", "Triplo indica tres vezes."],
  ["A pagina estava ilegivel e confusa.", "ilegivel", "adjetivo", "Ilegivel caracteriza pagina."],
  ["Ambas trabalharam na mesma sede.", "ambas", "numeral cardinal", "Ambas equivale a as duas."]
].forEach(([ctx, focus, answer, exp]) => addMc("mix", 3, "Prova mista", `No contexto, "${focus}" funciona como:`, ctx, shuffleCopy(["numeral cardinal", "numeral ordinal", "numeral multiplicativo", "numeral fracionario", "adjetivo", "adjetivo biforme"]).slice(0, 3).concat(answer).filter((v, i, a) => a.indexOf(v) === i), answer, exp));

for (let i = 1; i <= 24; i++) {
  const ex = numeralExamples[i % numeralExamples.length];
  addMc("mix", (i % 3) + 1, "Desafio relampago", `Escolha a analise correta de "${ex[0]}".`, "", shuffleCopy([
    `${ex[1]}: ${ex[2]}`,
    "adjetivo: caracteriza um substantivo",
    "substantivo: nomeia um ser",
    "verbo: indica acao"
  ]), `${ex[1]}: ${ex[2]}`, ex[2]);
}
