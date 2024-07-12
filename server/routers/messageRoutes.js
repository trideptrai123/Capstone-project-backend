import express from 'express';
import { addMessage, deleteMessage, getMessagesByRoomId, updateMessage } from '../controllers/MessageController.js';

const router = express.Router();

router.route('/room/:roomId')
  .get(getMessagesByRoomId);

router.route('/:messageId')
  .put(updateMessage)
  .delete(deleteMessage);
  router.route('/')
  .post(addMessage);


export default router;