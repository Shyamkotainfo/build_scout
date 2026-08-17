# BuildSmart — Backend

## Step 1: Project Foundation + Groq LLM Client

### Requirements

- Python 3.11+
- A valid [Groq API key](https://console.groq.com/)

---

### 1. Create and activate a virtual environment

```bash
cd BuildSmart/backend

python3 -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1
```

---

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder with your real key:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
```

> ⚠️ Never commit `.env` with a real key. It is listed in `.gitignore`.

---

### 4. Run the manual LLM smoke test

```bash
python -m app.main
```

Expected output:

```
BuildSmart LLM Test
-------------------
Response:
An AI agent is ...
```

---

### 5. Run pytest integration tests

```bash
pytest -v
```

The test sends `"Explain BuildSmart in one sentence."` to Groq and
asserts that a non-empty response is returned. The test calls the **real**
Groq API — make sure `GROQ_API_KEY` is set in `.env` before running.

---

### Project structure (Step 1)

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py          # Pydantic Settings — reads .env
│   ├── llm/
│   │   ├── __init__.py
│   │   └── client.py      # get_llm() factory → ChatGroq
│   └── main.py            # python -m app.main smoke test
│
├── tests/
│   └── test_llm.py        # Real integration test (no mocks)
│
├── requirements.txt
├── .env.example
└── README.md
```
