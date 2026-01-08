let selectedWords = [];

async function loadKotoba() {
    try {
        const response = await fetch('./irodori.json'); 
        const data = await response.json();
        displayRandomWords(data);
    } catch (err) {
        console.error("Gagal memuat JSON:", err);
    }
}

function displayRandomWords(data) {
    const daftarBab = Object.keys(data);
    const babAcak = daftarBab[Math.floor(Math.random() * daftarBab.length)];
    const listKataDiBab = data[babAcak];

    const shuffled = listKataDiBab.sort(() => 0.5 - Math.random());
    selectedWords = shuffled.slice(0, 2); 

    const container = document.getElementById('word-display');
    container.innerHTML = selectedWords.map(w => `
        <div class="street-chip">
            ${w.kanji}
            <span class="block text-[10px] text-zinc-400 font-sans uppercase">${w.meaning}</span>
        </div>
    `).join('');
}

async function checkSentence() {
    const userInput = document.getElementById('user-input').value;
    const resultDiv = document.getElementById('result-container');
    const btn = document.getElementById('btn-check');
    
    if (!userInput) return;

    btn.innerText = "SCANNING...";
    btn.style.opacity = "0.5";

    const kotobaHanyaJepang = selectedWords.map(w => w.kanji);

    try {
        const response = await fetch('http://localhost:8080/api/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                words: kotobaHanyaJepang,
                userSentence: userInput
            })
        });

        const result = await response.json();

        // UI Reset & Update
        resultDiv.classList.remove('hidden', 'correct', 'wrong');
        resultDiv.classList.add(result.is_correct ? 'correct' : 'wrong');
        
        document.getElementById('result-status').innerText = result.is_correct ? "PERFECT! 🐾" : "REJECTED!";
        document.getElementById('result-correction').innerText = result.correction || userInput;
        document.getElementById('result-explanation').innerText = result.explanation;

        // Scroll ke hasil
        resultDiv.scrollIntoView({ behavior: 'smooth' });
        
    } catch (err) {
        alert("SERVER_ERROR: Hubungkan ke Node.js!");
    } finally {
        btn.innerText = "VALIDATE_MISSION";
        btn.style.opacity = "1";
    }
}

document.getElementById('btn-check').addEventListener('click', checkSentence);
document.getElementById('btn-refresh').addEventListener('click', loadKotoba);

// Start
loadKotoba();
