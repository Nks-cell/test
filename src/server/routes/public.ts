import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/connect.ts';
import { slotManager } from '../services/slotManager.ts';
import { INITIAL_SPECIALTIES } from '../db/seedData.ts';

export const publicRouter = Router();

// GET /api/public/profile - Public Doctor Profile
publicRouter.get('/profile', async (_req: Request, res: Response) => {
  try {
    const profile = await dbRepository.getDoctorProfile();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve doctor profile' });
  }
});

// GET /api/public/clinic - Public Clinic Settings & Hours
publicRouter.get('/clinic', async (_req: Request, res: Response) => {
  try {
    const clinic = await dbRepository.getClinicSettings();
    res.json({ success: true, data: clinic });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve clinic configuration' });
  }
});

// GET /api/public/services - Active Medical Services
publicRouter.get('/services', async (_req: Request, res: Response) => {
  try {
    const allServices = await dbRepository.getServices();
    const activeServices = allServices.filter(s => s.isActive);
    res.json({ success: true, data: activeServices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve clinic services' });
  }
});

// GET /api/public/specialties - Supported Specialties
publicRouter.get('/specialties', async (_req: Request, res: Response) => {
  res.json({ success: true, data: INITIAL_SPECIALTIES });
});

// GET /api/public/slots?date=YYYY-MM-DD - Real-time slot availability
publicRouter.get('/slots', async (req: Request, res: Response) => {
  try {
    const dateStr = req.query.date as string;
    if (!dateStr) {
      res.status(400).json({ success: false, error: 'Date parameter (YYYY-MM-DD) is required' });
      return;
    }

    const availability = await slotManager.getAvailabilityForDate(dateStr);
    res.json({ success: true, data: availability });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to compute slot availability' });
  }
});
