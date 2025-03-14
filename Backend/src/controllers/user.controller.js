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
import {
  fetchLeetCodeData,
  fetchCodeforcesData,
  fetchGeeksForGeeksData,
} from "../services/index.js";
import User from "../models/user.model.js";

const validateData = (obj) => {
  const missingFields = Object.entries(obj)
    .filter(([_, value]) => !value?.trim())
    .map(([key]) => key);
  if (missingFields.length > 0) {
    throw new ApiError(400, `Please fill: ${missingFields.join(", ")}`);
  }
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating access token and refresh token:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access token and refresh token."
    );
  }
};

//Register the user
const registerUser = asyncHandler(async (req, res) => {
  const { leetcodeUsername, email, password, codeforcesusername, gfgusername } = req.body;

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
      role: "user",
      avatar: userAvatar,
      aboutMe,
      school,
      countryName,
      company,
      jobTitle,
      gfgusername : gfgusername || "",
      codeforcesusername : codeforcesusername || "",
      platforms: [
        {
          name: "LeetCode",
          username: leetcodeUsername,
          rating: 0,
          totalSolved: 0,
          problems: {
            easy: 0,
            medium: 0,
            hard: 0,
          },
        },
      ],
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -role"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while fetching the user.");
    } else {
      console.log("User Created Successfully");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User Created Successfully"));
  } catch (error) {
    console.error("User creation failed:", error);
    throw new ApiError(500, "User creation failed");
  }
});

//Login the user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateData({ email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid credentials");
    }

    const { refreshToken, accessToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -role"
    );

    if (!loggedInUser) {
      throw new ApiError(500, "Something went wrong while fetching the user.");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    console.log("Login successful.", accessToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "Login successful."
        )
      );
  } catch (error) {
    console.error("Login failed:", error);
    throw new ApiError(500, "Something went wrong while logging in.");
  }
});

//Get the user data
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId).select(
      "-password -refreshToken -role"
    );
    if (!user) {
      throw new ApiError(404, "User not found.");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User data fetched successfully."));
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new ApiError(500, "Something went wrong while fetching user data.");
  }
});

//Hit a refresh button to update the data manually
const refreshDataAndUpdateDB = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  const platforms = user.platforms;

  // Refreshing LeetCode data
  const { username, contestRanking, total, easy, medium, hard } = await fetchLeetCodeData(user.username);

  let leetcode = platforms.find((platform) => platform.name === "LeetCode");

  if (!leetcode) {

    leetcode = { name: "Leetcode", username, rating: contestRanking, totalSolved: total, problems: { easy, medium, hard } };
    platforms.push(leetcode);
  } else {
    // Update existing LeetCode data
    leetcode.username = username;
    leetcode.rating = contestRanking;
    leetcode.totalSolved = total;
    leetcode.problems.easy = easy;
    leetcode.problems.medium = medium;
    leetcode.problems.hard = hard;
  }

  if (user.gfgusername && user.gfgusername !== "") {
    const { username: gfgusername, rank, contestRating, total, easy, medium, hard } = await fetchGeeksForGeeksData(user.gfgusername);
    
    let gfg = platforms.find((platform) => platform.name === "GeeksForGeeks");

    if (!gfg) {
      // Create new GFG entry
      gfg = { 
        name: "GeeksForGeeks",
        username: gfgusername,
        rating: Number(contestRating), 
        totalSolved: total, 
        problems: { easy, medium, hard } 
      };
      platforms.push(gfg);
    } else {
      // Update existing GFG data
      gfg.username = gfgusername;
      gfg.rating = Number(contestRating) || 0;
      gfg.totalSolved = total;
      gfg.problems.easy = easy;
      gfg.problems.medium = medium;
      gfg.problems.hard = hard;
    }
  }

  await user.save();

  return res.status(200).json(new ApiResponse(200, user.platforms, "Platform data updated successfully"));
});




export { registerUser, loginUser, getProfile, refreshDataAndUpdateDB };
