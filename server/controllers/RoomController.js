import Room from "../models/Room.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { socketConfig } from "../socket.js";

// Lấy danh sách phòng chat theo userId
export const getRoomsByUserId = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).send({ message: "Thiếu userId." });
  }

  try {
    const rooms = await Room.find({ members: userId })
      .populate("members", "username email")
      .populate("lastMessageId")
      .populate({
        path: "lastMessageId",
        populate: {
          path: "userId",
          select: "username email",
        },
      });

    res.status(200).send(rooms);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy danh sách phòng chat." });
  }
};

// Cập nhật phòng chat
export const updateRoom = async (req, res) => {
  const { roomId } = req.params;
  const { name, updater } = req.body;
  if (!name) {
    return res.status(400).send({ message: "Thiếu tên phòng chat." });
  }

  try {
    const room = await Room.findByIdAndUpdate(roomId, { name }, { new: true });
    if (!room) {
      return res.status(404).send({ message: "Phòng chat không tồn tại." });
    }
    res.status(200).send(room);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi cập nhật phòng chat." });
  }
};
export const updateRoomImage = async (req, res) => {
  const { roomId } = req.params;
  const { image, updater } = req.body;
  if (!image) {
    return res.status(400).send({ message: "Vui lòng chọn ảnh" });
  }

  try {
    const room = await Room.findByIdAndUpdate(roomId, { image }, { new: true });
    if (!room) {
      return res.status(404).send({ message: "Phòng chat không tồn tại." });
    }
    res.status(200).send(room);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi cập nhật phòng chat." });
  }
};

// Xóa phòng chat và tất cả tin nhắn liên quan
export const deleteRoom = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send({ message: "Phòng chat không tồn tại." });
    }

    await Message.deleteMany({ roomId });
    await Room.deleteOne({ _id: roomId });

    res
      .status(200)
      .send({ message: "Phòng chat và tất cả tin nhắn đã được xóa." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Lỗi khi xóa phòng chat." });
  }
};

// Thêm người dùng vào phòng chat
export const addUsersToRoom = async (req, res) => {
  const io = socketConfig.getIO();
  const { roomId } = req.params;
  const { userIds, addedBy } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res
      .status(400)
      .send({ message: "Thiếu userIds hoặc userIds không hợp lệ." });
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send({ message: "Phòng chat không tồn tại." });
    }

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res
        .status(400)
        .send({ message: "Một hoặc nhiều thành viên không tồn tại" });
    }

    const newMembers = userIds.filter(
      (userId) => !room.members.includes(userId)
    );

    if (newMembers.length === 0) {
      return res
        .status(400)
        .send({ message: "Tất cả người dùng đã có trong phòng chat." });
    }

    room.members.push(...newMembers);

    // Create notification messages for each new member
    let listMessIo = [];
    for (const userId of newMembers) {
      const messageContent = `Thành đã thêm ${
        users.find((user) => user._id.toString() == userId)?.name
      } vào nhóm chat`;
      const notificationMessage = new Message({
        roomId: roomId,
        userId: addedBy?.id,
        message: messageContent,
        type: "noty",
      });
      await notificationMessage.save();
      listMessIo.push(notificationMessage);
    }

    await room.save();

    io.emit("message", listMessIo);

    res.status(200).send(room);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Lỗi khi thêm người dùng vào phòng chat." });
  }
};

// Xóa người dùng khỏi phòng chat
export const removeUserFromRoom = async (req, res) => {
  const io = socketConfig.getIO();
  const { roomId } = req.params;
  const { userId, actor, userRemoveName } = req.body;
  if (!userId) {
    return res.status(400).send({ message: "Thiếu userId." });
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send({ message: "Phòng chat không tồn tại." });
    }
    if (!room.members.includes(userId)) {
      return res
        .status(400)
        .send({ message: "Người dùng không có trong phòng chat." });
    }
    room.members = room.members.filter(
      (member) => member.toString() !== userId
    );
    await room.save();
    const notificationMessage = new Message({
      roomId: roomId,
      userId: actor?._id,
      message: actor.name + " đã xóa " + userRemoveName + " khỏi nhóm",
      type: "noty",
    });
    await notificationMessage.save();
    io.emit("message", notificationMessage);
    res.status(200).send(room);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Lỗi khi xóa người dùng khỏi phòng chat." });
  }
};

// Đánh dấu tin nhắn cuối cùng là đã đọc
export const markLastMessageAsRead = async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({ message: "Thiếu userId." });
  }

  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).send({ message: "Phòng chat không tồn tại." });
    }

    room.listMemberunRead = room.listMemberunRead.filter(
      (member) => member.toString() !== userId
    );
    await room.save();
    res
      .status(200)
      .send({ message: "Đã đánh dấu tin nhắn cuối cùng là đã đọc." });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Lỗi khi đánh dấu tin nhắn cuối cùng là đã đọc." });
  }
};
// Add Room
export const addRoom = async (req, res) => {
  const { name, members, roomMaster } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).send({ message: "Tên phòng không được để trống" });
  }

  if (!members || members.length === 0) {
    return res
      .status(400)
      .send({ message: "Danh sách thành viên không được để trống" });
  }

  const users = await User.find({ _id: { $in: members } });
  if (users.length !== members.length) {
    return res
      .status(400)
      .send({ message: "Một hoặc nhiều thành viên không tồn tại" });
  }

  const room = new Room({
    name: name.trim(),
    members,
    roomMaster,
  });

  // Lưu phòng vào cơ sở dữ liệu
  const createdRoom = await room.save();

  res.status(201).json(createdRoom);
};
export const getListUserNotInRoom = async (req, res) => {
  const { roomId } = req.params;

  // Kiểm tra xem phòng có tồn tại hay không
  const room = await Room.findById(roomId);
  if (!room) {
    res.status(404);
    throw new Error("Phòng không tồn tại");
  }

  // Lấy danh sách thành viên trong phòng
  const members = room.members;

  // Tìm tất cả người dùng không nằm trong danh sách thành viên của phòng
  const usersNotInRoom = await User.find({ _id: { $nin: members } });

  res.status(200).json(usersNotInRoom);
};

//Get Member By Room
export const getAllMembers = async (req, res) => {
  const { roomId } = req.params;

  // Check if room exists
  const room = await Room.findById(roomId).populate("members");
  if (!room) {
    res.status(404);
    throw new Error("Phòng không tồn tại");
  }

  res.json(room.members);
};
