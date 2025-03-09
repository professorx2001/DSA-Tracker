import axios from "axios";
import * as cheerio from "cheerio";
import ApiError from "../utils/apiError.js";

//Using cheerio for web scarping because we GFG doesn't provide any API

const fetchGeeksForGeeksData = async (username) => {
  const geeksforgeeksPractice_URl = `https://www.geeksforgeeks.org/user/${username}`;
  try {
    const response = await axios.get(geeksforgeeksPractice_URl);
    
    const $ = cheerio.load(response.data);


    const rank = $(
      ".educationDetails_head_left_userRankContainer--text__wt81s b"
    )
      .text()
      .trim()
      .replace("Rank", "");
    const easy = $('.problemNavbar_head_nav--text__UaGCx:contains("EASY")')
      .text()
      .match(/\d+/)[0];
    const medium = $('.problemNavbar_head_nav--text__UaGCx:contains("MEDIUM")')
      .text()
      .match(/\d+/)[0];
    const hard = $('.problemNavbar_head_nav--text__UaGCx:contains("HARD")')
      .text()
      .match(/\d+/)[0];
    const total = String(parseInt(easy) + parseInt(medium) + parseInt(hard));

    //Structuring the data similar to leetcode so that it can be used in the similarly.
    const data = {
      username,
      rank,
      submitStats: {
        acSubmissionNum: [
          {
            difficulty: "All",
            count: total,
          },
          {
            difficulty: "Easy",
            count: easy,
          },
          {
            difficulty: "Medium",
            count: medium,
          },
          {
            difficulty: "Hard",
            count: hard,
          },
        ],
      },
    };
    console.log(data.submitStats.acSubmissionNum)
    return data;
  } catch (error) {
    console.error("Error fetching GeeksForGeeks data:", error.message);
    throw new ApiError(500, "Error fetching GeeksForGeeks data");
  }
};

export default fetchGeeksForGeeksData;
