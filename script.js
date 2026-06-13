const contentPool = {
    easy: [
        "Learning new skills requires dedication and consistent practice. Whether you are mastering a musical instrument or improving your typing speed, patience and perseverance are essential. Every small step forward contributes to your overall progress and success.",
        "The sun is shining bright in the clear sky. Birds are singing beautiful songs. It is a wonderful day to walk in the green park.",
        "I like to read books every day. Reading helps me learn new things. Books take me to amazing places. Stories make me happy and excited."
    ],
    medium: [
        "Developing good habits early in life can lay a solid foundation for future success. Regular exercise and balanced nutrition play vital roles in maintaining overall mental clarity.",
        "The advancement of digital communication technologies has effectively bridged global gaps, allowing instant interactions across continents. However, balancing screen time remains crucial."
    ],
    hard: [
        "The labyrinthine architecture of modern software ecosystems demands an exceptionally deep comprehension of structural design patterns, architectural paradigms, and asynchronous data pipelines.",
        "Quantum computing utilizes fundamental principles of superposition and entanglement, radically outperforming classical computational models when processing encrypted multi-layered calculations."
    ]
};

let activeDifficulty = 'easy';
let rawParagraphText = "";
let splitWords = [];
let indexPointer = 0;

let timeLeft = 60;
let countdownRef = null;
let executionFlag = false;
let misstepsCount = 0;
let keysStrokeCount = 0;

// Dom Elements Fetch
const targetRender = document.getElementById('paragraph-render-target');
const mainInput = document.getElementById('main-typing-field');
const uiTimer = document.getElementById('live-timer');
const uiWpm = document.getElementById('live-wpm');
const uiAcc = document.getElementById('live-accuracy');
const uiMistakes = document.getElementById('live-mistakes');
const windowOverlay = document.getElementById('results-card-window');

function jumpToWorkspace() {
    document.getElementById('typing-board').scrollIntoView({ behavior: 'smooth' });
    mainInput.focus();
}

function jumpToTraining() {
    windowOverlay.classList.remove('show');
    document.getElementById('training-rack').scrollIntoView({ behavior: 'smooth' });
}

function initializeTextLoad() {
    const list = contentPool[activeDifficulty];
    rawParagraphText = list[Math.floor(Math.random() * list.length)];
    compileWordsLayout(rawParagraphText);
}

function compileWordsLayout(text) {
    splitWords = text.split(" ");
    targetRender.innerHTML = splitWords.map((word, i) => {
        return `<span class="word ${i === 0 ? 'active-current' : ''}" id="w-id-${i}">${word}</span>`;
    }).join("");
    indexPointer = 0;
    mainInput.value = "";
}

function setMode(mode, hostNode) {
    if (executionFlag) {
        if(!confirm("Reset current progress to switch difficulty?")) return;
        restartEngine();
    }
    activeDifficulty = mode;
    document.querySelectorAll('.diff-box').forEach(node => node.classList.remove('active'));
    hostNode.classList.add('active');
    initializeTextLoad();
}

function importPracticeText(text) {
    restartEngine();
    rawParagraphText = text;
    compileWordsLayout(text);
    document.getElementById('typing-board').scrollIntoView({ behavior: 'smooth' });
    mainInput.focus();
}

// Processing Input Engine Streams
mainInput.addEventListener('input', () => {
    const val = mainInput.value;

    // First stroke trigger
    if (!executionFlag && timeLeft > 0 && val.length > 0) {
        startCountdownTracker();
    }

    if (!executionFlag) return;

    const nodeWord = document.getElementById(`w-id-${indexPointer}`);
    if (!nodeWord) return;

    const targetWordMatch = splitWords[indexPointer];

    // Sub-word parsing indicator rule
    if (!targetWordMatch.startsWith(val.trim()) && val.trim().length > 0) {
        nodeWord.className = "word active-current match-error";
    } else {
        nodeWord.className = "word active-current";
    }

    // Word finalized trigger on Spacebar press
    if (val.endsWith(" ")) {
        const standardInput = val.trim();

        if (standardInput === targetWordMatch) {
            nodeWord.className = "word match-success";
            keysStrokeCount += targetWordMatch.length + 1;
        } else {
            nodeWord.className = "word match-error";
            misstepsCount++;
            keysStrokeCount += standardInput.length + 1;
        }

        indexPointer++;

        if (indexPointer >= splitWords.length) {
            refreshScores();
            terminateSession();
            return;
        }

        const subsequentNode = document.getElementById(`w-id-${indexPointer}`);
        if (subsequentNode) {
            subsequentNode.classList.add('active-current');
        }

        mainInput.value = "";
    }

    refreshScores();
});

function refreshScores() {
    const timePassed = 60 - timeLeft;
    let computedWpm = 0;
    if (timePassed > 0) {
        computedWpm = Math.round((keysStrokeCount / 5) / (timePassed / 60));
    }
    uiWpm.innerText = computedWpm;
    uiMistakes.innerText = misstepsCount;

    let computedAccuracy = 100;
    if (indexPointer > 0) {
        computedAccuracy = Math.round(((indexPointer - misstepsCount) / indexPointer) * 100);
        if (computedAccuracy < 0) computedAccuracy = 0;
    }
    uiAcc.innerText = `${computedAccuracy}%`;
}

function startCountdownTracker() {
    executionFlag = true;
    countdownRef = setInterval(() => {
        timeLeft--;
        uiTimer.innerText = `${timeLeft}s`;
        refreshScores();

        if (timeLeft <= 0) {
            terminateSession();
        }
    }, 1000);
}

function terminateSession() {
    clearInterval(countdownRef);
    executionFlag = false;
    mainInput.blur();

    const finalWpm = uiWpm.innerText;
    const finalAcc = uiAcc.innerText;

    document.getElementById('res-score-wpm').innerText = finalWpm;
    document.getElementById('res-score-accuracy').innerText = finalAcc;
    document.getElementById('res-score-mistakes').innerText = misstepsCount;
    document.getElementById('res-score-chars').innerText = keysStrokeCount;

    const msgNode = document.getElementById('feedback-message');
    const numWpm = parseInt(finalWpm);
    if(numWpm >= 55) {
        msgNode.innerText = "Exceptional speed! You type like an absolute master.";
    } else if(numWpm >= 35) {
        msgNode.innerText = "Excellent speed! Highly competent processing rates. Keep optimizing.";
    } else {
        msgNode.innerText = "Great job! Consistent daily practices will drastically accelerate your typing scores.";
    }

    windowOverlay.classList.add('show');
}

function restartEngine() {
    clearInterval(countdownRef);
    timeLeft = 60;
    misstepsCount = 0;
    keysStrokeCount = 0;
    executionFlag = false;

    uiTimer.innerText = "60s";
    uiWpm.innerText = "0";
    uiAcc.innerText = "100%";
    uiMistakes.innerText = "0";

    windowOverlay.classList.remove('show');
    initializeTextLoad();
    mainInput.focus();
}

window.onload = () => {
    initializeTextLoad();
};