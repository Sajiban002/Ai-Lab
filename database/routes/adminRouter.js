const Router = require('express');
const router = new Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Doctor approval routes
router.post('/doctors/unapproved', adminController.getnotApprovedDoctors);
router.post('/doctors/approve', adminController.approveDoctor);
router.post('/doctors/delete', adminController.deleteDoctorFromDB);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// System statistics
router.get('/stats', adminController.getSystemStats);

// Medical records
router.get('/medical-records', adminController.getAllMedicalRecords);

// Diagnoses
router.get('/diagnoses', adminController.getAllDiagnoses);

// Database management
router.get('/database/structure', adminController.getDatabaseStructure);
router.post('/database/query', adminController.executeQuery);

module.exports = router;