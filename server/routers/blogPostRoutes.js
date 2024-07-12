import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  createBlogPost,
  deleteBlogPost,
  getDetailBlogPost,
  getListBlogPost,
  updateBlogPost,
} from "../controllers/BlogPostController.js";

const router = express.Router();

// Define routes
router.post("/", createBlogPost);
router.get("/", getListBlogPost);
router.get("/:id", getDetailBlogPost);
router.put("/:id", updateBlogPost);
router.delete("/:id", deleteBlogPost);

export default router;
