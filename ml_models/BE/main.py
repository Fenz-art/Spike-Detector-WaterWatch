
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_utils import load_model_utils, preprocess_new_data
import pandas as pd
from fastapi.responses import JSONResponse
from typing import Dict, Any
import io, logging

# Load model, scaler, feature columns once
model, scaler, model_feature_columns = load_model_utils()

app = FastAPI(title="Waterborne Disease Outbreak Prediction")
logger = logging.getLogger("uvicorn.error")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "Waterborne Disease Outbreak Prediction API",
        "routes": ["/", "/health", "/predict-spike", "/docs", "/openapi.json"]
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/predict-spike")
async def predict_spike(file: UploadFile = File(...)):
    try:
        content = await file.read()
        logger.info(f"Received file: {file.filename}, size: {len(content)} bytes")
        try:
            df_new = pd.read_csv(io.BytesIO(content))
            logger.info(f"Successfully parsed as CSV with {len(df_new)} rows")
        except Exception as csv_error:
            logger.warning(f"CSV parsing failed: {csv_error}, trying Excel format")
            try:
                df_new = pd.read_excel(io.BytesIO(content))
                logger.info(f"Successfully parsed as Excel with {len(df_new)} rows")
            except Exception as excel_error:
                logger.error(f"Excel parsing also failed: {excel_error}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not parse file as CSV or Excel: {str(csv_error)}"
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error reading file")
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Accept either week_of_outbreak or day/month/year
    required_cols = {"Disease", "Latitude", "Longitude", "Cases", "preci", "LAI", "Temp"}
    has_week = "week_of_outbreak" in df_new.columns
    has_date = {'day', 'month', 'year'}.issubset(df_new.columns)
    if not (has_week or has_date):
        required_cols.add("week_of_outbreak")
        logger.error(f"Missing required columns: {required_cols - set(df_new.columns)}")
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {sorted(required_cols - set(df_new.columns))}. Found columns: {list(df_new.columns)}"
        )

    try:
        logger.info("Starting data preprocessing")
        X_new = preprocess_new_data(df_new, feature_columns=model_feature_columns, scaler=scaler)
        logger.info(f"Preprocessing successful, feature matrix shape: {X_new.shape}")
    except Exception as e:
        logger.exception("Preprocessing failed")
        raise HTTPException(
            status_code=400,
            detail=f"Data preprocessing error: {str(e)}"
        )

    try:
        logger.info("Running model prediction")
        prediction_probs = model.predict_proba(X_new)
        outbreak_probs = prediction_probs[:, 1]
        OUTBREAK_THRESHOLD = 0.5
        predictions = (outbreak_probs >= OUTBREAK_THRESHOLD).astype(int)
        logger.info(f"Using outbreak threshold: {OUTBREAK_THRESHOLD}")
        logger.info(f"Detected {sum(predictions)} outbreak(s) out of {len(predictions)} records")
        logger.info(f"Outbreak probabilities - min:{outbreak_probs.min():.3f}, max:{outbreak_probs.max():.3f}, mean:{outbreak_probs.mean():.3f}")
    except Exception as e:
        logger.exception("Model prediction failed")
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction error: {str(e)}"
        )

    try:
        df_new = df_new.copy()
        df_new['predicted_outbreak'] = predictions.astype(int)
        df_new['outbreak_probability'] = outbreak_probs.round(3)
        if 'Latitude' in df_new.columns and 'Longitude' in df_new.columns:
            df_new['_lat_r'] = df_new['Latitude'].round(3)
            df_new['_lon_r'] = df_new['Longitude'].round(3)
            heatmap = (
                df_new.groupby(['_lat_r', '_lon_r'])['predicted_outbreak']
                .sum()
                .reset_index()
                .rename(columns={'_lat_r': 'latitude', '_lon_r': 'longitude', 'predicted_outbreak': 'count'})
            )
            heatmap_data = heatmap.to_dict(orient='records')
            df_new.drop(columns=['_lat_r', '_lon_r'], inplace=True)
            logger.info(f"Generated heatmap with {len(heatmap_data)} points")
        else:
            heatmap_data = []
            logger.warning("Latitude/Longitude columns missing, heatmap empty")

        is_spike = bool((df_new['predicted_outbreak'] == 1).any())
        predictions_list = df_new.fillna('').to_dict(orient='records')
        response_payload: Dict[str, Any] = {
            'is_spike_detected': is_spike,
            'heatmap_data': heatmap_data,
            'predictions': predictions_list,
            'threshold_used': OUTBREAK_THRESHOLD,
            'max_outbreak_probability': float(outbreak_probs.max())
        }
        logger.info(f"Successfully returning response with spike_detected={is_spike}")
        return JSONResponse(content=response_payload)
    except Exception as e:
        logger.exception("Error building response")
        raise HTTPException(
            status_code=500,
            detail=f"Error building response: {str(e)}"
        )