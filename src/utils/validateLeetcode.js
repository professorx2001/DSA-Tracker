import axios from "axios";
import  ApiError from "./apiError.js";

const leetcode_API_URL = "https://leetcode.com/graphql";

const validateLeetCodeUsernameAndGetInfo = async (username) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      aboutMe
      school
      countryName
      company
      jobTitle
    }
  }
}
    `;

    const response = await axios.post(leetcode_API_URL, {
      query,
      variables: { username },
    });

    const user = response.data.data.matchedUser;

    if (!user) {
      throw new ApiError(404, "Invalid LeetCode username. Please provide a correct one.");
    }

    return {
      username: user.username,
      fullName: user.profile.realName || "No Name Provided",
      userAvatar: user.profile.userAvatar || "",
      aboutMe : user.profile.aboutMe || "",
      school : user.profile.school || "",
      countryName : user.profile.countryName || "",
      company : user.profile.company || "",
      jobTitle : user.profile.jobTitle || "",
    };

  } catch (error) {
    console.error("Error validating LeetCode username:", error.message);
    throw new ApiError(500, "Error validating LeetCode username");
  }
};

export default validateLeetCodeUsernameAndGetInfo;
