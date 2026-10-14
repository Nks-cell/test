import { Router, Response } from 'express';
import { dbRepository } from '../db/connect.ts';
import { requireAdminAuth, AuthenticatedRequest } from '../middleware/auth.ts';
import { notificationService } from '../services/notificationService.ts';

export const adminRouter = Router();

// Protect all admin endpoints with authentication
adminRouter.use(requireAdminAuth);

// GET /api/admin/stats - High-level clinic operations metrics
adminRouter.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const allAppointments = await dbRepository.getAppointments();
    const allInquiries = await dbRepository.getInquiries();

    const stats = {
      totalAppointments: allAppointments.length,
      pendingRequests: allAppointments.filter(a => a.status === 'pending').length,
      confirmedAppointments: allAppointments.filter(a => a.status === 'confirmed').length,
      completedConsultations: allAppointments.filter(a => a.status === 'completed').length,
      cancelledAppointments: allAppointments.filter(a => a.status === 'cancelled').length,
      totalInquiries: allInquiries.length,
      newInquiries: allInquiries.filter(i => i.status === 'new').length
    };

    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to aggregate admin statistics' });
  }
});

// GET /api/admin/appointments - List & filter appointments
adminRouter.get('/appointments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, date, search } = req.query as { status?: string; date?: string; search?: string };
    const appointments = await dbRepository.getAppointments({ status, date, search });
    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch appointments list' });
  }
});

// PATCH /api/admin/appointments/:id/status - Update appointment status (Pending -> Confirmed / Cancelled / Completed)
adminRouter.patch('/appointments/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid appointment status' });
      return;
    }

    const existing = await dbRepository.getAppointmentById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    // CONFLICT PREVENTION: If confirming, check if another appointment is already confirmed on this slot
    if (status === 'confirmed') {
      const isConflict = await dbRepository.isSlotBooked(existing.appointmentDate, existing.timeSlot, existing._id);
      if (isConflict) {
        res.status(409).json({
          success: false,
          error: `Conflict detected: An active appointment is already scheduled for ${existing.appointmentDate} at ${existing.timeSlot}. Please reschedule to an open slot before confirming.`
        });
        return;
      }
    }

    const previousStatus = existing.status;
    const updated = await dbRepository.updateAppointment(id, {
      status,
      adminNotes: adminNotes !== undefined ? adminNotes : existing.adminNotes,
      rejectionReason: rejectionReason !== undefined ? rejectionReason : existing.rejectionReason
    });

    if (!updated) {
      res.status(500).json({ success: false, error: 'Failed to persist status change' });
      return;
    }

    // Notification abstraction audit
    const notifyResult = await notificationService.notifyAppointmentStatusChange(updated, previousStatus, status);
    if (updated.notificationLog) {
      updated.notificationLog.push(notifyResult);
      await dbRepository.updateAppointment(id, { notificationLog: updated.notificationLog });
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update appointment status' });
  }
});

// PATCH /api/admin/appointments/:id/reschedule - Reschedule appointment with conflict validation
adminRouter.patch('/appointments/:id/reschedule', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newDate, newTimeSlot, adminNotes } = req.body;

    if (!newDate || !newTimeSlot) {
      res.status(400).json({ success: false, error: 'Both new date and new time slot are required for rescheduling.' });
      return;
    }

    const existing = await dbRepository.getAppointmentById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    // Check if new slot is already booked
    const isConflict = await dbRepository.isSlotBooked(newDate, newTimeSlot, id);
    if (isConflict) {
      res.status(409).json({
        success: false,
        error: `Selected slot ${newDate} at ${newTimeSlot} is already reserved by another patient.`
      });
      return;
    }

    const updated = await dbRepository.updateAppointment(id, {
      appointmentDate: newDate,
      timeSlot: newTimeSlot,
      adminNotes: adminNotes || `Rescheduled from ${existing.appointmentDate} ${existing.timeSlot}`
    });

    res.json({
      success: true,
      message: 'Appointment successfully rescheduled.',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to reschedule appointment' });
  }
});

// DELETE /api/admin/appointments/:id - Delete appointment record
adminRouter.delete('/appointments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await dbRepository.deleteAppointment(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Appointment record not found' });
      return;
    }
    res.json({ success: true, message: 'Appointment record permanently removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete appointment record' });
  }
});

// GET /api/admin/inquiries - List contact inquiries
adminRouter.get('/inquiries', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const inquiries = await dbRepository.getInquiries({ status });
    res.json({ success: true, data: inquiries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch inquiries' });
  }
});

// PATCH /api/admin/inquiries/:id - Update inquiry status or add staff note
adminRouter.patch('/inquiries/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updated = await dbRepository.updateInquiry(id, { status, notes });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Inquiry not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update inquiry' });
  }
});

// DELETE /api/admin/inquiries/:id - Delete inquiry
adminRouter.delete('/inquiries/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await dbRepository.deleteInquiry(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Inquiry not found' });
      return;
    }
    res.json({ success: true, message: 'Inquiry record removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete inquiry' });
  }
});

// PUT /api/admin/profile - Update doctor profile
adminRouter.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await dbRepository.updateDoctorProfile(req.body);
    res.json({ success: true, message: 'Doctor profile updated successfully.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update doctor profile' });
  }
});

// PUT /api/admin/clinic - Update clinic settings and hours
adminRouter.put('/clinic', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await dbRepository.updateClinicSettings(req.body);
    res.json({ success: true, message: 'Clinic settings and hours saved successfully.', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update clinic settings' });
  }
});

// POST /api/admin/services - Create new service
adminRouter.post('/services', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, description, durationMinutes, fee, currency = 'USD', preparationInstructions, isActive = true } = req.body;
    if (!name || !category || fee === undefined) {
      res.status(400).json({ success: false, error: 'Service name, category, and fee are required.' });
      return;
    }
    const created = await dbRepository.createService({
      name,
      category,
      description: description || '',
      durationMinutes: Number(durationMinutes) || 30,
      fee: Number(fee),
      currency,
      preparationInstructions,
      isActive: Boolean(isActive)
    });
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to create service' });
  }
});

// PUT /api/admin/services/:id - Update existing service
adminRouter.put('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await dbRepository.updateService(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update service' });
  }
});

// DELETE /api/admin/services/:id - Remove service
adminRouter.delete('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const success = await dbRepository.deleteService(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }
    res.json({ success: true, message: 'Service removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete service' });
  }
});
