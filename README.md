# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis and fact-checking triggered by the pause event of any YouTube video.

## Key Features

* **Contextual Intelligence:** Automatically extracts spoken dialogue from YouTube's internal caption tracks to provide context-aware analysis using Gemini 3.1 Flash Lite.
* **Search Source Filtering:** Customize where the AI sources links. Opt-in support for Wikipedia (enforces exact existing articles to prevent broken search URLs), Reddit, Google Scholar, and YouTube.
* **Watch Page Isolation:** Prevents the widget from rendering on the YouTube homepage or catalog pages, executing strictly on `/watch` routes.
* **Intelligent Buffering:** Maintains a deduplicated buffer of contextual links and information, allowing users to build a research trail without losing previous insights.
* **Debounced API Requests:** Includes a 2-second throttle mechanism to ensure smooth browsing and API efficiency while scrubbing through content.
* **Clean UI:** A minimized, scrollable overlay widget that dynamically scales to a maximum of 50% of the active video player's height. Large typographical hierarchies optimize readability.
* **Privacy & Customization:** Direct integration via user-provided API keys (stored locally).

## Architecture

* **Manifest V3:** Adheres to modern Chrome extension standards.
* **Native Transcript Extraction:** Bypasses browser-level UI restrictions by parsing YouTube's `ytInitialPlayerResponse` and fetching raw JSON/XML caption tracks.

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Navigate to the extension settings to input your Google AI Studio API Key and configure your preferred search domains.
