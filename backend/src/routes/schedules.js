import { Router } from 'express';

export function createSchedulesRouter(schedulerService) {
  const router = Router();

  // GET /api/schedules
  router.get('/', (req, res) => {
    const schedules = schedulerService.getSchedules();
    res.json({
      success: true,
      data: schedules
    });
  });

  // POST /api/schedules
  router.post('/', (req, res) => {
    const { applianceId, action, time, days } = req.body;
    if (!applianceId || !action || !time) {
      return res.status(400).json({ success: false, message: 'Missing required schedule fields (applianceId, action, time).' });
    }

    try {
      const created = schedulerService.addSchedule({ applianceId, action, time, days });
      res.status(201).json({
        success: true,
        message: 'Schedule created successfully.',
        data: created
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  // POST /api/schedules/:id/toggle
  router.post('/:id/toggle', (req, res) => {
    const { id } = req.params;
    const ok = schedulerService.toggleSchedule(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    res.json({ success: true, message: 'Schedule status toggled.' });
  });

  // DELETE /api/schedules/:id
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const ok = schedulerService.deleteSchedule(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Schedule not found.' });
    res.json({ success: true, message: 'Schedule deleted.' });
  });

  return router;
}
