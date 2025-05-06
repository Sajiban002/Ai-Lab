// Файл: routes/diagnosisHistoryRouter.js
const Router = require('express');
const router = new Router();
const diagnosisHistoryController = require('../controllers/diagnosisHistoryController'); 

const authMiddleware = require('../middleware/authMiddleware'); 

router.post('/', authMiddleware, diagnosisHistoryController.saveDiagnosis);


router.get('/', authMiddleware, diagnosisHistoryController.getUserHistory);

router.get('/stats/user', authMiddleware, diagnosisHistoryController.getUserStats);

router.get('/:id', authMiddleware, diagnosisHistoryController.getDiagnosisById);

router.delete('/:id', authMiddleware, diagnosisHistoryController.deleteDiagnosis);

module.exports = router;