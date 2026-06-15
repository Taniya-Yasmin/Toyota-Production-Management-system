import { Router, Request, Response } from 'express';
import Entry from '../models/Entry';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize(['Team Leader', 'Manager', 'Admin']));

// Export entries list to CSV
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const shift = req.query.shift as string;
    const query: any = {};
    if (shift) {
      query.shift = shift;
    }

    const entries = await Entry.find(query)
      .populate('createdBy', 'name employeeId')
      .sort({ createdAt: -1 });

    let csvContent = 'Date,Shift,Status,Creator,Total Received,Total Production,Total Pending,SignOff TM,SignOff AM,SignOff GL\n';

    entries.forEach((e) => {
      const creatorName = e.createdBy ? (e.createdBy as any).name : 'Unknown';
      const tm = e.signOff?.tmName || 'N/A';
      const am = e.signOff?.amName || 'N/A';
      const gl = e.signOff?.glName || 'N/A';
      
      csvContent += `${e.date},${e.shift},${e.status},"${creatorName}",${e.totals.totalReceived},${e.totals.totalProduction},${e.totals.totalPending},"${tm}","${am}","${gl}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=pmsp_report_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Failed to export report CSV.' });
  }
});

export default router;
