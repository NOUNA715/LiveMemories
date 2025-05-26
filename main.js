let mediaRecorder;
let recordedChunks = [];
let recordedBlob;

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById('recordedVideo').srcObject = stream;
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) recordedChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    document.getElementById('recordedVideo').srcObject = null;
    document.getElementById('recordedVideo').src = URL.createObjectURL(recordedBlob);
  };

  mediaRecorder.start();

  setTimeout(() => {
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
  }, 10000);
}

async function uploadToDrive() {
  if (!recordedBlob) {
    alert("📂 Please record a memory first.");
    return;
  }

  const status = document.getElementById("uploadStatus");
  status.textContent = "Uploading...";

  setTimeout(() => {
    status.textContent = "✅ Uploaded to cloud (simulation).";
  }, 2000);
}

function sendReminder() {
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('🧠 Time to reflect!', {
          body: 'Write or record your memory of the day.',
          icon: 'icon-192.png'
        });
      }
    });
  }
}

function generateAIMemory() {
  const examples = [
    "Today reminds you of a sunny walk with a loved one.",
    "Your memory on this day: discovering something new.",
    "A perfect day to look back and be grateful for the journey.",
    "Memory flashback: a birthday full of laughter and light.",
    "Let today be a fresh page in your story."
  ];
  const random = examples[Math.floor(Math.random() * examples.length)];
  document.getElementById("aiContent").textContent = random;
}

function translateUI() {
  const lang = navigator.language || navigator.userLanguage;
  const translations = {
    fr: {
      title: "Bienvenue à LiveMemories",
      description: "Votre application de journal des souvenirs multiplateforme. Installez-la et profitez-en!",
      recordBtn: "Commencer l'enregistrement",
      uploadBtn: "Téléverser vers le cloud",
      aiTitle: "Souvenir du jour (IA)"
    },
    ar: {
      title: "مرحبًا بك في لايف ميموريز",
      description: "تطبيق يوميات الذكريات عبر جميع الأجهزة. قم بالتثبيت واستمتع!",
      recordBtn: "ابدأ التسجيل",
      uploadBtn: "رفع إلى السحابة",
      aiTitle: "ذكرى اليوم (ذكاء اصطناعي)"
    },
    es: {
      title: "Bienvenido a LiveMemories",
      description: "Tu app multiplataforma para memorias. ¡Instálala y disfruta!",
      recordBtn: "Comenzar a grabar",
      uploadBtn: "Subir a la nube",
      aiTitle: "Recuerdo del día (IA)"
    }
  };

  const t = translations[lang.slice(0, 2)];
  if (t) {
    document.getElementById("title").textContent = t.title;
    document.getElementById("description").textContent = t.description;
    document.getElementById("recordBtn").textContent = t.recordBtn;
    document.getElementById("uploadBtn").textContent = t.uploadBtn;
    document.getElementById("aiTitle").textContent = t.aiTitle;
  }
}

generateAIMemory();
translateUI();

let deferredPrompt;
const installPrompt = document.getElementById("installPrompt");

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.createElement("button");
  btn.textContent = "📲 Install LiveMemories";
  btn.onclick = () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      installPrompt.textContent = choice.outcome === 'accepted'
        ? "✅ App installed!"
        : "❌ Installation dismissed.";
    });
  };
  installPrompt.appendChild(btn);
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('✅ Service Worker Registered:', reg.scope))
    .catch(err => console.error('❌ Service Worker Registration Failed:', err));
}
