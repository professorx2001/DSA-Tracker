import axios from "axios";
import ApiError from "../utils/apiError.js";

const leetcode_API_URL = "https://leetcode.com/graphql";

const fetchLeetCodeData = async (username) => {
  try {
    //found this query in the from google
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
      }
    `;
    //Using Post method because in GraphQL we use post method to send query
    const response = await axios.post(leetcode_API_URL, {
        query,
        variables: { username },
      });

    // console.log(response.data.data.submitStats.acSubmissionNum);
    console.log(response.data.data.matchedUser.submitStats);
    
    return response.data.data.matchedUser;
  } catch (error) {
    console.error("Error fetching LeetCode data:", error.message);
    throw new ApiError(500, "Error fetching LeetCode data");
  }
};


export default fetchLeetCodeData;
