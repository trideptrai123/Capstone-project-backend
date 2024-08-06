import express from 'express';
import {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
  getRanking,
  getStats,
  getTotalStaff,
  getTotalAdmin,
  getTopUniversities,
} from '../controllers/UniversityController.js';

const router = express.Router();

// Define routes
router.post('/', createUniversity);
router.get('/ranking/list', getRanking); // Get all majors by name
router.get('/', getUniversities);
router.get('/:id', getUniversityById);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);
router.get('/uni/stats',getStats);
router.get('/total/staff',getTotalStaff);
router.get('/total/admin',getTotalAdmin);
router.get('/top/10',getTopUniversities);




export default router;
