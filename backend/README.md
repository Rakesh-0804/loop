# AI Customer Feedback Intelligence Platform - Flask Backend Service

This is the Python Flask REST API backend integrated with **Neon PostgreSQL** and **Google Gemini 3.6 Flash AI**.

## API Endpoints Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root status and API directory |
| `GET` | `/health` | Health check endpoint |
| `POST` | `/submit-feedback` | Submit & analyze feedback using Gemini 3.6 Flash AI |
| `GET` | `/feedbacks` | Fetch all analyzed feedback records from PostgreSQL |
| `GET` | `/analytics` | Sentiment metrics aggregation (Total, Positive, Negative, Neutral) |
| `GET` | `/search?keyword=...` | Search feedback records by keyword in PostgreSQL |
| `POST` | `/generate-report` | Synthesize C-suite executive report using Gemini 3.6 Flash AI |

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://neondb_owner:npg_JLVuyth5XSk3@ep-nameless-pond-azsr3y63-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run the Server
```bash
python app.py
```
The Flask server will start at `http://0.0.0.0:8000`.
