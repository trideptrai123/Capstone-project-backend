import Request from "../models/Request.js";
import MajorHistory from "../models/MajorHistory.js";
import User from "../models/User.js"; // Make sure to import the User model
import University from "../models/University.js"; // Make sure to import the University model
import { socketConfig } from "../socket.js";
import Notification from "../models/Notyfication.js";
import Major from "../models/Major.js";

// Create a new request
export const createRequest = async (req, res) => {
  let { teacherId, universityId, majorId, year } = req.body;

  // Trim and validate input
  teacherId = teacherId.trim();
  universityId = universityId.trim();
  majorId = majorId.trim();

  if (!teacherId)
    return res.status(400).send({ message: "Giáo viên không được để trống." });
  if (!universityId)
    return res
      .status(400)
      .send({ message: "Trường đại học không được để trống." });
  if (!majorId)
    return res.status(400).send({ message: "Ngành học không được để trống." });
  if (!year)
    return res.status(400).send({ message: "Năm không được để trống." });

  // Check if teacherId is valid and role is teacher
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== "teacher") {
    return res.status(400).send({ message: "Giáo viên không hợp lệ." });
  }

  // Check if universityId is valid
  const university = await University.findById(universityId);
  if (!university) {
    return res.status(400).send({ message: "Trường đại học không hợp lệ." });
  }

  // Check if the request already exists
  const existingRequest = await Request.findOne({
    teacherId,
    universityId,
    majorId,
    year,
  });
  if (existingRequest) {
    return res.status(400).send({
      message:
        "Yêu cầu đã tồn tại cho năm này, trường đại học này và ngành học này.",
    });
  }

  // Check if the teacher is already assigned to the major in the specified year
  const existingHistory = await MajorHistory.findOne({
    majorId,
    year,
    "teachers.teacherId": teacherId,
  });
  if (existingHistory) {
    return res.status(400).send({
      message:
        "Giáo viên này đã được phân công cho ngành học này trong năm " + year,
    });
  }

  try {
    const request = new Request({ teacherId, universityId, majorId, year });
    await request.save();
    // Truy vấn tất cả các user có role là "Staff" thuộc trường đại học
    const staffMembers = await User.find({ universityId, role: "staff" });

    // Tạo thông báo trong database cho các nhân viên
    const notification = new Notification({
      content: `Yêu cầu mới từ giáo viên ${teacher.name}.`,
      receive: staffMembers.map((staff) => ({ userId: staff._id })),
      type: "request",
      role: "staff",
    });

    await notification.save();
    // Gửi thông báo qua Socket.IO cho các staff members
    const io = socketConfig.getIO();
    if (staffMembers?.length > 0) {
      console.log(staffMembers[0].universityId.toString());
      io.to(staffMembers[0].universityId.toString()).emit("noty", {
        content: `Yêu cầu mới từ giáo viên ${teacher.name}.`,
        role: "staff",
        _id: notification._id,
      });
    }
    res.status(201).send(request);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Lỗi khi tạo yêu cầu.", error });
  }
};

export const getRequestsByUniversityId = async (req, res) => {
  const { universityId } = req.params;
  const { majorName, year } = req.query;

  try {
    const query = { universityId };

    if (year) {
      query.year = year;
    }

    // Populate with major name and filter by major name if provided
    const requests = await Request.find(query)
      .populate({
        path: "majorId",
        match: majorName
          ? { name: { $regex: new RegExp(majorName, "i") } }
          : {},
      })
      .populate("teacherId universityId")
      .sort({ updatedAt: -1 });

    // Filter out requests where majorId is null (due to match filtering)
    const filteredRequests = requests.filter(
      (request) => request.majorId !== null
    );

    res.status(200).send(filteredRequests);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy danh sách yêu cầu.", error });
  }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
  const { status, yearsExperience } = req.body;

  if (!status || !["pending", "accept", "reject", "cancel"].includes(status)) {
    return res.status(400).send({ message: "Trạng thái không hợp lệ." });
  }

  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).send({
        message: "Không tìm thấy yêu cầu hoặc yêu cầu không ở trạng thái chờ.",
      });
    }

    // Truy vấn thêm thông tin từ các bảng khác
    const teacher = await User.findById(request.teacherId).select("name");
    const major = await Major.findById(request.majorId).select("name");

    if (status === "accept") {
      const majorHistory = await MajorHistory.findOne({
        majorId: request.majorId,
        year: request.year,
      });

      if (!majorHistory) {
        return res
          .status(404)
          .send({ message: "Không tìm thấy lịch sử ngành học." });
      }

      const isTeacherAssigned = majorHistory.teachers.some(
        (teacher) =>
          teacher.teacherId.toString() === request.teacherId.toString()
      );

      if (!isTeacherAssigned) {
        majorHistory.teachers.push({
          teacherId: request.teacherId,
          yearsExperience: yearsExperience || 0,
        });
        await majorHistory.save();
      }

      // Create notification for the teacher
      const notification = new Notification({
        content: `Yêu cầu của bạn cho ngành ${major.name}  đã được chấp nhận.`,
        type: "request",
        receive: [{ userId: request.teacherId, isViewed: false }],
      });
      await notification.save();

      // Send socket notification to the teacher
      const io = socketConfig.getIO();
      io.to(request.universityId.toString()).emit("noty", {
        ...notification._doc,
        role: "teacher",
      });
    }

    if (status === "reject") {
      const notification = new Notification({
        content: `Yêu cầu của bạn cho ngành ${major.name}  đã bị từ chối.`,
        type: "request",
        receive: [{ userId: request.teacherId, isViewed: false }],
      });
      await notification.save();

      const io = socketConfig.getIO();
      io.to(request.universityId.toString()).emit("noty", {
        ...notification._doc,
        role: "teacher",
      });
    }

    if (status === "cancel") {
      const staffMembers = await User.find({
        universityId: request.universityId,
        role: "staff",
      }).lean();
      const notification = new Notification({
        content: `Giáo viên ${teacher.name} đã hủy yêu cầu cho ngành ${major.name}.`,
        type: "request",
        receive: staffMembers.map((staff) => ({ userId: staff._id })),
      });

      await notification.save();

      const io = socketConfig.getIO();
      io.to(request.universityId.toString()).emit("noty", {
        ...notification._doc,
        role: "staff",
      });
    }


    if (status === "pending") {
      const staffMembers = await User.find({
        universityId: request.universityId,
        role: "staff",
      }).lean();
      const notification = new Notification({
        content: `Giáo viên ${teacher.name} đã tạo lại yêu cầu cho ngành ${major.name}.`,
        type: "request",
        receive: staffMembers.map((staff) => ({ userId: staff._id })),
      });

      await notification.save();

      const io = socketConfig.getIO();
      io.to(request.universityId.toString()).emit("noty", {
        ...notification._doc,
        role: "staff",
      });
    }

    // Cập nhật trạng thái request
    request.status = status;
    await request.save();

    res.status(200).send(request);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Lỗi khi cập nhật yêu cầu.", error });
  }
};

export const getRequestsByTeacherId = async (req, res) => {
  const { id: teacherId } = req.params;
  const { year, majorName } = req.query;

  try {
    let query = { teacherId };

    if (year) {
      query.year = year;
    }

    const requests = await Request.find(query)
      .populate("teacherId universityId majorId")
      .sort({ updatedAt: -1 });

    // Filter by majorName if provided
    let filteredRequests = requests;
    if (majorName) {
      filteredRequests = requests.filter((request) =>
        request.majorId.name
          .toLowerCase()
          .includes(majorName.trim().toLowerCase())
      );
    }

    res.status(200).send(filteredRequests);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy danh sách yêu cầu.", error });
  }
};

// Get request by ID
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "teacherId universityId majorId"
    );
    if (!request) {
      return res.status(404).send({ message: "Không tìm thấy yêu cầu." });
    }
    res.status(200).send(request);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy yêu cầu.", error });
  }
};

// Update request
export const updateRequest = async (req, res) => {
  let { teacherId, universityId, majorId, year } = req.body;

  // Trim and validate input
  teacherId = teacherId.trim();
  universityId = universityId.trim();
  majorId = majorId.trim();

  if (!teacherId)
    return res.status(400).send({ message: "Giáo viên không được để trống." });
  if (!universityId)
    return res
      .status(400)
      .send({ message: "Trường đại học không được để trống." });
  if (!majorId)
    return res.status(400).send({ message: "Ngành học không được để trống." });
  if (!year)
    return res.status(400).send({ message: "Năm không được để trống." });

  // Check if teacherId is valid and role is teacher
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== "teacher") {
    return res.status(400).send({ message: "Giáo viên không hợp lệ." });
  }

  // Check if universityId is valid
  const university = await University.findById(universityId);
  if (!university) {
    return res.status(400).send({ message: "Trường đại học không hợp lệ." });
  }

  // Check if the request already exists
  const existingRequest = await Request.findOne({
    teacherId,
    universityId,
    majorId,
    year,
    _id: { $ne: req.params.id },
  });
  if (existingRequest) {
    return res.status(400).send({
      message:
        "Yêu cầu đã tồn tại cho năm này, trường đại học này và ngành học này.",
    });
  }

  // Check if the teacher is already assigned to the major in the specified year
  const existingHistory = await MajorHistory.findOne({
    majorId,
    year,
    "teachers.teacherId": teacherId,
  });
  if (existingHistory) {
    return res.status(400).send({
      message:
        "Giáo viên này đã được phân công cho ngành học này trong năm " + year,
    });
  }

  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { teacherId, universityId, majorId, year },
      { new: true }
    );
    if (!request) {
      return res.status(404).send({ message: "Không tìm thấy yêu cầu." });
    }
    res.status(200).send(request);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi cập nhật yêu cầu.", error });
  }
};
