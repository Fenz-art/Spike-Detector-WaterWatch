
import joblib
import pandas as pd

def load_model_utils():
    model = joblib.load('models/random_forest_outbreak.pkl')
    scaler = joblib.load('models/scaler.pkl')
    feature_columns = joblib.load('models/model_feature_columns.pkl')
    return model, scaler, feature_columns

def preprocess_new_data(df_new, feature_columns, scaler):
    # If day/month/year present, convert to week_of_outbreak
    if {'day', 'month', 'year'}.issubset(df_new.columns):
        df_new['week_of_outbreak'] = pd.to_datetime(df_new[['year', 'month', 'day']]).dt.isocalendar().week
    elif 'week_of_outbreak' in df_new.columns:
        df_new['week_of_outbreak'] = df_new['week_of_outbreak'].astype(str).str.extract(r'(\d+)').astype(int)

    # Fill missing values for required columns
    for col in ['Deaths', 'Cases', 'preci', 'LAI', 'Temp']:
        if col in df_new.columns:
            df_new[col] = pd.to_numeric(df_new[col], errors='coerce').fillna(0)

    # Feature engineering (same as training)
    df_new['heavy_rain'] = (df_new['preci'] > df_new['preci'].quantile(0.75)).astype(int)
    df_new['optimal_temp'] = ((df_new['Temp'] >= 293) & (df_new['Temp'] <= 308)).astype(int)
    df_new['rain_temp_interaction'] = df_new['preci'] * df_new['Temp']
    disease_dummies = pd.get_dummies(df_new['Disease'], prefix='Disease', dtype=int)
    df_new = pd.concat([df_new, disease_dummies], axis=1)

    # Fill missing columns
    for col in feature_columns:
        if col not in df_new.columns:
            df_new[col] = 0
    X_new = df_new[feature_columns]

    # Scale numerical features
    numerical_features = ['Latitude', 'Longitude', 'Cases', 'preci', 'LAI', 'Temp', 'rain_temp_interaction', 'cases_in_radius', 'week_of_outbreak']
    for col in numerical_features:
        if col not in X_new.columns:
            X_new[col] = 0
    X_new[numerical_features] = scaler.transform(X_new[numerical_features])
    return X_new