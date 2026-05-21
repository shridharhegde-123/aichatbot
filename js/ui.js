/* ============================================================
   ui.js — Sidebar, emoji picker, chat history, theme, toast
   ============================================================ */

const sidebar         = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const menuToggle      = document.getElementById('menuToggle');
const sidebarClose    = document.getElementById('sidebarClose');
const chatHistoryList = document.getElementById('chatHistoryList');
const emojiBtn        = document.getElementById('emojiBtn');
const emojiPicker     = document.getElementById('emojiPicker');
const emojiGrid       = document.getElementById('emojiGrid');
const themeToggle     = document.getElementById('themeToggle');
const toast           = document.getElementById('toast');

// ── SIDEBAR ──────────────────────────────────────────────────
function openSidebar() {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('visible');
  sidebarBackdrop.style.display = 'block';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('visible');
  setTimeout(() => {
    if (!sidebarBackdrop.classList.contains('visible'))
      sidebarBackdrop.style.display = 'none';
  }, 300);
}

function maybeCloseSidebar() {
  if (window.innerWidth <= 640) closeSidebar();
}

menuToggle.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarClose.addEventListener('click', closeSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

// ── CHAT HISTORY LIST ────────────────────────────────────────
function renderHistoryList() {
  const chats = getSortedChats();
  chatHistoryList.innerHTML = '';

  if (chats.length === 0) {
    const li = document.createElement('li');
    li.style.cssText = 'color:var(--text-tertiary);font-size:.8rem;padding:8px 10px;';
    li.textContent   = 'No chats yet';
    chatHistoryList.appendChild(li);
    return;
  }

  chats.forEach(chat => {
    const li = document.createElement('li');
    li.className  = 'history-item' + (chat.id === currentChatId ? ' active' : '');
    li.dataset.id = chat.id;

    const icon = document.createElement('i');
    icon.className = 'ph ph-chat-circle';

    const text = document.createElement('span');
    text.className   = 'history-item-text';
    text.textContent = chat.title || 'New Chat';

    const del = document.createElement('button');
    del.className = 'history-delete-btn';
    del.innerHTML = '<i class="ph ph-x"></i>';
    del.title     = 'Delete';

    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
      if (chat.id === currentChatId) {
        const remaining = getSortedChats();
        if (remaining.length > 0) {
          currentChatId = remaining[0].id;
          setActiveChatId(currentChatId);
          renderChat(currentChatId);
        } else {
          currentChatId = null;
          setActiveChatId(null);
          messagesContainer.innerHTML = '';
          showWelcome(true);
        }
      }
      renderHistoryList();
    });

    li.append(icon, text, del);
    li.addEventListener('click', () => {
      currentChatId = chat.id;
      setActiveChatId(chat.id);
      renderChat(chat.id);
      renderHistoryList();
      maybeCloseSidebar();
    });

    chatHistoryList.appendChild(li);
  });
}

// ── THEME ────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.checked = (theme === 'light');
  saveTheme(theme);
}

themeToggle.addEventListener('change', () => {
  applyTheme(themeToggle.checked ? 'light' : 'dark');
});

// ── EMOJI PICKER ─────────────────────────────────────────────
const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😢','😡','🤩','😴',
  '👍','👎','👏','🙌','🤝','🙏','💪','✌️','🤞','☝️',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💯',
  '🔥','⭐','✨','💫','🌟','🎉','🎊','🎈','🎁','🏆',
  '🌈','🌙','☀️','⛅','🌊','🌸','🌺','🍀','🦋','🐶',
  '😺','🦁','🐸','🦊','🐼','🦄','🐉','🌻','🍕','☕',
  '🎵','🎮','📚','💻','📱','🎯','🚀','✈️','⚡','💎',
];

function buildEmojiGrid() {
  EMOJIS.forEach(emoji => {
    const btn       = document.createElement('button');
    btn.className   = 'emoji-btn-item';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      const input = document.getElementById('messageInput');
      const pos   = input.selectionStart ?? input.value.length;
      input.value = input.value.slice(0, pos) + emoji + input.value.slice(pos);
      input.focus();
      input.selectionStart = input.selectionEnd = pos + emoji.length;
      // Call app.js helpers
      autoResizeTextarea();
      updateSendBtn();
      closeEmojiPicker();
    });
    emojiGrid.appendChild(btn);
  });
}

function closeEmojiPicker() {
  emojiPicker.style.display = 'none';
  emojiBtn.classList.remove('active');
}

emojiBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = emojiPicker.style.display === 'block';
  emojiPicker.style.display = open ? 'none' : 'block';
  emojiBtn.classList.toggle('active', !open);
});

document.addEventListener('click', (e) => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) closeEmojiPicker();
});

// ── TOAST ────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, duration = 2500) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── INIT (called from app.js) ────────────────────────────────
function initUI() {
  buildEmojiGrid();
  applyTheme(getSavedTheme());
}
