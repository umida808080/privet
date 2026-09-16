// База данных слов встроена прямо в код страницы
const currentWords = [
    {
      "id": 1,
      "word": "привет",
      "image": "privet.jpg",
      "audio": "privet.mp3"
    },
    {
      "id": 2,
      "word": "здравствуйте",
      "image": "zdravst.jpg",
      "audio": "zdravst.mp3"
    }
];

let currentIndex = 0;
let currentAudio = null;

const wordImage = document.getElementById('word-image');
const wordText = document.getElementById('word-text');
const btnPlay = document.getElementById('btn-play');
const btnSpeak = document.getElementById('btn-speak');
const btnNext = document.getElementById('btn-next');
const resultText = document.getElementById('result-text');

// Автоматический старт при открытии страницы
showWord();

function showWord() {
    const activeWord = currentWords[currentIndex];
    wordText.innerText = activeWord.word;
    wordImage.src = activeWord.image;
    
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(activeWord.audio);
    
    resultText.innerText = "Нажмите «Говорить» и произнесите слово.";
    resultText.style.color = "#222222";
    btnNext.classList.add('hidden');
}

btnPlay.onclick = () => {
    if (currentAudio) currentAudio.play();
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;

    btnSpeak.onclick = () => {
        resultText.innerText = "Слушаю вас... Говорите!";
        resultText.style.color = "#2481cc";
        recognition.start();
    };

    recognition.onresult = (event) => {
        const userSpoke = event.results.transcript.toLowerCase().trim();
        const correctWord = currentWords[currentIndex].word.toLowerCase().trim();

        if (userSpoke === correctWord) {
            resultText.innerText = `Правильно! Отличное произношение.`;
            resultText.style.color = "#4caf50";
            
            if (currentIndex < currentWords.length - 1) {
                btnNext.classList.remove('hidden');
            } else {
                resultText.innerText += " Вы прошли всю тему! 🎉";
            }
        } else {
            resultText.innerText = `Не совсем верно. Вы сказали: "${userSpoke}". Попробуйте еще раз!`;
            resultText.style.color = "#f44336";
        }
    };

    recognition.onerror = (event) => {
        resultText.innerText = "Ошибка микрофона. Попробуйте снова.";
    };
} else {
    btnSpeak.style.display = "none";
    resultText.innerText = "Распознавание речи не поддерживается на этом устройстве.";
}

btnNext.onclick = () => {
    currentIndex++;
    showWord();
};