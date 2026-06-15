import { Router, Request, Response } from 'express';
import Target from '../models/Target';
import { authenticate, authorize } from '../middleware/auth';
import AuditLog from '../models/AuditLog';

const router = Router();

router.use(authenticate);

// Get targets for a specific shift (DAY or NIGHT)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = (req.query.shift as string) || 'DAY';
    if (!['DAY', 'NIGHT'].includes(shift)) {
      res.status(400).json({ message: 'Invalid shift.' });
      return;
    }
    const targets = await Target.find({ shift });
    res.json(targets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch targets.' });
  }
});

// Configure targets (Manager, Admin only)
router.put('/', authorize(['Manager', 'Admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { partName, lineType, shift, targetQty } = req.body;

    if (!partName || !lineType || !shift || typeof targetQty !== 'number') {
      res.status(400).json({ message: 'partName, lineType, shift, and targetQty are required.' });
      return;
    }

    let target = await Target.findOne({ partName, shift, lineType });
    let previousState = null;

    if (target) {
      previousState = target.toObject();
      target.targetQty = targetQty;
      await target.save();
    } else {
      target = await Target.create({ partName, lineType, shift, targetQty });
    }

    // Log the configuration change
    await AuditLog.create({
      userId: req.user!.userId,
      action: 'target_update',
      collectionName: 'targets',
      documentId: target._id,
      previousState,
      newState: target.toObject()
    });

    res.json(target);
  } catch (error) {
    console.error('Update target error:', error);
    res.status(500).json({ message: 'Failed to update target.' });
  }
});

export default router;
