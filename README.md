# insureIQ — ML Insurance Premium Predictor

**insureIQ** is a modern, high-fidelity insurance premium category predictor. It features a sleek glassmorphic React frontend and a FastAPI backend powered by a scikit-learn machine learning classifier. The app estimates whether an individual's profile aligns with a **Low**, **Medium**, or **High** insurance premium category based on real-time health, location, and lifestyle parameters.

---

## 🚀 Key Features

*   **Futuristic Dark UI**: Modern dark theme with floating radial ambient light meshes, transparent glass cards (`backdrop-filter: blur(20px)`), and glowing element states.
*   **Real-time Health Estimators**:
    *   **Live BMI Gauge**: Instantly computes and visualizes Body Mass Index (BMI) using interactive Weight and Height range sliders.
    *   **Live Health Risk Badge**: Dynamically assesses risk factors (Low, Medium, High) based on real-time BMI and smoking status.
    *   **City Tier Badge**: Automatically checks the input city against tier rules to resolve urban tier classifications (Tier 1/2/3).
*   **Grid-Based Occupation Selectors**: Replaces standard dropdown selects with descriptive, interactive cards featuring icon emojis.
*   **Simulated AI Scan Sequences**: Displays a custom digital scanning animation when query processing takes place to indicate model analysis steps.
*   **Radial Risk Gauge Visualizer**: Renders the final predicted category in a large circular indicator badge accented with custom glowing auras (Green for Low, Amber for Medium, Rose for High).
*   **Prediction Logs Dashboard**:
    *   Saves and retrieves full parameter history in MongoDB.
    *   Provides dynamic UI filters to search by city/occupation, smoker status, or risk tier.
    *   **Load into Form**: Prefills the interactive estimator with past logs instantly for quick adjustment runs.
*   **Secure JWT Authentication**: Form guards to manage public/private routes with custom-designed login/register screens.

---

## 🛠️ Tech Stack

### Backend
*   **Framework**: FastAPI (Python)
*   **Database**: MongoDB (via `motor` async driver)
*   **ML Engine**: Scikit-Learn (Random Forest model packaged in `model.pkl`)
*   **Data Processing**: Pandas
*   **Authentication**: JSON Web Tokens (JWT) & Bcrypt password hashing
*   **Schemas**: Pydantic v2

### Frontend
*   **Core**: React 19 (JavaScript)
*   **Build Utility**: Vite
*   **Routing**: React Router DOM v7
*   **Styling**: Pure CSS (custom variables, keyframe animations, glassmorphism, responsive grid layouts)

---

## 📁 Directory Structure

```text
├── app.py                  # FastAPI application routes & endpoints
├── auth.py                 # JWT token creation & login verification helpers
├── database.py             # MongoDB async client initialization & index establishment
├── config.py               # Pydantic environment configurations
├── schemas.py              # User inputs, API payload validators, & computed fields
├── requirements.txt        # Backend dependencies
├── model.pkl               # Trained scikit-learn model
└── frontend/               # React client application
    ├── index.html          # Entry document
    ├── vite.config.js      # Dev server configurations & API proxy rules
    ├── package.json        # Frontend scripts & modules
    └── src/
        ├── App.jsx         # App router setup & authentication state guards
        ├── index.css       # Global stylesheet (themes, glassmorphic panels, sliders)
        ├── components/     # Reusable buttons, badges, loaders & navbars
        ├── context/        # React Auth Context (handles Login/Register API calls)
        ├── pages/          # Core pages (Dashboard, History logs, Auth forms)
        └── api/            # API fetch client wrapper
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   MongoDB Instance (Running locally on `mongodb://localhost:27017` or configured via `.env`)

### 1. Backend Server Configuration
From the project root:

1.  Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    # On Windows:
    .venv\Scripts\activate
    # On macOS/Linux:
    source .venv/bin/activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Set up environment configurations:
    *   Create a `.env` file (copied from `.env.example`).
    *   Configure `MONGODB_URI` and your custom `JWT_SECRET_KEY`.
4.  Start the development server:
    ```bash
    uvicorn app:app --reload
    ```
    The API documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend React client
From the `frontend/` directory:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the local development server:
    ```bash
    npm run dev
    ```
3.  Open your browser and navigate to `http://localhost:5173/`. Vite automatically proxies requests pointing to `/api` to the backend on `http://127.0.0.1:8000`.

### 3. Production Build
To create a optimized production bundle of the React client:
```bash
cd frontend
npm run build
```
The static files will be exported to `frontend/dist/`.

---

## 🔒 Security & Environment Configurations

The following variables are configured inside your `.env` file:
*   `MONGODB_URI`: Connection string pointing to your database instance.
*   `MONGODB_DB_NAME`: Database name (defaults to `insurance_predictor`).
*   `JWT_SECRET_KEY`: Cryptographic signing key.
*   `JWT_ALGORITHM`: Crypto hashing protocol (defaults to `HS256`).
*   `JWT_EXPIRE_MINUTES`: Expiry duration for authentication sessions (defaults to `1440` minutes).
*   `CORS_ORIGINS`: Allowed server origins.
