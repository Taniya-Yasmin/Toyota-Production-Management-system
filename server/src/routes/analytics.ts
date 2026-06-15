import { Router, Request, Response } from 'express';
import Entry from '../models/Entry';
import Target from '../models/Target';
import AuditLog from '../models/AuditLog';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get target vs actual analytics status for the current active draft or today's entries
router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = (req.query.shift as string) || 'DAY';

    // 1. Fetch targets for this shift
    const targets = await Target.find({ shift });
    const targetMap = new Map<string, number>();
    targets.forEach((t) => {
      // Create key like "SubAssembly:Hood" or "Etios:RH FR DR"
      targetMap.set(`${t.lineType}:${t.partName}`, t.targetQty);
    });

    // 2. Fetch the latest draft or entry for this shift
    const latestEntry = await Entry.findOne({ shift })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!latestEntry) {
      res.json({
        hasData: false,
        shift,
        metrics: [],
      });
      return;
    }

    const metrics: any[] = [];

    // Accumulate SubAssembly production
    latestEntry.subAssembly.forEach((row) => {
      const targetVal = targetMap.get(`SubAssembly:${row.part}`) || 100;
      // Actual is sum of innova + bmc + crysta production done
      const actualPrd = (row.innova.prd || 0) + (row.bmc.prd || 0) + (row.crysta.prd || 0);
      metrics.push({
        partName: row.part,
        lineType: 'SubAssembly',
        target: targetVal,
        actual: actualPrd,
        completionRate: targetVal > 0 ? Math.round((actualPrd / targetVal) * 100) : 0,
      });
    });

    // Accumulate UnitParts production
    latestEntry.unitParts.forEach((row) => {
      const targetVal = targetMap.get(`UnitParts:${row.part}`) || 180;
      // qty1 represents production done
      const actualPrd = row.qty1 || 0;
      metrics.push({
        partName: row.part,
        lineType: 'UnitParts',
        target: targetVal,
        actual: actualPrd,
        completionRate: targetVal > 0 ? Math.round((actualPrd / targetVal) * 100) : 0,
      });
    });

    // Accumulate Etios production
    latestEntry.etios.forEach((row) => {
      const targetVal = targetMap.get(`Etios:${row.part}`) || 75;
      // hbk + sdn production done
      const actualPrd = (row.hbk.prd || 0) + (row.sdn.prd || 0);
      metrics.push({
        partName: row.part,
        lineType: 'Etios',
        target: targetVal,
        actual: actualPrd,
        completionRate: targetVal > 0 ? Math.round((actualPrd / targetVal) * 100) : 0,
      });
    });

    // Calculate OEE (Simple representation for demo: Actual Production / Target)
    let totalTarget = 0;
    let totalActual = 0;
    metrics.forEach((m) => {
      totalTarget += m.target;
      totalActual += m.actual;
    });

    const oeeEfficiency = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

    res.json({
      hasData: true,
      shift,
      date: latestEntry.date,
      oee: oeeEfficiency,
      totals: latestEntry.totals,
      metrics,
    });
  } catch (error) {
    console.error('Analytics status error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics status.' });
  }
});

// Get audit logs history (Team Leader, Manager, Admin only)
router.get(
  '/audit-logs',
  authorize(['Team Leader', 'Manager', 'Admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(100, parseInt(req.query.limit as string) || 30);
      const action = req.query.action as string;
      const query: any = {};
      if (action) {
        query.action = action;
      }

      const logs = await AuditLog.find(query)
        .populate('userId', 'name employeeId role')
        .sort({ timestamp: -1 })
        .limit(limit);

      res.json(logs);
    } catch (error) {
      console.error('Fetch audit logs error:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs.' });
    }
  }
);

export default router;
