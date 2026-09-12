/* =========================================================
   MANGOROYALE
   Main application logic

   IMPORTANT:
   This is a lightweight browser-based visual analysis system.

   It does NOT use a real AI model.

   Instead, it examines image pixels using Canvas and creates
   a deterministic fictional "Royalty Score".

   A real computer-vision model could later replace the
   analyzeImage() function.
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");

const mangoGrid = document.getElementById("mangoGrid");
const candidateControls = document.getElementById("candidateControls");
const candidateCount = document.getElementById("candidateCount");

const judgmentArea = document.getElementById("judgmentArea");
const beginJudgmentBtn = document.getElementById("beginJudgmentBtn");

const analysisSection = document.getElementById("analysisSection");
const analysisTitle = document.getElementById("analysisTitle");
const analysisMessage = document.getElementById("analysisMessage");
const loaderProgress = document.getElementById("loaderProgress");
const analysisPercent = document.getElementById("analysisPercent");
const analysisCandidate = document.getElementById("analysisCandidate");
const terminalLines = document.getElementById("terminalLines");

const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboard = document.getElementById("leaderboard");
const revealWinnerBtn = document.getElementById("revealWinnerBtn");

const winnerSection = document.getElementById("winnerSection");
const countdown = document.getElementById("countdown");
const winnerReveal = document.getElementById("winnerReveal");

const winnerImage = document.getElementById("winnerImage");
const winnerNumber = document.getElementById("winnerNumber");
const winnerName = document.getElementById("winnerName");
const winnerScore = document.getElementById("winnerScore");
const winnerPersonality = document.getElementById("winnerPersonality");
const winnerVerdict = document.getElementById("winnerVerdict");

const archiveCandidates = document.getElementById("archiveCandidates");
const archiveRejected = document.getElementById("archiveRejected");
const archiveWinner = document.getElementById("archiveWinner");

const clearBtn = document.getElementById("clearBtn");
const enterCourtBtn = document.getElementById("enterCourtBtn");
const learnBtn = document.getElementById("learnBtn");
const newElectionBtn = document.getElementById("newElectionBtn");
const scrollCourtBtn = document.getElementById("scrollCourtBtn");

const confettiCanvas = document.getElementById("confettiCanvas");


/* =========================================================
   APPLICATION STATE
========================================================= */

let mangoes = [];
let analyzedMangoes = [];
let currentWinner = null;


/*
   There is deliberately NO hard-coded maximum number of
   mangoes.

   You can upload 2, 5, 10, 20, etc.

   The browser's practical limit is simply available memory.
*/


/* =========================================================
   FUNNY ROYAL PERSONALITIES
========================================================= */

const personalities = [
    "Extremely arrogant.",
    "Suspiciously confident.",
    "Clearly expects everyone to bow.",
    "Has absolutely no qualifications but somehow looks royal.",
    "Acts like it owns the entire supermarket.",
    "Quiet, but clearly judging everyone.",
    "Looks like it has royal blood.",
    "Definitely arrived expecting a coronation.",
    "Has the confidence of a mango with inherited wealth.",
    "Probably has a private mango palace.",
    "Refuses to acknowledge the other candidates.",
    "Behaves like the fruit basket belongs to them."
];


/* =========================================================
   FUNNY VERDICTS
========================================================= */

const verdicts = [
    "This mango clearly believes it owns the fruit basket.",
    "Royal blood detected. Probably.",
    "An unnecessary amount of confidence detected.",
    "Looks like it has never paid for a mango in its life.",
    "This mango entered the competition expecting to win.",
    "The Mango Council has been mildly intimidated.",
    "A suspicious amount of royal energy has been discovered.",
    "This candidate appears to have connections inside the Mango Palace.",
    "The Council cannot explain it, but this mango has presence.",
    "This mango looks like it already has a royal portrait.",
    "The palace doors opened before this mango even knocked.",
    "After extensive scientific nonsense, the Council approves."
];


/* =========================================================
   ROYAL TITLES
========================================================= */

function getRoyalTitle(score) {

    if (score >= 97) {
        return "SUPREME MANGO EMPEROR";
    }

    if (score >= 90) {
        return "ROYAL HEIR";
    }

    if (score >= 80) {
        return "DUKE OF THE MANGO KINGDOM";
    }

    if (score >= 70) {
        return "ROYAL COURT MEMBER";
    }

    if (score >= 60) {
        return "MANGO NOBLE";
    }

    if (score >= 50) {
        return "ROYAL INTERN";
    }

    return "REJECTED BY THE MANGO PALACE";
}


/* =========================================================
   RANDOM ITEM
========================================================= */

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

fileInput.addEventListener("change", function(event) {

    const files = Array.from(event.target.files);

    addFiles(files);

    /*
       Reset input value so selecting the same file again
       still triggers the change event.
    */

    fileInput.value = "";
});


function addFiles(files) {

    files.forEach(file => {

        if (!file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function(event) {

            const mango = {
                id: crypto.randomUUID
                    ? crypto.randomUUID()
                    : Date.now() + Math.random(),

                file: file,

                src: event.target.result,

                name: `Mango #${mangoes.length + 1}`,

                score: null,

                analysis: null
            };

            mangoes.push(mango);

            renderMangoes();
        };

        reader.readAsDataURL(file);
    });
}


/* =========================================================
   DRAG & DROP
========================================================= */

uploadBox.addEventListener("dragover", function(event) {

    event.preventDefault();

    uploadBox.classList.add("dragging");
});


uploadBox.addEventListener("dragleave", function() {

    uploadBox.classList.remove("dragging");
});


uploadBox.addEventListener("drop", function(event) {

    event.preventDefault();

    uploadBox.classList.remove("dragging");

    const files = Array.from(event.dataTransfer.files);

    addFiles(files);
});


/* =========================================================
   RENDER MANGO CARDS
========================================================= */

function renderMangoes() {

    mangoGrid.innerHTML = "";

    candidateCount.textContent = mangoes.length;

    if (mangoes.length === 0) {

        candidateControls.style.display = "none";
        judgmentArea.style.display = "none";

        return;
    }

    candidateControls.style.display = "flex";

    judgmentArea.style.display = "block";


    mangoes.forEach((mango, index) => {

        mango.name = `Mango #${index + 1}`;

        const card = document.createElement("div");

        card.className = "mango-card";

        card.innerHTML = `

            <button
                class="remove-mango"
                data-id="${mango.id}"
                title="Remove mango"
            >
                ×
            </button>

            <img
                class="mango-card-image"
                src="${mango.src}"
                alt="${mango.name}"
            >

            <div class="mango-card-info">

                <div class="mango-number">
                    ROYAL CANDIDATE ${index + 1}
                </div>

                <h3>${mango.name}</h3>

                <div class="mango-status">
                    Awaiting judgment from the Mango Council...
                </div>

                <div class="score-row">

                    <span class="score-label">
                        ROYALTY SCORE
                    </span>

                    <span class="score">
                        —
                    </span>

                </div>

            </div>
        `;

        mangoGrid.appendChild(card);
    });


    /* Connect remove buttons */

    document.querySelectorAll(".remove-mango").forEach(button => {

        button.addEventListener("click", function() {

            const id = button.dataset.id;

            mangoes = mangoes.filter(mango => mango.id != id);

            renderMangoes();
        });

    });
}


/* =========================================================
   CLEAR ALL
========================================================= */

clearBtn.addEventListener("click", function() {

    mangoes = [];

    analyzedMangoes = [];

    currentWinner = null;

    renderMangoes();
});


/* =========================================================
   LANDING BUTTONS
========================================================= */

enterCourtBtn.addEventListener("click", function() {

    document.getElementById("court").scrollIntoView({
        behavior: "smooth"
    });

});


learnBtn.addEventListener("click", function() {

    document.getElementById("constitution").scrollIntoView({
        behavior: "smooth"
    });

});


scrollCourtBtn.addEventListener("click", function() {

    document.getElementById("court").scrollIntoView({
        behavior: "smooth"
    });

});


/* =========================================================
   IMAGE ANALYSIS
========================================================= */

/*
   Lightweight visual analysis.

   We use Canvas to inspect image pixels.

   Features:

   1. Warm/mango colour presence
   2. Colour richness/saturation
   3. Visual prominence
   4. Shape-like distribution
   5. Image composition

   These numbers are NOT scientific.

   They simply create a reproducible fictional score.
*/


async function analyzeImage(src) {

    return new Promise((resolve) => {

        const img = new Image();

        img.onload = function() {

            const canvas = document.createElement("canvas");

            /*
               Resize for faster processing.
            */

            const maxSize = 250;

            const scale = Math.min(
                1,
                maxSize / Math.max(img.width, img.height)
            );

            canvas.width = Math.max(1, Math.floor(img.width * scale));
            canvas.height = Math.max(1, Math.floor(img.height * scale));

            const ctx = canvas.getContext("2d", {
                willReadFrequently: true
            });

            ctx.drawImage(
                img,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const pixels = imageData.data;

            let warmPixels = 0;
            let saturatedPixels = 0;

            let brightnessTotal = 0;

            let centerWarm = 0;

            let nonBackground = 0;

            const totalPixels = pixels.length / 4;


            /*
               Examine pixels.
            */

            for (let i = 0; i < pixels.length; i += 4) {

                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                const brightness =
                    (r + g + b) / 3;

                brightnessTotal += brightness;


                /*
                   Rough mango-like warm colour detector.

                   We look for yellows/oranges/golden tones.
                */

                const looksWarm =
                    r > g * 1.08 &&
                    g > b * 1.15 &&
                    r > 100 &&
                    g > 60;


                if (looksWarm) {
                    warmPixels++;
                }


                /*
                   Rough saturation estimate.
                */

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);

                const saturation =
                    max === 0
                        ? 0
                        : (max - min) / max;


                if (saturation > 0.25) {
                    saturatedPixels++;
                }


                /*
                   Check center region.

                   A mango occupying the central part of the
                   image receives a fictional prominence bonus.
                */

                const pixelIndex = i / 4;

                const x =
                    pixelIndex % canvas.width;

                const y =
                    Math.floor(
                        pixelIndex / canvas.width
                    );

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                const dx = x - centerX;
                const dy = y - centerY;

                const distance =
                    Math.sqrt(dx * dx + dy * dy);

                const maxDistance =
                    Math.sqrt(
                        centerX * centerX +
                        centerY * centerY
                    );

                const normalizedDistance =
                    distance / maxDistance;


                if (
                    looksWarm &&
                    normalizedDistance < 0.55
                ) {
                    centerWarm++;
                }
            }


            /*
               Convert raw values into 0-100 metrics.
            */

            const warmRatio =
                warmPixels / totalPixels;

            const saturationRatio =
                saturatedPixels / totalPixels;

            const centerRatio =
                centerWarm / totalPixels;

            const averageBrightness =
                brightnessTotal / totalPixels;


            /*
               Image dimensions can influence "presence".
            */

            const aspectRatio =
                img.width / img.height;

            const shapeBalance =
                1 -
                Math.min(
                    1,
                    Math.abs(aspectRatio - 0.85)
                );


            /*
               Fictional scores.
            */

            const colourScore =
                clamp(
                    35 +
                    warmRatio * 100,
                    0,
                    100
                );

            const saturationScore =
                clamp(
                    30 +
                    saturationRatio * 80,
                    0,
                    100
                );

            const prominenceScore =
                clamp(
                    30 +
                    centerRatio * 150,
                    0,
                    100
                );

            const shapeScore =
                clamp(
                    shapeBalance * 100,
                    0,
                    100
                );


            /*
               Brightness has only a small effect.
            */

            const brightnessScore =
                clamp(
                    100 -
                    Math.abs(
                        averageBrightness - 155
                    ) / 2,
                    0,
                    100
                );


            /*
               Final fictional Royalty Score.

               This is intentionally ridiculous.
            */

            let finalScore =
                colourScore * 0.30 +
                saturationScore * 0.18 +
                prominenceScore * 0.25 +
                shapeScore * 0.15 +
                brightnessScore * 0.12;


            /*
               Small deterministic visual variation.

               This prevents many visually similar images from
               ending with identical scores.
            */

            const visualVariation =
                (
                    Math.floor(
                        warmRatio * 10000
                    ) % 7
                ) - 3;


            finalScore += visualVariation;


            finalScore =
                Math.round(
                    clamp(finalScore, 1, 99)
                );


            resolve({

                score: finalScore,

                colourScore: Math.round(colourScore),

                saturationScore:
                    Math.round(saturationScore),

                prominenceScore:
                    Math.round(prominenceScore),

                shapeScore:
                    Math.round(shapeScore),

                brightnessScore:
                    Math.round(brightnessScore),

                warmRatio,

                averageBrightness
            });

        };


        img.onerror = function() {

            /*
               Safe fallback.

               The image still participates in the election.
            */

            resolve({
                score: 50,
                colourScore: 50,
                saturationScore: 50,
                prominenceScore: 50,
                shapeScore: 50,
                brightnessScore: 50
            });

        };


        img.src = src;

    });
}


/* =========================================================
   CLAMP
========================================================= */

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );

}


/* =========================================================
   START ROYAL JUDGMENT
========================================================= */

beginJudgmentBtn.addEventListener(
    "click",
    beginJudgment
);


async function beginJudgment() {

    if (mangoes.length < 2) {

        alert(
            "The Mango Council requires at least TWO candidates. A monarchy needs competition. 👑🥭"
        );

        return;
    }


    /*
       Hide previous screens.
    */

    leaderboardSection.classList.add("hidden");
    winnerSection.classList.add("hidden");

    analysisSection.classList.remove("hidden");

    document.getElementById("court")
        .scrollIntoView({
            behavior: "smooth"
        });


    analyzedMangoes = [];


    loaderProgress.style.width = "0%";
    analysisPercent.textContent = "0%";

    terminalLines.innerHTML = "";


    /*
       Fake dramatic analysis messages.
    */

    const openingMessages = [
        "🔍 Locating mangoes...",
        "🥭 Detecting royal candidates...",
        "👁️ Examining mango appearance...",
        "👑 Measuring royal vibes...",
        "📜 Consulting the Mango Council...",
        "⚖️ Comparing candidates...",
        "🚨 Detecting suspicious levels of confidence...",
        "📊 Performing completely unnecessary calculations...",
        "🏰 Checking Mango Palace eligibility...",
        "👑 Selecting the rightful ruler..."
    ];


    for (const message of openingMessages) {

        addTerminalLine(message);

        analysisMessage.textContent =
            message;

        await sleep(420);
    }


    /*
       Actually analyze EVERY mango.
    */

    for (
        let i = 0;
        i < mangoes.length;
        i++
    ) {

        const mango = mangoes[i];

        analysisCandidate.textContent =
            `EXAMINING ${mango.name.toUpperCase()}`;


        const progressStart =
            Math.round(
                (i / mangoes.length) * 80
            );

        updateProgress(progressStart);


        addTerminalLine(
            `> Opening royal file: ${mango.name}`
        );


        const result =
            await analyzeImage(mango.src);


        mango.score =
            result.score;

        mango.analysis =
            result;


        mango.personality =
            randomItem(personalities);

        mango.verdict =
            randomItem(verdicts);

        mango.title =
            getRoyalTitle(result.score);


        analyzedMangoes.push(mango);


        const progressEnd =
            Math.round(
                ((i + 1) / mangoes.length) * 80
            );


        for (
            let p = progressStart;
            p <= progressEnd;
            p++
        ) {

            updateProgress(p);

            await sleep(15);
        }


        addTerminalLine(
            `✓ ${mango.name}: ${mango.score}% royal`
        );

    }


    /*
       Sort all candidates.

       IMPORTANT:
       This is where the actual comparison happens.
    */

    analyzedMangoes.sort(
        (a, b) =>
            b.score - a.score
    );


    /*
       Add final dramatic messages.
    */

    const finalMessages = [
        "⚖️ Comparing the royal bloodlines...",
        "📜 Reviewing the Mango Constitution...",
        "👑 Council members are arguing...",
        "🚨 One mango has become suspiciously powerful...",
        "🥭 Final royal calculations...",
        "👑 THE JUDGMENT IS COMPLETE."
    ];


    for (const message of finalMessages) {

        addTerminalLine(message);

        analysisMessage.textContent =
            message;

        await sleep(500);
    }


    updateProgress(100);

    analysisPercent.textContent = "100%";


    await sleep(900);


    /*
       Display leaderboard.
    */

    analysisSection.classList.add("hidden");

    showLeaderboard();

}


/* =========================================================
   PROGRESS
========================================================= */

function updateProgress(value) {

    const safeValue =
        clamp(value, 0, 100);

    loaderProgress.style.width =
        `${safeValue}%`;

    analysisPercent.textContent =
        `${safeValue}%`;

}


/* =========================================================
   TERMINAL
========================================================= */

function addTerminalLine(text) {

    const line =
        document.createElement("div");

    line.className =
        "terminal-line";

    line.textContent =
        text;

    terminalLines.appendChild(line);

    /*
       Keep terminal scrolled to bottom.
    */

    terminalLines.scrollTop =
        terminalLines.scrollHeight;

}


/* =========================================================
   LEADERBOARD
========================================================= */

function showLeaderboard() {

    leaderboard.innerHTML = "";

    analyzedMangoes.forEach(
        (mango, index) => {

            const row =
                document.createElement("div");

            row.className =
                "leader-row";

            row.style.animationDelay =
                `${index * 0.08}s`;


            let medal;

            if (index === 0) {
                medal = "🥇";
            } else if (index === 1) {
                medal = "🥈";
            } else if (index === 2) {
                medal = "🥉";
            } else {
                medal = `${index + 1}`;
            }


            row.innerHTML = `

                <div class="rank-number">
                    ${medal}
                </div>

                <img
                    class="rank-thumb"
                    src="${mango.src}"
                    alt="${mango.name}"
                >

                <div>

                    <div class="rank-name">
                        ${mango.name}
                    </div>

                    <div class="rank-title">
                        ${mango.title}
                    </div>

                </div>

                <div class="rank-score">
                    ${mango.score}%
                </div>
            `;


            leaderboard.appendChild(row);

        }
    );


    leaderboardSection.classList.remove("hidden");


    leaderboardSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================================
   WINNER REVEAL
========================================================= */

revealWinnerBtn.addEventListener(
    "click",
    revealWinner
);


async function revealWinner() {

    currentWinner =
        analyzedMangoes[0];


    winnerSection.classList.remove(
        "hidden"
    );

    winnerSection.scrollIntoView({
        behavior: "smooth"
    });


    winnerReveal.classList.add(
        "hidden"
    );


    /*
       Countdown
    */

    const numbers = ["3", "2", "1"];

    for (const number of numbers) {

        countdown.textContent =
            number;

        countdown.classList.remove(
            "countdown"
        );

        void countdown.offsetWidth;

        countdown.classList.add(
            "countdown"
        );

        await sleep(1000);
    }


    countdown.textContent =
        "👑";


    await sleep(700);


    /*
       Fill winner information.
    */

    winnerImage.src =
        currentWinner.src;

    winnerNumber.textContent =
        currentWinner.name.toUpperCase();

    winnerName.textContent =
        currentWinner.title;

    winnerScore.textContent =
        `${currentWinner.score}%`;

    winnerPersonality.textContent =
        `"${currentWinner.personality}"`;

    winnerVerdict.textContent =
        `"${currentWinner.verdict}"`;


    /*
       Archive.
    */

    archiveCandidates.textContent =
        analyzedMangoes.length;

    archiveRejected.textContent =
        Math.max(
            0,
            analyzedMangoes.length - 1
        );

    archiveWinner.textContent =
        currentWinner.name.toUpperCase();


    /*
       Reveal.
    */

    winnerReveal.classList.remove(
        "hidden"
    );


    /*
       Fire confetti.
    */

    launchConfetti();

}


/* =========================================================
   NEW ELECTION
========================================================= */

newElectionBtn.addEventListener(
    "click",
    function() {

        /*
           Keep uploaded mangoes so the judge can
           immediately run another election.
        */

        analyzedMangoes = [];

        currentWinner = null;

        winnerSection.classList.add(
            "hidden"
        );

        leaderboardSection.classList.add(
            "hidden"
        );

        renderMangoes();

        document.getElementById("court")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================================
   SLEEP
========================================================= */

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );

}


/* =========================================================
   CONFETTI
========================================================= */

function launchConfetti() {

    const canvas =
        confettiCanvas;

    const ctx =
        canvas.getContext("2d");

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    const particles = [];

    const symbols = [
        "✦",
        "✧",
        "👑",
        "🥭",
        "★"
    ];


    /*
       Create particles.
    */

    for (
        let i = 0;
        i < 180;
        i++
    ) {

        particles.push({

            x:
                Math.random() *
                canvas.width,

            y:
                -Math.random() *
                canvas.height,

            size:
                8 +
                Math.random() * 18,

            speed:
                2 +
                Math.random() * 5,

            drift:
                (Math.random() - 0.5) * 2,

            rotation:
                Math.random() *
                Math.PI *
                2,

            rotationSpeed:
                (Math.random() - 0.5) *
                0.15,

            symbol:
                symbols[
                    Math.floor(
                        Math.random() *
                        symbols.length
                    )
                ],

            opacity: 1

        });

    }


    let startTime =
        performance.now();


    function animate(now) {

        const elapsed =
            now - startTime;


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        particles.forEach(
            particle => {

                particle.y +=
                    particle.speed;

                particle.x +=
                    particle.drift;

                particle.rotation +=
                    particle.rotationSpeed;


                if (
                    elapsed > 2500
                ) {

                    particle.opacity =
                        Math.max(
                            0,
                            1 -
                            (
                                (elapsed - 2500) /
                                2500
                            )
                        );

                }


                ctx.save();

                ctx.globalAlpha =
                    particle.opacity;

                ctx.translate(
                    particle.x,
                    particle.y
                );

                ctx.rotate(
                    particle.rotation
                );


                ctx.font =
                    `${particle.size}px serif`;

                ctx.fillText(
                    particle.symbol,
                    0,
                    0
                );


                ctx.restore();

            }
        );


        if (
            elapsed < 5000
        ) {

            requestAnimationFrame(
                animate
            );

        } else {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }

    }


    requestAnimationFrame(
        animate
    );

}


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function() {

        if (
            confettiCanvas
        ) {

            confettiCanvas.width =
                window.innerWidth;

            confettiCanvas.height =
                window.innerHeight;

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

renderMangoes();


/*
   Console message for the developers.

   This is intentionally ridiculous.
*/

console.log(
    "%c🥭 MANGOROYALE 👑",
    "font-size:25px;font-weight:bold;"
);

console.log(
    "The Mango Council is watching."
);

console.log(
    "Royal blood detection system: probably accurate."
);