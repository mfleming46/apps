(function () {
  const LETTERS = ["A","B","C","D","E","F","G"];

  let cards = [];
  let order = [];
  let idx = 0;
  let started = false;
  let answers = [];
  let mode = "perQuestion";
  let startTime = 0;
  let pendingMode = null;
  
  // add near the other state vars at the top of flash.js:
  let lastAttempt = null; // session-only memory of last summary {pct, total, avgTimeSec}

  const elIntro    = document.getElementById("intro");   // NEW: intro container
  const elStart    = document.getElementById("start");
  const elSummary  = document.getElementById("summaryList");

  const elCardBox  = document.getElementById("cardBox");
  const elCardInner= document.getElementById("cardInner");
  const elPanel    = document.getElementById("panel");
  const elFoot     = document.getElementById("foot");

  const elStatus   = document.getElementById("status");
  const elBtnEasy  = document.getElementById("btnEasy");
  const elBtnAdv   = document.getElementById("btnAdvanced");

  elBtnEasy.addEventListener("click", () => selectModeAndStart("perQuestion"));
  elBtnAdv.addEventListener("click",  () => selectModeAndStart("end"));

  const elQText   = document.getElementById("qText");
  const elCounter = document.getElementById("counter");
  const elImg     = document.getElementById("noteImg");
  // document.getElementById("btnQuit").addEventListener("click", goStart);
  document.getElementById("btnQuit").addEventListener("click", onQuit);

  function XonQuit() {

	  // If user has answered any cards, show a partial summary.
	  if (started && answers.length > 0) {
		if (elIntro) elIntro.style.display = "none"; // optional
		showSummaryFlow(true);   // <-- early = true
	  } else {
		goStart("quit");
	  }
	}
	
	function onQuit() {
  if (started && answers.length > 0) {
    lastAttempt = null;                // ← wipe prior score on an incomplete run
    if (elIntro) elIntro.style.display = "none";
    showSummaryFlow(true);             // early summary, no “Up from …” line
  } else {
    goStart("quit");
  }
}


  /* which of these lines can be removed? */
  const elSumTitle   = document.getElementById("sumTitle");
  const elSumStats   = document.getElementById("sumStats");
  const elSumFlow    = document.getElementById("sumFlow");
  const elSumRestart = document.getElementById("sumRestart");
  elSumRestart.addEventListener("click", goStart);
	

  window.addEventListener("keydown", (e) => {
    const k = (e.key || "").toUpperCase();
    if (!started || elPanel.dataset.mode !== "front") return;
    if (["A","B","C","D","E","F","G"].includes(k)) { e.preventDefault(); onPick(k); }
  });

  tryFetchDeck();

  async function tryFetchDeck() {
    elStatus.textContent = "";
    try {
      const res = await fetch("flash.txt", { cache: "no-store" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const text = await res.text();
      await loadFromText(text);
    } catch {
      showFatal("Sorry — couldn’t load the quiz content. Please try reloading the page.");
    }
  }

  async function loadFromText(text) {
    const parsed = parseDeck(text);
    if (!parsed.cards.length) return showFatal("Sorry — no questions are available.");
    const badImages = await checkImages(parsed.cards.map(c => c.image));
    if (badImages.length) return showFatal("Some images couldn’t be loaded. Please try again.");

    cards = parsed.cards;
    elStatus.textContent = "";

    if (pendingMode) { mode = pendingMode; pendingMode = null; begin(); }
  }

  function parseDeck(text) {
    const blocks = text.split(/\n\s*\n+/).map(b=>b.trim()).filter(Boolean);
    const out = [], errors = [];
    blocks.forEach((block, i) => {
      const id   = /(^|\n)id:\s*(.*)/i.exec(block)?.[2]?.trim();
      const q    = /(^|\n)question:\s*(.*)/i.exec(block)?.[2]?.trim();
      const img  = /(^|\n)image:\s*(.*)/i.exec(block)?.[2]?.trim();
      const corr = /(^|\n)correct:\s*([A-G])/i.exec(block)?.[2]?.toUpperCase();
      if (!id || !q || !img || !corr) return;
      out.push({ id, question:q, image:img, correct:corr });
    });
    return { cards: out, errors: [] };
  }

  function checkImages(urls) {
    return Promise.all(urls.map(u => new Promise(res => {
      const img = new Image();
      img.onload = () => res(null);
      img.onerror = () => res(u);
      img.src = u;
    }))).then(xs => xs.filter(Boolean));
  }

  function selectModeAndStart(chosen) {
    pendingMode = chosen;
    if (!cards.length) { elStatus.textContent = "Loading…"; elBtnEasy.disabled = elBtnAdv.disabled = true; return; }
    mode = pendingMode; pendingMode = null; begin();
  }

  function begin(){
	logClick();
    // hide intro beyond the start page
    if (elIntro) elIntro.style.display = "none";

    elBtnEasy.disabled = elBtnAdv.disabled = false;
    elStatus.textContent = "";

    order = shuffle(cards.map((_,i)=>i));
    idx = 0; answers = []; started = true;

    show(elCardBox); show(elPanel); show(elFoot);
    hide(elStart); hide(elSummary);

    renderFront();
  }

  function goStart(){
    started = false;

    // show intro again on restart
    if (elIntro) elIntro.style.display = "";

    hide(elCardBox); hide(elPanel); hide(elFoot);
    hide(elSummary); show(elStart);
  }

  function renderFront(){
	  
	const c = cards[ order[idx] ];
	elCardInner.classList.remove("ok","bad");
	elQText.classList.remove("result");           // ← add
	elQText.textContent = c.question;             // unchanged
	elImg.src = c.image;

    elPanel.dataset.mode = "front";
    elPanel.innerHTML = "";
    ["A","B","C","D","E","F","G"].forEach(L => {
      const b = document.createElement("button");
      b.textContent = L;
      b.addEventListener("click", () => onPick(L));
      elPanel.appendChild(b);
    });

    elCounter.textContent = `Card ${idx+1} / ${order.length}`;
    startTime = performance.now();
  }

  function renderBack(aIndex){
	  
	const a = answers[aIndex];
	const ok = (a.picked === a.correct);
	elCardInner.classList.toggle("ok",  ok);
	elCardInner.classList.toggle("bad", !ok);

	elQText.textContent = ok ? "✅ Correct!" : "❌ Oops.";  // ← replace question
	elQText.classList.add("result");                        // ← optional styling hook

	elImg.src = a.image;  

    elPanel.dataset.mode = "back";
    elPanel.innerHTML = "";
    const rYour    = document.createElement("div");
    const rCorrect = document.createElement("div");
    const rTime    = document.createElement("div");
    rYour.textContent    = `Your answer: ${a.picked}`;
    rCorrect.textContent = `Correct answer: ${a.correct}`;
    rTime.textContent    = `Time: ${(a.timeMs/1000).toFixed(2)}s`;
    const spacer = document.createElement("div"); spacer.className = "spacer";
    const btn    = document.createElement("button"); btn.textContent = "Next Note";
	btn.style.fontWeight = "bold";
    btn.addEventListener("click", nextCardOrSummary);
    elPanel.append(rYour, rCorrect, rTime, spacer, btn);

    elCounter.textContent = `Card ${aIndex+1} / ${answers.length}`;
  }

  function onPick(letter){
    const c = cards[ order[idx] ];
    const timeMs = performance.now() - startTime;
    answers.push({ id:c.id, question:c.question, image:c.image, correct:c.correct, picked:letter, timeMs });

    if (mode === "perQuestion") {
      renderBack(answers.length - 1);
    } else {
      nextCardOrSummary();
    }
  }

  function nextCardOrSummary(){
    idx++;
    if (idx >= order.length) { showSummaryFlow(); }
    else { renderFront(); }
  }


function XshowSummaryFlow(early = false){
  if (elIntro) elIntro.style.display = "none";

  hide(elCardBox); hide(elPanel); hide(elFoot);
  hide(elStart); show(elSummary);

  const attempted = answers.length;
  const totalDeck = order.length;
  const correct   = answers.filter(a => a.picked === a.correct).length;
  const pct       = attempted ? Math.round(100 * correct / attempted) : 0;
  const avgSec    = attempted ? (answers.reduce((s,a)=>s+a.timeMs,0) / attempted / 1000) : 0;

  // badge selection
  let badgeClass = "badge--teal";
  let badgeLabel = "badge";
  if (!early && attempted === totalDeck) {
    if (pct >= 90)      { badgeClass = "badge--gold";   badgeLabel = "gold"; }
    else if (pct >= 80) { badgeClass = "badge--silver"; badgeLabel = "silver"; }
    else                { badgeClass = "badge--teal";   badgeLabel = "complete"; }
  } else {
    badgeLabel = "session";
  }

  // improvement vs last attempt (session only)
  let deltaLine = "";
  if (lastAttempt && lastAttempt.total > 0) {
    const delta = pct - lastAttempt.pct;
    if (delta > 0)      deltaLine = `Up from ${lastAttempt.pct}% last time`;
    else if (delta < 0) deltaLine = `Down from ${lastAttempt.pct}% last time`;
    else                deltaLine = `Same as last time (${lastAttempt.pct}%)`;
  }

  const title = (!early && attempted === totalDeck)
    ? "Nice Work – Quiz complete!"
    : "Incomplete session";

  const line1 = (!early && attempted === totalDeck)
    ? `You answered ${correct} of ${attempted} correctly (${pct}%).`
    : `You attempted ${attempted} of ${totalDeck} cards. Correct: ${correct} (${pct}%).`;

  const line2 = `Your average time to respond was ${avgSec.toFixed(2)}s.`;



  // Build hero per mockup
  const hero = document.createElement("div");
  hero.className = "summary-hero";
  hero.innerHTML = `
    <h2>${title}</h2>
    <div class="hero-row">
      <div class="badge ${badgeClass}">
        <div class="label">${badgeLabel}</div>
        <div class="pct">${pct}%</div>
      </div>
      <div class="hero-stats">
        ${deltaLine ? `<p><b>${deltaLine}</b></p>` : ""}
        <p>${line1}</p>
        <p>${line2}</p>
        <div class="hero-actions">
          <button id="sumRestart">Repeat the quiz</button>
        </div>
        <p class="answers-note">There’s a summary of your answers below</p>
      </div>
    </div>
  `;

  // swap the head with hero
  const head = elSummary.querySelector(".summary-head");
  head.innerHTML = ""; head.appendChild(hero);
  head.querySelector("#sumRestart").addEventListener("click", () => goStart("restart"));

  // answers flow
  elSumFlow.innerHTML = "";
  answers.forEach((a) => {
    const ok = (a.picked === a.correct);
    const block = document.createElement("div");
    block.className = "cardblock " + (ok ? "ok" : "bad");
    block.innerHTML = `
      <div class="body">
        <div class="qtext result">${ok ? "✅ Correct!" : "❌ Oops."}</div>
        <div class="imgwrap big"><img src="${escapeHtml(a.image)}" alt=""></div>
      </div>
      <div class="footer">
        <div>Your answer: ${a.picked}</div>
        <div>Correct answer: ${a.correct}</div>
        <div>Time: ${(a.timeMs/1000).toFixed(2)}s</div>
      </div>`;
    elSumFlow.appendChild(block);
  });

  // remember last attempt for this session
  lastAttempt = { pct, total: attempted, avgTimeSec: Number(avgSec.toFixed(2)) };
}

// === REPLACE your whole showSummaryFlow(early = false) with this ===
function showSummaryFlow(early = false){
  if (elIntro) elIntro.style.display = "none";

  hide(elCardBox); hide(elPanel); hide(elFoot);
  hide(elStart); show(elSummary);

  // ---- compute stats (same math you had) ----
  const attempted = answers.length;
  const totalDeck = order.length;
  const correct   = answers.filter(a => a.picked === a.correct).length;
  const pct       = attempted ? Math.round(100 * correct / attempted) : 0;
  const avgSec    = attempted ? (answers.reduce((s,a)=>s+a.timeMs,0) / attempted / 1000) : 0;

  // ---- mount the hero header ----
  const head = elSummary.querySelector(".summary-head");
  head.innerHTML = '<div id="heroMount"></div>';

  HeroCard.render(document.getElementById("heroMount"), {
    attempted,
    total: totalDeck,
    correct,
    avgSec: Number(avgSec.toFixed(2)),
    lastPct: lastAttempt ? lastAttempt.pct : undefined,  // your session-only memory
    early
  }, {
    // If your medals live in /apps/flash/images/, uncomment and adjust:
    images: { gold: 'images/gold.svg', silver: 'images/silver.svg', teal: 'images/teal.svg' }
  });

  // “Repeat the quiz” button from the hero
  head.addEventListener("hero:restart", () => goStart("restart"));

  // ---- your existing per-card summary flow ----
  elSumFlow.innerHTML = "";
  answers.forEach((a) => {
    const ok = (a.picked === a.correct);
    const block = document.createElement("div");
    block.className = "cardblock " + (ok ? "ok" : "bad");
    block.innerHTML = `
      <div class="body">
        <div class="qtext result">${ok ? "✅ Correct!" : "❌ Oops."}</div>
        <div class="imgwrap big"><img src="${escapeHtml(a.image)}" alt=""></div>
      </div>
      <div class="footer">
        <div>Your answer: ${a.picked}</div>
        <div>Correct answer: ${a.correct}</div>
        <div>Time: ${(a.timeMs/1000).toFixed(2)}s</div>
      </div>`;
    elSumFlow.appendChild(block);
  });

  // ---- remember this attempt (session-only) ----
  //lastAttempt = { pct, total: attempted, avgTimeSec: Number(avgSec.toFixed(2)) };
	
	// remember last attempt only for full completions
  if (!early && answers.length === order.length) {
		lastAttempt = { pct, total: answers.length, avgTimeSec: Number(avgSec.toFixed(2)) };
	}
	
}



  function logClick() {
  fetch('../log.php?page=flash', { method: 'GET' })
  console.log("click logged");
}


  // utils
  
  function shuffle(a){ const x=a.slice(); for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [x[i],x[j]]=[x[j],x[i]];} return x; } 
  // function shuffle(a) { return a; }
  function show(el){ el.classList.remove("hidden"); }
  function hide(el){ el.classList.add("hidden"); }
  function escapeHtml(s){ return String(s).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  function showFatal(msg){
    show(elStart);
    if (elIntro) elIntro.style.display = ""; // still show intro for errors
    elStatus.textContent = msg;
    elStatus.style.color = "#b2271a";
  }
})();
