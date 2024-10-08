import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  likeUniversity,
  searchUser,
  inactiveUser,
  addUser,
  unlikeUniversity,
  changePassword,
  addCompareUniversity,
  deleteCompareUniversity,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/auth', authUser);
router.post('/logout', logoutUser);
router.post('/add', addUser);
router.put('/change-pass',protect, changePassword);


router
  .route('/profile')
  .get(protect, getUserProfile)
  
  router.get("/search",searchUser)
  router.put("/inactive/:id",inactiveUser)
  
  router
  .route('/profile/:id')
  .put(protect, updateUserProfile);
  router.get("/search",searchUser)
  router.put("/inactive/:id",inactiveUser)



router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, getUserById)
  .put(protect, updateUser);


router.put('/like/:id', protect, likeUniversity); // Route để like/unlike university
router.put('/unlike/:id', protect, unlikeUniversity); // Route để like/unlike university


router.put('/compare/:id', protect, addCompareUniversity); // Route để like/unlike university
router.put('/uncompare/:id', protect, deleteCompareUniversity); // Route để like/unlike university



export default router;
