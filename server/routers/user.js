const userController = require('../controllers/userControllers');
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUserAuthorization,
} = require('../controllers/verifyToken');

const router = require('express').Router();
//GET ALL USERS
router.get('/', verifyToken, userController.getAllUsers);

//DELETE USER
router.delete(
  '/:id',
  verifyTokenAndUserAuthorization,
  userController.deleteUser
);

module.exports = router;
