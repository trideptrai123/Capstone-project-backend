import express from 'express';
import {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
} from '../controllers/UniversityController.js';

const router = express.Router();

// Define routes
router.post('/', createUniversity);
router.get('/', getUniversities);
router.get('/:id', getUniversityById);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);

export default router;
