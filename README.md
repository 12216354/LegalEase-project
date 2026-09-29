# EduGenie – AI Learning Assistant

EduGenie is an intelligent, student-first learning companion powered by **Google Gemini**. Designed for modern web and mobile devices, EduGenie transforms how students study by decomposing complex academic topics into step-by-step principles, generating interactive 3-question quizzes, creating structured study summaries, and formulating personalized learning paths.

---

## 🌟 Key Features

1. **AI Question & Answer (`/qa`)**
   - Ask any educational question across STEM, humanities, and languages.
   - Formatted explanations with examples, markdown rendering, bullet points, and code blocks.
   - One-click "Copy Answer" for quick study notes.

2. **Concept Explanation (`/explain`)**
   - Pedagogical 7-step breakdown:
     1. Simple Definition
     2. Core Concept
     3. Step-by-Step Explanation
     4. Practical Real-World Example
     5. Important Points & Formulas
     6. Common Mistakes & Pitfalls
     7. Quick Memory Recap
   - Customizable difficulty level (Beginner, Intermediate, Advanced) and style (Simple, Detailed, Examples).

3. **AI Quiz Generator (`/quiz`)**
   - Generates **EXACTLY 3 multiple-choice questions**, each with **EXACTLY 4 options** and 1 correct answer.
   - Interactive question cards with progress tracking.
   - Instant score calculation, percentage display, visual indicator, answer review, and detailed pedagogical explanations.
   - "Try Again" to re-test retention and "Generate New Quiz" for fresh topics.

4. **Study Material Summarizer (`/summarize`)**
   - Paste long textbook notes, articles, or lecture transcripts.
   - Deconstructs content into Main Idea, Key Bullet Points, Important Terms Glossary, Essential Facts, and Quick Revision summary.
   - Adjustable summary depth (Short, Medium, Detailed).

5. **Personalized Learning Recommendations (`/recommendations`)**
   - Formulate a tailored academic roadmap tailored to current knowledge level, academic goal, and daily study time.
   - Step-by-step curriculum milestones: Prerequisites, Fundamentals, Core Concepts, Practical Examples, Intermediate Topics, Advanced Topics, Projects, and Revision.

6. **Recent Activity Persistence**
   - Automatically records recent questions, explanations, quizzes, summaries, and paths to `localStorage`.
   - Revisit previous learning sessions with 1 click.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, tsx
- **AI Engine**: Google Gemini via `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Build Tool**: Vite 8
- **Testing**: Built-in comprehensive test runner (`tsx tests/test_api.ts`)

---

## 📁 Project Structure

```
EduGenie/
├── index.html                   # HTML entry point with synchronized metadata & OG tags
├── metadata.json                # AI Studio application metadata & server capabilities
├── package.json                 # Dependencies and execution scripts
├── server.ts                    # Full-stack server entry point (Express + Vite middleware)
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration
├── .env.example                 # Environment configuration template
│
├── src/
│   ├── main.tsx                 # React DOM root mounting
│   ├── App.tsx                  # Core application component & navigation router
│   ├── index.css                # Tailwind CSS global styles
│   │
│   ├── components/
│   │   ├── Header.tsx           # Responsive navigation bar with mobile drawer
│   │   ├── Footer.tsx           # Educational platform footer & status
│   │   ├── Hero.tsx             # Home hero with 5-feature cards & 5-step workflow
│   │   ├── LearnWorkspace.tsx   # Central learning interface & dynamic task selector
│   │   ├── QAView.tsx           # Q&A tool with copy answer & loading states
│   │   ├── ExplainView.tsx      # 7-step concept explanation view
│   │   ├── QuizView.tsx         # Interactive 3-question quiz generator & scoring
│   │   ├── SummarizeView.tsx    # Text summarizer with 5 revision cards
│   │   ├── RecommendationsView.tsx # Personalized learning roadmap generator
│   │   ├── AboutView.tsx        # Pedagogical philosophy & future roadmap
│   │   └── RecentActivityDrawer.tsx # Slide-over recent activity viewer
│   │
│   ├── server/
│   │   ├── config.ts            # Environment variables & constants configuration
│   │   ├── validators.ts        # Input validation & strict 3-question quiz validator
│   │   ├── gemini.ts            # Google Gemini AI services & prompt templates
│   │   └── routes.ts            # Express API endpoints
│   │
│   └── services/
│       ├── api.ts               # Client-side API client
│       └── storage.ts           # Local storage persistence for recent activity
│
└── tests/
    └── test_api.ts              # 12-suite validation & contract test runner
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# GEMINI_MODEL: Model alias (defaults to gemini-3.8-flash)
GEMINI_MODEL="gemini-3.8-flash"

# Application Configuration
APP_NAME="EduGenie"
APP_VERSION="1.0.0"
MAX_INPUT_LENGTH=12000
PORT=3000

# Optional: Frontend API base URL (leave empty for same-origin relative requests)
VITE_API_BASE_URL=""
```

---

## 🚀 Local Installation & Running

1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your API Key**:
   Set `GEMINI_API_KEY` in your environment or `.env` file.

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:3000`

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Running Tests

The test suite validates input limits, empty checks, JSON cleanup, and strict quiz contracts (exactly 3 questions, 4 options each, and 1 correct answer):

```bash
npm test
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Sample Request |
|---|---|---|---|
| `GET` | `/health` | Service health status | - |
| `POST` | `/qa` | Ask educational questions | `{"text": "Explain Newton's third law"}` |
| `POST` | `/explain` | 7-step concept explanation | `{"text": "Photosynthesis", "level": "beginner", "preference": "simple"}` |
| `POST` | `/quiz` | Generate 3-question quiz | `{"text": "Python Functions", "difficulty": "medium"}` |
| `POST` | `/summarize` | Summarize study material | `{"text": "Long study notes...", "length": "medium"}` |
| `POST` | `/learn/recommendations` | Personalized learning path | `{"topic": "Machine Learning", "level": "beginner", "goal": "skill development", "study_time": "30 minutes/day"}` |

---

## 🔒 Security & Privacy

- **Server-Side AI Calls**: The `GEMINI_API_KEY` is strictly accessed on the backend; it is never bundled in frontend JavaScript or exposed in network traffic.
- **Input Sanitization**: User inputs are checked for length limits (12,000 characters) and stripped of unsafe control characters.
- **Strict Quiz Schema Validation**: Every generated quiz is validated on the server for JSON conformity and structural correctness before being returned to the client.
