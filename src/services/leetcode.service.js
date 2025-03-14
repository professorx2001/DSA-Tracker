import axios from "axios";
import ApiError from "../utils/apiError.js";

const leetcode_API_URL = "https://leetcode.com/graphql";

const fetchLeetCodeData = async (username) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            userAvatar
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
        userContestRanking(username: $username) {
          rating
        }
      }
    `;

    const response = await axios.post(leetcode_API_URL, {
      query,
      variables: { username },
    });

    const data = {
      username: response.data.data.matchedUser.username,
      profilePic: response.data.data.matchedUser.profile.userAvatar || "", // Profile picture URL
      contestRanking: response.data.data.userContestRanking?.rating || "Not Rated",
      total: response.data.data.matchedUser.submitStats.acSubmissionNum[0].count || "0",
      easy: response.data.data.matchedUser.submitStats.acSubmissionNum[1].count || "0",
      medium: response.data.data.matchedUser.submitStats.acSubmissionNum[2].count || "0",
      hard: response.data.data.matchedUser.submitStats.acSubmissionNum[3].count || "0",
    };
    // console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching LeetCode data:", error.message);
    throw new ApiError(500, "Error fetching LeetCode data");
  }
};

export default fetchLeetCodeData;

