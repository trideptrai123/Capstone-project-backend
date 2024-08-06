import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import User from "../models/User.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      userType: user.userType,
      likedUniversities: user.likedUniversities,
      role:user.role
     // Include likedUniversities
    });
  } else {
    res.status(401);
    throw new Error("Sai email hoặc mật khẩu");
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('Password should be at least 6 characters');
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  } else {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, userType } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    userType,
  });

  // If user is successfully created, generate token and return user info
  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      userType: user.userType,
      likedUniversities: user.likedUniversities, // Include likedUniversities
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("likedUniversities");
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      userType: user.userType,
      likedUniversities: user.likedUniversities,
      role:user?.role,
      universityId:user.universityId || null,
      gender:user.gender,
      address:user.address,
      avatar:user.avatar,
      dateOfBirth:user.dateOfBirth,
      description:user.description
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
// const updateUserProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;
//     user.userType = req.body.userType || user.userType;

//     if (req.body.password) {
//       user.password = req.body.password;
//     }

//     const updatedUser = await user.save();

//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       userType: updatedUser.userType,
//       isAdmin: updatedUser.isAdmin,
//       likedUniversities: updatedUser.likedUniversities, // Include likedUniversities
//       token: generateToken(updatedUser._id),
//     });
//   } else {
//     res.status(404);
//     throw new Error("User not found");
//   }
// });

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Can not delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").populate('likedUniversities');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin) || false;
    user.userType = req.body.userType || user.userType;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      userType: updatedUser.userType,
      likedUniversities: updatedUser.likedUniversities, // Include likedUniversities
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Like/Unlike university
// @route   PUT /api/users/like/:id
// @access  Private
const likeUniversity = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(user)

  if (user) {
    const universityId = req.params.id;
    const index = user.likedUniversities.indexOf(universityId);

    if (index === -1) {
      user.likedUniversities.push(universityId);
    } else {
      user.likedUniversities.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ likedUniversities: user.likedUniversities });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
export const unlikeUniversity = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  console.log(user)

  if (user) {
    const universityId = req.params.id;
    const index = user.likedUniversities.indexOf(universityId);

    if (index === -1) {
      res.status(400).json({ message: "Không tìm thấy trường đại học " });
    } else {
      user.likedUniversities.splice(index, 1);
    }

    await user.save();
    res.status(200).json({ likedUniversities: user.likedUniversities });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const searchUser = asyncHandler(async (req, res) => {
  const { name, isAdmin } = req.query;

  // Create a base filter object to include only active users
  let filter = {
    active: true,
  };

  if (isAdmin != 'true') {
    // If isAdmin is not true, add the condition to exclude admins
    filter.$or = [{ isAdmin: false }, { role: 'user' }];
  }

  if (name) {
    // Use a regular expression to perform a case-insensitive search on the name
    filter.name = { $regex: name, $options: 'i' };
  }

  // Fetch users based on the filter
  const users = await User.find(filter);
  res.json(users);
});

// inactive user
const inactiveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, { active: false }, { new: true });

  if (user) {
    res.json({
      message: 'Đã inactive thành công',
      user,
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy user');
  }
});

// Add user
const addUser = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();
  const role = req.body.role
  const universityId = req.body.universityId || null


  // Validate input fields
  if (!name) {
    return res.status(400).json({ message: 'Tên là bắt buộc' });
  }
  if(role == "staff" || role == "teacher"){
    if(!universityId){
      return res.status(400).json({ message: 'Trường học là bắt buộc' });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Email đã tồn tại' });
  }

  // Create a new user
  const user = new User({
    name,
    email,
    password,
    role,
    universityId
  });

  // Save the user to the database
  const createdUser = await user.save();
  res.status(201).json(createdUser);
});

export const updateUserProfile = async (req, res) => {
  const { id: userId } = req.params;
  const updateData = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "Người dùng không tồn tại." });
    }

    // Update the fields that are provided in the request body
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    // Save the updated user data
    await user.save();

    res.status(200).send({ message: "Cập nhật thông tin người dùng thành công.", user });
  } catch (error) {
    res.status(500).send({ message: "Lỗi khi cập nhật thông tin người dùng.", error });
  }
};

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  likeUniversity,
  searchUser,
  inactiveUser,
  addUser
};
