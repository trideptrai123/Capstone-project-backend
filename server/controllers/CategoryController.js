import asyncHandler from "../middleware/asyncHandler.js";
import CategoryPost from "../models/Category.js";
import BlogPost from "../models/BlogPost.js";


// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if(!name?.trim()){
    return res.status(400).json({ message: "Tên danh mục bắt buộc" });
  }
  // Kiểm tra trùng tên category
  const existingCategory = await CategoryPost.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({ message: "Tên danh mục đã tồn tại" });
  }

  try {
    const category = new CategoryPost(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all category
const getListCategory = asyncHandler(async (req, res) => {
  try {
    const category = await CategoryPost.find();
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a single category by ID
const getDetailCategory = asyncHandler(async (req, res) => {
  try {
    const category = await CategoryPost.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tồn tại danh mục" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a category by ID
    const updateCategory = asyncHandler(async (req, res) => {
        const { name } = req.body;
        if(!name?.trim()){
          return res.status(400).json({ message: "Tên danh mục bắt buộc" });
        }
        const category = await CategoryPost.findById(req.params.id);
        if (!category) {
          return res.status(404).json({ message: "Không tồn tại danh mục" });
        }
        // Kiểm tra trùng tên category (ngoại trừ category hiện tại)
        const existingCategory = await CategoryPost.findOne({ name, _id: { $ne: req.params.id } });
        if (existingCategory) {
          return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }
      
        try {
          const category = await CategoryPost.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
              new: true,
              runValidators: true,
            }
          );
          if (!category) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục' });
          }
          res.status(200).json(category);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      });

// Delete a category by ID
const deleteCategory = asyncHandler(async (req, res) => {
    // Kiểm tra xem có blog post nào sử dụng category này không
    const blogPostsUsingCategory = await BlogPost.findOne({ category: req.params.id });
    if (blogPostsUsingCategory) {
      return res.status(400).json({ message: 'Không thể xóa do có bài viết  thuộc danh mục này' });
    }
  
    try {
      const category = await CategoryPost.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy category' });
      }
      res.status(200).json({ message: 'Xóa thành công' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

export {
  createCategory,
  getListCategory,
  getDetailCategory,
  updateCategory,
  deleteCategory,
};
