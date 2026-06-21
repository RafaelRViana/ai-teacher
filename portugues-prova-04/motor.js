const LS_KEY = "portuguesProva04GameV1";
const RANKS = ["Aprendiz", "Investigador", "Estrategista", "Mestre das Palavras", "Guardiao da Prova"];

let progress = loadProgress();
let session = null;
let timer = null;

function loadProgress() {
  const base = { xp: 0, bestArena: 0, bossWon: false, zones: Array(10).fill(0), seen: [] };
  try {
    return { ...base, ...(JSON.parse(localStorage.getItem(LS_KEY)) || {}) };
  } catch {
    return base;
  }
}

function saveProgress() {
  localStorage.setItem(LS_KEY, JSON.stringify(progress));
}

function show(id) {
  clearTimer();
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "hub") updateHub();
}

function goHub() {
  updateHub();
  show("hub");
}

function updateHub() {
  const level = Math.floor(progress.xp / 100) + 1;
  const rank = RANKS[Math.min(RANKS.length - 1, Math.floor((level - 1) / 3))];
  document.getElementById("rankName").textContent = rank;
  document.getElementById("lvlNum").textContent = `Nv. ${level}`;
  document.getElementById("xpFill").style.width = `${progress.xp % 100}%`;
  document.getElementById("xpLabel").textContent = `${progress.xp % 100} / 100 XP`;
  document.getElementById("journeyBadge").textContent = `${progress.zones.filter(Boolean).length}/10`;
  document.getElementById("arenaBadge").textContent = `Rec: ${progress.bestArena}`;
  const bossOpen = progress.zones.filter(Boolean).length >= 7;
  document.getElementById("bossBadge").textContent = bossOpen ? (progress.bossWon ? "Vencido" : "Aberto") : "Bloqueado";
  document.getElementById("introStats").innerHTML = `
    <span class="mini-stat"><b>${QUESTIONS.length}</b> desafios</span>
    <span class="mini-stat"><b>${progress.zones.filter(Boolean).length}</b> zonas</span>
    <span class="mini-stat"><b>${progress.bestArena}</b> arena</span>`;
}

function openMap() {
  const list = document.getElementById("mapList");
  const unlocked = progress.zones.filter(Boolean).length;
  list.innerHTML = "";
  ZONES.forEach((z, i) => {
    const isOpen = i <= unlocked;
    const stars = progress.zones[i] || 0;
    const div = document.createElement("div");
    div.className = `zone ${isOpen ? (stars ? "" : "available") : "locked"}`;
    div.onclick = () => isOpen && startJourney(i);
    div.innerHTML = `
      <div class="zicon">${stars ? "⭐" : isOpen ? "🎯" : "🔒"}</div>
      <div class="zinfo"><h3>${i + 1}. ${z.name}</h3><p>${z.goal}</p><div class="zstars">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div></div>
      <div class="zlock">${isOpen ? "›" : ""}</div>`;
    list.appendChild(div);
  });
  show("map");
}

function startJourney(index) {
  const z = ZONES[index];
  startSession({
    mode: "journey",
    zone: index,
    title: `Zona ${index + 1}`,
    total: 12,
    lives: 3,
    timed: false,
    questions: pickQuestions(z.topic, z.diff, 12)
  });
}

function startArena() {
  startSession({
    mode: "arena",
    title: "Arena",
    total: 35,
    lives: 3,
    timed: true,
    timeLimit: 22,
    questions: pickQuestions("mix", 3, 35, true)
  });
}

function startBoss() {
  if (progress.zones.filter(Boolean).length < 7) {
    alert("Venca pelo menos 7 zonas para abrir o Chefao.");
    return;
  }
  startSession({
    mode: "boss",
    title: "Chefao",
    total: 20,
    lives: 2,
    timed: true,
    timeLimit: 26,
    questions: pickQuestions("mix", 3, 20, true)
  });
}

function startSession(config) {
  clearTimer();
  session = {
    ...config,
    index: 0,
    score: 0,
    combo: 1,
    maxCombo: 1,
    correct: 0,
    mistakes: [],
    answered: false
  };
  show("game");
  renderQuestion();
}

function pickQuestions(topic, diff, total, hardMix = false) {
  const pool = QUESTIONS.filter(q => {
    const topicOk = topic === "mix" ? true : (q.topic === topic || q.topic === "mix");
    const diffOk = hardMix ? q.diff >= 2 : q.diff <= diff + 1;
    return topicOk && diffOk;
  });
  const weakSeen = new Set((progress.seen || []).slice(-40));
  const fresh = shuffleCopy(pool.filter(q => !weakSeen.has(q.id)));
  const backup = shuffleCopy(pool);
  const chosen = [];
  while (chosen.length < total && (fresh.length || backup.length)) {
    const next = fresh.shift() || backup.shift();
    if (next && !chosen.some(q => q.id === next.id)) chosen.push(next);
  }
  return chosen;
}

function renderQuestion() {
  clearTimer();
  session.answered = false;
  const q = session.questions[session.index];
  if (!q) return finishSession();

  document.getElementById("hMode").textContent = `${session.title} ${session.index + 1}/${session.total}`;
  document.getElementById("hScore").textContent = `Pts ${session.score}`;
  document.getElementById("hCombo").textContent = `Combo x${session.combo}`;
  document.getElementById("hLives").textContent = "♥".repeat(session.lives);
  document.getElementById("pFill").style.width = `${(session.index / session.total) * 100}%`;

  const typeClass = q.topic === "num" ? "t-num" : q.topic === "adj" ? "t-adj" : "t-mix";
  const context = q.context ? `<div class="q-context">${q.context}</div>` : "";
  const body = q.type === "type" ? renderTyped(q) : renderOptions(q);
  document.getElementById("qCard").innerHTML = `
    <span class="q-type ${typeClass}">${q.typeLabel || "Desafio"}</span>
    <div class="q-text">${q.text}</div>
    ${context}
    ${body}
    <div class="fb" id="feedback"></div>
    <button class="btn-next" id="btnNext" onclick="nextQuestion()">Continuar</button>`;

  if (q.type === "type") {
    const input = document.getElementById("typedAnswer");
    input.focus();
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") checkTyped();
    });
  }
  if (session.timed) startTimer(session.timeLimit);
}

function renderOptions(q) {
  const options = normalizeOptions(q.options, q.answer);
  return `<div class="opts ${options.some(o => o.length > 26) ? "col1" : ""}">
    ${options.map(o => `<button class="opt" onclick="checkOption(this, '${escapeForAttr(o)}')">${o}</button>`).join("")}
  </div>`;
}

function renderTyped() {
  return `<div class="typed-wrap">
    <input class="typed-input" id="typedAnswer" autocomplete="off" placeholder="Digite sua resposta">
    <button class="btn-check" onclick="checkTyped()">Conferir</button>
  </div>`;
}

function normalizeOptions(options, answer) {
  const out = [];
  [...(options || []), answer].forEach(o => {
    if (o && !out.includes(o)) out.push(o);
  });
  return shuffleCopy(out).slice(0, Math.max(4, Math.min(6, out.length)));
}

function escapeForAttr(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function checkOption(btn, selected) {
  if (session.answered) return;
  const q = session.questions[session.index];
  const ok = selected === q.answer;
  document.querySelectorAll(".opt").forEach(opt => {
    opt.disabled = true;
    if (opt.textContent === q.answer) opt.classList.add("correct");
    else if (opt === btn) opt.classList.add("wrong");
    else opt.classList.add("dim");
  });
  resolveAnswer(ok, q);
}

function checkTyped() {
  if (session.answered) return;
  const q = session.questions[session.index];
  const input = document.getElementById("typedAnswer");
  const value = clean(input.value);
  const ok = (q.accepted || [q.answer]).some(ans => clean(ans) === value);
  input.disabled = true;
  input.style.borderColor = ok ? "var(--green)" : "var(--red)";
  resolveAnswer(ok, q);
}

function clean(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function resolveAnswer(ok, q) {
  clearTimer();
  session.answered = true;
  progress.seen = [...(progress.seen || []), q.id].slice(-120);
  const feedback = document.getElementById("feedback");
  const next = document.getElementById("btnNext");

  if (ok) {
    const gained = 10 * session.combo + q.diff * 3;
    session.score += gained;
    session.correct++;
    session.combo++;
    session.maxCombo = Math.max(session.maxCombo, session.combo);
    feedback.className = "fb show ok";
    feedback.innerHTML = `<span class="fb-head">Acertou!</span>+${gained} pontos. ${q.explanation || ""}`;
    pulseCombo();
  } else {
    session.lives--;
    session.combo = 1;
    session.mistakes.push(q);
    feedback.className = "fb show no";
    feedback.innerHTML = `<span class="fb-head">Resposta: ${q.answer}</span>${q.explanation || "Revise essa ideia antes de continuar."}`;
  }

  updateHeader();
  saveProgress();
  next.classList.add("show");

  if (session.lives <= 0 && session.mode !== "journey") {
    next.textContent = "Ver resultado";
  }
}

function updateHeader() {
  document.getElementById("hScore").textContent = `Pts ${session.score}`;
  document.getElementById("hCombo").textContent = `Combo x${session.combo}`;
  document.getElementById("hLives").textContent = "♥".repeat(Math.max(0, session.lives));
}

function pulseCombo() {
  const pill = document.getElementById("hCombo");
  pill.classList.add("bump");
  setTimeout(() => pill.classList.remove("bump"), 220);
  if (session.combo > 2) {
    const flash = document.getElementById("comboFlash");
    flash.textContent = `Combo x${session.combo}!`;
    flash.classList.remove("go");
    void flash.offsetWidth;
    flash.classList.add("go");
  }
}

function nextQuestion() {
  if (session.lives <= 0 && session.mode !== "journey") return finishSession();
  session.index++;
  if (session.index >= session.total) return finishSession();
  renderQuestion();
}

function startTimer(seconds) {
  const bar = document.getElementById("timerBar");
  const fill = document.getElementById("timerFill");
  bar.classList.add("show");
  const start = Date.now();
  timer = setInterval(() => {
    const left = Math.max(0, seconds * 1000 - (Date.now() - start));
    fill.style.width = `${(left / (seconds * 1000)) * 100}%`;
    if (left <= 0) {
      clearTimer();
      if (!session.answered) {
        const q = session.questions[session.index];
        resolveAnswer(false, q);
      }
    }
  }, 120);
}

function clearTimer() {
  if (timer) clearInterval(timer);
  timer = null;
  const bar = document.getElementById("timerBar");
  if (bar) bar.classList.remove("show");
}

function finishSession() {
  clearTimer();
  const accuracy = Math.round((session.correct / session.total) * 100);
  const xp = Math.max(8, session.correct * 6 + Math.floor(session.score / 30));
  progress.xp += xp;

  if (session.mode === "journey") {
    const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
    progress.zones[session.zone] = Math.max(progress.zones[session.zone] || 0, stars);
    saveProgress();
    showResult(stars, accuracy, xp);
    return;
  }

  if (session.mode === "arena") progress.bestArena = Math.max(progress.bestArena, session.correct);
  if (session.mode === "boss" && accuracy >= 80 && session.lives > 0) progress.bossWon = true;
  saveProgress();
  showGameOver(accuracy, xp);
}

function showResult(stars, accuracy, xp) {
  show("result");
  document.getElementById("resIcon").textContent = stars >= 2 ? "🏆" : stars === 1 ? "🧭" : "📚";
  document.getElementById("resTitle").textContent = stars ? "Zona concluida!" : "Zona em treino";
  document.getElementById("resStars").textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
  document.getElementById("resBox").innerHTML = resultRows(accuracy, xp);
  document.getElementById("resMsg").textContent = stars >= 2 ? "Boa! A proxima zona ficou mais perto." : "Revise o feedback e tente novamente para desbloquear melhor pontuacao.";
  document.getElementById("resNext").onclick = () => openMap();
}

function showGameOver(accuracy, xp) {
  show("gameover");
  const wonBoss = session.mode === "boss" && progress.bossWon;
  document.getElementById("goIcon").textContent = wonBoss ? "🏆" : session.correct >= 20 ? "⚔️" : "📚";
  document.getElementById("goTitle").textContent = wonBoss ? "Chefao vencido!" : "Rodada encerrada";
  document.getElementById("goBox").innerHTML = resultRows(accuracy, xp);
  document.getElementById("goMsg").textContent = reviewMessage();
  document.getElementById("goRetry").onclick = () => session.mode === "boss" ? startBoss() : startArena();
}

function resultRows(accuracy, xp) {
  return `
    <div class="res-row"><span>Acertos</span><b>${session.correct}/${session.total}</b></div>
    <div class="res-row"><span>Aproveitamento</span><b>${accuracy}%</b></div>
    <div class="res-row"><span>Pontuacao</span><b>${session.score}</b></div>
    <div class="res-row"><span>Maior combo</span><b>x${Math.max(1, session.maxCombo - 1)}</b></div>
    <div class="res-row"><span>XP ganho</span><b>${xp}</b></div>`;
}

function reviewMessage() {
  if (!session.mistakes.length) return "Rodada limpa. Excelente dominio.";
  const topics = [...new Set(session.mistakes.slice(0, 3).map(q => q.typeLabel || "desafio"))].join(", ");
  return `Para subir mais, revise: ${topics}. O jogo vai misturar esses pontos nas proximas rodadas.`;
}

function quitGame() {
  clearTimer();
  if (confirm("Sair desta rodada? O progresso da rodada atual sera perdido.")) show("hub");
}

function resetProgress() {
  if (!confirm("Zerar todo o progresso deste jogo?")) return;
  progress = { xp: 0, bestArena: 0, bossWon: false, zones: Array(10).fill(0), seen: [] };
  saveProgress();
  updateHub();
}

function openStudy() {
  studyTab(0, document.querySelector(".s-tab"));
  show("study");
}

function studyTab(index, btn) {
  document.querySelectorAll(".s-tab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.getElementById("studyContent").innerHTML = STUDY_DATA[index].html;
}

updateHub();
