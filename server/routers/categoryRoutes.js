import express from 'express';
import { createCategory, deleteCategory, getDetailCategory, getListCategory, updateCategory } from '../controllers/CategoryController.js';
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define routes
router.post('/', createCategory);
router.get('/', getListCategory);
router.get('/:id', getDetailCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
