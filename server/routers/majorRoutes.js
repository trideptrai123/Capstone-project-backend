import express from 'express';
import {
  addMajor,
  getMajors,
  getMajorDetails,
  updateMajor,
  deleteMajor,
  addMajorHistory,
  getMajorHistories,
  updateMajorHistory,
  deleteMajorHistory,
  getUniqueMajorNames,
} from '../controllers/MajorController.js';
import { getRanking } from '../controllers/UniversityController.js';

const router = express.Router();

// Define routes
router.post('/', addMajor); // Create a new major
router.get('/', getMajors); // Get all majors
router.get('/list/name', getUniqueMajorNames); // Get all majors by name


router.get('/:id', getMajorDetails); // Get details of a specific major
router.put('/:id', updateMajor); // Update a specific major
router.delete('/:id', deleteMajor); // Delete a specific major

// Routes for managing major history
router.post('/:id/history', addMajorHistory); // Add a history entry for a specific major
router.get('/:id/history', getMajorHistories); // Get history for a specific major
router.put('/:id/history/:historyId', updateMajorHistory); // Update a history entry
router.delete('/:id/history/:historyId', deleteMajorHistory); // Delete a history entry

export default router;
