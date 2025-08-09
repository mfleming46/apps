(function () {
  const LETTERS = ["A","B","C","D","E","F","G"];

  // ---------- State ----------
  let cards = [];                   // from flash.txt
  let order = [];                   // shuffled index list
  let idx = 0;                      // current card index within order during quiz
  let started = false;
  let answers = [];                 // {id, question, image, correct, picked, timeMs}
  let mode = "perQuestion";         // 'perQuestion' | 'end'
  let startTime = 0;

  // ---------- Elements ----------
  const elStart   = document.getElementById("start");
  const elQuiz    = document.getElementById("quiz");
  const elReveal  = document.getElementById("reveal");

  const elStatus  = document.getElementById("status");
  const elLoader  = document.getElementById("loader");
  const elFile    = document.getElementById("file");

  // start screen controls
  document.querySelectorAll('input[name="mode"]').forEach(r => {
    r.addEventListener("change", () => {
      mode = document.querySelector('input[name="mode"]:checked').value;
    });
  });
  document.getElementById("btnStart").addEventListener("click", onStart);

  // quiz screen
  const elQText   = document.getElementById("qText");
  const elCounter = document.getElementById("counter");
  const elImg     = document.getElementById("noteImg");
  const elAnswers = document.getElementById("answers");
  document.getElementById("btnQuit").addEventListener("click", onQuit);

  // reveal screen
  const elRImg    = document.getElementById("rImg");
  const elRQText  = document.getElementById("rQText");
  const elRCounter= document.getElementById("rCounter");
  const elRYour   = document.getElementById("rYour");
  const elRCorrect= document.getElementById("rCorrect");
  const elRTime   = document.getElementById("rTime");
  const elRPrev   = document.getElementById("rPrev");
  const elRNext   = document.getElementById("rNext");
  const elRDone   = document.getElementById("rDone");

  // buttons A–G
  LETTERS.forEach(L => {
    const b = document.createElement("button");
    b.textContent = L;
    b.addEventListener("click", () => onPick(L));
    elAnswers.appendChild(b);
  });

  // keyboard
  window.addEventListener("keydown", (e) => {
    const k = (e.key || "").toUpperCase();
    if (!started || isShowingReveal()) return;
    if (LETTERS.includes(k)) {
      e.preventDefault();
      onPick(k);
    }
  });

  // reveal nav
  elRPrev.addEventListener("click", () => reviewMove(-1));
  elRNext.addEventListener("click", () => reviewMove(+1));
  elRDone.addEventListener("click", () => goStart());

  // ---------- Deck loading ----------
  tryFetchDeck(); // auto-load if possible; else show picker

  async function tryFetchDeck() {
    try {
      const res = await fetch("flash.txt", { cache: "no-store" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const text = await res.text();
      await loadFromText(text, "flash.txt");
    } catch (err) {
      elStatus.textContent = "Auto-load failed. Choose flash.txt…";
      elLoader.classList.remove("hidden");
      elFile.addEventListener("change", async (e) => {
        const f = e.target.files[0]; if (!f) return;
        const t = await f.text();
        await loadFromText(t, f.name);
      }, { once:true });
    }
  }

  async function loadFromText(text, label) {
    const parsed = parseDeck(text);
    if (!parsed.cards.length) return showFatal("No valid cards in " + label + list(parsed.errors));
    const badImages = await checkImages(parsed.cards.map(c => c.image));
    if (badImages.length) return showFatal("Image(s) not found:" + list(badImages));
    cards = parsed.cards;
    elStatus.textContent = "Loaded " + label + ` — ${cards.length} cards`;
    elLoader.classList.add("hidden");
    document.getElementById("btnStart").disabled = false;
  }

  function parseDeck(text) {
    const blocks = text.split(/\n\s*\n+/).map(b=>b.trim()).filter(Boolean);
    const out = [], errors = [];
    blocks.forEach((block, i) => {
      const id   = /(^|\n)id:\s*(.*)/i.exec(block)?.[2]?.trim();
      const q    = /(^|\n)question:\s*(.*)/i.exec(block)?.[2]?.trim();
      const img  = /(^|\n)image:\s*(.*)/i.exec(block)?.[2]?.trim();
      const corr = /(^|\n)correct:\s*([A-G])/i.exec(block)?.[2]?.toUpperCase();
      const tag  = `(card ${i+1})`;
      if (!id)   { errors.push(`${tag} missing id`); return; }
      if (!q)    { errors.push(`${tag} ${id} missing question`); return; }
      if (!img)  { errors.push(`${tag} ${id} missing image`); return; }
      if (!corr || !"ABCDEFG".includes(corr)) { errors.push(`${tag} ${id} invalid correct`); return; }
      out.push({ id, question:q, image:img, correct:corr });
    });
    return { cards: out, errors };
  }

  function list(arr){ return "<ul class='meta' style='margin:6px 0 0 18px'>" + arr.map(s=>`<li>${escapeHtml(s)}</li>`).join("") + "</ul>"; }
  function escapeHtml(s){ return String(s).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  function checkImages(urls) {
    return Promise.all(urls.map(u => new Promise(res => {
      const img = new Image();
      img.onload = () => res(null);
      img.onerror = () => res(u);
      img.src = u;
    }))).then(xs => xs.filter(Boolean));
  }

  // ---------- Flow ----------
  function onStart(){
    if (!cards.length) return alert("Deck not loaded yet.");
    begin();
  }

  function begin(){
    order = shuffle(cards.map((_,i)=>i));
    idx = 0; answers = []; started = true;
    show(elQuiz); hide(elStart); hide(elReveal);
    renderCard();
  }

  function onQuit(){
    if (confirm("Quit the quiz and return to the start? Progress will be lost.")) {
      goStart();
    }
  }

  function goStart(){
    started = false;
    hide(elQuiz); hide(elReveal); show(elStart);
  }

  function renderCard(){
    const c = cards[ order[idx] ];
    elQText.textContent = c.question;
    elCounter.textContent = `Card ${idx+1} / ${order.length}`;
    elImg.src = c.image;
    elImg.onerror = () => showFatal("Missing image during quiz: " + escapeHtml(c.image));
    // enable all buttons
    [...elAnswers.children].forEach(btn => { btn.classList.remove("ok","bad"); btn.disabled=false; });
    startTime = performance.now();
  }

  function onPick(letter){
    const c = cards[ order[idx] ];
    const timeMs = performance.now() - startTime;
    const record = { id:c.id, question:c.question, image:c.image, correct:c.correct, picked:letter, timeMs };
    answers.push(record);

    // per-question -> reveal now; end -> move on
    if (mode === "perQuestion") {
      showReveal(answers.length-1);   // show just answered
    } else {
      nextCard();
    }
  }

  function nextCard(){
    idx++;
    if (idx >= order.length) {
      // finished: review starts at first answer
      showReveal(0);
    } else {
      renderCard();
    }
  }

  // Reveal/review (shared layout)
  function showReveal(index){
    hide(elQuiz); hide(elStart); show(elReveal);
    // clamp
    index = Math.max(0, Math.min(index, answers.length-1));
    elReveal.dataset.index = String(index);

    const a = answers[index];
    elReveal.classList.toggle("ok",  a.picked === a.correct);
    elReveal.classList.toggle("bad", a.picked !== a.correct);

    elRQText.textContent = a.question;
    elRImg.src = a.image;
    elRCounter.textContent = `Card ${index+1} / ${answers.length}`;
    elRYour.textContent = `Your answer: ${a.picked}`;
    elRCorrect.textContent = `Correct: ${a.correct}`;
    elRTime.textContent = `Time: ${(a.timeMs/1000).toFixed(2)}s`;

    // nav buttons
    const atStart = index === 0;
    const atEnd   = index === answers.length-1;

    elRPrev.disabled = atStart;
    elRNext.disabled = atEnd && mode === "perQuestion"; // in perQuestion, Next should move to next quiz card
    elRDone.textContent = (mode === "perQuestion" ? "Continue" : (atEnd ? "Done" : "Back to quiz"));
  }

  // Review nav handler
  function reviewMove(step){
    const index = Number(elReveal.dataset.index || "0");
    const next = index + step;

    if (mode === "perQuestion") {
      // per-question: only allow Next (step +1) to continue the quiz
      if (step < 0) return;
      hide(elReveal); show(elQuiz);
      nextCard();
    } else {
      // end review: navigate answers
      const clamped = Math.max(0, Math.min(next, answers.length-1));
      showReveal(clamped);
    }
  }

  function isShowingReveal(){ return !elReveal.classList.contains("hidden"); }

  // helpers
  function shuffle(a){ const x=a.slice(); for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]];} return x; }
  function show(el){ el.classList.remove("hidden"); }
  function hide(el){ el.classList.add("hidden"); }

  function showFatal(html){
    show(elStart); hide(elQuiz); hide(elReveal);
    elStatus.innerHTML = html;
    elStatus.style.color = "#b2271a";
  }
})();
