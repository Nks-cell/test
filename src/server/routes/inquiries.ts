import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/connect.ts';

export const inquiriesRouter = Router();

// POST /api/inquiries - Submit a general patient or clinic inquiry
inquiriesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, emailOrPhone, category = 'general', message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Name is required (minimum 2 characters).' });
      return;
    }

    if (!emailOrPhone || typeof emailOrPhone !== 'string' || emailOrPhone.trim().length < 5) {
      res.status(400).json({ success: false, error: 'A valid email address or phone number is required.' });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      res.status(400).json({ success: false, error: 'Please enter your message (minimum 5 characters).' });
      return;
    }

    const newInquiry = await dbRepository.createInquiry({
      name: name.trim(),
      emailOrPhone: emailOrPhone.trim(),
      category: ['general', 'appointment', 'facilities', 'billing'].includes(category) ? category : 'general',
      message: message.trim().slice(0, 1000),
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. Your message has been sent to our clinic front desk.',
      data: {
        id: newInquiry._id,
        createdAt: newInquiry.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to submit contact message. Please try again.' });
  }
});
