// --- Configuration ---
// Use HTTPS to avoid mixed content issues on GitHub Pages
const API_BASE = 'https://api.alquran.cloud/v1/ayah';
const TOTAL_VERSES = 6236;
// Edition identifiers for the API
const EDITIONS = 'quran-uthmani,en.sahih,bn.bengali'; // Arabic, English (Saheeh Intl), Bengali (Zakaria)

// --- DOM Elements ---
const verseArabicEl = document.getElementById('verse-arabic');
const translationEnEl = document.getElementById('translation-en');
const translationBnEl = document.getElementById('translation-bn');
const verseReferenceEl = document.getElementById('verse-reference');
const newVerseBtn = document.getElementById('new-verse-btn');
const themeToggleBtn = document.getElementById('theme-toggle'); // Theme toggle button
const themeIcon = themeToggleBtn.querySelector('i'); // Icon inside the button

// --- Theme Management ---
let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon(); // Set initial icon

function updateThemeIcon() {
    if (themeIcon) {
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
});

// --- Data Fetching ---
async function fetchRandomVerse() {
    try {
        const randomVerseNumber = Math.floor(Math.random() * TOTAL_VERSES) + 1;

        // Fetch the verse data including specified editions (using HTTPS now)
        const response = await fetch(`${API_BASE}/${randomVerseNumber}/editions/${EDITIONS}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 200 && data.data && Array.isArray(data.data)) {
            // Process the array of verses (one for each edition)
            const result = {
                arabic: null,
                english: null,
                bengali: null
            };

            data.data.forEach(verseObj => {
                if (verseObj?.edition?.identifier) {
                    const identifier = verseObj.edition.identifier;
                    if (identifier === 'quran-uthmani') {
                        result.arabic = verseObj;
                    } else if (identifier === 'en.sahih') {
                        result.english = verseObj;
                    } else if (identifier === 'bn.bengali') {
                        result.bengali = verseObj;
                    }
                }
            });

            if (result.arabic) {
                return result;
            } else {
                throw new Error("Arabic text (quran-uthmani) not found in API response");
            }
        } else {
            throw new Error(`API returned an unexpected format or error: ${JSON.stringify(data)}`);
        }
    } catch (error) {
        console.error("Error fetching verse:", error);
        return null;
    }
}

// --- Display Logic ---
async function displayRandomVerse() {
    // Add loading state to all text elements
    verseArabicEl.classList.add('loading');
    translationEnEl.classList.add('loading');
    translationBnEl.classList.add('loading');
    verseReferenceEl.classList.add('loading');

    verseArabicEl.textContent = "...";
    translationEnEl.textContent = "...";
    translationBnEl.textContent = "...";
    verseReferenceEl.textContent = "Loading...";

    const verseData = await fetchRandomVerse();

    if (!verseData || !verseData.arabic) {
        verseArabicEl.textContent = "تعذر تحميل الآية.";
        translationEnEl.textContent = "Failed to load English translation.";
        translationBnEl.textContent = "বাংলা অনুবাদ লোড করতে ব্যর্থ।";
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

    // Populate the Bengali translation
    if (verseData.bengali?.text) {
        translationBnEl.textContent = verseData.bengali.text;
    } else {
        translationBnEl.textContent = "[বাংলা অনুবাদ নেই]";
    }

    // Populate the reference using the Arabic data object
    const arabicData = verseData.arabic;
    const surahName = arabicData.surah?.englishName || `Surah ${arabicData.surah?.number || 'Unknown'}`;
    const ayahNumber = arabicData.numberInSurah;
    verseReferenceEl.textContent = `${surahName} • ${ayahNumber}`;

    // Remove loading state
    removeLoadingStates();
}

function removeLoadingStates() {
    verseArabicEl.classList.remove('loading');
    translationEnEl.classList.remove('loading');
    translationBnEl.classList.remove('loading');
    verseReferenceEl.classList.remove('loading');
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    displayRandomVerse();
});

// Event listener for the new verse button
newVerseBtn.addEventListener('click', displayRandomVerse);
