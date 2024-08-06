import express from "express";
import { createRequest, getRequestById, getRequestsByTeacherId, getRequestsByUniversityId, updateRequest, updateRequestStatus } from "../controllers/RequestController.js";
import { protect, admin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.route("/").post(protect, createRequest);
router.route("/:id").get(protect, getRequestById);
router.route("/update/:id").put(protect, updateRequest);


router.route("/my-request/:id").get(protect, getRequestsByTeacherId);

router.route("/university/:universityId").get(protect, getRequestsByUniversityId);
router.route("/:id").put(protect, updateRequestStatus);

export default router;
