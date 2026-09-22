import { Router } from 'express';

export function createAnalyticsRouter(analyticsService, recommendationService, simulationEngine) {
  const router = Router();

  // GET /api/analytics/realtime
  router.get('/realtime', (req, res) => {
    const snapshot = simulationEngine.getSnapshot();
    res.json({
      success: true,
      data: {
        liveHistory: snapshot.liveHistory,
        tariff: snapshot.tariff,
        carbonFactor: snapshot.carbonFactor,
        speedMultiplier: snapshot.speedMultiplier,
        isPaused: snapshot.isPaused
      }
    });
  });

  // GET /api/analytics/historical?range=today|yesterday|7d|30d
  router.get('/historical', (req, res) => {
    const range = req.query.range || '7d';
    const result = analyticsService.getHistoricalData(range);
    res.json({
      success: true,
      data: result
    });
  });

  // GET /api/analytics/attribution
  router.get('/attribution', (req, res) => {
    const attribution = analyticsService.getDeviceAttribution();
    res.json({
      success: true,
      data: attribution
    });
  });

  // GET /api/analytics/peak-hours
  router.get('/peak-hours', (req, res) => {
    const peakInfo = analyticsService.getPeakHourAnalysis();
    res.json({
      success: true,
      data: peakInfo
    });
  });

  // GET /api/analytics/recommendations
  router.get('/recommendations', (req, res) => {
    const recommendations = recommendationService.generateRecommendations();
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  });

  return router;
}
