/* 
The things which I want to give users to control
 1. Register
 2. Login
 3. Logout

 4. Get User Profile
 5. Update (mail, password, profilepic)

*/


import {
  asyncHandler,
  ApiError,
  validateLeetCodeUsernameAndGetInfo,
  ApiResponse,
} from "../utils/index.js";

import { User, Platform } from "../models/index.js";

const validateData = (obj) => {
  const missingFields = Object.entries(obj)
    .filter(([_, value]) => !value?.trim())
    .map(([key]) => key);
  if (missingFields.length > 0) {
    throw new ApiError(400, `Please fill: ${missingFields.join(", ")}`);
  }
};
const generateAccessTokenAndRefreshToken = async(userId)=>{
  try {
    const user = await User.findById(userId)

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating Access token and Refresh token:", error);
    throw new ApiError(500,"Something went wrong while generating access token and refresh token.");
  }
}



const registerUser = asyncHandler(async (req, res) => {
  const { leetcodeUsername, email, password, gfgUsername, codeforcesUsername } = req.body;

  validateData({ leetcodeUsername, email, password });

  // Check if leetcodeUsername, email already exists
  const existingUser = await User.findOne({
    $or: [{ username: leetcodeUsername.toLowerCase() }, { email }],
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
  } = await validateLeetCodeUsernameAndGetInfo(leetcodeUsername);
  console.log(fullName);
  
  try {
    const user = await User.create({
      fullName,
      username: leetcodeUsername,
      email,
      password,
      role : "user",
      avatar : userAvatar,
      aboutMe,
      school,
      countryName,
      company,
      jobTitle,
      gfgUsername,
      codeforcesUsername
    });

    const platforms = [];

    if (leetcodeUsername) {
      const leetcodePlatform = await Platform.create({
        userId: user._id,
        name: "LeetCode",
        username: leetcodeUsername,
      });
      platforms.push(leetcodePlatform._id);
    }

    if (gfgUsername) {
      const gfgPlatform = await Platform.create({
        userId: user._id,
        name: "GeeksforGeeks",
        username : gfgUsername,
      });
      platforms.push(gfgPlatform._id);
    }

    if (codeforcesUsername) {
      const codeforcesPlatform = await Platform.create({
        userId: user._id,
        name: "Codeforces",
        username: codeforcesUsername,
      });
      platforms.push(codeforcesPlatform._id);
    }

    // Update user with platform IDs
    user.platforms = platforms;
    await user.save();


    const createdUser = await User.findById(user._id).populate("platforms", "-userId -__v").select("-password -refreshToken -role");

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while fetching the user.");
    } else {
      console.log("User Created Successfully");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User Created Successfully"));

  } catch (error) {
    console.error("User creation failed:", error);
    throw new ApiError(500, "User creation failed");
  }
});



const loginUser = asyncHandler(async(req, res)=>{
  const { email , password } = req.body
  validateData({email, password})

  try {
    const user = await User.findOne({email})
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const isPasswordValid = await user.isPasswordMatch(password)
    if(!isPasswordValid){
      throw new ApiError(400, "Invalid credentials")
    }

    const { refreshToken, accessToken } = generateAccessTokenAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).populate("platforms", "-userId -__v").select("-password -refreshToken -role");

    if (!loggedInUser) {
      throw new ApiError(500, "Something went wrong while fetching the user.");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful."));
      
  } catch (error) {
    console.error("Login failed:", error);
    throw new ApiError(500, "Something went wrong while logging in.");
  }

})

export { registerUser, loginUser };
