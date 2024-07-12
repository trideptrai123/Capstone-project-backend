import express from 'express';
import { admin, protect } from '../middleware/authMiddleware.js';
import { createComment, deleteComment, getCommentById, getCommentsForPost, updateComment } from '../controllers/CommentPostController.js';

const router = express.Router();

// Define routes
router.post('/', createComment);
router.get('/:id', getCommentsForPost);
router.get('/:id', getCommentById);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;
