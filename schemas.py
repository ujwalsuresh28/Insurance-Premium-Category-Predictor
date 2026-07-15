from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field, computed_field


class UserRegister(BaseModel):
    name: Annotated[str, Field(..., min_length=1, max_length=100)]
    email: EmailStr
    password: Annotated[str, Field(..., min_length=6, max_length=128)]


class UserLogin(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(..., min_length=1)]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


class UserInput(BaseModel):
    age: Annotated[int, Field(..., gt=0, lt=120)]
    weight: Annotated[float, Field(..., gt=0)]
    height: Annotated[float, Field(..., gt=0)]
    income_lpa: Annotated[float, Field(..., gt=0)]
    smoker: Annotated[bool, Field(...)]
    city: Annotated[str, Field(..., max_length=50)]
    occupation: Annotated[
        Literal[
            "retired",
            "freelancer",
            "student",
            "government_job",
            "business_owner",
            "unemployed",
            "private_job",
        ],
        Field(...),
    ]

    @computed_field
    @property
    def bmi(self) -> float:
        return round(self.weight / (self.height**2), 2)

    @computed_field
    @property
    def lifestyle_risk(self) -> str:
        if self.smoker and self.bmi > 30:
            return "high"
        if self.smoker and self.bmi > 27:
            return "medium"
        return "low"

    @computed_field
    @property
    def age_group(self) -> str:
        if self.age < 25:
            return "young"
        if self.age < 45:
            return "adult"
        if self.age < 65:
            return "middle_aged"
        return "senior"

    @computed_field
    @property
    def city_tier(self) -> int:
        tier_1_cities = [
            "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune",
        ]
        tier_2_cities = [
            "Jaipur", "Chandigarh", "Indore", "Lucknow", "Patna", "Ranchi",
            "Visakhapatnam", "Coimbatore", "Bhopal", "Nagpur", "Vadodara", "Surat",
            "Rajkot", "Jodhpur", "Raipur", "Amritsar", "Varanasi", "Agra", "Dehradun",
            "Mysore", "Jabalpur", "Guwahati", "Thiruvananthapuram", "Ludhiana", "Nashik",
            "Allahabad", "Udaipur", "Aurangabad", "Hubli", "Belgaum", "Salem", "Vijayawada",
            "Tiruchirappalli", "Bhavnagar", "Gwalior", "Dhanbad", "Bareilly", "Aligarh",
            "Gaya", "Kozhikode", "Warangal", "Kolhapur", "Bilaspur", "Jalandhar", "Noida",
            "Guntur", "Asansol", "Siliguri",
        ]
        if self.city in tier_1_cities:
            return 1
        if self.city in tier_2_cities:
            return 2
        return 3


class PredictionResponse(BaseModel):
    predicted_category: str
    derived_features: dict


class PredictionHistoryItem(BaseModel):
    id: str
    input: dict
    output: dict
    created_at: datetime
