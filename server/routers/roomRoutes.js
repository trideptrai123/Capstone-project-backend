import express from "express";
import {
  addRoom,
  addUsersToRoom,
  deleteRoom,
  getAllMembers,
  getListUserNotInRoom,
  getRoomsByUserId,
  markLastMessageAsRead,
  removeUserFromRoom,
  updateRoom,
  updateRoomImage,
} from "../controllers/RoomController.js";
const router = express.Router();

router.route("/").get(getRoomsByUserId).post(addRoom);
router.route("/member/notInroom/:roomId").get(getListUserNotInRoom);
router.route("/member/:roomId").get(getAllMembers);
router.route("/rename/:roomId").put(updateRoom)
router.route("/image/:roomId").put(updateRoomImage)


router.route("/:roomId/add-user").post(addUsersToRoom);

router.route("/:roomId/remove-user").post(removeUserFromRoom);

router.route("/:roomId/mark-as-read").post(markLastMessageAsRead);
router.route("/:roomId").delete(deleteRoom);

export default router;
