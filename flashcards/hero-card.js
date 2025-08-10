/* ===== hero-card.js — summary hero (uses external medal SVGs) ===== */
/* Exposes HeroCard.render(mountEl, stats, opts)  — opts: { images? } */

(function (global) {
  function chooseBadge(pct, attempted, total, early) {
    if (!early && attempted === total) {
      if (pct >= 90)      return ["gold",   "gold"];
      else if (pct >= 80) return ["silver", "silver"];
      else                return ["teal",   "complete"]; // finished but <80
    }
    return ["teal", "session"]; // partial/early
  }

  function render(mountEl, stats, opts) {
    if (!mountEl) throw new Error("HeroCard.render: mountEl missing");
    const o = Object.assign({ images:{} }, opts || {});

    const attempted = Number(stats.attempted || 0);
    const total     = Number(stats.total || 0);
    const correct   = Number(stats.correct != null ? stats.correct : 0);
    const avgSecNum = Number(stats.avgSec || 0);
    const avgSec    = isFinite(avgSecNum) ? avgSecNum.toFixed(2) : "0.00";
    const early     = !!stats.early;
    const lastPct   = (typeof stats.lastPct === "number" && !isNaN(stats.lastPct)) ? stats.lastPct : null;

    const pct = attempted ? Math.round(100 * correct / attempted) : 0;
    const [kind, label] = chooseBadge(pct, attempted, total, early);

    // images default to gold.svg / silver.svg / teal.svg next to the HTML
    const imgSrc = (o.images && o.images[kind]) || (kind + ".svg");

    let deltaLine = "";
    if (lastPct !== null) {
      const d = pct - lastPct;
      if (d > 0)      deltaLine = `Up from ${lastPct}% last time`;
      else if (d < 0) deltaLine = `Down from ${lastPct}% last time`;
      else            deltaLine = `Same as last time (${lastPct}%)`;
    }

    const title = (!early && attempted === total) ? "Nice Work – Quiz complete!" : "Session summary";
    const line1 = (!early && attempted === total)
      ? `You answered ${correct} of ${attempted} correctly (${pct}%).`
      : `You attempted ${attempted} of ${total} cards. Correct: ${correct} (${pct}%).`;
    const line2 = `Your average time to respond was ${avgSec}s.`;

    const hero = document.createElement("div");
    hero.className = "hc-hero";
    hero.innerHTML = `
      <h2>${title}</h2>
      <div class="hc-hero__row">
        <div class="hc-badge">
          <img alt="${kind} medal" src="${imgSrc}">
          <div class="hc-overlay">
            <div>
              <div class="hc-label">${label}</div>
              <div class="hc-pct">${pct}%</div>
            </div>
          </div>
        </div>
        <div class="hc-hero__stats">
          ${deltaLine ? `<p><b>${deltaLine}</b></p>` : ""}
          <p>${line1}</p>
          <p>${line2}</p>
          <div class="hc-hero__actions">
            <button type="button" class="hc-button hc-hero__restart">Repeat the quiz</button>
          </div>
          <p class="hc-answers-note">There’s a summary of your answers below</p>
        </div>
      </div>
    `;
    mountEl.replaceChildren(hero);

    hero.querySelector(".hc-hero__restart").addEventListener("click", () => {
      mountEl.dispatchEvent(new CustomEvent("hero:restart", { bubbles: true }));
    });

    return { pct, kind, label, imgSrc };
  }

  global.HeroCard = { render };
})(this);
