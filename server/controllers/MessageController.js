import Message from '../models/Message.js';
import Room from '../models/Room.js';
import mongoose from 'mongoose';
import { socketConfig } from '../socket.js';

// Lấy danh sách tin nhắn của một phòng, sắp xếp theo thời gian tạo
export const getMessagesByRoomId = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('userId', 'name email'); // Populate thông tin người dùng

    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send({ message: 'Lỗi khi lấy danh sách tin nhắn.' });
  }
};

// Thêm tin nhắn mới
export const addMessage = async (req, res) => {
  const { roomId, userId, message, type } = req.body;

  if (!roomId || !userId || !message) {
    return res.status(400).send({ message: 'Thiếu thông tin cần thiết.' });
  }

  try {
    // Tìm phòng chat
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send({ message: 'Phòng chat không tồn tại.' });
    }

    // Kiểm tra người gửi có phải là thành viên của phòng chat hay không
    if (!room.members.includes(userId)) {
      return res.status(403).send({ message: 'Người dùng không phải là thành viên của phòng chat.' });
    }

    // Tạo tin nhắn mới
    const newMessage = new Message({
      roomId,
      userId,
      message,
      type,
      createdAt: new Date()
    });

    await newMessage.save();

    // Cập nhật thông tin phòng với tin nhắn cuối cùng
    room.lastMessageId = newMessage._id;
    room.listMemberunRead = room.members.filter(member => member.toString() !== userId);
    await room.save();

    // const io = socketConfig.getIO();
    // io.to(roomId).emit('message', newMessage);

    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send({ message: 'Lỗi khi thêm tin nhắn.' });
  }
};

// Cập nhật tin nhắn
export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).send({ message: 'Thiếu thông tin cần thiết.' });
  }

  try {
    const existingMessage = await Message.findById(messageId);
    if (!existingMessage) {
      return res.status(404).send({ message: 'Tin nhắn không tồn tại.' });
    }
    if (existingMessage.userId.toString() !== userId) {
      return res.status(403).send({ message: 'Bạn không có quyền sửa tin nhắn này.' });
    }

    existingMessage.message = message;
    await existingMessage.save();
    res.status(200).send(existingMessage);
  } catch (error) {
    res.status(500).send({ message: 'Lỗi khi cập nhật tin nhắn.' });
  }
};

// Xóa tin nhắn
export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({ message: 'Thiếu userId.' });
  }

  try {
    const existingMessage = await Message.findById(messageId);
    if (!existingMessage) {
      return res.status(404).send({ message: 'Tin nhắn không tồn tại.' });
    }
    if (existingMessage.userId.toString() !== userId) {
      return res.status(403).send({ message: 'Bạn không có quyền xóa tin nhắn này.' });
    }

    await existingMessage.remove();
    res.status(200).send({ message: 'Tin nhắn đã được xóa.' });
  } catch (error) {
    res.status(500).send({ message: 'Lỗi khi xóa tin nhắn.' });
  }
};