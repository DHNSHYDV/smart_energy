import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { SYSTEM_CONFIG } from './config/constants.js';
import { initDatabase } from './config/database.js';
import { SimulationEngine } from './simulation/SimulationEngine.js';
import { MQTTBrokerService } from './mqtt/broker.js';
import { AnomalyService } from './services/anomalyService.js';
import { RecommendationService } from './services/recommendationService.js';
import { SchedulerService } from './services/schedulerService.js';
import { initSocketHandler } from './sockets/socketHandler.js';

import { createApplianceRouter } from './routes/appliances.js';
import { createAnalyticsRouter } from './routes/analytics.js';
import { createAlertsRouter } from './routes/alerts.js';
import { createSchedulesRouter } from './routes/schedules.js';
import { createSimulationRouter } from './routes/simulation.js';
import { createSystemRouter } from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize SQLite Database
initDatabase();

// 2. Initialize Simulation Engine & IoT Controller
const simulationEngine = new SimulationEngine();

// 3. Initialize MQTT Broker Service (Port 1883)
const mqttService = new MQTTBrokerService(simulationEngine);
mqttService.start();

// 4. Initialize Domain Services
const anomalyService = new AnomalyService(simulationEngine);
const recommendationService = new RecommendationService(simulationEngine);
const schedulerService = new SchedulerService(simulationEngine);
schedulerService.start();

// 5. Initialize Express App & HTTP Server
const app = express();
const httpServer = createServer(app);

// Enable CORS for cross-device mobile Wi-Fi connectivity
app.use(cors({ origin: '*' }));
app.use(express.json());

// 6. Initialize Socket.IO Server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
initSocketHandler(io, simulationEngine, anomalyService, recommendationService, mqttService);

// 7. Mount REST API Routes
app.use('/api/appliances', createApplianceRouter(simulationEngine, mqttService));
app.use('/api/analytics', createAnalyticsRouter(analyticsServiceInstance(analyticsServiceWrapper(simulationEngine)), recommendationService, simulationEngine));
app.use('/api/alerts', createAlertsRouter(anomalyService));
app.use('/api/schedules', createSchedulesRouter(schedulerService));
app.use('/api/simulation', createSimulationRouter(simulationEngine));
app.use('/api/system', createSystemRouter(simulationEngine, mqttService));

// Helper for AnalyticsService import cleanly
import { AnalyticsService } from './services/analyticsService.js';
function analyticsServiceInstance() {
  return new AnalyticsService(simulationEngine);
}
function analyticsServiceWrapper(engine) {
  return new AnalyticsService(engine);
}

// 8. Serve Frontend Static Production Build (if present)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    // If request does not start with /api, serve index.html
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
  });
  console.log(`[Frontend] Serving pre-built web client from ${frontendDistPath}`);
}

// 9. Start Simulation Engine Clock
simulationEngine.start();

// 10. Listen on Port 5000 bound to 0.0.0.0 (enables local Wi-Fi mobile access)
const PORT = SYSTEM_CONFIG.PORT;
httpServer.listen(PORT, '0.0.0.0', () => {
  const localIp = simulationEngine.esp32.getLocalIP();
  console.log('\n===============================================================');
  console.log('⚡ SMART ENERGY CONSERVATION TRACKER - SIMULATION SYSTEM ⚡');
  console.log('===============================================================');
  console.log(`📡 IoT Edge Gateway:  ${SYSTEM_CONFIG.DEVICE_ID} (ONLINE)`);
  console.log(`🔌 MQTT Broker:       mqtt://localhost:${SYSTEM_CONFIG.MQTT_PORT}`);
  console.log(`💻 Laptop Dashboard:  http://localhost:${PORT}`);
  console.log(`📱 Mobile (Same Wi-Fi): http://${localIp}:${PORT}`);
  console.log('===============================================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Smart Energy Tracker Simulation...');
  simulationEngine.stop();
  schedulerService.stop();
  process.exit(0);
});
