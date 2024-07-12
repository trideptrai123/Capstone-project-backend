import asyncHandler from "../middleware/asyncHandler.js";
import BlogPost from "../models/BlogPost.js";
import CategoryPost from "../models/Category.js";
import University from "../models/University.js";

// Create a new blog post
const createBlogPost = asyncHandler(async (req, res) => {
  const { headerImage, title, content, category,university } = req.body;

  // Kiểm tra các giá trị required
  if (!headerImage) {
    return res.status(400).json({ message: 'Vui lòng điền hình ảnh tiêu đề' });
  }
  if (!title) {
    return res.status(400).json({ message: 'Vui lòng điền tiêu đề' });
  }
  if (!content) {
    return res.status(400).json({ message: 'Vui lòng điền nội dung' });
  }
  if (!category) {
    return res.status(400).json({ message: 'Vui lòng chọn danh mục' });
  }
  if (!university) {
    return res.status(400).json({ message: 'Vui lòng chọn trường học' });
  }
  if (title.trim() === "" || content.trim() === "") {
    return res
      .status(400)
      .json({ message: "Tiêu đề và nội dung không được để trống" });
  }

  // Kiểm tra xem category có tồn tại không
  const categoryExists = await CategoryPost.findById(category);
  if (!categoryExists) {
    return res.status(400).json({ message: "Danh mục không tồn tại" });
  }
  const universityExists = await University.findById(university);
  if (!universityExists) {
    return res.status(400).json({ message: "Trường học không tồn tại" });
  }


  try {
    const blogPost = new BlogPost({ headerImage, title, content, category,university });
    await blogPost.save();
    res.status(201).json(blogPost);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể tạo bài viết", error: error.message });
  }
});

// Get all blog posts
const getListBlogPost = asyncHandler(async (req, res) => {
  try {
    const { search, category, university } = req.query;

    // Build the filter object
    let filter = {};

    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category?.trim()) {
      filter.category = category;
    }

    if (university?.trim()) {
      filter.university = university;
    }

    // Query the blog posts with filter and sort by updatedAt in descending order
    const blogPosts = await BlogPost.find(filter)
      .populate("category")
      .sort({ updatedAt: -1 });

    res.status(200).json(blogPosts);
  } catch (error) {
    res.status(400).json({
      message: "Không thể lấy danh sách bài viết",
      error: error.message,
    });
  }
});
// Get a single blog post by ID
const getDetailBlogPost = asyncHandler(async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate(
      "category"
    ).populate("university");
    if (!blogPost) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    res.status(200).json(blogPost);
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Không thể lấy chi tiết bài viết",
        error: error.message,
      });
  }
});

// Update a blog post by ID
const updateBlogPost = asyncHandler(async (req, res) => {
  const { headerImage, title, content, category ,university} = req.body;

  // Kiểm tra các giá trị required
  if (!headerImage || !title || !content || !category || !university) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ các trường bắt buộc" });
  }

  if (title.trim() === "" || content.trim() === "") {
    return res
      .status(400)
      .json({ message: "Tiêu đề và nội dung không được để trống" });
  }

  // Kiểm tra xem category có tồn tại không
  const categoryExists = await CategoryPost.findById(category);
  if (!categoryExists) {
    return res.status(400).json({ message: "Danh mục không tồn tại" });
  }

  try {
    const blogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { headerImage, title, content, category ,university},
      {
        new: true,
        runValidators: true,
      }
    );
    if (!blogPost) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    res.status(200).json(blogPost);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể cập nhật bài viết", error: error.message });
  }
});

// Delete a blog post by ID
const deleteBlogPost = asyncHandler(async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }
    res.status(200).json({ message: "Bài viết đã được xóa thành công" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể xóa bài viết", error: error.message });
  }
});

export {
  createBlogPost,
  getListBlogPost,
  getDetailBlogPost,
  updateBlogPost,
  deleteBlogPost,
};
