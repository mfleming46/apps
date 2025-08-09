(function () {
  const LETTERS = ["A","B","C","D","E","F","G"];

  // ---------- State ----------
  let cards = [];                   // parsed from flash.txt
  let order = [];                   // shuffled indices
  let idx = 0;                      // current index in order
  let started = false;
  let answers = [];                 // {id, question, image, correct, picked, timeMs}
  let mode = "perQuestion";         // 'perQuestion' | 'end'
  let startTime = 0;

  // ---------- Elements ----------
  const elStart     = document.getElementById("start");
  const elSummary   = document.getElementById("summaryList");

  // unified panels
  const elCardBox   = document.getElementById("cardBox");
  const elCardInner = document.getElementById("cardInner");
  const elPanel     = document.getElementById("panel");
  const elFoot      = document.getElementById("foot");

  // start controls
  const elStatus    = document.getElementById("status");
  const elLoader    = document.getElementById("loader");
  const elFile      = document.getElementById("file");
  const elBtnStart  = document.getElementById("btnStart");
  document.querySelectorAll('input[name="mode"]').forEach(r => {
    r.addEventListener("change", () => {
      mode = document.querySelector('input[name="mode"]:checked').value;
    });
  });
  elBtnStart.addEventListener("click", onStart);

  // card content
  const elQText   = document.getElementById("qText");
  const elCounter = document.getElementById("counter");
  const elImg     = document.getElementById("noteImg");
  document.getElementById("btnQuit").addEventListener("click", goStart);

  // summary content
  const elSumTitle   = document.getElementById("sumTitle");
  const elSumStats   = document.getElementById("sumStats");
  const elSumFlow    = document.getElementById("sumFlow");
  const elSumRestart = document.getElementById("sumRestart");
  elSumRestart.addEventListener("click", goStart);

  // keyboard answers (active only when front is shown)
  window.addEventListener("keydown", (e) => {
    const k = (e.key || "").toUpperCase();
    if (!started || elPanel.dataset.mode !== "front") return;
    if (LETTERS.includes(k)) {
      e.preventDefault();
      onPick(k);
    }
  });

  // ---------- Deck loading ----------
  tryFetchDeck();

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
    if (!cards.length) {
      elLoader.classList.remove("hidden");
      elFile.click();
      return;
    }
    begin();
  }

  function begin(){
    order = shuffle(cards.map((_,i)=>i));
    idx = 0; answers = []; started = true;

    show(elCardBox); show(elPanel); show(elFoot);
    hide(elStart); hide(elSummary);

    renderFront();
  }

  function goStart(){
    started = false;
    hide(elCardBox); hide(elPanel); hide(elFoot);
    hide(elSummary); show(elStart);
  }

  function renderFront(){
    const c = cards[ order[idx] ];
    // card panel (no color class)
    elCardInner.classList.remove("ok","bad");
    elQText.textContent = c.question;
    elImg.src = c.image;
    elImg.onerror = () => showFatal("Missing image during quiz: " + escapeHtml(c.image));

    // button panel for front
    elPanel.dataset.mode = "front";
    elPanel.innerHTML = ""; // clear
    LETTERS.forEach(L => {
      const b = document.createElement("button");
      b.textContent = L;
      b.addEventListener("click", () => onPick(L));
      elPanel.appendChild(b);
    });

    // foot panel (identical)
    elCounter.textContent = `Card ${idx+1} / ${order.length}`;
  }

  function renderBack(aIndex){
    const a = answers[aIndex];
    // card panel with pass/fail color
    elCardInner.classList.toggle("ok",  a.picked === a.correct);
    elCardInner.classList.toggle("bad", a.picked !== a.correct);
    elQText.textContent = a.question;
    elImg.src = a.image;

    // button panel for back (results row)
    elPanel.dataset.mode = "back";
    elPanel.innerHTML = "";
    const rYour    = document.createElement("div");
    const rCorrect = document.createElement("div");
    const rTime    = document.createElement("div");
    rYour.textContent    = `Your answer: ${a.picked}`;
    rCorrect.textContent = `Correct: ${a.correct}`;
    rTime.textContent    = `Time: ${(a.timeMs/1000).toFixed(2)}s`;
    const spacer = document.createElement("div"); spacer.className = "spacer";
    const btn    = document.createElement("button"); btn.textContent = "Continue";
    btn.addEventListener("click", nextCardOrSummary);
    elPanel.append(rYour, rCorrect, rTime, spacer, btn);

    // foot panel (identical)
    elCounter.textContent = `Card ${aIndex+1} / ${answers.length}`;
  }

  function onPick(letter){
    const c = cards[ order[idx] ];
    const timeMs = performance.now() - startTime;
    const rec = { id:c.id, question:c.question, image:c.image, correct:c.correct, picked:letter, timeMs };
    answers.push(rec);

    if (mode === "perQuestion") {
      renderBack(answers.length - 1);
    } else {
      nextCardOrSummary();
    }
  }

  function nextCardOrSummary(){
    idx++;
    if (idx >= order.length) {
      showSummaryFlow(); // both modes
    } else {
      renderFront();
      startTime = performance.now();
    }
  }

  // Continuous summary flow (used for BOTH modes)
  function showSummaryFlow(){
    hide(elCardBox); hide(elPanel); hide(elFoot);
    hide(elStart); show(elSummary);

    const correct = answers.filter(a => a.picked === a.correct).length;
    const pct = answers.length ? Math.round(100*correct/answers.length) : 0;
    const avg = answers.length ? (answers.reduce((s,a)=>s+a.timeMs,0)/answers.length/1000).toFixed(2) : "0.00";

    elSumTitle.textContent = "Nice work — quiz complete!";
    elSumStats.textContent = `You answered ${correct} of ${answers.length} correctly (${pct}%). Average time: ${avg}s.`;

    // Build the flow
    elSumFlow.innerHTML = "";
    answers.forEach((a) => {
      const block = document.createElement("div");
      block.className = "cardblock " + (a.picked === a.correct ? "ok" : "bad");
      block.innerHTML = `
        <div class="body">
          <div class="qtext">${escapeHtml(a.question)}</div>
          <div class="imgwrap big"><img src="${escapeHtml(a.image)}" alt=""></div>
        </div>
        <div class="footer">
          <div>Your answer: ${a.picked}</div>
          <div>Correct: ${a.correct}</div>
          <div>Time: ${(a.timeMs/1000).toFixed(2)}s</div>
        </div>`;
      elSumFlow.appendChild(block);
    });
  }

  // helpers
  function shuffle(a){ const x=a.slice(); for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]];} return x; }
  function show(el){ el.classList.remove("hidden"); }
  function hide(el){ el.classList.add("hidden"); }
  function escapeHtml(s){ return String(s).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt'}[c])); }

  function showFatal(html){
    show(elStart);
    elStatus.innerHTML = html;
    elStatus.style.color = "#b2271a";
  }

  // start initial render time when we show first question
  // (set in renderFront)
  const observeFirst = new MutationObserver(() => {
    if (!started || elPanel.dataset.mode !== "front") return;
    startTime = performance.now();
    observeFirst.disconnect();
  });

  // reconnect observer each time we get back to a front panel render
  const origRenderFront = renderFront;
  renderFront = function(){
    origRenderFront.apply(this, arguments);
    observeFirst.disconnect();
    observeFirst.observe(elPanel, { childList:true });
  };
})();
