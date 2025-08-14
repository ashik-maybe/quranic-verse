# Ayah

A beautiful, minimal Quran verse viewer built with HTML, CSS, and JavaScript. Display a random verse in Arabic, its English translation, and listen to its recitation. Perfect for use as a browser homepage.

## Features

*   **Random Ayah:** Displays a new, random verse from the Quran each time.
*   **Arabic Text:** Rendered in a beautiful, readable font.
*   **English Translation:** Provided by Saheeh International.
*   **Audio Recitation:** Listen to the verse recited by Mishary Rashid Alafasy.
*   **Dark/Light Mode:** Automatically adapts to your system preference or toggle manually. Preference is saved.
*   **Responsive Design:** Looks great on desktop and mobile.

## Tech Stack

*   **HTML5**
*   **CSS3** (Flexbox, Grid, Custom Properties)
*   **JavaScript** (ES6 Modules, Fetch API, Async/Await)
*   **[Vite](https://vitejs.dev/):** Used for initial project scaffolding.
*   **[Font Awesome](https://fontawesome.com/):** For UI icons.
*   **[Google Fonts](https://fonts.google.com/):** For beautiful typography (`Scheherazade New`, `Inter`).

## Data Sources & Credits

*   **Quran API:** <https://alquran.cloud/api>
    *   This project uses the "Ayah - Get an Ayah of the Quran" endpoint to fetch the Arabic text, English translation, and audio recitation URL.
    *   Arabic Text Edition: `quran-uthmani`
    *   English Translation Edition: `en.sahih`
    *   Audio Recitation Edition: `ar.alafasy`

## Getting Started

These instructions will get you a copy of the project up and running on your local machine or deployed to GitHub Pages.

### Prerequisites

*   A modern web browser.
*   (Optional, for local development) [Node.js](https://nodejs.org/) and npm (usually bundled with Node.js).

### Cloning & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/quranic-verse.git
    cd quranic-verse
    ```
    *(Replace `your-username` with your actual GitHub username if you push this code to your repo)*

2.  **Run locally (using Vite dev server):**
    *   Install dependencies (if you have Node.js):
        ```bash
        npm install
        ```
    *   Start the development server:
        ```bash
        npm run dev
        ```
    *   Open your browser and go to the address provided by Vite (usually `http://localhost:5173`).
