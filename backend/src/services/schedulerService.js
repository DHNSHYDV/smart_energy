import { db } from '../config/database.js';

export class SchedulerService {
  constructor(simulationEngine) {
    this.simulationEngine = simulationEngine;
    this.timer = null;
    this.lastTriggeredMinute = null;
  }

  start() {
    this.timer = setInterval(() => this.checkSchedules(), 10000); // Check every 10s
    console.log('[SchedulerService] Automation scheduler active.');
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  checkSchedules() {
    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDay = dayNames[now.getDay()];

    const triggerKey = `${currentDay}_${currentHourMin}`;
    if (this.lastTriggeredMinute === triggerKey) {
      return; // Already executed this minute
    }

    try {
      const activeSchedules = db.prepare('SELECT * FROM schedules WHERE is_active = 1').all();

      for (const schedule of activeSchedules) {
        if (schedule.time === currentHourMin) {
          let days = [];
          try {
            days = JSON.parse(schedule.days);
          } catch (e) {
            days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
          }

          if (days.includes(currentDay)) {
            const targetState = schedule.action === 'ON';
            console.log(`[Scheduler] ⏰ Auto-executing schedule #${schedule.id}: Turn ${schedule.action} on ${schedule.appliance_id}`);
            this.simulationEngine.toggleAppliance(schedule.appliance_id, targetState);
          }
        }
      }

      this.lastTriggeredMinute = triggerKey;
    } catch (e) {
      console.error('[SchedulerService] Error evaluating schedules:', e.message);
    }
  }

  getSchedules() {
    try {
      return db.prepare(`
        SELECT s.*, a.name as appliance_name, a.location 
        FROM schedules s
        JOIN appliances a ON s.appliance_id = a.id
        ORDER BY s.time ASC
      `).all();
    } catch (e) {
      console.error('[SchedulerService] Error fetching schedules:', e.message);
      return [];
    }
  }

  addSchedule({ applianceId, action, time, days }) {
    try {
      const daysStr = JSON.stringify(days || ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
      const stmt = db.prepare(`
        INSERT INTO schedules (appliance_id, action, time, days, is_active)
        VALUES (?, ?, ?, ?, 1)
      `);
      const info = stmt.run(applianceId, action, time, daysStr);
      return {
        id: info.lastInsertRowid,
        applianceId,
        action,
        time,
        days: JSON.parse(daysStr),
        isActive: true
      };
    } catch (e) {
      console.error('[SchedulerService] Error creating schedule:', e.message);
      throw e;
    }
  }

  toggleSchedule(id) {
    try {
      db.prepare('UPDATE schedules SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
      return true;
    } catch (e) {
      console.error('[SchedulerService] Error toggling schedule:', e.message);
      return false;
    }
  }

  deleteSchedule(id) {
    try {
      db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
      return true;
    } catch (e) {
      console.error('[SchedulerService] Error deleting schedule:', e.message);
      return false;
    }
  }
}
