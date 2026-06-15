import { Router, Request, Response } from 'express';
import Inventory from '../models/Inventory';
import { authenticate, authorize } from '../middleware/auth';
import AuditLog from '../models/AuditLog';

const router = Router();

router.use(authenticate);

// Get current inventory list
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const stock = await Inventory.find().sort({ lineType: 1, partName: 1 });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch inventory.' });
  }
});

// Adjust stock levels (Team Leader, Manager, Admin)
router.put('/adjust', authorize(['Team Leader', 'Manager', 'Admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { partName, lineType, adjustment } = req.body;

    if (!partName || !lineType || typeof adjustment !== 'number') {
      res.status(400).json({ message: 'partName, lineType, and adjustment amount are required.' });
      return;
    }

    const item = await Inventory.findOne({ partName, lineType });
    if (!item) {
      res.status(404).json({ message: 'Inventory item not found.' });
      return;
    }

    const previousState = item.toObject();
    item.currentStock = Math.max(0, item.currentStock + adjustment);
    await item.save();

    // Log the action
    await AuditLog.create({
      userId: req.user!.userId,
      action: 'inventory_adjust',
      collectionName: 'inventories',
      documentId: item._id,
      previousState,
      newState: item.toObject()
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to adjust stock.' });
  }
});

// Update thresholds (Manager, Admin only)
router.put('/:id', authorize(['Manager', 'Admin']), async (req: Request, res: Response): Promise<void> => {
  try {
    const { minThreshold, currentStock } = req.body;
    const item = await Inventory.findById(req.params.id);

    if (!item) {
      res.status(404).json({ message: 'Item not found.' });
      return;
    }

    const previousState = item.toObject();
    if (typeof minThreshold === 'number') item.minThreshold = minThreshold;
    if (typeof currentStock === 'number') item.currentStock = Math.max(0, currentStock);
    await item.save();

    // Log the action
    await AuditLog.create({
      userId: req.user!.userId,
      action: 'inventory_update_threshold',
      collectionName: 'inventories',
      documentId: item._id,
      previousState,
      newState: item.toObject()
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item.' });
  }
});

export default router;
