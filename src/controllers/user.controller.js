/* 
The things which I want to give users to control
 1. Register
 2. Login
 3. Logout

 4. Get User Profile
 5. Update (mail, password, profilepic)

*/

import User from "../models/user.model.js";

import {
  asyncHandler,
  ApiError,
  validateLeetCodeUsernameAndGetInfo,
} from "../utils/index.js";

const validateData = (obj) => {
  const missingFields = Object.entries(obj)
    .filter(([_, value]) => !value?.trim())
    .map(([key]) => key);
  if (missingFields.length > 0) {
    throw new ApiError(400, `Please fill: ${missingFields.join(", ")}`);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  validateData({ username, email, password });

  // Check if leetcodeUsername, email already exists
  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const {
    fullName,
    userAvatar,
    aboutMe,
    school,
    countryName,
    company,
    jobTitle,
  } = await validateLeetCodeUsernameAndGetInfo(username);
  console.log(fullName);
  
  try {
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role,
      avatar : userAvatar,
      aboutMe,
      school,
      countryName,
      company,
      jobTitle,
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken -role");
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while fetching the user.");
    } else {
      console.log("User Created Successfully");
    }

    return res.status(201).json({
      success: true,
      message: "User Created Successfully",
      data: createdUser,
    })
  } catch (error) {
    console.error("User creation failed:", error);
    throw new ApiError(500, "User creation failed");
  }
});

export { registerUser };
