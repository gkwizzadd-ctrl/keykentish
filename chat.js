/* Key Kentish — Alvatross Chat Widget v3
   Chat-first: picks render inline as the opening bot message
   Phase 1 : Inline topic picks  →  seeds AI chat
   Phase 2 : AI chat             →  POST webhook/ai-agent
   Phase 3 : Contact form        →  POST webhook/custom-contact
*/
(function () {
  const CHAT_WH = 'https://n8n.srv1739004.hstgr.cloud/webhook/ai-agent';
  const FORM_WH = 'https://n8n.srv1739004.hstgr.cloud/webhook/custom-contact';
  const SESSION  = 'kk-' + Math.random().toString(36).slice(2, 10);
  let   started  = false;

  /* ── CSS ─────────────────────────────────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
    #kk-btn {
      position:fixed; bottom:32px; right:32px; z-index:9000;
      display:flex; align-items:center; gap:10px;
      background:#00A894; color:#0A1628; border:none; cursor:pointer;
      padding:14px 22px 14px 18px;
      font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:13px; font-weight:600; letter-spacing:.04em;
      box-shadow:0 8px 32px rgba(0,168,148,.35),0 2px 8px rgba(0,0,0,.18);
      transition:transform .2s,box-shadow .2s,opacity .2s;
    }
    #kk-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,168,148,.45),0 4px 12px rgba(0,0,0,.22); }
    #kk-btn.hidden { opacity:0; pointer-events:none; transform:translateY(8px); }
    #kk-btn svg { width:18px; height:18px; flex-shrink:0; }

    #kk-panel {
      position:fixed; bottom:32px; right:32px; z-index:9001;
      width:420px; height:580px; display:flex; flex-direction:column;
      background:#fff;
      box-shadow:0 24px 80px rgba(10,22,40,.28),0 4px 16px rgba(0,0,0,.14);
      opacity:0; transform:translateY(20px) scale(.97); pointer-events:none;
      transition:opacity .3s cubic-bezier(.4,0,.2,1),transform .3s cubic-bezier(.4,0,.2,1);
      overflow:hidden;
    }
    #kk-panel.open { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }

    /* Header */
    #kk-head {
      background:#0A1628; padding:16px 18px;
      display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
    }
    .kk-head-l { display:flex; align-items:center; gap:11px; }
    .kk-avatar {
      width:34px; height:34px; background:#00A894; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
    }
    .kk-avatar svg { width:16px; height:16px; }
    .kk-hname { font-family:'Instrument Sans',system-ui,sans-serif; font-size:13px; font-weight:600; color:#fff; }
    .kk-hsub  { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.38); margin-top:2px; }
    .kk-dot   { display:inline-block; width:6px; height:6px; border-radius:50%; background:#00A894; margin-right:4px; animation:kk-pulse 2s ease-in-out infinite; }
    @keyframes kk-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    .kk-head-r { display:flex; align-items:center; gap:6px; }
    #kk-form-btn {
      font-family:'Instrument Sans',system-ui,sans-serif; font-size:11px; font-weight:500;
      letter-spacing:.06em; text-transform:uppercase;
      background:rgba(0,168,148,.15); color:#00A894; border:1px solid rgba(0,168,148,.3);
      padding:6px 13px; cursor:pointer; transition:background .2s;
    }
    #kk-form-btn:hover { background:rgba(0,168,148,.28); }
    #kk-form-btn.kk-hidden { display:none; }
    #kk-close {
      background:none; border:none; cursor:pointer; color:rgba(255,255,255,.35);
      font-size:22px; font-weight:300; line-height:1; padding:2px 4px; transition:color .2s;
    }
    #kk-close:hover { color:#fff; }

    /* Body */
    #kk-body { flex:1; overflow:hidden; display:flex; flex-direction:column; }

    /* ── Chat view ──────────────────────────────────────────── */
    #kk-chat { flex:1; overflow:hidden; display:flex; flex-direction:column; }
    #kk-msgs {
      flex:1; overflow-y:auto; padding:16px; display:flex;
      flex-direction:column; gap:12px; background:#F4F6FA; scroll-behavior:smooth;
    }
    #kk-msgs::-webkit-scrollbar { width:3px; }
    #kk-msgs::-webkit-scrollbar-thumb { background:rgba(0,0,0,.1); }

    .kk-msg { display:flex; flex-direction:column; max-width:88%; }
    .kk-msg.user { align-self:flex-end; align-items:flex-end; }
    .kk-msg.bot  { align-self:flex-start; align-items:flex-start; width:100%; max-width:100%; }
    .kk-lbl { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:#8A9BB0; margin-bottom:4px; }
    .kk-bbl {
      padding:11px 14px; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:13.5px; line-height:1.55;
    }
    .kk-msg.user .kk-bbl { background:#0A1628; color:#fff; }
    .kk-msg.bot  .kk-bbl { background:#fff; color:#0A1628; border:1px solid rgba(10,22,40,.08); }
    .kk-bbl p   { margin:0 0 6px; }
    .kk-bbl p:last-child { margin-bottom:0; }
    .kk-bbl strong { font-weight:600; }
    .kk-bbl em     { font-style:italic; }
    .kk-bbl a {
      display:inline-block; margin-top:6px;
      background:#00A894; color:#0A1628;
      font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:12px; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
      padding:9px 18px; text-decoration:none;
      transition:opacity .2s;
    }
    .kk-bbl a:hover { opacity:.85; }
    .kk-bbl ul, .kk-bbl ol { margin:6px 0 6px 16px; padding:0; }
    .kk-bbl li     { margin-bottom:3px; }
    .kk-bbl .kk-bq {
      border-left:3px solid #00A894; margin:6px 0;
      padding:6px 10px; background:rgba(0,168,148,.06);
      font-style:italic; color:#555;
    }

    /* ── Footer pick tray ───────────────────────────────────── */
    #kk-pick-tray {
      border-top:1px solid rgba(10,22,40,.09); background:#F4F6FA;
      padding:10px 12px; flex-shrink:0;
    }
    #kk-pick-tray.kk-hidden { display:none; }
    #kk-pick-select {
      width:100%; padding:10px 36px 10px 12px;
      border:1.5px solid rgba(10,22,40,.14);
      font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:13px; color:#0A1628; background:#fff;
      appearance:none; -webkit-appearance:none; outline:none; cursor:pointer;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300A894' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 12px center;
      transition:border-color .2s;
    }
    #kk-pick-select:focus { border-color:#00A894; }
    #kk-pick-select option[value=''] { color:#8A9BB0; }

    /* ── Quick-reply chips (after bot messages) ─────────────── */
    .kk-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
    .kk-chip {
      font-family:'Instrument Sans',system-ui,sans-serif; font-size:11px; font-weight:500;
      letter-spacing:.04em; color:#0A1628; background:#fff;
      border:1.5px solid rgba(10,22,40,.15); padding:5px 12px;
      cursor:pointer; transition:border-color .2s, background .2s;
    }
    .kk-chip:hover { border-color:#00A894; background:rgba(0,168,148,.06); }

    /* ── In-chat OPTIONS dropdown ────────────────────────────── */
    .kk-opt-wrap { margin-top:8px; display:flex; gap:7px; align-items:center; }
    .kk-opt-select {
      flex:1; padding:8px 32px 8px 10px;
      border:1.5px solid rgba(10,22,40,.14);
      font-family:'Instrument Sans',system-ui,sans-serif; font-size:13px;
      color:#0A1628; background:#fff; appearance:none; -webkit-appearance:none;
      outline:none; cursor:pointer;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2300A894' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 10px center;
      transition:border-color .2s;
    }
    .kk-opt-select:focus { border-color:#00A894; }
    .kk-opt-go {
      background:#00A894; border:none; cursor:pointer; padding:8px 14px;
      color:#0A1628; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:12px; font-weight:600; letter-spacing:.03em; flex-shrink:0;
      transition:opacity .2s;
    }
    .kk-opt-go:hover { opacity:.85; }

    /* ── In-chat MULTI chips ─────────────────────────────────── */
    .kk-multi-wrap { margin-top:8px; }
    .kk-multi-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
    .kk-multi-chip {
      font-family:'Instrument Sans',system-ui,sans-serif; font-size:11px; font-weight:500;
      letter-spacing:.04em; color:#0A1628; background:#fff;
      border:1.5px solid rgba(10,22,40,.15); padding:5px 12px;
      cursor:pointer; transition:border-color .2s, background .2s;
    }
    .kk-multi-chip.selected { border-color:#00A894; background:rgba(0,168,148,.10); color:#007a6b; }
    .kk-multi-go {
      background:#0A1628; border:none; cursor:pointer; padding:7px 16px;
      color:#fff; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:12px; font-weight:600; letter-spacing:.03em;
      transition:background .2s;
    }
    .kk-multi-go:hover { background:#00A894; color:#0A1628; }

    /* Typing */
    .kk-typing { display:flex; align-items:center; gap:5px; padding:11px 14px; background:#fff; border:1px solid rgba(10,22,40,.08); }
    .kk-typing span { width:6px; height:6px; border-radius:50%; background:#00A894; animation:kk-bounce .9s ease-in-out infinite; }
    .kk-typing span:nth-child(2) { animation-delay:.15s; }
    .kk-typing span:nth-child(3) { animation-delay:.30s; }
    @keyframes kk-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

    /* Input area */
    #kk-foot {
      border-top:1px solid rgba(10,22,40,.09); padding:12px 14px;
      background:#fff; flex-shrink:0;
    }
    #kk-cform { display:flex; gap:7px; align-items:flex-end; }
    #kk-input {
      flex:1; resize:none; border:1.5px solid rgba(10,22,40,.14);
      padding:9px 12px; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:13.5px; color:#0A1628; background:#F4F6FA; outline:none;
      transition:border-color .2s; max-height:90px; line-height:1.45;
    }
    #kk-input:focus { border-color:#00A894; }
    #kk-input::placeholder { color:#8A9BB0; }
    #kk-input:disabled { opacity:.5; }
    #kk-send {
      background:#00A894; border:none; cursor:pointer; padding:9px 16px;
      color:#0A1628; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:13px; font-weight:600; letter-spacing:.03em;
      transition:opacity .2s; flex-shrink:0; height:40px;
    }
    #kk-send:hover { opacity:.85; }
    #kk-send:disabled { opacity:.38; cursor:not-allowed; }
    .kk-fnote {
      font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.07em;
      color:#8A9BB0; margin-top:7px; text-align:center;
    }

    /* ── Form view ──────────────────────────────────────────── */
    #kk-form { flex:1; overflow-y:auto; padding:22px 20px; background:#F4F6FA; display:none; flex-direction:column; }
    #kk-form.kk-active { display:flex; }
    .kk-form-title {
      font-family:'Cormorant Garamond',Georgia,serif;
      font-size:20px; font-style:italic; font-weight:600; color:#0A1628; margin-bottom:4px;
    }
    .kk-form-sub { font-size:12px; color:#8A9BB0; margin-bottom:18px; line-height:1.5; }
    .kk-frow { margin-bottom:12px; }
    .kk-flbl {
      display:block; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:11px; font-weight:500; letter-spacing:.06em; text-transform:uppercase;
      color:#0A1628; margin-bottom:4px;
    }
    .kk-flbl span { color:#00A894; }
    .kk-fctl {
      width:100%; padding:9px 12px; border:1.5px solid rgba(10,22,40,.14);
      font-family:'Instrument Sans',system-ui,sans-serif; font-size:13px;
      color:#0A1628; background:#fff; outline:none;
      transition:border-color .2s; appearance:none; -webkit-appearance:none;
    }
    .kk-fctl:focus { border-color:#00A894; }
    .kk-sel-wrap { position:relative; }
    .kk-sel-wrap::after {
      content:''; position:absolute; right:12px; top:50%; transform:translateY(-50%);
      border-left:4px solid transparent; border-right:4px solid transparent;
      border-top:5px solid #8A9BB0; pointer-events:none;
    }
    textarea.kk-fctl { resize:vertical; min-height:68px; }
    #kk-fsubmit {
      width:100%; background:#0A1628; color:#fff; border:none; cursor:pointer;
      padding:13px 20px; font-family:'Instrument Sans',system-ui,sans-serif;
      font-size:13px; font-weight:600; letter-spacing:.05em; text-transform:uppercase;
      transition:background .2s; margin-top:4px;
    }
    #kk-fsubmit:hover { background:#00A894; color:#0A1628; }
    #kk-fsubmit:disabled { opacity:.45; cursor:not-allowed; }
    .kk-err { font-size:11px; color:#c0392b; margin-top:4px; display:none; }
    #kk-back {
      background:none; border:none; cursor:pointer; padding:0;
      font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em;
      text-transform:uppercase; color:#8A9BB0; transition:color .2s;
      margin-bottom:14px; display:inline-flex; align-items:center; gap:6px;
    }
    #kk-back:hover { color:#0A1628; }

    /* ── Thanks view ────────────────────────────────────────── */
    #kk-thanks {
      flex:1; display:none; flex-direction:column; align-items:center;
      justify-content:center; padding:32px 28px; text-align:center; background:#F4F6FA;
    }
    #kk-thanks.kk-active { display:flex; }
    .kk-tick {
      width:52px; height:52px; background:#0A1628;
      display:flex; align-items:center; justify-content:center; margin:0 auto 20px;
    }
    .kk-tick svg { width:24px; height:24px; }
    .kk-ty-h {
      font-family:'Cormorant Garamond',Georgia,serif; font-size:26px;
      font-style:italic; font-weight:600; color:#0A1628; margin-bottom:10px;
    }
    .kk-ty-p { font-size:13.5px; color:#8A9BB0; line-height:1.65; }

    @media (max-width:480px) {
      #kk-panel { width:calc(100vw - 16px); right:8px; bottom:8px; }
      #kk-btn   { right:16px; bottom:16px; }
    }
  `;
  document.head.appendChild(css);

  /* ── Pick definitions ────────────────────────────────────── */
  const PICKS = [
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#00A894" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
      title: 'Explore the Alvatross Platform',
      desc:  'Unified Catalog, Order Mgmt, Activation, Inventory & Fallout',
      seed:  "I'd like an overview of the Alvatross platform and how it compares to traditional OSS/BSS stacks."
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#00A894" stroke-width="2" stroke-linecap="round"><path d="M17 3l4 4-4 4M7 21l-4-4 4-4"/><path d="M21 7H3M21 17H3"/></svg>`,
      title: 'Legacy Migration & Modernisation',
      desc:  'Replace monolithic stacks with cloud-native, TM Forum-aligned architecture',
      seed:  "We're evaluating replacing our legacy BSS/OSS stack. Can you walk me through what a migration to Alvatross would look like?"
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#00A894" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      title: 'BSS/OSS Strategy & Roadmap',
      desc:  'TM Forum alignment, digital transformation planning, vendor evaluation',
      seed:  "I need strategic advice on our BSS/OSS roadmap and where Alvatross fits within our digital transformation programme."
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#00A894" stroke-width="2" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
      title: 'Request a Demo or PoC',
      desc:  'See the platform in your environment before committing',
      seed:  "I'd like to understand what a demo or proof-of-concept with Alvatross would involve and what we'd need to prepare."
    },
    {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#00A894" stroke-width="2" stroke-linecap="round"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.127.96.362 1.906.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 5 5l1.27-1.27a2 2 0 0 1 2.11-.45c.904.339 1.85.573 2.81.7A2 2 0 0 1 21 17v-.09"/></svg>`,
      title: 'Skip straight to the form',
      desc:  'Jump directly to our contact & enquiry form',
      goto:  'form'
    }
  ];

  /* ── HTML ────────────────────────────────────────────────── */
  const root = document.createElement('div');
  root.innerHTML = `
  <button id="kk-btn" aria-label="Open Alvatross chat">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    Ask the Platform Expert
  </button>

  <div id="kk-panel" role="dialog" aria-label="Alvatross Platform Expert">

    <div id="kk-head">
      <div class="kk-head-l">
        <div class="kk-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0A1628" stroke-width="2.5" stroke-linecap="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
          </svg>
        </div>
        <div>
          <div class="kk-hname">Alvatross Platform Expert</div>
          <div class="kk-hsub"><span class="kk-dot"></span>Online · Powered by AI</div>
        </div>
      </div>
      <div class="kk-head-r">
        <button id="kk-form-btn" class="kk-hidden">Get in Touch</button>
        <button id="kk-close" aria-label="Close">&times;</button>
      </div>
    </div>

    <div id="kk-body">

      <!-- Chat view (default) -->
      <div id="kk-chat">
        <div id="kk-msgs"></div>
        <div id="kk-pick-tray">
          <select id="kk-pick-select">
            <option value="">What brings you here today?</option>
          </select>
        </div>
        <div id="kk-foot">
          <form id="kk-cform">
            <textarea id="kk-input" rows="1" placeholder="Or type your question…" aria-label="Message" disabled></textarea>
            <button id="kk-send" type="submit" disabled>Send</button>
          </form>
          <div class="kk-fnote">Alvatross BSS/OSS · Key Kentish</div>
        </div>
      </div>

      <!-- Form view -->
      <div id="kk-form">
        <button id="kk-back">← Back to chat</button>
        <p class="kk-form-title">Get in touch</p>
        <p class="kk-form-sub">Fill in your details and Gareth will follow up within one business day.</p>
        <form id="kk-enquiry">
          <input type="text" name="Leave this blank" style="display:none" tabindex="-1" autocomplete="off"/>
          <div class="kk-frow">
            <label class="kk-flbl" for="kk-f-company">Company name <span>*</span></label>
            <input class="kk-fctl" id="kk-f-company" name="Company name" type="text" required autocomplete="organization"/>
          </div>
          <div class="kk-frow">
            <label class="kk-flbl" for="kk-f-contact">Your name <span>*</span></label>
            <input class="kk-fctl" id="kk-f-contact" name="Contact name" type="text" required autocomplete="name"/>
          </div>
          <div class="kk-frow">
            <label class="kk-flbl" for="kk-f-email">Email <span>*</span></label>
            <input class="kk-fctl" id="kk-f-email" name="email" type="email" required autocomplete="email"/>
          </div>
          <div class="kk-frow">
            <label class="kk-flbl" for="kk-f-web">Website</label>
            <input class="kk-fctl" id="kk-f-web" name="Website" type="url" placeholder="https://" autocomplete="url"/>
          </div>
          <div class="kk-frow">
            <label class="kk-flbl" for="kk-f-budget">Annual BSS/OSS budget <span>*</span></label>
            <div class="kk-sel-wrap">
              <select class="kk-fctl" id="kk-f-budget" name="Budget" required>
                <option value="">Select a range…</option>
                <option>less than 100,000</option>
                <option>100,000 to 500,000</option>
                <option>500,000 to 1,000,000</option>
                <option>1,000,000 to 2,000,000</option>
                <option>2,000,000 to 5,000,000</option>
                <option>5,000,000+</option>
                <option>Not known</option>
              </select>
            </div>
          </div>
          <div class="kk-frow">
            <label class="kk-flbl" for="kk-f-notes">Notes / context</label>
            <textarea class="kk-fctl" id="kk-f-notes" name="Notes" placeholder="Briefly describe your situation or questions…"></textarea>
          </div>
          <div id="kk-ferr" class="kk-err"></div>
          <button id="kk-fsubmit" type="submit">Send Enquiry</button>
        </form>
      </div>

      <!-- Thanks view -->
      <div id="kk-thanks">
        <div class="kk-tick">
          <svg viewBox="0 0 24 24" fill="none" stroke="#00A894" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p class="kk-ty-h">Enquiry received.</p>
        <p class="kk-ty-p">Thank you — Gareth will be in touch within one business day. You'll also receive a confirmation email shortly.</p>
      </div>

    </div>
  </div>
  `;
  document.body.appendChild(root);

  /* ── Refs ─────────────────────────────────────────────────── */
  const btn      = document.getElementById('kk-btn');
  const panel    = document.getElementById('kk-panel');
  const formBtn  = document.getElementById('kk-form-btn');
  const closeEl  = document.getElementById('kk-close');
  const backEl   = document.getElementById('kk-back');
  const msgs     = document.getElementById('kk-msgs');
  const pickTray = document.getElementById('kk-pick-tray');
  const cform    = document.getElementById('kk-cform');
  const input    = document.getElementById('kk-input');
  const send     = document.getElementById('kk-send');
  const enquiry = document.getElementById('kk-enquiry');
  const fsubmit = document.getElementById('kk-fsubmit');
  const ferr    = document.getElementById('kk-ferr');
  const vChat   = document.getElementById('kk-chat');
  const vForm   = document.getElementById('kk-form');
  const vThanks = document.getElementById('kk-thanks');
  let panelOpen = false;

  /* ── View switching ──────────────────────────────────────── */
  function showChat()   { vChat.style.display=''; vForm.classList.remove('kk-active'); vThanks.classList.remove('kk-active'); formBtn.classList.remove('kk-hidden'); }
  function showForm()   { vChat.style.display='none'; vForm.classList.add('kk-active'); vThanks.classList.remove('kk-active'); formBtn.classList.add('kk-hidden'); }
  function showThanks() { vChat.style.display='none'; vForm.classList.remove('kk-active'); vThanks.classList.add('kk-active'); formBtn.classList.add('kk-hidden'); }

  formBtn.addEventListener('click', showForm);
  backEl.addEventListener('click', showChat);

  /* ── Open / close ────────────────────────────────────────── */
  function openPanel() {
    panelOpen = true;
    panel.classList.add('open');
    btn.classList.add('hidden');
    if (!started) {
      started = true;
      injectPicks();
      addBotMsg('Hi! Select a topic below or type your question.');
    }
  }
  function closePanel() {
    panelOpen = false;
    panel.classList.remove('open');
    btn.classList.remove('hidden');
  }
  btn.addEventListener('click', openPanel);
  closeEl.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panelOpen) closePanel(); });

  /* ── Populate the dropdown pick tray ────────────────────── */
  function injectPicks() {
    const sel = document.getElementById('kk-pick-select');
    PICKS.forEach((p, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = p.title;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      const p = PICKS[sel.value];
      if (!p) return;
      pickTray.classList.add('kk-hidden');
      if (p.goto === 'form') { showForm(); return; }
      enableInput();
      sendToAgent(p.seed, true);
    });
  }

  /* ── Enable the text input after a pick ─────────────────── */
  function enableInput() {
    input.disabled = false;
    send.disabled  = false;
    input.placeholder = 'Type your question…';
    setTimeout(() => input.focus(), 100);
  }

  /* ── Render messages ─────────────────────────────────────── */
  /* ── Markdown renderer ───────────────────────────────────── */
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function renderMd(raw) {
    const lines = raw.split('\n');
    const out = []; let inUl = false;
    for (const line of lines) {
      if (/^>\s?/.test(line)) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        out.push(`<div class="kk-bq">${inline(esc(line.replace(/^>\s?/,'')))}</div>`);
      } else if (/^[-*]\s+/.test(line)) {
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push(`<li>${inline(esc(line.replace(/^[-*]\s+/,'')))}</li>`);
      } else {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (line.trim()) out.push(`<p>${inline(esc(line))}</p>`);
      }
    }
    if (inUl) out.push('</ul>');
    return out.join('');
  }

  /* ── Parse [OPTIONS:] and [MULTI:] tags from AI text ─────── */
  function parseAITags(text) {
    const optM   = text.match(/\[OPTIONS:\s*([^\]]+)\]/i);
    const multiM = text.match(/\[MULTI:\s*([^\]]+)\]/i);
    const match  = optM || multiM;
    if (!match) return { clean: text, type: null, options: [] };
    return {
      clean:   text.replace(match[0], '').replace(/\n{2,}/g, '\n').trim(),
      type:    optM ? 'options' : 'multi',
      options: match[1].split('|').map(s => s.trim()).filter(Boolean)
    };
  }

  function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = 'kk-msg ' + role;

    const lbl = document.createElement('div');
    lbl.className = 'kk-lbl';
    lbl.textContent = role === 'user' ? 'You' : 'Alvatross Expert';

    const bbl = document.createElement('div');
    bbl.className = 'kk-bbl';

    if (role === 'bot') {
      const parsed = parseAITags(text);
      bbl.innerHTML = renderMd(parsed.clean);
      wrap.appendChild(lbl);
      wrap.appendChild(bbl);

      if (parsed.type === 'options' && parsed.options.length) {
        const optWrap = document.createElement('div');
        optWrap.className = 'kk-opt-wrap';

        const sel = document.createElement('select');
        sel.className = 'kk-opt-select';
        const placeholder = document.createElement('option');
        placeholder.value = ''; placeholder.textContent = 'Choose…';
        sel.appendChild(placeholder);
        parsed.options.forEach(o => {
          const opt = document.createElement('option');
          opt.value = o; opt.textContent = o;
          sel.appendChild(opt);
        });

        const goBtn = document.createElement('button');
        goBtn.className = 'kk-opt-go'; goBtn.textContent = 'Go';
        goBtn.addEventListener('click', () => {
          const val = sel.value;
          if (!val) return;
          optWrap.remove();
          sendToAgent(val, false);
        });

        optWrap.appendChild(sel);
        optWrap.appendChild(goBtn);
        wrap.appendChild(optWrap);

      } else if (parsed.type === 'multi' && parsed.options.length) {
        const multiWrap = document.createElement('div');
        multiWrap.className = 'kk-multi-wrap';
        const chipsRow = document.createElement('div');
        chipsRow.className = 'kk-multi-chips';
        const selected = new Set();

        parsed.options.forEach(o => {
          const c = document.createElement('button');
          c.className = 'kk-multi-chip'; c.textContent = o;
          c.addEventListener('click', () => {
            if (selected.has(o)) { selected.delete(o); c.classList.remove('selected'); }
            else                 { selected.add(o);    c.classList.add('selected'); }
          });
          chipsRow.appendChild(c);
        });

        const goBtn = document.createElement('button');
        goBtn.className = 'kk-multi-go'; goBtn.textContent = 'Confirm';
        goBtn.addEventListener('click', () => {
          if (!selected.size) return;
          multiWrap.remove();
          sendToAgent([...selected].join(', '), false);
        });

        multiWrap.appendChild(chipsRow);
        multiWrap.appendChild(goBtn);
        wrap.appendChild(multiWrap);
      }

    } else {
      bbl.textContent = text;
      wrap.appendChild(lbl);
      wrap.appendChild(bbl);
    }

    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }
  function addBotMsg(text) { return addMsg('bot', text); }
  function addUserMsg(text) { return addMsg('user', text); }

  /* ── Intercept Vercel contact links → open built-in form ─── */
  msgs.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    if (!a.href.includes('n8n-gareth-kentish.vercel.app/contact')) return;
    e.preventDefault();
    const p = new URL(a.href);
    const company = p.searchParams.get('company') || '';
    const notes   = p.searchParams.get('notes')   || '';
    if (company) document.getElementById('kk-f-company').value = company;
    if (notes)   document.getElementById('kk-f-notes').value   = notes;
    showForm();
  });

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'kk-msg bot'; wrap.id = 'kk-typing';
    const lbl = document.createElement('div'); lbl.className = 'kk-lbl'; lbl.textContent = 'Alvatross Expert';
    const bbl = document.createElement('div'); bbl.className = 'kk-typing';
    bbl.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(lbl); wrap.appendChild(bbl);
    msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() { const t = document.getElementById('kk-typing'); if (t) t.remove(); }

  /* ── Send to AI agent ────────────────────────────────────── */
  async function sendToAgent(message, silent) {
    if (!silent) addUserMsg(message);
    send.disabled = true;
    showTyping();
    try {
      const res  = await fetch(CHAT_WH, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: SESSION })
      });
      const data = await res.json();
      hideTyping();
      const text = data.output || 'Sorry, no response received. Please try again.';
      addBotMsg(text);
    } catch {
      hideTyping();
      addBotMsg('Connection issue — please try again in a moment.');
    } finally {
      send.disabled = false;
    }
  }

  /* ── Chat form submit ────────────────────────────────────── */
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cform.requestSubmit(); } });
  cform.addEventListener('submit', e => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg || input.disabled) return;
    input.value = ''; input.style.height = 'auto';
    sendToAgent(msg, false);
  });

  /* ── Enquiry form submit ─────────────────────────────────── */
  enquiry.addEventListener('submit', async e => {
    e.preventDefault();
    ferr.style.display = 'none';
    fsubmit.disabled = true;
    fsubmit.textContent = 'Sending…';
    const body = {};
    new FormData(enquiry).forEach((v, k) => { body[k] = v; });
    try {
      const res  = await fetch(FORM_WH, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) { showThanks(); }
      else throw new Error();
    } catch {
      ferr.textContent = 'Submission failed — please email gareth@garethkentish.com directly.';
      ferr.style.display = 'block';
      fsubmit.disabled = false;
      fsubmit.textContent = 'Send Enquiry';
    }
  });

})();
