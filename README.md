# Supervisor Feedback Analyzer

Supervisor Feedback Analyzer is a full-stack local application for reviewing supervisor-to-employee conversation transcripts and turning them into structured coaching insights. It combines a React dashboard for transcript input and results review with an Express API that sends prompts to Ollama for local LLM-based analysis.

The project is designed to be simple to run, easy to extend, and dependable when model output is messy. The backend normalizes Ollama responses into a stable JSON structure, while the frontend presents the output in a clean dashboard for non-technical users.

## Project Overview

The application helps users:

- paste or load a sample transcript
- send the transcript to a local analysis API
- generate structured coaching insights using Ollama
- review evidence, score, KPI mapping, gap analysis, and follow-up questions in a readable dashboard

This project currently runs fully on a local machine and does not require a hosted AI provider.

## Features

- React frontend built with Vite
- Tailwind CSS dashboard UI
- sample transcript loader from local JSON files
- transcript submission to an Express backend
- Ollama integration using `llama3.2`
- structured JSON analysis response
- loading and error handling in the UI
- evidence cards with positive, negative, and neutral tags
- prominent rubric score display
- resilient JSON extraction, validation, normalization, and retry handling on the backend

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- HTTP client: `fetch` in the frontend, `axios` in the backend
- Local LLM runtime: Ollama
- Model: `llama3.2`
- Tooling: ESLint, Nodemon

## Architecture Overview

The repository is split into two main apps:

- [client](C:\Users\2026\Desktop\supervisor-feedback-analyzer\client): React frontend
- [server](C:\Users\2026\Desktop\supervisor-feedback-analyzer\server): Express backend

High-level flow:

1. A user pastes a transcript or selects a sample transcript in the frontend.
2. The frontend sends a `POST` request to `http://localhost:5000/analyze`.
3. The Express backend builds a strict JSON-only prompt for Ollama.
4. The backend sends the prompt to `http://localhost:11434/api/generate`.
5. Ollama returns model output.
6. The backend extracts JSON safely, retries once if parsing fails, validates required fields, and applies fallback values for missing sections.
7. The frontend renders the structured analysis in dashboard cards.

Expected API response shape:

```json
{
  "evidence": [],
  "rubricScore": {
    "score": 0,
    "justification": ""
  },
  "kpiMapping": [],
  "gapAnalysis": [],
  "followUpQuestions": []
}
```

## Setup Instructions

### Prerequisites

- Node.js 18+ recommended
- npm
- Ollama installed locally

### Clone or open the project

If you already have the project folder locally, open it in your terminal:

```powershell
cd C:\Users\2026\Desktop\supervisor-feedback-analyzer
```

### Install frontend dependencies

```powershell
cd client
npm install
```

### Install backend dependencies

```powershell
cd ..\server
npm install
```

## Ollama Setup

Install Ollama from the official site:

- [Ollama](https://ollama.com)

Pull the required model:

```powershell
ollama pull llama3.2
```

Start Ollama if it is not already running. By default, the backend expects:

```text
http://localhost:11434/api/generate
```

Optional environment variables for the backend:

- `PORT`: API server port, defaults to `5000`
- `OLLAMA_URL`: custom Ollama generate endpoint, defaults to `http://localhost:11434/api/generate`

Example `.env` for the backend:

```env
PORT=5000
OLLAMA_URL=http://localhost:11434/api/generate
```

## How to Run Frontend and Backend

### Run the backend

From the `server` folder:

```powershell
npm run dev
```

This starts the Express API with Nodemon on `http://localhost:5000`.

### Run the frontend

From the `client` folder in a separate terminal:

```powershell
npm run dev
```

Vite will start the frontend development server and print the local URL, typically:

```text
http://localhost:5173
```

### Production-style checks

Frontend lint:

```powershell
cd client
npm run lint
```

Frontend build:

```powershell
cd client
npm run build
```

Backend start without Nodemon:

```powershell
cd server
npm start
```

## Design Decisions

- Local-first AI integration: Ollama was used instead of a hosted model API so the app can run privately on a local machine.
- Separate client and server folders: keeps frontend and backend concerns isolated and easier to maintain.
- Structured JSON contract: the backend forces analysis into a predictable schema so the frontend can stay simple.
- Defensive parsing: model output is treated as unreliable by default, so the server extracts JSON carefully, retries once, validates fields, and fills missing values safely.
- Minimal dashboard UI: the frontend focuses on clarity over novelty, which makes the tool more approachable for non-technical users.
- Sample transcript loader: small local JSON samples make the app easier to demo and test.

## Challenges Solved

- Converting free-form model output into consistent structured JSON
- Handling malformed or partial JSON from Ollama safely
- Retrying once when model output cannot be parsed correctly
- Falling back gracefully when required analysis sections are missing
- Presenting technical analysis output in a non-technical, dashboard-friendly UI
- Keeping the frontend modular while the analysis schema evolved

## Future Improvements

- Add transcript file upload support
- Add conversation history or saved reports
- Add richer evidence classification from the model instead of keyword-based tone tagging
- Introduce backend tests for parsing and validation logic
- Add frontend integration tests for the analysis workflow
- Support multiple Ollama models through a simple settings panel
- Add export options such as PDF or JSON download
- Improve rubric scoring transparency with defined scoring criteria
- Add authentication and multi-user project storage if the app expands beyond local use

## Repository Structure

```text
supervisor-feedback-analyzer/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── server/
│   ├── server.js
│   └── package.json
└── README.md
```
