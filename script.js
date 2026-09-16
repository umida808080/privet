const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Разворачиваем приложение на весь экран телефона

let currentWords = [];
let currentIndex = 0;
let currentAudio = null;

// Элементы интерфейса
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const themeTitle = document.getElementById('theme-title');
const wordImage = document.getElementById('word-image');
const wordText = document.getElementById('word-text');
const btnPlay = document.getElementById('btn-play');
const btnSpeak = document.getElementById('btn-speak');
const btnNext = document.getElementById('btn-next');
const resultText = document.getElementById('result-text');

// 1. Загружаем базу данных из data.json
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Проверяем параметр старта из ссылки Телеграма (например: ?startapp=greetings)
        const startParam = tg.initDataUnsafe.start_param;
        
        // Находим нужную тему в файле data.json
        const selectedTheme = data.themes.find(t => t.theme_name === startParam);

        if (selectedTheme) {
            startGame(selectedTheme);
        } else {
            menuScreen.innerHTML = `<h2>Тема не найдена. Перейдите по правильной ссылке, например: ?startapp=greetings</h2>`;
        }
    })
    .catch(err => {
        menuScreen.innerHTML = `<h2>Ошибка загрузки данных</h2>`;
        console.error(err);
    });

// 2. Запуск игры по выбранной теме
function startGame(theme) {
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    themeTitle.innerText = `Тема: ${theme.theme_name}`;
    currentWords = theme.words;
    currentIndex = 0;
    showWord();
}

// 3. Показ текущего слова
function showWord() {
    const activeWord = currentWords[currentIndex];
    wordText.innerText = activeWord.word;
    wordImage.src = activeWord.image;
    
    // Готовим аудио для прослушивания
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(activeWord.audio);
    
    // Сбрасываем статус проверки
    resultText.innerText = "Нажмите «Говорить» и произнесите слово.";
    resultText.style.color = "var(--tg-theme-text-color)";
    btnNext.classList.add('hidden');
}

// Слушаем эталонное произношение
btnPlay.onclick = () => {
    if (currentAudio) currentAudio.play();
};

// 4. ПРОВЕРКА ПРОИЗНОШЕНИЯ (Web Speech API)
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
        const userSpoke = event.results[0][0].transcript.toLowerCase().trim();
        const correctWord = currentWords[currentIndex].word.toLowerCase().trim();

        // Сравниваем то, что сказал пользователь, с правильным словом
        if (userSpoke === correctWord) {
            resultText.innerText = `Правильно! Отличное произношение.`;
            resultText.style.color = "#4caf50"; // Зеленый цвет
            
            // Если есть еще слова в теме — показываем кнопку "Дальше"
            if (currentIndex < currentWords.length - 1) {
                btnNext.classList.remove('hidden');
            } else {
                resultText.innerText += " Вы прошли всю тему! ??";
            }
        } else {
            resultText.innerText = `Не совсем верно. Вы сказали: "${userSpoke}". Попробуйте еще раз!`;
            resultText.style.color = "#f44336"; // Красный цвет
        }
    };

    recognition.onerror = (event) => {
        resultText.innerText = "Ошибка микрофона. Попробуйте снова.";
        console.error(event.error);
    };
} else {
    btnSpeak.style.display = "none";
    resultText.innerText = "Распознавание речи не поддерживается на этом устройстве.";
}

// Кнопка "Следующее слово"
btnNext.onclick = () => {
    currentIndex++;
    showWord();
};
