import { dbRepository } from '../db/connect.ts';
import { TimeSlotOption, WorkingDaySchedule } from '../../types/index.ts';

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Generate standard intervals between start and end time (e.g. 09:00 to 17:00 with 30m steps)
 */
function generateTimeSlots(startHourMinute: string, endHourMinute: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = startHourMinute.split(':').map(Number);
  const [endH, endM] = endHourMinute.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const finishMinutes = endH * 60 + endM;

  while (currentMinutes + intervalMinutes <= finishMinutes) {
    const hours24 = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const formatted = `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
    slots.push(formatted);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

export const slotManager = {
  /**
   * Generates a unique, friendly booking reference number
   */
  generateReference(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `MCP-${yy}${mm}-${randomHex}`;
  },

  /**
   * Returns slot availability for a specified date YYYY-MM-DD
   */
  async getAvailabilityForDate(dateStr: string): Promise<{
    date: string;
    isOperatingDay: boolean;
    reason?: string;
    slots: TimeSlotOption[];
  }> {
    const clinic = await dbRepository.getClinicSettings();

    // Check if valid date format
    const targetDate = new Date(`${dateStr}T00:00:00Z`);
    if (isNaN(targetDate.getTime())) {
      return { date: dateStr, isOperatingDay: false, reason: 'Invalid date format', slots: [] };
    }

    // Check if target date is in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) {
      return { date: dateStr, isOperatingDay: false, reason: 'Cannot schedule appointments in the past', slots: [] };
    }

    // Check holiday list
    if (clinic.holidays.includes(dateStr)) {
      return { date: dateStr, isOperatingDay: false, reason: 'Clinic closed for scheduled holiday / observance', slots: [] };
    }

    // Determine Day of Week
    const dayOfWeek = DAYS_MAP[targetDate.getUTCDay()];
    const daySchedule = clinic.workingHours.find((w: WorkingDaySchedule) => w.day === dayOfWeek);

    if (!daySchedule || daySchedule.isClosed) {
      return { date: dateStr, isOperatingDay: false, reason: `Clinic is closed on ${dayOfWeek}s`, slots: [] };
    }

    const slotDuration = daySchedule.slotDurationMinutes || clinic.appointmentSlotMinutes || 30;
    const possibleSlots = generateTimeSlots(daySchedule.open, daySchedule.close, slotDuration);

    // Retrieve active bookings on this date
    const existingBookings = await dbRepository.getAppointments({ date: dateStr });
    const bookedTimeMap = new Map<string, string>();

    for (const apt of existingBookings) {
      if (apt.status === 'confirmed' || apt.status === 'pending') {
        bookedTimeMap.set(apt.timeSlot, apt.referenceNumber);
      }
    }

    const slots: TimeSlotOption[] = possibleSlots.map(time => {
      const isBooked = bookedTimeMap.has(time);
      return {
        time,
        available: !isBooked,
        reason: isBooked ? 'Slot already reserved' : undefined
      };
    });

    return {
      date: dateStr,
      isOperatingDay: true,
      slots
    };
  }
};
