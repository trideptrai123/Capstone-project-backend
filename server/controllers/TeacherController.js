import User from "../models/User.js";
import MajorHistory from "../models/MajorHistory.js";
import mongoose from "mongoose";

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Add a new teacher
export const addTeacher = async (req, res) => {
  let { name, email, password, universityId, yearsExperience, certificates, rating, dateOfBirth, description } = req.body;

  // Trim strings
  name = name.trim();
  email = email.trim();
  password = password.trim();
  certificates = certificates.map(certificate => certificate.trim());
  description = description.trim();

  if (!name) return res.status(400).send({ message: "Tên không được để trống." });
  if (!email) return res.status(400).send({ message: "Email không được để trống." });
  if (!isValidEmail(email)) return res.status(400).send({ message: "Email không đúng định dạng." });
  if (!password) return res.status(400).send({ message: "Mật khẩu không được để trống." });
  if (!universityId) return res.status(400).send({ message: "Mã trường đại học không được để trống." });
  if (!dateOfBirth) return res.status(400).send({ message: "Ngày sinh không được để trống." });
  if (new Date(dateOfBirth) > new Date()) return res.status(400).send({ message: "Ngày sinh không được là ngày trong tương lai." });
  if (yearsExperience < 0) return res.status(400).send({ message: "Số năm kinh nghiệm không được âm." });
  if (rating < 0 || rating > 5) return res.status(400).send({ message: "Đánh giá phải từ 0 đến 5." });

  try {
    const user = new User({
      name,
      email,
      password,
      role: "teacher",
      universityId,
      yearsExperience,
      certificates,
      rating,
      dateOfBirth,
      description
    });

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send({ message: "Lỗi khi thêm giảng viên.", error });
  }
};

// Edit a teacher
export const editTeacher = async (req, res) => {
  const { id } = req.params;
  let { name, email, universityId, yearsExperience, certificates, rating, dateOfBirth, description } = req.body;

  // Trim strings
  name = name.trim();
  certificates = certificates.map(certificate => certificate.trim());
  description = description.trim();

  if (!name) return res.status(400).send({ message: "Tên không được để trống." });
  if (!universityId) return res.status(400).send({ message: "Mã trường đại học không được để trống." });
  if (!dateOfBirth) return res.status(400).send({ message: "Ngày sinh không được để trống." });
  if (new Date(dateOfBirth) > new Date()) return res.status(400).send({ message: "Ngày sinh không được là ngày trong tương lai." });
  if (yearsExperience < 0) return res.status(400).send({ message: "Số năm kinh nghiệm không được âm." });
  if (rating < 0 || rating > 5) return res.status(400).send({ message: "Đánh giá phải từ 0 đến 5." });

  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        universityId,
        yearsExperience,
        certificates,
        rating,
        dateOfBirth,
        description
      },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).send({ message: "Giảng viên không tồn tại." });

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({ message: "Lỗi khi cập nhật giảng viên.", error });
  }
};

// Delete a teacher
export const deleteTeacher = async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) return res.status(404).send({ message: "Giảng viên không tồn tại." });
  
      // Remove teacher from MajorHistory
      await MajorHistory.updateMany(
        { "teachers.teacherId": new mongoose.Types.ObjectId(id) },
        { $pull: { teachers: { teacherId: new mongoose.Types.ObjectId(id) } } }
      );
  
      res.status(200).send({ message: "Giảng viên đã được xóa." });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Lỗi khi xóa giảng viên.", error });
    }
  };
  

// Get teacher details
export const getTeacherDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate("universityId", "name");
    if (!user) return res.status(404).send({ message: "Giảng viên không tồn tại." });

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lấy thông tin giảng viên.", error });
  }
};

// Search teachers
export const searchTeachers = async (req, res) => {
  const { name, universityId } = req.query;

  try {
    const query = { role: "teacher" };
    if (name) query.name = new RegExp(name.trim(), "i");
    if (universityId) query.universityId = universityId;

    const teachers = await User.find(query).populate("universityId", "name").sort({ createdAt: -1 });;

    res.status(200).send(teachers);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi tìm kiếm giảng viên.", error });
  }
  
};
