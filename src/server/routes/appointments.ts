import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/connect.ts';
import { slotManager } from '../services/slotManager.ts';
import { notificationService } from '../services/notificationService.ts';
import { Appointment } from '../../types/index.ts';

export const appointmentsRouter = Router();

// POST /api/appointments - Submit an appointment booking request
appointmentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      patientName,
      patientPhone,
      patientEmail,
      serviceId,
      appointmentDate,
      timeSlot,
      consultationType = 'in_person',
      notes
    } = req.body;

    // 1. Strict Server-Side Validation
    if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Patient full name is required (minimum 2 characters).' });
      return;
    }

    if (!patientPhone || typeof patientPhone !== 'string' || patientPhone.trim().length < 7) {
      res.status(400).json({ success: false, error: 'Valid patient contact phone number is required.' });
      return;
    }

    if (!serviceId) {
      res.status(400).json({ success: false, error: 'Please select a valid consultation service.' });
      return;
    }

    if (!appointmentDate || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      res.status(400).json({ success: false, error: 'A valid appointment date (YYYY-MM-DD) is required.' });
      return;
    }

    if (!timeSlot || typeof timeSlot !== 'string') {
      res.status(400).json({ success: false, error: 'Please choose an available appointment time slot.' });
      return;
    }

    // 2. Fetch service details
    const services = await dbRepository.getServices();
    const service = services.find(s => s._id === serviceId);
    if (!service) {
      res.status(400).json({ success: false, error: 'Selected medical service does not exist.' });
      return;
    }

    // 3. Verify slot availability via SlotManager (handles holiday, closed days, and existing bookings)
    const availability = await slotManager.getAvailabilityForDate(appointmentDate);
    if (!availability.isOperatingDay) {
      res.status(400).json({
        success: false,
        error: availability.reason || 'Clinic is not open for consultations on the selected date.'
      });
      return;
    }

    const matchingSlot = availability.slots.find(s => s.time.toUpperCase() === timeSlot.toUpperCase());
    if (!matchingSlot || !matchingSlot.available) {
      res.status(409).json({
        success: false,
        error: 'The requested time slot is no longer available. Please select another time.'
      });
      return;
    }

    // 4. Generate unique reference and persist
    const referenceNumber = slotManager.generateReference();

    const newAppointmentData: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'> = {
      referenceNumber,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail ? patientEmail.trim() : undefined,
      serviceId: service._id,
      serviceName: service.name,
      appointmentDate,
      timeSlot,
      consultationType: consultationType === 'telehealth' ? 'telehealth' : 'in_person',
      notes: notes ? notes.slice(0, 500).trim() : undefined,
      status: 'pending', // New appointments default to Pending until clinic staff confirms
      isDemoRecord: true
    };

    const savedAppointment = await dbRepository.createAppointment(newAppointmentData);

    // 5. Trigger notification abstraction (safely logs without claiming false external delivery)
    const notifyResult = await notificationService.notifyAppointmentStatusChange(
      savedAppointment,
      'none',
      'pending'
    );

    // Save notification audit log to appointment record
    await dbRepository.updateAppointment(savedAppointment._id, {
      notificationLog: [notifyResult]
    });

    res.status(201).json({
      success: true,
      message: 'Appointment request received and queued for clinic review.',
      data: {
        referenceNumber: savedAppointment.referenceNumber,
        status: savedAppointment.status,
        appointmentDate: savedAppointment.appointmentDate,
        timeSlot: savedAppointment.timeSlot,
        serviceName: savedAppointment.serviceName,
        consultationType: savedAppointment.consultationType,
        patientName: savedAppointment.patientName,
        isDemoRecord: true
      }
    });
  } catch (error: any) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while scheduling your appointment. Please try again.'
    });
  }
});

// GET /api/appointments/lookup/:ref - Public appointment status check
appointmentsRouter.get('/lookup/:ref', async (req: Request, res: Response) => {
  try {
    const ref = req.params.ref;
    if (!ref) {
      res.status(400).json({ success: false, error: 'Reference number is required' });
      return;
    }

    const appointment = await dbRepository.getAppointmentByReference(ref);
    if (!appointment) {
      res.status(404).json({
        success: false,
        error: `No appointment found with reference number "${ref}".`
      });
      return;
    }

    // Expose only non-sensitive summary details to public viewer
    res.json({
      success: true,
      data: {
        referenceNumber: appointment.referenceNumber,
        status: appointment.status,
        appointmentDate: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        serviceName: appointment.serviceName,
        consultationType: appointment.consultationType,
        createdAt: appointment.createdAt,
        isDemoRecord: appointment.isDemoRecord
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to look up appointment' });
  }
});
