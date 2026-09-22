import { Router } from 'express';
import QRCode from 'qrcode';
import os from 'os';
import { SYSTEM_CONFIG } from '../config/constants.js';

export function createSystemRouter(simulationEngine, mqttService) {
  const router = Router();

  // GET /api/system/gateway - Edge controller status
  router.get('/gateway', (req, res) => {
    const status = simulationEngine.esp32.getStatus();
    res.json({
      success: true,
      data: {
        ...status,
        mqttConnected: mqttService ? mqttService.isConnected : false,
        activeAppliances: Array.from(simulationEngine.appliances.values()).filter(a => a.isOn).length,
        totalAppliances: simulationEngine.appliances.size
      }
    });
  });

  // GET /api/system/network - Local Wi-Fi IP and generated QR code for mobile pairing
  router.get('/network', async (req, res) => {
    let localIp = '127.0.0.1';
    const interfaces = os.networkInterfaces();

    // Prioritize wlan/wi-fi or eth interfaces over virtual/docker ones
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          // Prefer 192.168.x.x or 10.x.x.x
          if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
            localIp = iface.address;
            break;
          } else if (localIp === '127.0.0.1') {
            localIp = iface.address;
          }
        }
      }
    }

    const port = SYSTEM_CONFIG.PORT;
    const mobileUrl = `http://${localIp}:${port}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      res.json({
        success: true,
        data: {
          localIp,
          port,
          mobileUrl,
          qrCode: qrDataUrl,
          instructions: [
            'Ensure your mobile phone is connected to the SAME Wi-Fi network as this laptop.',
            `Open your phone camera or browser and navigate to: ${mobileUrl}`,
            'Or simply scan the QR code above with your phone camera.'
          ]
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, message: 'QR Code generation failed: ' + e.message });
    }
  });

  return router;
}
