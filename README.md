# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis, fact-checking, and community insight extraction triggered by the pause event of any YouTube video.

## Key Features

* **Community Insights (YouTube Comments):** Optionally utilizes the YouTube Data API to fetch up to 100 top comments per video. The AI analyzes these comments and surfaces highly relevant community discussions related to the exact timestamp you paused at. Clicking the comment author scrolls the page directly to the discussion thread.
* **Visual Domain Grouping (Card Layout):** Organizes retrieved links into distinct, visually separated cards (Wikipedia, Reddit, Google Scholar, YouTube, etc.) with dedicated background layers for easier scanning.
* **Expanded Previews:** Features a dynamic side-panel that displays a pre-loaded, extended AI-summarized snapshot (up to ~800 characters) of the link's content instantly upon hover.
* **Precise Reddit Sourcing:** Intelligent prompt safeguards enforce the retrieval of highly-relevant, specific Reddit posts (e.g. historical threads) while strictly instructing the AI to verify the post's persistence to avoid deleted content.
* **Quick Settings Access:** A convenient gear icon (⚙) directly in the widget header instantly routes users to the extension configuration page.
* **Contextual Intelligence:** Extracts spoken dialogue from YouTube's internal caption tracks to provide context-aware analysis using Gemini 3.1 Flash Lite.
* **Intelligent Buffering:** Maintains a deduplicated buffer of contextual links throughout the video session.

## Architecture & APIs

* **Manifest V3:** Adheres to modern Chrome extension standards.
* **Google Gemini API:** Utilizes the Gemini 3.1 Flash Lite model for rapid transcript and comment synthesis.
* **YouTube Data API (v3):** Integrates standard API methods to pre-cache comment threads for AI evaluation.
* **Native Transcript Extraction:** Bypasses browser-level UI restrictions by parsing YouTube's `ytInitialPlayerResponse` and fetching raw JSON/XML caption tracks.

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Click the ⚙ icon in the widget to open the settings menu. You will need:
    * **Google AI Studio API Key:** For Gemini integration.
    * **YouTube Data API (v3) Key:** For metadata and comment retrieval (Available via Google Cloud Console).
