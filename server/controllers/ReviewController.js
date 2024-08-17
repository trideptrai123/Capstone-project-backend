import Review from "../models/Review.js";
import User from "../models/User.js";


export const createReview = async (req, res) => {
  const { teacherId, universityId, year, rating, comment } = req.body;

  // Validate input
  if (!teacherId) return res.status(400).send({ message: "Giáo viên không được để trống." });
  if (!universityId) return res.status(400).send({ message: "Trường đại học không được để trống." });
  if (!year) return res.status(400).send({ message: "Năm không được để trống." });
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).send({ message: "Đánh giá phải từ 1 đến 5." });
  }

  // Kiểm tra review đã tồn tại cho năm này chưa
  const existingReview = await Review.findOne({ teacherId, universityId, year });
  if (existingReview) {
    return res.status(400).send({ message: "Giáo viên đã đánh giá trường này trong năm này." });
  }

  try {
    const review = new Review({ teacherId, universityId, year, rating, comment });
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi lưu đánh giá.", error });
  }
};

export const editReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
  
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send({ message: "Đánh giá phải từ 1 đến 5." });
    }
  
    try {
      const review = await Review.findByIdAndUpdate(
        id,
        { rating, comment },
        { new: true, runValidators: true }
      );
      if (!review) {
        return res.status(404).send({ message: "Không tìm thấy đánh giá." });
      }
      res.status(200).send(review);
    } catch (error) {
      res.status(500).send({ message: "Lỗi khi chỉnh sửa đánh giá.", error });
    }
  };

  export const getReviewById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const review = await Review.findById(id).populate('teacherId', 'name').populate('universityId', 'name');
      if (!review) {
        return res.status(404).send({ message: "Không tìm thấy đánh giá." });
      }
      res.status(200).send(review);
    } catch (error) {
      res.status(500).send({ message: "Lỗi khi lấy đánh giá.", error });
    }
  };

  export const searchReviews = async (req, res) => {
    const { teacherId, universityId, year, teacherName } = req.query;
  
    const query = {};
    if (teacherId) query.teacherId = teacherId;
    if (universityId) query.universityId = universityId;
    if (year) query.year = parseInt(year);
  
    try {
      // Nếu có teacherName, tìm kiếm giảng viên trong bảng User với role là "teacher"
      if (teacherName) {
        const teachers = await User.find({
          role: "teacher",  // Chỉ tìm kiếm giáo viên
          name: { $regex: teacherName.trim(), $options: 'i' } // Tìm theo tên giáo viên
        }).select('_id'); // Chỉ lấy ID
  
        const teacherIds = teachers.map(teacher => teacher._id);
        query.teacherId = { $in: teacherIds }; // Sử dụng mảng ID để tìm kiếm trong bảng Review
      }
  
      // Sau đó tìm kiếm các đánh giá dựa trên query đã build
      const reviews = await Review.find(query)
        .populate('teacherId', 'name')  // Populate thông tin tên giảng viên từ bảng User
        .populate('universityId', 'name')
        .sort({ createdAt: -1 });
  
      res.status(200).send(reviews);
    } catch (error) {
      res.status(500).send({ message: "Lỗi khi tìm kiếm đánh giá.", error });
    }
  };
  

  export const deleteReview = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Tìm và xóa review theo ID
      const review = await Review.findByIdAndDelete(id);
  
      // Nếu review không tồn tại
      if (!review) {
        return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
      }
  
      // Xóa thành công
      res.status(200).json({ message: 'Đánh giá đã được xóa thành công.' });
    } catch (error) {
      // Xử lý lỗi
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi xóa đánh giá.' });
    }
  };