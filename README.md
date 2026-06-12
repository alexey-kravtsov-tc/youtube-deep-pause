# YouTube Deep Pause

YouTube Deep Pause is a Chrome extension designed to enhance learning and research during video consumption. It provides real-time contextual analysis, fact-checking, and community insight extraction triggered by the pause event of any YouTube video.

## Key Features

* **Progressive Context Learning:** Maintains an active session memory of previously suggested links. When you pause again later in the video, the AI receives its past recommendations to ensure it provides new, complementary insights rather than repeating the same URLs.
* **Customizable Preview Length:** Define exactly how detailed you want the AI to be. Adjust the word count for the hover previews via the extension settings.
* **Comments Insights Synthesis:** Analyzes up to 100 top YouTube comments and synthesizes relevant discussions into a unified "Comments Insights" deep link. Hover to read the AI summary, or click to scroll straight to the video's comment section.
* **Visual Domain Grouping (Card Layout):** Organizes retrieved links into distinct, visually separated cards (Wikipedia, Reddit, Google Scholar, YouTube, Comments Insights) with dedicated background layers for easier scanning.
* **Reliable Reddit Sourcing:** By utilizing Reddit's search parameter format (`/search/?q=...`), the AI reliably bypasses 404 URL hallucinations caused by unpredictable, deleted, or random thread IDs.
* **Implicit Timestamp Intelligence:** The AI evaluates context based on exactly where you paused without overtly injecting robotic phrases like "At the 45-second mark".

## Setup

1.  **Clone the repository.**
2.  **Load Unpacked:** Navigate to `chrome://extensions/`, enable Developer Mode, and select this directory.
3.  **Configure:** Click the ⚙ icon in the widget to open the settings menu. You will need:
    * **Google AI Studio API Key:** For Gemini integration.
    * **YouTube Data API (v3) Key:** For metadata and comment retrieval (Available via Google Cloud Console).
