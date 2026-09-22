import { Router } from 'express';
import { db } from '../config/database.js';

export function createSimulationRouter(simulationEngine) {
  const router = Router();

  // GET /api/simulation/snapshot
  router.get('/snapshot', (req, res) => {
    res.json({ success: true, data: simulationEngine.getSnapshot() });
  });

  // POST /api/simulation/speed
  router.post('/speed', (req, res) => {
    const { speed } = req.body;
    const num = parseInt(speed, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      return res.status(400).json({ success: false, message: 'Invalid speed multiplier. Must be 1-100.' });
    }
    const newSpeed = simulationEngine.setSpeed(num);
    res.json({ success: true, speedMultiplier: newSpeed });
  });

  // POST /api/simulation/pause
  router.post('/pause', (req, res) => {
    simulationEngine.pause();
    res.json({ success: true, isPaused: true });
  });

  // POST /api/simulation/resume
  router.post('/resume', (req, res) => {
    simulationEngine.resume();
    res.json({ success: true, isPaused: false });
  });

  // POST /api/simulation/reset
  router.post('/reset', (req, res) => {
    simulationEngine.reset();
    res.json({ success: true, message: 'Simulation counters and energy accumulators reset.' });
  });

  // POST /api/simulation/scenario
  router.post('/scenario', (req, res) => {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ success: false, message: 'Scenario name is required.' });
    const result = simulationEngine.applyScenario(scenario);
    res.json({ success: true, data: result });
  });

  // POST /api/simulation/anomaly
  router.post('/anomaly', (req, res) => {
    const { applianceId = 'AC001', isAnomaly = true } = req.body;
    const result = simulationEngine.setApplianceAnomaly(applianceId, isAnomaly);
    if (!result) return res.status(404).json({ success: false, message: 'Appliance not found.' });
    res.json({ success: true, data: result });
  });

  // POST /api/simulation/config
  router.post('/config', (req, res) => {
    const { tariff, carbonFactor } = req.body;
    if (tariff !== undefined) {
      const val = parseFloat(tariff);
      if (!isNaN(val) && val > 0) {
        simulationEngine.tariff = val;
        db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(val), 'tariff_per_kwh');
      }
    }
    if (carbonFactor !== undefined) {
      const val = parseFloat(carbonFactor);
      if (!isNaN(val) && val > 0) {
        simulationEngine.carbonFactor = val;
        db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(val), 'carbon_factor');
      }
    }
    res.json({
      success: true,
      tariff: simulationEngine.tariff,
      carbonFactor: simulationEngine.carbonFactor
    });
  });

  return router;
}
