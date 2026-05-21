<<<<<<< HEAD
# NexusAI — ChatGPT-Style AI Chat App

A fully frontend-only, premium AI chat interface built with vanilla HTML, CSS, and JavaScript. No backend required.

## 📁 Folder Structure

```
aichat/
├── index.html              ← Main HTML (page shell, sidebar, chat area, input)
├── netlify.toml            ← Netlify deployment config (security headers, permissions)
├── README.md
│
├── css/
│   ├── reset.css           ← Normalize & base reset
│   ├── variables.css       ← Design tokens (dark/light CSS custom properties)
│   ├── layout.css          ← Body, main panel, topbar, toast
│   ├── sidebar.css         ← Sidebar, brand, new-chat button, history list, footer
│   ├── chat.css            ← Chat area, message bubbles, welcome screen, typing dots
│   ├── input.css           ← Input box, toolbar, emoji picker, image preview, send button
│   ├── animations.css      ← All @keyframes & animation utilities
│   └── responsive.css      ← Mobile/tablet breakpoints
│
└── js/
    ├── storage.js          ← localStorage CRUD for chats & messages
    ├── ai.js               ← AI response engine (fake responses + optional real API)
    ├── chat.js             ← Message rendering, send flow, clear, download
    ├── voice.js            ← Speech-to-Text (Web Speech API) + Text-to-Speech
    ├── ui.js               ← Sidebar toggle, emoji picker, history list, theme, toast
    └── app.js              ← Entry point — wires all modules, handles input events
```

## 🚀 Features

| Feature | Details |
|---|---|
| Dark / Light theme | Toggle in sidebar; persisted to localStorage |
| Chat history | Multiple chats stored in localStorage; sidebar list |
| Image upload | Gallery picker (`<input>`) + mobile camera (`capture="environment"`) |
| Image preview | Thumbnail shown before sending; removable |
| Voice input | Web Speech API — click mic to dictate |
| Voice output | Web Speech Synthesis — click "Read" on any AI message |
| Emoji picker | 80+ emojis; click inserts at cursor position |
| Typing animation | Three bouncing dots while AI "thinks" |
| Auto-scroll | Scrolls to latest message automatically |
| Copy message | Per-message copy button |
| Clear chat | Clears current chat messages |
| Download chat | Exports full conversation as `.txt` |
| Delete all | Wipe all stored chats |
| Suggestion cards | Four starter prompts on welcome screen |
| Fake AI engine | Keyword-based response bank; no API key needed |
| Real API support | Set `AI_CONFIG.apiKey` and `useReal: true` in `js/ai.js` |
| Responsive | Full mobile layout; sidebar becomes a slide-in drawer |
| Netlify-ready | Drop the folder in Netlify; works out of the box |

## 🔧 Using a Real API (Optional)

Open `js/ai.js` and update the config block:

```js
const AI_CONFIG = {
  apiKey  : 'YOUR_ANTHROPIC_API_KEY',
  model   : 'claude-sonnet-4-20250514',
  useReal : true,
};
```

> ⚠️ For production, never expose API keys in frontend code. Use a backend proxy or Netlify Functions.

## 🌐 Deploying to Netlify

1. Drag and drop the `aichat/` folder onto [netlify.com/drop](https://app.netlify.com/drop)
2. Done — your site is live!

Or via Netlify CLI:
```bash
netlify deploy --dir=aichat --prod
```

## 🖥️ Running Locally

Just open `index.html` in a browser — no build step needed.

For camera/mic permissions to work properly, serve over HTTPS or `localhost`:
```bash
npx serve aichat
# or
python3 -m http.server 3000 --directory aichat
```

## 📱 Mobile Support

- Sidebar slides in as a drawer
- Camera input uses `capture="environment"` (rear camera by default)
- Touch-friendly tap targets throughout
- Voice input works on iOS Safari and Chrome for Android
=======
# aichatbot
>>>>>>> 4fad1d8e0391b1d08c3240c2cae6720b2aac76bd
