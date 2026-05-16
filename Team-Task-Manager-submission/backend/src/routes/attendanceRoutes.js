import express from 'express';
import { getAttendance, punchIn, punchOut } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAttendance);
router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);

export default router;
