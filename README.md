# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis and fact-checking triggered by the pause event of any YouTube video.

## Key Features

* **Visual Domain Grouping (Card Layout):** Organizes retrieved links into distinct, visually separated cards (Wikipedia, Reddit, Google Scholar, YouTube, etc.) with dedicated background layers for easier scanning.
* **Expanded Previews:** Features a dynamic side-panel that displays a pre-loaded, extended AI-summarized snapshot (up to ~800 characters) of the link's content instantly upon hover.
* **Reliable Reddit Sourcing:** Intelligent prompt safeguards enforce the retrieval of root subreddits (e.g., `r/science`) over individual posts, completely preventing dead or deleted Reddit links.
* **Quick Settings Access:** A convenient gear icon (⚙) directly in the widget header instantly routes users to the extension configuration page.
* **Contextual Intelligence:** Extracts spoken dialogue from YouTube's internal caption tracks to provide context-aware analysis using Gemini 3.1 Flash Lite.
* **Intelligent Buffering:** Maintains a deduplicated buffer of contextual links throughout the video session.
* **Debounced API Requests:** Includes a 2-second throttle mechanism to ensure smooth browsing.

## Architecture

* **Manifest V3:** Adheres to modern Chrome extension standards.
* **Native Transcript Extraction:** Bypasses browser-level UI restrictions by parsing YouTube's `ytInitialPlayerResponse` and fetching raw JSON/XML caption tracks.

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Navigate to the extension settings (or click the ⚙ icon in the widget) to input your Google AI Studio API Key and configure your preferred search domains.
