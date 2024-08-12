import Notification from "../models/Notyfication.js";

// Get list of notifications by user ID
export const getListNotyByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({
      'receive.userId': userId
    }).sort({ createdAt: -1 });

    const userNotifications = notifications.map(notification => {
      const userReceive = notification.receive.find(r => r.userId.toString() == userId);
      return {
        ...notification._doc,
        isViewed: userReceive ? userReceive.isViewed : false
      };
    });

    res.status(200).json(userNotifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách thông báo.', error });
  }
}

//
export const viewNoty = async (req, res) => {
    const { userId } = req.body;
    const { notyIds } = req.body;
  
    try {
      for (const notyId of notyIds) {
        await Notification.updateOne(
          { _id: notyId, 'receive.userId': userId },
          { $set: { 'receive.$.isViewed': true } }
        );
      }
  
      res.status(200).json({ message: 'Đã cập nhật trạng thái xem thông báo.' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái thông báo.', error });
    }
  }

  export const createNotification = async (req, res) => {
    const { content, receive, type, rawData } = req.body;
  
    // Kiểm tra xem các trường cần thiết có được cung cấp hay không
    if (!content || !receive || !Array.isArray(receive) || receive.length === 0) {
      return res.status(400).json({ message: "Nội dung và danh sách người nhận không được để trống." });
    }
  
    // Tạo một thông báo mới
    try {
      const notification = new Notification({
        content,
        receive,
        type,
        rawData
      });
  
      // Lưu thông báo vào cơ sở dữ liệu
      await notification.save();
  
      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tạo thông báo.", error });
    }
  }