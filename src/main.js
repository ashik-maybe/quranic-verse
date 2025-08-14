// --- Configuration ---
const API_BASE = 'https://api.alquran.cloud/v1/ayah'; // Ensure HTTPS
const TOTAL_VERSES = 6236;
// Editions: Arabic text, English translation, Audio recitation (Mishary Alafasy)
const EDITIONS = 'quran-uthmani,en.sahih,ar.alafasy';

// --- DOM Elements ---
const verseArabicEl = document.getElementById('verse-arabic');
const translationEnEl = document.getElementById('translation-en');
const verseReferenceEl = document.getElementById('verse-reference');
const newVerseBtn = document.getElementById('new-verse-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');

// --- Audio Player Elements ---
const recitationAudioEl = document.getElementById('recitation-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn.querySelector('i');
const rewindBtn = document.getElementById('rewind-btn');
const forwardBtn = document.getElementById('forward-btn');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = muteBtn.querySelector('i');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');

// --- Theme Management (Persisted) ---
let currentTheme = localStorage.getItem('quran-app-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon();

function updateThemeIcon() {
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('quran-app-theme', currentTheme);
    updateThemeIcon();
});

// --- Audio Player Logic ---
let isPlaying = false;

// Utility function to format time (seconds to M:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update play/pause button icon
function updatePlayPauseIcon() {
    playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
}

// Update mute button icon
function updateMuteIcon() {
    if (recitationAudioEl.muted || recitationAudioEl.volume === 0) {
        muteIcon.className = 'fas fa-volume-mute';
    } else if (recitationAudioEl.volume > 0.5) {
        muteIcon.className = 'fas fa-volume-up';
    } else {
        muteIcon.className = 'fas fa-volume-down';
    }
    muteBtn.setAttribute('aria-label', recitationAudioEl.muted ? 'Unmute' : 'Mute');
}

// --- Event Listeners for Audio Player ---
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        recitationAudioEl.pause();
    } else {
        // Ensure src is set before playing
        if (recitationAudioEl.src) {
            recitationAudioEl.play().catch(error => {
                 console.error("Audio play error:", error);
                 // Handle play error (e.g., user gesture required)
                 // Could show a message to user
            });
        }
    }
});

rewindBtn.addEventListener('click', () => {
    recitationAudioEl.currentTime = Math.max(recitationAudioEl.currentTime - 5, 0);
});

forwardBtn.addEventListener('click', () => {
    recitationAudioEl.currentTime = Math.min(recitationAudioEl.currentTime + 5, recitationAudioEl.duration || recitationAudioEl.currentTime);
});

muteBtn.addEventListener('click', () => {
    recitationAudioEl.muted = !recitationAudioEl.muted;
    updateMuteIcon();
    // Update slider if muted via button
    if (recitationAudioEl.muted) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = recitationAudioEl.volume * 100;
    }
});

progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * recitationAudioEl.duration;
    recitationAudioEl.currentTime = seekTime;
});

volumeSlider.addEventListener('input', () => {
    recitationAudioEl.volume = volumeSlider.value / 100;
    recitationAudioEl.muted = (recitationAudioEl.volume === 0);
    updateMuteIcon();
});

// --- Audio Element Events ---
recitationAudioEl.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseIcon();
});

recitationAudioEl.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseIcon();
});

recitationAudioEl.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayPauseIcon();
    // Reset progress bar
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
});

recitationAudioEl.addEventListener('timeupdate', () => {
    if (recitationAudioEl.duration) {
        const currentTime = recitationAudioEl.currentTime;
        const duration = recitationAudioEl.duration;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(currentTime);
    }
});

recitationAudioEl.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(recitationAudioEl.duration);
});

recitationAudioEl.addEventListener('volumechange', () => {
    // Update slider and mute icon if volume changed externally (e.g., OS controls)
    if (!volumeSlider.matches(':active')) { // Don't override user dragging slider
        volumeSlider.value = recitationAudioEl.volume * 100;
    }
    updateMuteIcon();
});


// --- Data Fetching ---
async function fetchRandomVerse() {
    try {
        const randomVerseNumber = Math.floor(Math.random() * TOTAL_VERSES) + 1;
        const response = await fetch(`${API_BASE}/${randomVerseNumber}/editions/${EDITIONS}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 200 && data.data && Array.isArray(data.data)) {
            const result = {
                arabic: null,
                english: null,
                audio: null
            };

            data.data.forEach(verseObj => {
                if (verseObj?.edition?.identifier) {
                    const identifier = verseObj.edition.identifier;
                    if (identifier === 'quran-uthmani') {
                        result.arabic = verseObj;
                    } else if (identifier === 'en.sahih') {
                        result.english = verseObj;
                    } else if (identifier === 'ar.alafasy') {
                        result.audio = verseObj;
                    }
                }
            });

            if (result.arabic) {
                return result;
            } else {
                throw new Error("Arabic text (quran-uthmani) not found in API response");
            }
        } else {
            throw new Error(`API returned an unexpected format or error.`);
        }
    } catch (error) {
        console.error("Error fetching verse:", error);
        return null;
    }
}

// --- Display Logic ---
async function displayRandomVerse() {
    // Add loading state
    verseArabicEl.classList.add('loading');
    translationEnEl.classList.add('loading');
    verseReferenceEl.classList.add('loading');

    verseArabicEl.textContent = "...";
    translationEnEl.textContent = "...";
    verseReferenceEl.textContent = "Loading...";

    // Reset audio player UI
    recitationAudioEl.src = '';
    recitationAudioEl.load();
    isPlaying = false;
    updatePlayPauseIcon();
    progressBar.value = 0;
    volumeSlider.value = 100; // Reset slider
    recitationAudioEl.volume = 1.0;
    recitationAudioEl.muted = false;
    updateMuteIcon();
    currentTimeEl.textContent = "0:00";
    durationEl.textContent = "0:00";

    const verseData = await fetchRandomVerse();

    if (!verseData || !verseData.arabic) {
        verseArabicEl.textContent = "تعذر تحميل الآية.";
        translationEnEl.textContent = "Failed to load English translation.";
        verseReferenceEl.textContent = "";
        removeLoadingStates();
        return;
    }

    // Populate the Arabic text
    verseArabicEl.textContent = verseData.arabic.text;

    // Populate the English translation
    if (verseData.english?.text) {
        translationEnEl.textContent = verseData.english.text;
    } else {
        translationEnEl.textContent = "[English translation not available]";
    }

    // Populate the Audio Player
    if (verseData.audio?.audio) {
        recitationAudioEl.src = verseData.audio.audio;
        recitationAudioEl.preload = 'metadata';
        recitationAudioEl.load();
        // Duration will be updated on 'loadedmetadata' event
    } else {
        console.warn("Audio URL not found for this verse.");
    }

    // Populate the reference
    const arabicData = verseData.arabic;
    const surahName = arabicData.surah?.englishName || `Surah ${arabicData.surah?.number || 'Unknown'}`;
    const ayahNumber = arabicData.numberInSurah;
    verseReferenceEl.textContent = `${surahName} • ${ayahNumber}`;

    removeLoadingStates();
}

function removeLoadingStates() {
    verseArabicEl.classList.remove('loading');
    translationEnEl.classList.remove('loading');
    verseReferenceEl.classList.remove('loading');
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    displayRandomVerse();
});

newVerseBtn.addEventListener('click', displayRandomVerse);
