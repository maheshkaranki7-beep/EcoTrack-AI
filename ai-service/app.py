from fastapi import FastAPI
from pydantic import BaseModel
app=FastAPI(title="EcoTrack AI classifier placeholder")
class Request(BaseModel):
    category_hint:str|None=None
@app.get("/health")
def health(): return {"status":"ok","model":"placeholder_not_trained"}
@app.post("/classify")
def classify(data:Request):
    return {"predicted_class":data.category_hint or "Needs review","confidence":None,
            "model_status":"placeholder_not_trained",
            "message":"No trained image model is connected. Confirm category manually."}
