from contextlib import asynccontextmanager
from typing import Annotated

import pandas as pd
import pickle
from bson import ObjectId
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from auth import create_access_token, get_current_user, hash_password, verify_password
from config import get_settings
from database import ensure_indexes, get_database, utc_now
from schemas import (
    PredictionHistoryItem,
    PredictionResponse,
    TokenResponse,
    UserInput,
    UserLogin,
    UserRegister,
    UserResponse,
)

with open("model.pkl", "rb") as f:
    model = pickle.load(f)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_indexes()
    yield


app = FastAPI(title="insureIQ Premium Predictor", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserRegister):
    db = get_database()
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_doc = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "created_at": utc_now(),
    }
    result = await db.users.insert_one(user_doc)
    return UserResponse(id=str(result.inserted_id), name=user_doc["name"], email=user_doc["email"])


@app.post("/auth/login", response_model=TokenResponse)
async def login_user(payload: UserLogin):
    db = get_database()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(str(user["_id"]), user["email"])
    return TokenResponse(access_token=token)


@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: Annotated[dict, Depends(get_current_user)]):
    return UserResponse(id=current_user["id"], name=current_user["name"], email=current_user["email"])


@app.post("/predict", response_model=PredictionResponse)
async def predict_premium(
    data: UserInput,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    input_df = pd.DataFrame(
        [
            {
                "bmi": data.bmi,
                "age_group": data.age_group,
                "lifestyle_risk": data.lifestyle_risk,
                "city_tier": data.city_tier,
                "income_lpa": data.income_lpa,
                "occupation": data.occupation,
            }
        ]
    )

    prediction = model.predict(input_df)[0]
    derived_features = {
        "bmi": data.bmi,
        "age_group": data.age_group,
        "lifestyle_risk": data.lifestyle_risk,
        "city_tier": data.city_tier,
    }
    input_payload = data.model_dump(exclude={"bmi", "age_group", "lifestyle_risk", "city_tier"})
    output_payload = {
        "predicted_category": str(prediction),
        "derived_features": derived_features,
    }

    db = get_database()
    await db.predictions.insert_one(
        {
            "user_id": ObjectId(current_user["id"]),
            "input": input_payload,
            "output": output_payload,
            "created_at": utc_now(),
        }
    )

    return PredictionResponse(
        predicted_category=str(prediction),
        derived_features=derived_features,
    )


@app.get("/history", response_model=list[PredictionHistoryItem])
async def get_prediction_history(
    current_user: Annotated[dict, Depends(get_current_user)],
    limit: int = 50,
):
    db = get_database()
    cursor = (
        db.predictions.find({"user_id": ObjectId(current_user["id"])})
        .sort("created_at", -1)
        .limit(min(limit, 100))
    )

    history: list[PredictionHistoryItem] = []
    async for doc in cursor:
        history.append(
            PredictionHistoryItem(
                id=str(doc["_id"]),
                input=doc["input"],
                output=doc["output"],
                created_at=doc["created_at"],
            )
        )
    return history
