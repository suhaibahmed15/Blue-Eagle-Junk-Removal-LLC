/* ════════════════════════════════════════════════════════════
                          chatbot.js
   ════════════════════════════════════════════════════════════ */

(function () {
  /* ── BUSINESS CONFIG ── */
  const BUSINESS = {
    name: "Blue Eagle Junk Removal LLC",
    phone: "(248) 242-1376",
    email: "info@blueeaglejunkremoval.com",
    hours: "Mon–Fri: 7AM–9PM & Sat: 8AM–6PM",
    location: "Highland, Michigan",
    owner: "Sal Gutierrez",
    founded: "2014",
    areas: "Highland, Milford, White Lake, Hartland, Waterford,Clarkston , Holly, MI",
    services: "Appliance Removal, Hot Tub Removal, Electronic Waste, Garbage & Trash, Full Cleanouts, Mattress Removal, Post-Construction Debris, Recycling, Commercial Junk, Yard Waste, Construction Debris, Shed Removal, Deck Removal, Attic/Basement/Garage Cleanouts, Estate Cleanouts, Hoarding Cleanouts, Brush & Debris",
    perks: "Eco-friendly disposal, transparent pricing, same-day service, licensed & insured, military discount, free in-home estimates",
  };

  const SYSTEM_PROMPT = `You are the friendly AI assistant for ${BUSINESS.name}. 
You help visitors with junk removal questions in ${BUSINESS.location} and Oakland County.

BUSINESS DETAILS:
- Phone: ${BUSINESS.phone}
- Hours: ${BUSINESS.hours}
- Service Areas: ${BUSINESS.areas}
- Services: ${BUSINESS.services}
- Key Perks: ${BUSINESS.perks}

GUIDELINES:
- Be warm and professional. Keep answers to 2–4 sentences.
- Explain that quotes are free and based on volume. 
- Always encourage them to call or text ${BUSINESS.phone} for scheduling or firm quotes.
- Use one relevant emoji per message.`;

  const CONVERSATION_HISTORY = [];

  /* ── INJECT CSS ── */
  const style = document.createElement('style');
  style.textContent = `
    #be-chat-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 10000;
      width: 62px; height: 62px; border-radius: 50%;
      background: linear-gradient(135deg, #1a6fff, #0050cc);
      border: none; cursor: pointer; box-shadow: 0 4px 24px rgba(26,111,255,.55);
      display: flex; align-items: center; justify-content: center;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1);
      animation: be-pulse 2.8s ease-in-out infinite;
    }
    #be-chat-fab:hover { transform: scale(1.12); }
    #be-chat-fab.open { animation: none; background: #1c232d; }
    #be-chat-fab .fab-close { display: none; }
    #be-chat-fab.open .fab-chat { display: none; }
    #be-chat-fab.open .fab-close { display: block; }

    #be-chat-badge {
      position: absolute; top: -3px; right: -3px; background: #f0a500; color: #080a0d;
      font-size: 10px; font-weight: 800; width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; border: 2px solid #080a0d;
    }
    #be-chat-badge.hidden { display: none; }

    #be-chat-window {
      position: fixed; bottom: 104px; right: 28px; z-index: 9999;
      width: 370px; max-width: calc(100vw - 40px);
      background: #10141a; border: 1px solid #1e2730; border-radius: 14px;
      box-shadow: 0 24px 64px rgba(0,0,0,.7); display: flex; flex-direction: column;
      transform: scale(.92) translateY(20px); opacity: 0; pointer-events: none;
      transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
      max-height: min(560px, 80vh); overflow: hidden; font-family: sans-serif;
    }
    #be-chat-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    .be-header {
      background: #0d111a; border-bottom: 1px solid #1e2730; padding: 16px;
      display: flex; align-items: center; gap: 12px; position: relative;
    }
    .be-header::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, #1a6fff, #f0a500);
    }
    .be-avatar { width: 40px; height: 40px; border-radius: 50%; background: #1a6fff22; border: 1px solid #1a6fff; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .be-hname { color: #eef1f6; font-weight: bold; font-size: 16px; }
    .be-hstatus { font-size: 11px; color: #4a5a6e; display: flex; align-items: center; gap: 4px; }
    .be-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; }

    .be-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
    .be-msg { display: flex; gap: 10px; align-items: flex-end; animation: fadeIn 0.3s ease; }
    .be-msg.user { flex-direction: row-reverse; }
    .be-bubble { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
    .be-msg.bot .be-bubble { background: #161c24; color: #c8d4e0; border: 1px solid #1e2730; }
    .be-msg.user .be-bubble { background: #1a6fff; color: #fff; }

    .be-typing { display: flex; gap: 4px; padding: 10px; }
    .be-typing span { width: 6px; height: 6px; background: #2a3340; border-radius: 50%; animation: be-typedot 1.2s infinite; }
    .be-typing span:nth-child(2) { animation-delay: .2s; }
    .be-typing span:nth-child(3) { animation-delay: .4s; }

    .be-quick-replies { padding: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
    .be-qr { background: none; border: 1px solid #1e2730; color: #7a8fa8; padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: 0.2s; }
    .be-qr:hover { border-color: #1a6fff; color: #fff; }

    .be-input-row { padding: 12px; border-top: 1px solid #1e2730; display: flex; gap: 10px; background: #0d111a; }
    #be-input { flex: 1; background: #161c24; border: 1px solid #1e2730; border-radius: 8px; padding: 10px; color: #fff; outline: none; resize: none; font-size: 14px; font-family: inherit; }
    #be-send-btn { background: #1a6fff; border: none; border-radius: 8px; width: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    #be-send-btn:disabled { background: #1e2730; cursor: not-allowed; }

    .be-footer { font-size: 10px; text-align: center; color: #2a3340; padding: 8px; border-top: 1px solid #1a2030; }
    
    @keyframes be-pulse { 0% { box-shadow: 0 0 0 0 rgba(26,111,255,0.7); } 70% { box-shadow: 0 0 0 15px rgba(26,111,255,0); } 100% { box-shadow: 0 0 0 0 rgba(26,111,255,0); } }
    @keyframes be-typedot { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.5); background: #1a6fff; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);

  /* ── INJECT HTML ── */
  document.body.insertAdjacentHTML('beforeend', `
    <button id="be-chat-fab" aria-label="Chat with us">
      <span id="be-chat-badge" class="hidden">1</span>
      <svg class="fab-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <svg class="fab-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div id="be-chat-window">
      <div class="be-header">
        <div class="be-avatar">🦅</div>
        <div class="be-hinfo">
          <div class="be-hname">Blue Eagle AI</div>
          <div class="be-hstatus"><span class="be-dot"></span>Online</div>
        </div>
      </div>
      <div class="be-messages" id="be-messages"></div>
      <div class="be-quick-replies" id="be-quick-replies">
        <button class="be-qr">📋 Get a Quote</button>
        <button class="be-qr">🗺️ Service Areas</button>
        <button class="be-qr">⚡ Same-Day?</button>
      </div>
      <div class="be-input-row">
        <textarea id="be-input" placeholder="Ask about services..." rows="1"></textarea>
        <button id="be-send-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </div>
      <div class="be-footer">Powered by Cerebras Inference · Blue Eagle Junk Removal</div>
    </div>
  `);

  /* ── ELEMENTS ── */
  const fab = document.getElementById('be-chat-fab');
  const win = document.getElementById('be-chat-window');
  const msgs = document.getElementById('be-messages');
  const input = document.getElementById('be-input');
  const sendBtn = document.getElementById('be-send-btn');
  const badge = document.getElementById('be-chat-badge');
  const quickReplies = document.getElementById('be-quick-replies');

  /* ── ACTIONS ── */
  function openChat() {
    win.classList.add('open');
    fab.classList.add('open');
    badge.classList.add('hidden');
    if (msgs.children.length === 0) addWelcome();
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() { win.classList.remove('open'); fab.classList.remove('open'); }
  fab.onclick = () => win.classList.contains('open') ? closeChat() : openChat();

  function addWelcome() {
    appendMsg('bot', "Hey there! 🦅 I'm the Blue Eagle AI assistant. Need help clearing out some space in Oakland County? Ask me anything!");
  }

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `be-msg ${role}`;
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    div.innerHTML = `<div class="be-bubble">${formatted}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'be-msg bot';
    div.id = 'be-typing-indicator';
    div.innerHTML = `<div class="be-typing"><span></span><span></span><span></span></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function sendMessage(text) {
    if (!text.trim() || sendBtn.disabled) return;

    quickReplies.style.display = 'none';
    appendMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    showTyping();

    CONVERSATION_HISTORY.push({ role: 'user', content: text });

    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer csk-56npr9xcmm3crk88p3m2eewwwjrfkn2ckkc5jh593wkdhck2'
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...CONVERSATION_HISTORY],
          max_tokens: 250,
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices[0].message.content;

      // Small delay so users can actually see the "typing" animation
      setTimeout(() => {
        const loader = document.getElementById('be-typing-indicator');
        if (loader) loader.remove();

        appendMsg('bot', reply);
        CONVERSATION_HISTORY.push({ role: 'assistant', content: reply });
        sendBtn.disabled = false;
        input.focus();
      }, 700);

    } catch (err) {
      const loader = document.getElementById('be-typing-indicator');
      if (loader) loader.remove();
      appendMsg('bot', "I'm having a connection issue. Please call us directly at **(248) 242-1376**! 🦅");
      sendBtn.disabled = false;
    }
  }

  /* ── EVENT LISTENERS ── */
  sendBtn.onclick = () => sendMessage(input.value);
  input.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
  };
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
  document.querySelectorAll('.be-qr').forEach(btn => {
    btn.onclick = () => sendMessage(btn.textContent.trim());
  });
  setTimeout(() => { if (!win.classList.contains('open')) badge.classList.remove('hidden'); }, 4000);
})();