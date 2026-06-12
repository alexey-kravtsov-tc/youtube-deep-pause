# YouTube Deep Pause

YouTube Deep Pause is an intelligent Chrome extension that enhances learning and research during video consumption. By triggering on the YouTube "pause" event, it provides real-time contextual analysis, fact-checking, and community insight extraction using Gemini Flash AI.

## 🚀 Key Features

* **Progressive Context Learning:** The AI remembers previously suggested links during your watch session to ensure it provides new, complementary insights rather than repeating itself.
* **Comments Insights Synthesis:** Connects to the YouTube Data API to analyze top video comments, synthesizing relevant community discussions into a single deep-link that scrolls you directly to the YouTube comment section.
* **Visual Domain Grouping (Card Layout):** Organizes retrieved links into distinct, visually separated cards (Wikipedia, Reddit, Google Scholar, YouTube) for easier scanning.
* **Expanded Previews:** Features a dynamic side-panel that displays a pre-loaded, AI-summarized snapshot of the link's content instantly upon hover. You can customize the length of this preview in the settings.
* **Reliable Reddit Sourcing:** Utilizes Reddit's native search parameter format (`/search/?q=...`) to ensure reliable URL resolution, bypassing 404 errors caused by deleted or hallucinated threads.
* **Implicit Timestamp Intelligence:** The AI evaluates context natively based on exactly where you paused, without awkwardly injecting timecodes into the resulting text.
* **Debounced Architecture:** A 2-second throttle mechanism ensures smooth scrubbing and prevents API spam.

## ⚙️ Architecture & APIs

* **Manifest V3:** Adheres to modern, secure Chrome extension standards.
* **Google Gemini API:** Utilizes the `gemini-3.1-flash-lite` model for rapid transcript and comment synthesis.
* **YouTube Data API (v3):** Caches comment threads for AI evaluation to extract "Community Insights".
* **Playwright E2E Testing:** Fully automated UI and state testing via GitHub Actions.

## 📦 Installation (Sideloading)

Because this extension uses user-provided API keys, it is distributed via GitHub Releases rather than the Chrome Web Store.

1. Go to the [Releases page](https://github.com/alexey-kravtsov-tc/youtube-deep-pause/releases) of this repository.
2. Download the latest `youtube-deep-pause.zip` file.
3. Extract the ZIP file to a folder on your computer.
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** in the top right corner.
6. Click **Load unpacked** and select the folder where you extracted the ZIP file.

## 🛠️ Configuration

Once installed, click the extension icon or the ⚙ (gear) icon in the widget to open the settings menu. You will need to provide:

1. **Google AI Studio API Key:** Required for Gemini AI integration. Get it [here](https://aistudio.google.com/apikey).
2. **YouTube Data API (v3) Key:** Required for "Comments Insights". Get it from the [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com).

## 🧪 Development & Testing

To run the Playwright End-to-End tests locally:
```bash
npm install
npm run test:e2e
