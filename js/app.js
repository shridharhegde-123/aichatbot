/* ============================================================
   app.js — Entry point: wires all modules together
   ============================================================ */

// ── GLOBAL PENDING IMAGE ─────────────────────────────────────
window._pendingImage = null;

// ── DOM REFS ─────────────────────────────────────────────────
const messageInput    = document.getElementById('messageInput');
const sendBtn         = document.getElementById('sendBtn');
const newChatBtn      = document.getElementById('newChatBtn');
const clearChatBtn    = document.getElementById('clearChatBtn');
const clearAllBtn     = document.getElementById('clearAllBtn');
const downloadBtn     = document.getElementById('downloadBtn');
const imageInput      = document.getElementById('imageInput');
const cameraInput     = document.getElementById('cameraInput');
const imagePreviewBar = document.getElementById('imagePreviewBar');
const imagePreview    = document.getElementById('imagePreview');
const removeImageBtn  = document.getElementById('removeImageBtn');

// ── TEXTAREA AUTO-RESIZE ─────────────────────────────────────
function autoResizeTextarea() {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + 'px';
}

// ── ENABLE / DISABLE SEND BUTTON ────────────────────────────
function updateSendBtn() {
  const hasText = messageInput.value.trim().length > 0;
  const hasImg  = !!window._pendingImage;
  sendBtn.disabled = !(hasText || hasImg);
}

// ── TEXTAREA: input event ────────────────────────────────────
messageInput.addEventListener('input', () => {
  autoResizeTextarea();
  updateSendBtn();
});

// ── SEND ON ENTER (Shift+Enter = newline) ────────────────────
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

// ── SEND BUTTON CLICK ────────────────────────────────────────
sendBtn.addEventListener('click', handleSend);

// ── MAIN SEND HANDLER ────────────────────────────────────────
function handleSend() {
  const text  = messageInput.value.trim();
  const image = window._pendingImage || null;

  if (!text && !image) return;
  if (isAITyping) return;

  // Reset input UI
  messageInput.value = '';
  autoResizeTextarea();
  clearImagePreview();
  updateSendBtn();

  // Send to chat module
  sendMessage(text, image);
}

// ── NEW CHAT ─────────────────────────────────────────────────
newChatBtn.addEventListener('click', () => {
  const id = createChat();
  setActiveChatId(id);
  currentChatId = id;
  renderChat(id);
  renderHistoryList();
  messageInput.focus();
  maybeCloseSidebar();
});

// ── CLEAR CURRENT CHAT ───────────────────────────────────────
clearChatBtn.addEventListener('click', () => {
  if (confirm('Clear all messages in this chat?')) {
    clearCurrentChat();
  }
});

// ── CLEAR ALL CHATS ──────────────────────────────────────────
clearAllBtn.addEventListener('click', () => {
  if (confirm('Delete ALL chats? This cannot be undone.')) {
    deleteAllChats();
    currentChatId = null;
    setActiveChatId(null);
    messagesContainer.innerHTML = '';
    showWelcome(true);
    renderHistoryList();
    showToast('All chats deleted');
  }
});

// ── DOWNLOAD CHAT ────────────────────────────────────────────
downloadBtn.addEventListener('click', downloadCurrentChat);

// ── IMAGE INPUT (gallery) ────────────────────────────────────
imageInput.addEventListener('change', (e) => {
  handleImageFile(e.target.files[0]);
  imageInput.value = '';
});

// ── CAMERA INPUT (mobile) ────────────────────────────────────
cameraInput.addEventListener('change', (e) => {
  handleImageFile(e.target.files[0]);
  cameraInput.value = '';
});

// ── HANDLE IMAGE FILE ────────────────────────────────────────
function handleImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    window._pendingImage          = e.target.result;
    imagePreview.src              = e.target.result;
    imagePreviewBar.style.display = 'flex';
    updateSendBtn();
  };
  reader.readAsDataURL(file);
}

// ── REMOVE IMAGE PREVIEW ─────────────────────────────────────
function clearImagePreview() {
  window._pendingImage          = null;
  imagePreview.src              = '';
  imagePreviewBar.style.display = 'none';
  updateSendBtn();
}

removeImageBtn.addEventListener('click', clearImagePreview);

// ── SUGGESTION CARDS ─────────────────────────────────────────
document.querySelectorAll('.suggestion-card').forEach(card => {
  card.addEventListener('click', () => {
    const prompt = card.dataset.prompt;
    if (!prompt) return;
    messageInput.value = prompt;
    autoResizeTextarea();
    updateSendBtn();
    // Small delay so the button re-enables before send
    setTimeout(handleSend, 50);
  });
});

// ── INJECT CODE BLOCK STYLES ─────────────────────────────────
function injectCodeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .code-block {
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      overflow-x: auto;
      margin: 8px 0;
      font-size: 0.83rem;
      line-height: 1.6;
    }
    .code-block code {
      font-family: 'Courier New', Courier, monospace;
      color: #a3e635;
    }
    .inline-code {
      font-family: 'Courier New', Courier, monospace;
      background: rgba(124,106,255,0.12);
      color: var(--accent-1);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 0.85em;
    }
    [data-theme="light"] .code-block code { color: #166534; }
    [data-theme="light"] .code-block { background: #f1f5f9; }
  `;
  document.head.appendChild(style);
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectCodeStyles();
  initUI();           // theme, emoji grid
  renderHistoryList();

  // Restore last active chat
  const savedId = getActiveChatId();
  const chats   = getSortedChats();

  if (savedId && getChat(savedId)) {
    currentChatId = savedId;
    renderChat(savedId);
  } else if (chats.length > 0) {
    currentChatId = chats[0].id;
    setActiveChatId(currentChatId);
    renderChat(currentChatId);
  } else {
    showWelcome(true);
  }

  updateSendBtn();
  setTimeout(() => messageInput.focus(), 100);
});
