import AdminLoginAlert from '../models/AdminLoginAlert.js';

export const getAdminLoginAlerts = async (_req, res, next) => {
  try {
    const alerts = await AdminLoginAlert.find().sort({ attemptedAt: -1 }).limit(20);
    return res.json({ alerts });
  } catch (error) {
    return next(error);
  }
};

export const approveAdminLoginAlert = async (req, res, next) => {
  try {
    const alert = await AdminLoginAlert.findById(req.params.alertId);

    if (!alert) {
      return res.status(404).json({ message: 'Admin login alert was not found' });
    }

    alert.status = 'Approved';
    await alert.save();

    return res.json({ alert });
  } catch (error) {
    return next(error);
  }
};
