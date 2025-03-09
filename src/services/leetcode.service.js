import axios from "axios";
import ApiError from "../utils/apiError.js";

const leetcode_API_URL = "https://leetcode.com/graphql";

const fetchLeetCodeData = async (username) => {
  try {
    //Found this query in the from google
    const query = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
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

    //Using Post method because in GraphQL we use post method to send query
    const response = await axios.post(leetcode_API_URL, {
        query,
        variables: { username },
      });
    
      
      const data = {
        username : response.data.data.matchedUser.username,
        contestRanking : response.data.data.userContestRanking.rating,
        total: response.data.data.matchedUser.submitStats.acSubmissionNum[0].count || "0",
        easy: response.data.data.matchedUser.submitStats.acSubmissionNum[1].count || "0",
        medium: response.data.data.matchedUser.submitStats.acSubmissionNum[2].count || "0",
        hard: response.data.data.matchedUser.submitStats.acSubmissionNum[3].count || "0",
      }; 

      console.log(data.username,data.contestRanking, data.total, data.easy, data.medium, data.hard);
    return data;
  } catch (error) {
    console.error("Error fetching LeetCode data:", error.message);
    throw new ApiError(500, "Error fetching LeetCode data");
  }
};


export default fetchLeetCodeData;
