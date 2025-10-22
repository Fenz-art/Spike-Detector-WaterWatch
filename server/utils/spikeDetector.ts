import { getStorage } from "../storage/index.js";

interface SpikeDetectionResult {
  isSpike: boolean;
  severity: "low" | "medium" | "high" | "critical";
  casesDetected: number;
  expectedCases: number;
  spikePercentage: number;
  message: string;
}

/**
 * Calculate Z-score for anomaly detection
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Detect spike in disease cases using statistical methods
 */
export async function detectSpike(
  location: string,
  diseaseType: string,
  currentCases: number
): Promise<SpikeDetectionResult> {
  const storage = getStorage();
  
  // Get historical data for the same location and disease type
  const allRecords = await storage.findRecords({
    location,
    diseaseType,
  });
  
  // Filter for last 90 days and sort
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const historicalRecords = allRecords
    .filter(r => r.dateReported >= ninetyDaysAgo)
    .sort((a, b) => b.dateReported.getTime() - a.dateReported.getTime());

  // If no historical data, use basic threshold
  if (historicalRecords.length < 5) {
    const threshold = 10; // Baseline threshold
    if (currentCases > threshold) {
      return {
        isSpike: true,
        severity: currentCases > threshold * 3 ? "critical" : currentCases > threshold * 2 ? "high" : "medium",
        casesDetected: currentCases,
        expectedCases: threshold,
        spikePercentage: ((currentCases - threshold) / threshold) * 100,
        message: `Spike detected in ${location}! ${currentCases} cases of ${diseaseType} reported (insufficient historical data for precise analysis).`,
      };
    }
    return {
      isSpike: false,
      severity: "low",
      casesDetected: currentCases,
      expectedCases: threshold,
      spikePercentage: 0,
      message: "No spike detected. Cases within normal range.",
    };
  }

  // Calculate statistics from historical data
  const caseCounts = historicalRecords.map((record) => record.casesCount);
  const mean = caseCounts.reduce((sum, val) => sum + val, 0) / caseCounts.length;
  const stdDev = calculateStdDev(caseCounts, mean);
  const zScore = calculateZScore(currentCases, mean, stdDev);

  // Use moving average for expected cases
  const recentRecords = historicalRecords.slice(0, 7); // Last 7 records
  const movingAvg = recentRecords.length > 0
    ? recentRecords.reduce((sum, record) => sum + record.casesCount, 0) / recentRecords.length
    : mean;

  const expectedCases = Math.round(movingAvg);
  const spikePercentage = ((currentCases - expectedCases) / expectedCases) * 100;

  // Determine severity based on Z-score and spike percentage
  let severity: "low" | "medium" | "high" | "critical" = "low";
  let isSpike = false;

  if (zScore > 3 || spikePercentage > 200) {
    severity = "critical";
    isSpike = true;
  } else if (zScore > 2 || spikePercentage > 100) {
    severity = "high";
    isSpike = true;
  } else if (zScore > 1.5 || spikePercentage > 50) {
    severity = "medium";
    isSpike = true;
  } else if (zScore > 1 || spikePercentage > 25) {
    severity = "low";
    isSpike = true;
  }

  const message = isSpike
    ? `⚠️ SPIKE DETECTED in ${location}! ${currentCases} cases of ${diseaseType} reported (expected: ${expectedCases}). This is ${spikePercentage.toFixed(1)}% above normal levels. Z-score: ${zScore.toFixed(2)}`
    : `✓ No spike detected in ${location}. ${currentCases} cases of ${diseaseType} are within normal range (expected: ${expectedCases}).`;

  return {
    isSpike,
    severity,
    casesDetected: currentCases,
    expectedCases,
    spikePercentage: Math.round(spikePercentage),
    message,
  };
}

/**
 * Create alert if spike is detected
 */
export async function createAlertIfSpike(
  location: string,
  diseaseType: string,
  currentCases: number,
  recordId: string,
  latitude?: number,
  longitude?: number
): Promise<any | null> {
  const storage = getStorage();
  const detection = await detectSpike(location, diseaseType, currentCases);

  if (detection.isSpike) {
    const alert = await storage.createAlert({
      recordId,
      location,
      diseaseType,
      severity: detection.severity,
      casesDetected: detection.casesDetected,
      expectedCases: detection.expectedCases,
      message: detection.message,
    });

    return alert;
  }

  return null;
}
