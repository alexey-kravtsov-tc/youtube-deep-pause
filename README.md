# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis and fact-checking triggered by the pause event of any YouTube video.

## Key Features

* **Visual Domain Grouping:** Organizes retrieved links into distinct, visually separated categories (Wikipedia, Reddit, Google Scholar, YouTube, etc.) for easier scanning.
* **Instant Previews:** Features a dynamic side-panel that displays a pre-loaded, AI-summarized snapshot of the link's content instantly upon hover, preventing the need to open unnecessary tabs.
* **Contextual Intelligence:** Extracts spoken dialogue from YouTube's internal caption tracks to provide context-aware analysis using Gemini 3.1 Flash Lite.
* **Search Source Filtering:** Customize where the AI sources links. Opt-in support for Wikipedia, Reddit, Google Scholar, and YouTube.
* **Intelligent Buffering:** Maintains a deduplicated buffer of contextual links throughout the video session.
* **Debounced API Requests:** Includes a 2-second throttle mechanism to ensure smooth browsing.
* **Clean UI:** A minimized, scrollable overlay widget that dynamically scales to a maximum of 50% of the active video player's height.

## Architecture

* **Manifest V3:** Adheres to modern Chrome extension standards.
* **Native Transcript Extraction:** Bypasses browser-level UI restrictions by parsing YouTube's `ytInitialPlayerResponse` and fetching raw JSON/XML caption tracks.

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Navigate to the extension settings to input your Google AI Studio API Key and configure your preferred search domains.
