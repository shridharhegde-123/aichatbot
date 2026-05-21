/* ============================================================
   storage.js — All localStorage read/write operations
   ============================================================ */

const STORAGE_KEY_CHATS    = 'nexusai_chats';
const STORAGE_KEY_ACTIVE   = 'nexusai_active_chat';
const STORAGE_KEY_THEME    = 'nexusai_theme';

// ── Generate a unique ID ──────────────────────────────────────
function generateId() {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// ── Load all chats from localStorage ─────────────────────────
function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CHATS)) || {};
  } catch {
    return {};
  }
}

// ── Save all chats to localStorage ───────────────────────────
function saveChats(chats) {
  try {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  } catch (e) {
    console.warn('Storage quota exceeded:', e);
  }
}

// ── Get active chat ID ────────────────────────────────────────
function getActiveChatId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE) || null;
}

// ── Set active chat ID ────────────────────────────────────────
function setActiveChatId(id) {
  if (id) localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  else     localStorage.removeItem(STORAGE_KEY_ACTIVE);
}

// ── Create a new chat ─────────────────────────────────────────
function createChat(title = 'New Chat') {
  const chats = loadChats();
  const id    = generateId();
  chats[id]   = {
    id,
    title,
    messages  : [],
    createdAt : Date.now(),
    updatedAt : Date.now(),
  };
  saveChats(chats);
  return id;
}

// ── Get a single chat ─────────────────────────────────────────
function getChat(id) {
  const chats = loadChats();
  return chats[id] || null;
}

// ── Update chat title ─────────────────────────────────────────
function updateChatTitle(id, title) {
  const chats = loadChats();
  if (chats[id]) {
    chats[id].title     = title;
    chats[id].updatedAt = Date.now();
    saveChats(chats);
  }
}

// ── Add message to chat ───────────────────────────────────────
function addMessage(chatId, message) {
  const chats = loadChats();
  if (!chats[chatId]) return;
  chats[chatId].messages.push(message);
  chats[chatId].updatedAt = Date.now();
  // Auto-title from first user message
  if (chats[chatId].messages.length === 1 && message.role === 'user') {
    chats[chatId].title = message.text.slice(0, 42) + (message.text.length > 42 ? '…' : '');
  }
  saveChats(chats);
}

// ── Clear messages in chat ────────────────────────────────────
function clearChatMessages(id) {
  const chats = loadChats();
  if (chats[id]) {
    chats[id].messages = [];
    chats[id].title    = 'New Chat';
    chats[id].updatedAt = Date.now();
    saveChats(chats);
  }
}

// ── Delete a chat ─────────────────────────────────────────────
function deleteChat(id) {
  const chats = loadChats();
  delete chats[id];
  saveChats(chats);
}

// ── Delete all chats ──────────────────────────────────────────
function deleteAllChats() {
  localStorage.removeItem(STORAGE_KEY_CHATS);
  localStorage.removeItem(STORAGE_KEY_ACTIVE);
}

// ── Get chats sorted by updatedAt desc ───────────────────────
function getSortedChats() {
  const chats = loadChats();
  return Object.values(chats).sort((a, b) => b.updatedAt - a.updatedAt);
}

// ── Theme persistence ─────────────────────────────────────────
function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
}

function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}
