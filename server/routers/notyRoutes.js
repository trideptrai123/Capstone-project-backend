import express from "express";
import { createNotification, getListNotyByUser, viewNoty } from "../controllers/Notification.js";

const router = express.Router();

router.route("/:userId").get(getListNotyByUser)
router.route("/").post(createNotification)
router.route("/viewed").put(viewNoty)



export default router;
