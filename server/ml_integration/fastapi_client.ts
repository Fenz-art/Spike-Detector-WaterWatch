import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MLPredictionResult {
  is_spike_detected: boolean;
  heatmap_data: Array<{
    latitude: number;
    longitude: number;
    count: number;
  }>;
  predictions: any[];
  threshold_used: number;
  max_outbreak_probability: number;
}

export async function predictSpike(file: Buffer, filename: string): Promise<MLPredictionResult> {
  const formData = new FormData();
  const blob = new Blob([file], { type: 'text/csv' });
  formData.append('file', blob, filename);

  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-spike`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 second timeout
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'ML prediction failed');
    }
    throw new Error('Unable to connect to ML service');
  }
}

export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}
