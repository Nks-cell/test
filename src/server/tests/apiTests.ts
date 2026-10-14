import { dbRepository } from '../db/connect.ts';
import { slotManager } from '../services/slotManager.ts';
import { generateToken, verifyToken } from '../middleware/auth.ts';

export interface TestResult {
  name: string;
  category: 'Validation' | 'Conflict Prevention' | 'Authentication' | 'Authorization';
  passed: boolean;
  message: string;
}

export async function runSelfDiagnosticTests(): Promise<{ summary: { total: number; passed: number; failed: number }; results: TestResult[] }> {
  const results: TestResult[] = [];

  // TEST 1: Booking Validation - Ensure invalid date is caught
  try {
    const pastAvailability = await slotManager.getAvailabilityForDate('2020-01-01');
    if (!pastAvailability.isOperatingDay && pastAvailability.reason?.includes('past')) {
      results.push({
        name: 'Past Date Booking Rejection',
        category: 'Validation',
        passed: true,
        message: 'Successfully rejected scheduling on past dates.'
      });
    } else {
      results.push({
        name: 'Past Date Booking Rejection',
        category: 'Validation',
        passed: false,
        message: 'Failed to reject past date.'
      });
    }
  } catch (err: any) {
    results.push({ name: 'Past Date Booking Rejection', category: 'Validation', passed: false, message: err.message });
  }

  // TEST 2: Holiday & Closed Day Slot Calculation
  try {
    const sundayAvailability = await slotManager.getAvailabilityForDate('2026-10-18'); // Oct 18, 2026 is Sunday
    if (!sundayAvailability.isOperatingDay) {
      results.push({
        name: 'Closed Day Detection (Sunday)',
        category: 'Validation',
        passed: true,
        message: 'Successfully recognized Sunday as closed according to working hours schedule.'
      });
    } else {
      results.push({
        name: 'Closed Day Detection (Sunday)',
        category: 'Validation',
        passed: false,
        message: 'Expected Sunday to be closed.'
      });
    }
  } catch (err: any) {
    results.push({ name: 'Closed Day Detection (Sunday)', category: 'Validation', passed: false, message: err.message });
  }

  // TEST 3: Conflict Prevention - Slot Collision Detection
  try {
    const testDate = '2026-11-12';
    const testSlot = '10:00 AM';

    // Create first appointment
    const first = await dbRepository.createAppointment({
      referenceNumber: 'TEST-CONF-01',
      patientName: 'Test Patient A',
      patientPhone: '+1 555-0001',
      serviceId: 'srv_01',
      serviceName: 'General Health Consultation',
      appointmentDate: testDate,
      timeSlot: testSlot,
      consultationType: 'in_person',
      status: 'confirmed',
      isDemoRecord: true
    });

    // Verify slot is booked
    const isBooked = await dbRepository.isSlotBooked(testDate, testSlot);

    // Clean up test record
    await dbRepository.deleteAppointment(first._id);

    if (isBooked) {
      results.push({
        name: 'Double-Booking Conflict Prevention',
        category: 'Conflict Prevention',
        passed: true,
        message: 'Double-booking prevention correctly identified active slot collision.'
      });
    } else {
      results.push({
        name: 'Double-Booking Conflict Prevention',
        category: 'Conflict Prevention',
        passed: false,
        message: 'Failed to detect active slot collision.'
      });
    }
  } catch (err: any) {
    results.push({ name: 'Double-Booking Conflict Prevention', category: 'Conflict Prevention', passed: false, message: err.message });
  }

  // TEST 4: JWT Token Generation & Verification
  try {
    const samplePayload = { id: 'admin_test', email: 'test@medicarepro.demo', role: 'super_admin', name: 'Tester' };
    const token = generateToken(samplePayload);
    const decoded = verifyToken(token);

    if (decoded && decoded.email === samplePayload.email) {
      results.push({
        name: 'JWT Admin Session Token Security',
        category: 'Authentication',
        passed: true,
        message: 'JWT generated and decoded with intact claims.'
      });
    } else {
      results.push({
        name: 'JWT Admin Session Token Security',
        category: 'Authentication',
        passed: false,
        message: 'Token verification failed.'
      });
    }
  } catch (err: any) {
    results.push({ name: 'JWT Admin Session Token Security', category: 'Authentication', passed: false, message: err.message });
  }

  // TEST 5: Invalid Token Rejection
  try {
    const invalidToken = 'eyJh.invalid.fake.token';
    const decoded = verifyToken(invalidToken);
    if (!decoded) {
      results.push({
        name: 'Forged Token Authorization Rejection',
        category: 'Authorization',
        passed: true,
        message: 'Tampered/forged token correctly rejected.'
      });
    } else {
      results.push({
        name: 'Forged Token Authorization Rejection',
        category: 'Authorization',
        passed: false,
        message: 'Forged token was unexpectedly accepted.'
      });
    }
  } catch (err: any) {
    results.push({ name: 'Forged Token Authorization Rejection', category: 'Authorization', passed: false, message: err.message });
  }

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return {
    summary: { total: results.length, passed, failed },
    results
  };
}
