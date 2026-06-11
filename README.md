# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis and fact-checking triggered by the pause event of any YouTube video.

## Key Features

*   **Contextual Intelligence:** Automatically extracts spoken dialogue from YouTube's internal caption tracks to provide context-aware analysis using Gemini 3.1 Flash Lite.
*   **Intelligent Buffering:** Maintains a deduplicated buffer of contextual links and information, allowing users to build a research trail without losing previous insights.
*   **Debounced API Requests:** Includes a 2-second throttle mechanism to ensure smooth browsing and API efficiency while scrubbing through content.
*   **Clean UI:** A minimized, scrollable overlay widget that respects the video player's dimensions (max-height limited to 50% of the player).
*   **Privacy & Customization:** Direct integration via user-provided API keys (stored locally) with no data training on user activity.

## Architecture

*   **Manifest V3:** Adheres to modern Chrome extension standards.
*   **Native Transcript Extraction:** Bypasses browser-level UI restrictions by parsing YouTube's `ytInitialPlayerResponse` and fetching raw JSON caption tracks.
*   **Gemini Integration:** Utilizes the Gemini 3.1 Flash Lite model to synthesize transcript context and generate a comprehensive list of deep-dive educational resources.

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Navigate to the extension settings and input your Google AI Studio API Key.
