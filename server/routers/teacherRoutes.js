import express from "express";
import {
  addTeacher,
  editTeacher,
  deleteTeacher,
  getTeacherDetails,
  searchTeachers,
} from "../controllers/TeacherController.js";

const router = express.Router();

// Endpoint for adding a new teacher
router.route("/").post(addTeacher);

// Endpoint for searching teachers
router.route("/").get(searchTeachers);

// Endpoint for getting details of a specific teacher
router.route("/:id").get(getTeacherDetails);

// Endpoint for updating a specific teacher
router.route("/:id").put(editTeacher);

// Endpoint for deleting a specific teacher
router.route("/:id").delete(deleteTeacher);

export default router;