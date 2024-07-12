import asyncHandler from "../middleware/asyncHandler.js";
import Comment from "../models/CommentPost.js";
import BlogPost from "../models/BlogPost.js";
import User from "../models/User.js";

// Create a new comment
const createComment = asyncHandler(async (req, res) => {
  const { content, blogPostId, parentComment, userId } = req.body;

  // Kiểm tra các giá trị required
  if (!content || !blogPostId) {
    return res
      .status(400)
      .json({ message: "Nội dung và bài viết là bắt buộc" });
  }

  if (content.trim() === "") {
    return res.status(400).json({ message: "Nội dung không được để trống" });
  }

  // Kiểm tra xem blogPost có tồn tại không
  const blogPostExists = await BlogPost.findById(blogPostId);
  if (!blogPostExists) {
    return res.status(400).json({ message: "Bài viết không tồn tại" });
  }

  // Nếu có parentComment, kiểm tra xem nó có tồn tại không
  if (parentComment) {
    const parentCommentExists = await Comment.findById(parentComment);
    if (!parentCommentExists) {
      return res.status(400).json({ message: "Bình luận cha không tồn tại" });
    }
  }

  try {
    const comment = new Comment({
      content,
      userId,
      blogPostId,
      parentComment,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể tạo bình luận", error: error.message });
  }
});

// Get all comments for a blog post
const getCommentsForPost = asyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find({
      blogPostId: req.params.id,
      parentComment: null,
    })
      .populate("userId", "name")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name" },
      });
    res.status(200).json(comments);
  } catch (error) {
    res.status(400).json({
      message: "Không thể lấy danh sách bình luận",
      error: error.message,
    });
  }
});

// Get a single comment by ID
const getCommentById = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("userId", "name")
      .populate({
        path: "replies",
        populate: { path: "userId", select: "name" },
      });
    if (!comment) {
      return res.status(404).json({ message: "Bình luận không tồn tại" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({
      message: "Không thể lấy chi tiết bình luận",
      error: error.message,
    });
  }
});

// Update a comment by ID
const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  // Kiểm tra giá trị required
  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Nội dung không được để trống" });
  }

  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true, runValidators: true }
    );
    if (!comment) {
      return res.status(404).json({ message: "Bình luận không tồn tại" });
    }
    res.status(200).json(comment);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể cập nhật bình luận", error: error.message });
  }
});

// Delete a comment by ID
const deleteComment = async (req, res) => {
  const commentId = req.params.id;
  console.log(commentId);
  // Tìm tất cả các bình luận con của commentId
  // const childComments = await Comment.find({ parentComment: commentId });
  await Comment.deleteMany({ parentComment: commentId });
  // // Xóa bình luận hiện tại
  await Comment.findByIdAndDelete(commentId);
  res.status(200).json({ message: "Xoa ok" });
};

export {
  createComment,
  getCommentsForPost,
  getCommentById,
  updateComment,
  deleteComment,
};
