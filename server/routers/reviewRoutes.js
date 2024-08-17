import express from "express";
import { createReview, deleteReview, editReview, getReviewById, searchReviews } from "../controllers/ReviewController.js";

const router = express.Router();

router.route("/").get(searchReviews)
router.route("/").post(createReview)
router.route("/:id").put(editReview)
router.route("/:id").get(getReviewById)
router.route("/:id").delete(deleteReview)



export default router;
