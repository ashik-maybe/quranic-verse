// --- Configuration ---
const API_BASE = 'http://api.alquran.cloud/v1/ayah';
// Total verses in the Quran
const TOTAL_VERSES = 6236;

// --- DOM Elements ---
const verseArabicEl = document.getElementById('verse-arabic');
const verseReferenceEl = document.getElementById('verse-reference');
const newVerseBtn = document.getElementById('new-verse-btn');

// --- Theme Management ---
let currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', currentTheme);

newVerseBtn.addEventListener('click', displayRandomVerse);

// --- Data Fetching ---
async function fetchRandomVerse() {
    try {
        // Generate a random verse number (1 to 6236)
        const randomVerseNumber = Math.floor(Math.random() * TOTAL_VERSES) + 1;

        // Fetch the verse data (Arabic text and meta)
        // Using the format: http://api.alquran.cloud/v1/ayah/{{reference}}
        const response = await fetch(`${API_BASE}/${randomVerseNumber}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // The API returns data in data.data
        if (data.code === 200 && data.data) {
            return data.data;
        } else {
            throw new Error(`API returned an error: ${data.status}`);
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
    verseArabicEl.textContent = "..." ;
    verseReferenceEl.textContent = "Loading...";

    const verseData = await fetchRandomVerse();

    if (!verseData) {
        verseArabicEl.textContent = "تعذر تحميل الآية. يرجى المحاولة لاحقًا.";
        verseReferenceEl.textContent = "";
        verseArabicEl.classList.remove('loading');
        return;
    }

    // Populate the Arabic text
    verseArabicEl.textContent = verseData.text;

    // Populate the reference (Surah Name and Ayah Number)
    // verseData.surah contains surah details
    // verseData.numberInSurah is the ayah number within the surah
    const surahName = verseData.surah?.englishName || `Surah ${verseData.surah?.number || 'Unknown'}`;
    const ayahNumber = verseData.numberInSurah;

    verseReferenceEl.textContent = `${surahName} • ${ayahNumber}`;

    // Remove loading state
    verseArabicEl.classList.remove('loading');
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    displayRandomVerse();
});
