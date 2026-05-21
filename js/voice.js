/* ============================================================
   voice.js — Speech-to-Text & Text-to-Speech using Web APIs
   NOTE: autoResizeTextarea() and updateSendBtn() are defined
   in app.js — voice.js calls them but does NOT redefine them.
   ============================================================ */

let recognition      = null;
let isRecording      = false;
let currentUtterance = null;

const micBtn = document.getElementById('micBtn');

// ── INIT SPEECH RECOGNITION ──────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function initSpeechRecognition() {
  if (!SpeechRecognition) return false;

  recognition = new SpeechRecognition();
  recognition.continuous     = false;
  recognition.interimResults = true;
  recognition.lang           = navigator.language || 'en-US';

  recognition.onresult = (e) => {
    const input = document.getElementById('messageInput');
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final   += e.results[i][0].transcript;
      else                       interim += e.results[i][0].transcript;
    }
    const base   = input.value.replace(/\s*\[…\].*$/, '').trimEnd();
    input.value  = final
      ? (base + (base ? ' ' : '') + final)
      : (base + (interim ? ` […] ${interim}` : ''));
    autoResizeTextarea();
    updateSendBtn();
  };

  recognition.onend   = () => {
    const input = document.getElementById('messageInput');
    input.value = input.value.replace(/\s*\[…\].*$/, '').trim();
    autoResizeTextarea();
    updateSendBtn();
    stopRecording();
  };

  recognition.onerror = (e) => {
    showToast('Mic error: ' + e.error);
    stopRecording();
  };

  return true;
}

// ── TOGGLE RECORDING ─────────────────────────────────────────
function toggleRecording() {
  isRecording ? stopRecording() : startRecording();
}

function startRecording() {
  if (!recognition && !initSpeechRecognition()) {
    showToast('Speech recognition not supported in this browser');
    return;
  }
  try {
    recognition.start();
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.querySelector('i').className = 'ph ph-microphone-slash';
    showToast('Listening…');
  } catch (e) {
    console.warn('Recognition start error:', e);
  }
}

function stopRecording() {
  if (recognition && isRecording) {
    try { recognition.stop(); } catch {}
  }
  isRecording = false;
  micBtn.classList.remove('recording');
  micBtn.querySelector('i').className = 'ph ph-microphone';
}

micBtn.addEventListener('click', toggleRecording);

// ── TEXT-TO-SPEECH ───────────────────────────────────────────
function speakText(text, btn = null) {
  if (!window.speechSynthesis) {
    showToast('Text-to-speech not supported');
    return;
  }
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    if (btn) btn.innerHTML = '<i class="ph ph-speaker-high"></i> Read';
    currentUtterance = null;
    return;
  }
  const clean = text
    .replace(/```[\s\S]*?```/g, 'code block.')
    .replace(/`[^`]+`/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  currentUtterance        = new SpeechSynthesisUtterance(clean);
  currentUtterance.rate   = 1.0;
  currentUtterance.pitch  = 1.0;
  currentUtterance.volume = 1.0;
  currentUtterance.lang   = navigator.language || 'en-US';

  if (btn) {
    btn.innerHTML = '<i class="ph ph-stop-circle"></i> Stop';
    currentUtterance.onend = currentUtterance.onerror = () => {
      btn.innerHTML    = '<i class="ph ph-speaker-high"></i> Read';
      currentUtterance = null;
    };
  }
  speechSynthesis.speak(currentUtterance);
}
