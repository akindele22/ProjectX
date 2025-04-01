import express from 'express';
import { InventoryController } from '../controllers/inventoryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { 
  validateInventoryItem,
  validateInventoryUpdate 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// GET /api/v1/inventory - List all items
router.get('/', 
  authorize(['inventory:read']), 
  InventoryController.getAllItems
);

// POST /api/v1/inventory - Create new item
router.post('/', 
  authorize(['inventory:create']),
  validateInventoryItem,
  InventoryController.createItem
);

// GET /api/v1/inventory/:id - Get single item
router.get('/:id', 
  authorize(['inventory:read']),
  InventoryController.getItemById
);

// PUT /api/v1/inventory/:id - Update item
router.put('/:id', 
  authorize(['inventory:update']),
  validateInventoryUpdate,
  InventoryController.updateItem
);

// DELETE /api/v1/inventory/:id - Delete item
router.delete('/:id', 
  authorize(['inventory:delete']),
  InventoryController.deleteItem
);

export default router;