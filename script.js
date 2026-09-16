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

// Старт игры
showWord();

function showWord() {
    const activeWord = currentWords[currentIndex];
    wordText.innerText = activeWord.word;
    wordImage.src = activeWord.image;
    
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(activeWord.audio);
    
    resultText.innerText = "Нажмите «Говорить» и произнесите слово.";
    resultText.style.color = "#222222";
    
    // Кнопка "Дальше" теперь видна всегда, чтобы пользователь не застревал
    if (currentIndex < currentWords.length - 1) {
        btnNext.classList.remove('hidden');
        btnNext.innerText = "Следующее слово ➡️";
    } else {
        btnNext.classList.add('hidden'); // На последнем слове прячем её
    }
}

// Озвучка эталона
btnPlay.onclick = () => {
    if (currentAudio) {
        currentAudio.play().catch(e => {
            console.log("Ошибка аудио, возможно файл не найден:", e);
            alert("Не удалось воспроизвести аудио. Проверьте файл " + currentWords[currentIndex].audio);
        });
    }
};

// Распознавание речи
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    btnSpeak.onclick = () => {
        resultText.innerText = "Слушаю вас... Говорите громко и четко!";
        resultText.style.color = "#2481cc";
        try {
            recognition.start();
        } catch(e) {
            recognition.stop();
            setTimeout(() => recognition.start(), 300);
        }
    };

    recognition.onresult = (event) => {
        const userSpoke = event.results[0][0].transcript.toLowerCase().trim();
        const correctWord = currentWords[currentIndex].word.toLowerCase().trim();

        // Проверка: ищем совпадение слова в сказанной фразе
        if (userSpoke.includes(correctWord) || correctWord.includes(userSpoke)) {
            resultText.innerText = `💥 Отлично! Вы сказали: "${userSpoke}". Правильно!`;
            resultText.style.color = "#4caf50";
            if (currentIndex === currentWords.length - 1) {
                resultText.innerText += "\n🎉 Вы прошли всю тему!";
            }
        } else {
            resultText.innerText = `Вы сказали: "${userSpoke}". Попробуйте еще раз!`;
            resultText.style.color = "#f44336";
        }
    };

    recognition.onerror = (event) => {
        console.log("Ошибка распознавания:", event.error);
        if (event.error === 'not-allowed') {
            resultText.innerText = "Ошибка: Дайте приложению доступ к микрофону в настройках телефона!";
        } else {
            resultText.innerText = "Не удалось распознать речь. Попробуйте сказать еще раз.";
        }
        resultText.style.color = "#f44336";
    };
} else {
    btnSpeak.style.display = "none";
    resultText.innerText = "Распознавание речи не поддерживается в данном браузере.";
}

// Переключение вперед
btnNext.onclick = () => {
    if (currentIndex < currentWords.length - 1) {
        currentIndex++;
        showWord();
    }
};