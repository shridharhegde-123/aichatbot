/* ============================================================
   chat.js — Message rendering, send flow, clear, download
   ============================================================ */

// ── STATE ────────────────────────────────────────────────────
let currentChatId = null;
let isAITyping    = false;

// ── DOM REFS ─────────────────────────────────────────────────
const chatArea          = document.getElementById('chatArea');
const messagesContainer = document.getElementById('messagesContainer');
const welcomeScreen     = document.getElementById('welcomeScreen');

// ── TIMESTAMP ────────────────────────────────────────────────
function formatTime(ts) {
  const d = new Date(ts);
  let h   = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const p = h >= 12 ? 'PM' : 'AM';
  h       = h % 12 || 12;
  return `${h}:${m} ${p}`;
}

// ── BASIC MARKDOWN FORMATTER ─────────────────────────────────
function formatText(text) {
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre class="code-block"><code class="lang-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`
  );
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/\n/g, '<br>');
  return text;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── BUILD MESSAGE ELEMENT ─────────────────────────────────────
function createMessageElement(msg) {
  const row = document.createElement('div');
  row.className  = `message-row ${msg.role}`;
  row.dataset.id = msg.id;

  // Header
  const header   = document.createElement('div');
  header.className = 'message-header';

  const avatar   = document.createElement('div');
  avatar.className = msg.role === 'ai' ? 'avatar ai-avatar' : 'avatar user-avatar';
  avatar.innerHTML = msg.role === 'ai'
    ? '<i class="ph-fill ph-shooting-star"></i>'
    : '<i class="ph ph-user"></i>';

  const nameSpan = document.createElement('span');
  nameSpan.className  = 'sender-name';
  nameSpan.textContent = msg.role === 'ai' ? 'NexusAI' : 'You';

  const timeSpan = document.createElement('span');
  timeSpan.className  = 'message-timestamp';
  timeSpan.textContent = formatTime(msg.timestamp || Date.now());

  header.append(avatar, nameSpan, timeSpan);

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  if (msg.image) {
    const img   = document.createElement('img');
    img.src       = msg.image;
    img.className = 'message-image';
    img.alt       = 'Attached image';
    bubble.appendChild(img);
  }

  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';
  textDiv.innerHTML = formatText(msg.text || '');
  bubble.appendChild(textDiv);

  // Action buttons
  const actions  = document.createElement('div');
  actions.className = 'message-actions';

  const copyBtn  = document.createElement('button');
  copyBtn.className = 'action-btn';
  copyBtn.innerHTML = '<i class="ph ph-copy"></i> Copy';
  copyBtn.addEventListener('click', () => copyMessage(msg.text, copyBtn));
  actions.appendChild(copyBtn);

  if (msg.role === 'ai') {
    const ttsBtn  = document.createElement('button');
    ttsBtn.className = 'action-btn';
    ttsBtn.innerHTML = '<i class="ph ph-speaker-high"></i> Read';
    ttsBtn.addEventListener('click', () => speakText(msg.text, ttsBtn));
    actions.appendChild(ttsBtn);
  }

  row.append(header, bubble, actions);
  return row;
}

// ── COPY TEXT ────────────────────────────────────────────────
async function copyMessage(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    btn.innerHTML = '<i class="ph ph-check"></i> Copied!';
    setTimeout(() => { btn.innerHTML = '<i class="ph ph-copy"></i> Copy'; }, 2000);
  } catch {
    showToast('Could not copy');
  }
}

// ── TYPING INDICATOR ─────────────────────────────────────────
function showTypingIndicator() {
  const row    = document.createElement('div');
  row.className = 'message-row ai';
  row.id        = 'typingRow';

  const header  = document.createElement('div');
  header.className = 'message-header';

  const avatar  = document.createElement('div');
  avatar.className = 'avatar ai-avatar';
  avatar.innerHTML = '<i class="ph-fill ph-shooting-star"></i>';

  const name    = document.createElement('span');
  name.className  = 'sender-name';
  name.textContent = 'NexusAI';

  header.append(avatar, name);

  const bubble  = document.createElement('div');
  bubble.className = 'typing-bubble';
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>`;

  row.append(header, bubble);
  messagesContainer.appendChild(row);
  scrollToBottom();
}

function removeTypingIndicator() {
  const row = document.getElementById('typingRow');
  if (row) row.remove();
}

// ── SCROLL ───────────────────────────────────────────────────
function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ── SHOW / HIDE WELCOME ──────────────────────────────────────
function showWelcome(show) {
  welcomeScreen.style.display     = show ? 'flex'  : 'none';
  messagesContainer.style.display = show ? 'none'  : 'flex';
}

// ── RENDER FULL CHAT ─────────────────────────────────────────
function renderChat(chatId) {
  currentChatId = chatId;
  messagesContainer.innerHTML = '';

  const chat = getChat(chatId);
  if (!chat || chat.messages.length === 0) {
    showWelcome(true);
    return;
  }

  showWelcome(false);
  chat.messages.forEach(msg => messagesContainer.appendChild(createMessageElement(msg)));
  scrollToBottom();
}

// ── APPEND ONE MESSAGE ───────────────────────────────────────
function appendMessage(msg) {
  showWelcome(false);
  messagesContainer.appendChild(createMessageElement(msg));
  scrollToBottom();
}

// ── SEND MESSAGE ─────────────────────────────────────────────
async function sendMessage(text, imageDataUrl = null) {
  if (!text && !imageDataUrl) return;
  if (isAITyping) return;

  // Create chat session if none exists
  if (!currentChatId) {
    currentChatId = createChat();
    setActiveChatId(currentChatId);
    renderHistoryList();
  }

  const userMsg = {
    id        : 'msg_' + Date.now(),
    role      : 'user',
    text      : text,
    image     : imageDataUrl || null,
    timestamp : Date.now(),
  };

  addMessage(currentChatId, userMsg);
  appendMessage(userMsg);
  renderHistoryList();

  // AI turn
  isAITyping = true;
  showTypingIndicator();

  try {
    const chat    = getChat(currentChatId);
    const history = (chat?.messages || []).slice(-10);
    const aiText  = await getAIResponse(text, imageDataUrl, history);

    removeTypingIndicator();

    const aiMsg = {
      id        : 'msg_' + (Date.now() + 1),
      role      : 'ai',
      text      : aiText,
      timestamp : Date.now(),
    };

    addMessage(currentChatId, aiMsg);
    appendMessage(aiMsg);
    renderHistoryList();

  } catch (err) {
    removeTypingIndicator();
    const errMsg = {
      id        : 'msg_err_' + Date.now(),
      role      : 'ai',
      text      : `⚠️ Error: ${err.message}`,
      timestamp : Date.now(),
    };
    addMessage(currentChatId, errMsg);
    appendMessage(errMsg);
  } finally {
    isAITyping = false;
  }
}

// ── CLEAR CURRENT CHAT ───────────────────────────────────────
function clearCurrentChat() {
  if (!currentChatId) return;
  clearChatMessages(currentChatId);
  renderChat(currentChatId);
  renderHistoryList();
  showToast('Chat cleared');
}

// ── DOWNLOAD CHAT ────────────────────────────────────────────
function downloadCurrentChat() {
  if (!currentChatId) return;
  const chat = getChat(currentChatId);
  if (!chat || !chat.messages.length) {
    showToast('No messages to download');
    return;
  }
  const lines = [
    `NexusAI Chat — ${chat.title}`,
    `Exported: ${new Date().toLocaleString()}`,
    '─'.repeat(50), ''
  ];
  chat.messages.forEach(m => {
    lines.push(`[${formatTime(m.timestamp)}] ${m.role === 'user' ? 'You' : 'NexusAI'}:`);
    if (m.text)  lines.push(m.text);
    if (m.image) lines.push('[Image attached]');
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `nexusai-chat-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Chat downloaded!');
}
