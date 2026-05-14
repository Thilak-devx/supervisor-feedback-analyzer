# Supervisor Feedback Analyzer

Supervisor Feedback Analyzer is a full-stack local application for reviewing supervisor-to-employee conversation transcripts and converting them into structured coaching insights. It combines a React dashboard for transcript input and review with an Express API that orchestrates a local Ollama model.

The project was built to demonstrate practical product thinking, prompt engineering, structured AI output handling, and clean frontend/backend integration in a way that is understandable to non-technical users.

## Project Overview

The application helps users:

- paste or load a sample supervisor transcript
- send the transcript to a local analysis API
- generate structured coaching insights using Ollama
- review evidence, scoring, KPI mapping, gap analysis, and follow-up questions in a clean dashboard

This project currently runs fully on a local machine and does not require any hosted AI provider.

## Features

- React frontend built with Vite
- Tailwind CSS dashboard UI
- sample transcript loader for quick testing
- Express backend for prompt orchestration and validation
- Ollama integration using `llama3.2`
- structured JSON analysis response
- evidence cards with quote, category, sentiment, and explanation
- prominent rubric score display
- loading, error, empty, and fallback UI states
- resilient JSON extraction, retry, normalization, and validation on the backend

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- HTTP: `fetch` in the frontend, `axios` in the backend
- Local LLM runtime: Ollama
- Model: `llama3.2`
- Tooling: ESLint, Nodemon

## Setup Instructions

### Prerequisites

- Node.js 18+ recommended
- npm
- Ollama installed locally

### Open the project

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

Optional backend environment variables:

- `PORT`: API server port, defaults to `5000`
- `OLLAMA_URL`: custom Ollama generate endpoint, defaults to `http://localhost:11434/api/generate`

Example `server/.env`:

```env
PORT=5000
OLLAMA_URL=http://localhost:11434/api/generate
```

## How to Run Frontend and Backend

### Run the backend

```powershell
cd server
npm run dev
```

This starts the Express API on `http://localhost:5000`.

### Run the frontend

In a separate terminal:

```powershell
cd client
npm run dev
```

Vite will start the frontend development server, typically on:

```text
http://localhost:5173
```

### Verification commands

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

Backend syntax check:

```powershell
cd server
node --check server.js
```

## Architecture Overview

The repository is split into two main applications:

- [client](C:\Users\2026\Desktop\supervisor-feedback-analyzer\client): React frontend
- [server](C:\Users\2026\Desktop\supervisor-feedback-analyzer\server): Express backend

High-level flow:

1. A user pastes a transcript or selects a sample transcript in the frontend.
2. The frontend sends a `POST` request to `http://localhost:5000/analyze`.
3. The Express backend builds a strict JSON-only prompt for Ollama.
4. The backend sends the prompt to `http://localhost:11434/api/generate`.
5. Ollama returns model output.
6. The backend extracts JSON safely, retries once if needed, validates required fields, and applies fallback values for missing sections.
7. The frontend renders the structured analysis in dashboard cards.

Expected response shape:

```json
{
  "evidence": [
    {
      "quote": "",
      "category": "",
      "sentiment": "positive",
      "explanation": ""
    }
  ],
  "rubricScore": {
    "score": 0,
    "justification": ""
  },
  "kpiMapping": [],
  "gapAnalysis": [],
  "followUpQuestions": []
}
```

### Frontend Flow

1. The user enters a transcript manually or loads a sample from the dropdown.
2. React state manages transcript input, loading status, analysis output, and errors.
3. The frontend service layer sends the transcript to the backend.
4. The UI transitions through pre-analysis, loading, error, partial, and complete states.
5. Structured results are displayed as readable dashboard cards.

### Backend Flow

1. The Express server exposes `POST /analyze`.
2. The route validates transcript presence, type, length, and request size.
3. The backend builds a strict prompt and sends it to Ollama.
4. The response is extracted, parsed, normalized, validated, and retried once if malformed.
5. The server performs a final sanitation pass before returning the response to the frontend.

### Ollama Integration Flow

1. The backend sends a request to `http://localhost:11434/api/generate`.
2. Ollama runs `llama3.2` locally with `stream: false`.
3. The model is instructed to return raw JSON only, with no markdown or extra explanation.
4. If the response is malformed or incomplete, the backend retries once with a stricter repair prompt.
5. The frontend receives either a validated result or a fallback-safe normalized result.

### Why Express Was Used

- It separates UI concerns from prompt orchestration and validation logic.
- It gives the frontend a stable internal API instead of coupling it directly to the LLM runtime.
- It makes future additions like auth, persistence, logging, or rate limiting much easier.

### Why a Local LLM Was Chosen

- It keeps transcript data on the user's machine.
- It avoids dependence on hosted AI APIs, billing, and internet connectivity for local development.
- It is a practical fit for privacy-conscious internal analysis workflows.

## Prompt Engineering Explanation

The backend prompt was designed to reduce ambiguity and improve structured output quality.

Key prompt decisions:

- require exactly one JSON object
- explicitly forbid markdown, code fences, and extra explanation
- define the exact expected schema
- constrain evidence into structured objects
- constrain rubric scoring to numeric output
- instruct the model to use empty arrays rather than omit fields
- use a stricter retry prompt if the first output is malformed

Structured prompting was necessary because free-form LLM output is often readable for humans but unreliable for software systems that need a strict contract.

## JSON Reliability Strategy

The backend treats model output as unreliable by default and hardens the response in several layers:

1. The prompt explicitly requires a single JSON object with a fixed schema.
2. Markdown fences and surrounding noise are stripped before parsing.
3. The server uses brace-aware extraction to isolate the first complete JSON object safely.
4. Parsed data is normalized into frontend-safe structures.
5. Required fields are validated:
   - `evidence`
   - `rubricScore`
   - `kpiMapping`
   - `gapAnalysis`
   - `followUpQuestions`
6. If the first model response is malformed or incomplete, generation is retried once.
7. If issues remain, fallback-safe values are returned so the frontend never receives a broken shape.

## Design Decisions

- Local-first AI integration: Ollama was chosen over a hosted model API to keep the workflow private and simple.
- Separate client and server folders: this keeps frontend and backend concerns clearly isolated.
- Structured JSON contract: the backend guarantees a predictable schema so the frontend can stay simple and robust.
- Defensive parsing and fallback handling: model output is never trusted blindly.
- Minimal dashboard UI: the interface is intentionally clean, readable, and recruiter-friendly rather than flashy.
- Sample transcript loader: this makes the project easier to test and demo quickly.

## Tradeoffs and Limitations

- Local models are slower and less consistent than strong hosted APIs.
- Output quality depends on the installed model and available machine resources.
- JSON reliability is much better with validation, but LLM output can still be shallow or incomplete.
- The current solution uses prompt engineering plus validation rather than a fully typed generation framework.
- There is no persistence layer yet, so analyses are not saved between sessions.
- The project is optimized for local evaluation and demonstration, not multi-user production deployment.

## Future Improvements

- Add transcript file upload support
- Add saved report history
- Add richer rubric-specific evaluation logic from external config files
- Add backend tests for parsing and validation
- Add frontend integration tests for the analysis flow
- Support multiple local models through a settings panel
- Add export options such as PDF or JSON download
- Improve rubric transparency with explicit level definitions and KPI descriptions
- Add authentication and persistent storage if the product expands

## AI Usage Reflection

This project used AI coding assistance as a productivity tool, but not as an unverified source of truth. Generated output was reviewed, adjusted, and validated against the codebase and runtime behavior before being kept.

### Where AI Coding Assistants Helped

- Scaffolding the initial React and Express structure
- Speeding up repetitive UI work such as cards, layout sections, and state-specific views
- Drafting prompt and JSON parsing strategies for Ollama integration
- Helping shape documentation and architecture explanations

### Where Outputs Were Rejected

- UI suggestions that felt too generic or too decorative for the intended professional dashboard style
- Backend logic that trusted model output too easily
- Early ideas that treated evidence as loose strings instead of structured objects
- Any implementation that could pass malformed JSON or missing fields directly to the frontend

### How Generated Code Was Verified

- Source files were reviewed directly after major changes
- Frontend changes were checked with `npm run lint` and `npm run build`
- Backend changes were checked with `node --check`
- Frontend and backend data contracts were reviewed together
- Generated code was revised when it added weak validation, confusing UX, or unnecessary complexity

### Hallucination Prevention Strategy

- Read the actual local files before making assumptions
- Keep schemas explicit instead of relying on model intuition
- Normalize and validate model output before returning it
- Prefer safe fallback values over optimistic assumptions
- Use concrete verification commands rather than trusting generated code by default

### Why Structured Prompting Was Necessary

- Ollama can return extra text, markdown, or malformed JSON unless heavily constrained
- The frontend depends on a stable schema to render safely
- Structured evidence objects require more precision than a plain-language summary
- Tight prompt rules reduce off-schema fields, missing keys, and formatting drift

### Lessons Learned

- AI assistance is most useful when paired with careful review and strong validation
- Prompt quality improves reliability, but prompt quality alone is not enough
- Local LLM workflows benefit heavily from defensive backend normalization
- Incomplete AI output should be treated as a normal operating condition
- The most dependable pattern was structured prompting plus schema validation, retry logic, and fallback UX

## Screenshots

Add screenshots here before submission. Recommended captures:

- Home dashboard with empty state
- Transcript loaded from sample dropdown
- Loading state while analysis runs
- Completed dashboard with score, evidence, KPI mapping, gap analysis, and follow-up questions
- Error or partial-analysis state

Example structure:

```md
![Empty State](./docs/screenshots/empty-state.png)
![Completed Analysis](./docs/screenshots/completed-analysis.png)
```

## Repository Structure

```text
supervisor-feedback-analyzer/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- data/
|   |   |-- services/
|   |   `-- utils/
|   `-- package.json
|-- server/
|   |-- server.js
|   `-- package.json
`-- README.md
```
