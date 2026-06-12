# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis, fact-checking, and community insight extraction triggered by the pause event of any YouTube video.

## Key Features

* **Community Insights Synthesis:** Analyzes up to 100 top YouTube comments and synthesizes relevant discussions into a unified "Community Insights" link. Hover to read the 800-character AI summary, or click it to seamlessly scroll straight to the video's comment section.
* **Visual Domain Grouping (Card Layout):** Organizes retrieved links into distinct, visually separated cards (Wikipedia, Reddit, Google Scholar, YouTube, Community) with dedicated background layers for easier scanning.
* **Reliable Reddit Sourcing:** By utilizing Reddit's search parameter format (`/search/?q=...`), the AI reliably bypasses 404 URL hallucinations caused by unpredictable, deleted, or random thread IDs.
* **Expanded Previews:** Features a dynamic side-panel that displays a pre-loaded, extended AI-summarized snapshot (up to ~800 characters) of the link's content instantly upon hover.
* **Quick Settings Access:** A convenient gear icon (⚙) directly in the widget header instantly routes users to the extension configuration page.
* **Contextual Intelligence:** Extracts spoken dialogue from YouTube's internal caption tracks to provide context-aware analysis using Gemini 3.1 Flash Lite.
* **Debounced API Requests:** Includes a 2-second throttle mechanism to ensure smooth browsing.

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Click the ⚙ icon in the widget to open the settings menu. You will need:
    * **Google AI Studio API Key:** For Gemini integration.
    * **YouTube Data API (v3) Key:** For metadata and comment retrieval (Available via Google Cloud Console).
