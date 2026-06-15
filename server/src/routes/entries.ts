import { Router, Request, Response } from 'express';
import Entry from '../models/Entry';
import AuditLog from '../models/AuditLog';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All entry routes require authentication
router.use(authenticate);

/* ── Default row data ───────────────────────────────────────── */

const SUB_ASSEMBLY_PARTS = [
  'Hood', 'RH FR DR', 'LH FR DR', 'RH RR DR', 'LH RR DR',
  'Back DR', 'Fender', 'Radiator', 'Apron', 'Dash',
  'Full Cowl', 'Cowl Top', 'Wheel House', 'SM Small',
];

const UNIT_PARTS_LIST = [
  'FSM', 'CB', 'FT', 'Bumper Punching', 'All Model', 'Laser Cutting',
];

const ETIOS_PARTS = [
  'Hood', 'RH FR DR', 'LH FR DR', 'RH RR DR', 'LH RR DR',
  'Back DR', 'Fender', 'Radiator', 'Apron', 'Dash',
  'Full Cowl', 'Cowl Top', 'Wheel House', 'SM Small',
];

function buildDefaultSubAssembly() {
  return SUB_ASSEMBLY_PARTS.map((part) => ({
    part,
    innova: { received: 0, prd: 0, pending: 0 },
    bmc: { received: 0, prd: 0, pending: 0 },
    crysta: { received: 0, prd: 0, pending: 0 },
  }));
}

function buildDefaultUnitParts() {
  return UNIT_PARTS_LIST.map((part) => ({
    part,
    qty1: 0,
    qty2: 0,
  }));
}

function buildDefaultEtios() {
  return ETIOS_PARTS.map((part) => ({
    part,
    hbk: { received: 0, prd: 0, pending: 0 },
    sdn: { received: 0, prd: 0, pending: 0 },
  }));
}

/* ── Helper: today as YYYY-MM-DD ────────────────────────────── */

function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ── Helper: create audit log ─────────────────────────────── */

async function createAuditLog(
  userId: string,
  action: string,
  documentId: any,
  prevObj: any,
  newObj: any
) {
  try {
    await AuditLog.create({
      userId,
      action,
      collectionName: 'entries',
      documentId,
      previousState: prevObj,
      newState: newObj
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
}

/* ── Routes ─────────────────────────────────────────────────── */

/**
 * POST /api/entries — Create a new entry
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { shift } = req.body;

    if (!shift || !['DAY', 'NIGHT'].includes(shift)) {
      res.status(400).json({ message: 'Shift must be "DAY" or "NIGHT".' });
      return;
    }

    const entry = new Entry({
      date: todayString(),
      shift,
      status: 'draft',
      createdBy: req.user!.userId,
      subAssembly: buildDefaultSubAssembly(),
      unitParts: buildDefaultUnitParts(),
      etios: buildDefaultEtios(),
      signOff: null,
      totals: {
        totalReceived: 0,
        totalProduction: 0,
        totalPending: 0,
      },
    });

    await entry.save();
    
    // Write audit log
    await createAuditLog(req.user!.userId, 'create', entry._id, null, entry.toObject());

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ message: 'Failed to create entry.' });
  }
});

/**
 * GET /api/entries/current — Get active draft for the logged-in user
 */
router.get('/current', async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Entry.findOne({
      status: 'draft',
      createdBy: req.user!.userId,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    res.json(entry || null);
  } catch (error) {
    console.error('Get current entry error:', error);
    res.status(500).json({ message: 'Failed to fetch current entry.' });
  }
});

/**
 * GET /api/entries/history — List past entries
 * Operators: view own logs
 * Managers/Leaders/Admins: view all logs
 */
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const query = req.user!.role === 'Operator' ? { createdBy: req.user!.userId } : {};

    const entries = await Entry.find(query)
      .populate('createdBy', 'name employeeId role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Entry.countDocuments(query);

    res.json({
      entries,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Failed to fetch entry history.' });
  }
});

/**
 * GET /api/entries/:id — Get entry by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };
    if (req.user!.role === 'Operator') {
      query.createdBy = req.user!.userId;
    }

    const entry = await Entry.findOne(query).populate('createdBy', 'name employeeId role');

    if (!entry) {
      res.status(404).json({ message: 'Entry not found.' });
      return;
    }

    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ message: 'Failed to fetch entry.' });
  }
});

/**
 * PUT /api/entries/:id/sub-assembly — Update sub-assembly data
 */
router.put('/:id/sub-assembly', async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      createdBy: req.user!.userId,
    });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found.' });
      return;
    }

    if (entry.status !== 'draft') {
      res.status(400).json({ message: 'Cannot update a submitted entry.' });
      return;
    }

    const previousState = entry.toObject();
    entry.subAssembly = req.body.subAssembly;
    entry.totals = Entry.calcTotals(entry);
    await entry.save();

    await createAuditLog(req.user!.userId, 'update_sub_assembly', entry._id, previousState, entry.toObject());

    res.json(entry);
  } catch (error) {
    console.error('Update sub-assembly error:', error);
    res.status(500).json({ message: 'Failed to update sub-assembly.' });
  }
});

/**
 * PUT /api/entries/:id/unit-parts — Update unit parts data
 */
router.put('/:id/unit-parts', async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      createdBy: req.user!.userId,
    });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found.' });
      return;
    }

    if (entry.status !== 'draft') {
      res.status(400).json({ message: 'Cannot update a submitted entry.' });
      return;
    }

    const previousState = entry.toObject();
    entry.unitParts = req.body.unitParts;
    entry.totals = Entry.calcTotals(entry);
    await entry.save();

    await createAuditLog(req.user!.userId, 'update_unit_parts', entry._id, previousState, entry.toObject());

    res.json(entry);
  } catch (error) {
    console.error('Update unit-parts error:', error);
    res.status(500).json({ message: 'Failed to update unit parts.' });
  }
});

/**
 * PUT /api/entries/:id/etios — Update etios data
 */
router.put('/:id/etios', async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      createdBy: req.user!.userId,
    });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found.' });
      return;
    }

    if (entry.status !== 'draft') {
      res.status(400).json({ message: 'Cannot update a submitted entry.' });
      return;
    }

    const previousState = entry.toObject();
    entry.etios = req.body.etios;
    entry.totals = Entry.calcTotals(entry);
    await entry.save();

    await createAuditLog(req.user!.userId, 'update_etios', entry._id, previousState, entry.toObject());

    res.json(entry);
  } catch (error) {
    console.error('Update etios error:', error);
    res.status(500).json({ message: 'Failed to update etios.' });
  }
});

/**
 * PUT /api/entries/:id/draft — Save as draft
 */
router.put('/:id/draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      createdBy: req.user!.userId,
    });

    if (!entry) {
      res.status(404).json({ message: 'Entry not found.' });
      return;
    }

    if (entry.status !== 'draft') {
      res.status(400).json({ message: 'Only draft entries can be saved as draft.' });
      return;
    }

    const previousState = entry.toObject();
    await entry.save();

    await createAuditLog(req.user!.userId, 'save_draft', entry._id, previousState, entry.toObject());
    res.json(entry);
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Failed to save draft.' });
  }
});

/**
 * POST /api/entries/:id/submit — Submit entry with sign-off
 * Gates submission to Team Leader, Manager, and Admin roles
 */
router.post(
  '/:id/submit',
  authorize(['Team Leader', 'Manager', 'Admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const entry = await Entry.findOne({ _id: req.params.id });

      if (!entry) {
        res.status(404).json({ message: 'Entry not found.' });
        return;
      }

      if (entry.status !== 'draft') {
        res.status(400).json({ message: 'Entry is already submitted.' });
        return;
      }

      const { signOff } = req.body;
      if (!signOff || !signOff.tmName || !signOff.tmNumber) {
        res.status(400).json({ message: 'Sign-off with tmName and tmNumber is required.' });
        return;
      }

      const previousState = entry.toObject();
      entry.signOff = signOff;
      entry.status = 'submitted';
      entry.totals = Entry.calcTotals(entry);
      await entry.save();

      await createAuditLog(req.user!.userId, 'submit', entry._id, previousState, entry.toObject());

      res.json(entry);
    } catch (error) {
      console.error('Submit entry error:', error);
      res.status(500).json({ message: 'Failed to submit entry.' });
    }
  }
);

export default router;
