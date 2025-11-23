// =========================================================
// Elements
// =========================================================
const roleInput = document.getElementById("role");
const startBtn = document.getElementById("startBtn");
const chatDiv = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const statusText = document.querySelector('.status-text');
const localTime = document.getElementById('localTime');

// =========================================================
// Global variables
// =========================================================
let sessionId = null;
let isListening = false;
const roleQuestions = {
  "Software Engineer": [
    "What is SQL and why is it used?",
    "Explain the difference between a list and a tuple in Python.",
    "What are REST APIs and how do they work?",
    "What is the difference between HTTP and HTTPS?"
  ],
  "Data Scientist": [
    "Explain the difference between supervised and unsupervised learning.",
    "What is a confusion matrix?",
    "How do you handle missing data in a dataset?",
    "Explain the difference between Python lists and NumPy arrays."
  ]
  // Add more roles here
};
let session = {
  role: null,
  askedQuestions: [], // store index of questions already asked
};
function getNextQuestion(role) {
  const questions = roleQuestions[role];
  if (!questions) return "No questions available for this role.";

  // Filter out questions already asked
  const remainingQuestions = questions.filter((q, index) => !session.askedQuestions.includes(index));

  if (remainingQuestions.length === 0) {
    return "You have answered all the questions for this role!";
  }

  // Pick a random question
  const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
  const question = remainingQuestions[randomIndex];

  // Save index to askedQuestions
  session.askedQuestions.push(questions.indexOf(question));

  return question;
}
startBtn.addEventListener("click", () => {
  const role = roleInput.value.trim();
  if (!roleQuestions[role]) {
    alert("Role not found!");
    return;
  }
  session.role = role;
  session.askedQuestions = [];
  
  const firstQuestion = getNextQuestion(role);
  appendMessage("Interviewer", firstQuestion, "agent");
  speak(firstQuestion); // ElevenLabs TTS
});
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("You", text, "you");
  userInput.value = "";

  // Ask next question after answer
  const nextQuestion = getNextQuestion(session.role);
  appendMessage("Interviewer", nextQuestion, "agent");
  speak(nextQuestion);
}

// =========================================================
// Update local time display
// =========================================================
function updateLocalTime() {
    const timeElement = document.getElementById("localTime");
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

// Update time immediately and then every minute
updateLocalTime();
setInterval(updateLocalTime, 60000);

// =========================================================
// Stop all TTS
// =========================================================
function stopTTS() {
    speechSynthesis.cancel();
}

// =========================================================
// Speech Recognition Setup - FIXED VERSION
// =========================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;  // CHANGED: Set to false to stop after each result

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add("listening");
        micBtn.textContent = '●';
        console.log("Speech recognition started");
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove("listening");
        micBtn.textContent = '🎤';
        console.log("Speech recognition ended");
    };

    recognition.onerror = (e) => {
        console.error("Speech Error:", e);
        isListening = false;
        micBtn.classList.remove("listening");
        micBtn.textContent = '🎤';
    };

    recognition.onresult = (event) => {
        console.log("Speech result received");
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript.trim();  // Only put text into input, no auto-send
    };
} else {
    console.warn("Speech Recognition not supported in this browser.");
    micBtn.disabled = true;
    micBtn.title = "Speech recognition not supported";
}

// =========================================================
// Custom Neon Alert
// =========================================================
function showNeonAlert(message, title = "Attention") {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'neon-alert-overlay';
        
        // Create alert
        const alert = document.createElement('div');
        alert.className = 'neon-alert';
        alert.innerHTML = `
            <div class="neon-alert-icon">⚠️</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="neon-alert-buttons">
                <button class="neon-alert-btn confirm">Got it</button>
            </div>
        `;
        
        overlay.appendChild(alert);
        document.body.appendChild(overlay);
        
        // Focus the button for accessibility
        const confirmBtn = alert.querySelector('.confirm');
        confirmBtn.focus();
        
        // Handle confirm button click
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        // Handle overlay click (close when clicking outside)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(true);
            }
        });
        
        // Handle Escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleKeydown);
                resolve(true);
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
    });
}

// =========================================================
// Role Validation
// =========================================================
function isValidRole(role) {
    if (!role || role.trim().length < 2) return false;
    
    const roleLower = role.toLowerCase().trim();
    
    // Common invalid inputs (names, greetings, etc.)
    const invalidPatterns = [
        // Common names and greetings
        /\b(hi|hello|hey|my name is|i am|this is)\b/i,
        /\b(mr|ms|mrs|dr|prof)\b\.?\s+\w+/i,
        // Single words that are likely names
        /\b(john|jane|smith|doe|alex|mike|david|sarah|emma|lucas)\b/i,
        // Too short or generic
        /^\w+$/i // Single word only
    ];
    
    // Check for invalid patterns
    for (const pattern of invalidPatterns) {
        if (pattern.test(roleLower)) {
            return false;
        }
    }
    
    // Check if it looks like a job role (positive patterns)
    const jobRoleIndicators = [
        // Job titles with common prefixes/suffixes
        /\b(senior|junior|lead|principal|staff|associate|assistant)\b/i,
        /\b(engineer|developer|analyst|manager|specialist|consultant|architect)\b/i,
        /\b(director|head|chief|officer|president|vice president)\b/i,
        /\b(designer|researcher|scientist|advisor|coordinator)\b/i,
        // Common role patterns
        /\w+\s+\w+/i, // At least two words
        /.+[eE]ngineer$/i,
        /.+[dD]eveloper$/i,
        /.+[mM]anager$/i,
        /.+[aA]nalyst$/i,
        /.+[dD]esigner$/i
    ];
    
    // If it matches at least one job role indicator, consider it valid
    for (const indicator of jobRoleIndicators) {
        if (indicator.test(roleLower)) {
            return true;
        }
    }
    
    // If it's a longer description that might be a role
    if (roleLower.split(/\s+/).length >= 3) {
        return true;
    }
    
    return false;
}

// =========================================================
// Get Role Suggestions
// =========================================================
function getRoleSuggestions() {
    return [
        "Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "Machine Learning Engineer",
        "DevOps Engineer",
        "Cloud Architect",
        "Product Manager",
        "Project Manager",
        "UX Designer",
        "UI Designer",
        "Data Analyst",
        "Business Analyst",
        "System Administrator",
        "Network Engineer",
        "Security Analyst",
        "QA Engineer",
        "Mobile Developer",
        "Web Developer",
        "Database Administrator",
        "Technical Lead",
        "Solution Architect",
        "Scrum Master",
        "Product Owner"
    ];
}

// =========================================================
// Start Interview
// =========================================================
startBtn.addEventListener("click", async () => {
    const role = roleInput.value.trim();
    
    // Validate role
    if (!role) {
        await showNeonAlert("Please enter a role to start the interview practice session.", "Role Required");
        roleInput.focus();
        return;
    }
    
    if (!isValidRole(role)) {
        const suggestions = getRoleSuggestions();
        const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        await showNeonAlert(
            `"${role}" doesn't look like a job role. Please enter a valid job position.<br><br>Try something like:<br>• ${randomSuggestions.join('<br>• ')}`,
            "Invalid Role"
        );
        roleInput.focus();
        roleInput.select();
        return;
    }

    startBtn.disabled = true;
    startBtn.textContent = "Starting...";
    statusText.textContent = "Starting...";

    try {
        const res = await fetch("http://127.0.0.1:8000/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role })
        });

        if (!res.ok) throw new Error('Backend start failed: ' + res.status);
        
        const data = await res.json();
        sessionId = data.session_id;

        appendMessage("Interviewer", data.reply, "agent");
        speak(data.reply);
        statusText.textContent = "Active";

    } catch (err) {
        console.error(err);
        appendSystem('Could not start interview. Check backend (http://127.0.0.1:8000).');
        statusText.textContent = "Error";
    } finally {
        startBtn.disabled = false;
        startBtn.textContent = "Start Interview";
    }
});

// =========================================================
// Send Message (Manual only)
// =========================================================
sendBtn.addEventListener("click", sendMessage);

// Also allow sending with Enter key
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const text = userInput.value.trim();
    if (!text || !sessionId) {
        if (!text) showNeonAlert("Please enter a message or use the mic to speak", "Message Required");
        return;
    }

    appendMessage("You", text, "you");
    userInput.value = "";

    // Show typing indicator
    appendTyping();
    statusText.textContent = "Thinking...";

    fetch("http://127.0.0.1:8000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, text })
    })
    .then(res => {
        if (!res.ok) throw new Error('Server error: ' + res.status);
        return res.json();
    })
    .then(data => {
        removeTyping();
        appendMessage("Interviewer", data.reply, "agent");
        speak(data.reply);
        statusText.textContent = "Active";
    })
    .catch(err => {
        console.error(err);
        removeTyping();
        appendSystem('Network error while sending message.');
        statusText.textContent = "Error";
    });
}

// =========================================================
// Mic Toggle - FIXED VERSION
// =========================================================
micBtn.addEventListener("click", () => {
    if (!recognition) {
        showNeonAlert("Speech recognition not available", "Microphone Error");
        return;
    }

    stopTTS(); // Stop speaking when mic starts

    if (!isListening) {
        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting recognition:", e);
        }
    } else {
        recognition.stop();
    }
});

// =========================================================
// Add message to chat
// =========================================================
function appendMessage(sender, message, kind = 'agent') {
    const el = document.createElement('div');
    el.className = 'msg ' + (kind === 'you' ? 'you' : 'agent');
    el.innerHTML = `
        <div class="meta">
            <span class="assistant-name">${sender}</span> 
            <span class="time">${(new Date()).toLocaleTimeString()}</span>
        </div>
        <div class="content">${escapeHtml(message)}</div>
    `;
    chatDiv.appendChild(el);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// =========================================================
// Typing indicator functions
// =========================================================
function appendTyping() {
    const el = document.createElement('div');
    el.className = 'msg agent typing-indicator';
    el.id = 'typing-id';
    el.innerHTML = `
        <div class="meta">
            <span class="assistant-name">Interviewer</span> 
            <span class="time">${(new Date()).toLocaleTimeString()}</span>
        </div>
        <div class="typing">
            <div class="dot-anim"></div>
            <div class="dot-anim two"></div>
            <div class="dot-anim three"></div>
        </div>
    `;
    chatDiv.appendChild(el);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

function removeTyping() {
    const t = document.getElementById('typing-id');
    if (t) t.remove();
}

// =========================================================
// System message function
// =========================================================
function appendSystem(text) {
    const el = document.createElement('div');
    el.style.fontSize = '13px';
    el.style.color = '#9fb7c7';
    el.style.textAlign = 'center';
    el.style.margin = '6px 0';
    el.textContent = text;
    chatDiv.appendChild(el);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// =========================================================
// HTML escape function
// =========================================================
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<"'>]/g, 
        c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])
    );
}

// =========================================================
// Browser TTS
// =========================================================
function speak(text) {
    stopTTS();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = 1;
    
    // Handle TTS errors
    u.onerror = (event) => {
        console.error("TTS Error:", event);
    };
    
    speechSynthesis.speak(u);
}

// =========================================================
// Initialize with welcome message
// =========================================================
appendSystem('Welcome! Enter a role and click "Start Interview". Use the mic to speak answers.');

// Accessibility: keyboard focus
micBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter') micBtn.click(); });
sendBtn.addEventListener('keyup', (e) => { if (e.key === 'Enter') sendBtn.click(); });
