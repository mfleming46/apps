
// Minimal shared visibility controller for all applets
// Usage:
//   <script src="../common/blocks.js"></script>
//   <script>Blocks.init({ cookies:true, references:false, help:true });</script>
(function (global) {
  const SELECTORS = {
    description: '.app-description',
    cookies:     '.cookie-notice',
    references:  '.references',
    help:        '.help-panel',       // container that holds Help/Demo/buttons (+ optional .help-block inside)
    copyright:   '.copyright-notice',
    discussion:  '.giscus-block'
  };

  const DEFAULTS = {
    description: true,
    cookies: false,
    references: false,
    help: false,
    copyright: true,
    discussion: false
  };

  function nodes(sel) { return Array.from(document.querySelectorAll(sel)); }
  function setDisplay(sel, show) { nodes(sel).forEach(n => n.style.display = show ? '' : 'none'); }

  const Blocks = {
    state: { ...DEFAULTS },
    init(opts) {
      // Allow per-page inline overrides via global APP_OPTS or FLASH_OPTS too
      const inline = global.APP_OPTS || global.FLASH_OPTS || {};
      this.state = { ...DEFAULTS, ...inline, ...opts };
      this.apply();
    },
    apply() {
      for (const key in SELECTORS) setDisplay(SELECTORS[key], !!this.state[key]);
    },
    show(name, show = true) { this.state[name] = !!show; this.apply(); },
    hide(name) { this.show(name, false); },
    toggle(name) { this.state[name] = !this.state[name]; this.apply(); }
  };

  global.Blocks = Blocks;
})(window);

