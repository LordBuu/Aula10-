/**
 * Express router for Vacation system
 */
import { Router } from 'express';
import { VacationController } from '../controllers/vacationController';

const router = Router();

router.post('/validate', VacationController.validateRequest);
router.get('/rules', VacationController.getRules);
router.get('/health', VacationController.healthCheck);

export default router;
