import express from 'express';
import CheckoutController from '../controllers/checkoutController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateCheckout } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['checkout:process']));

router.post('/', validateCheckout, CheckoutController.processCheckout);
router.get('/history', CheckoutController.getCheckoutHistory);

// Use default export
export default router;