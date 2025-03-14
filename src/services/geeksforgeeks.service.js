import axios from "axios";
import * as cheerio from "cheerio";
import ApiError from "../utils/apiError.js";

//Using cheerio for web scarping because we GFG doesn't provide any API

const fetchGeeksForGeeksData = async (username) => {
  const geeksforgeeksPractice_URl = `https://www.geeksforgeeks.org/user/${username}`;
  try {
    const response = await axios.get(geeksforgeeksPractice_URl);

    const $ = cheerio.load(response.data);

    const instituteRank = $(
      ".educationDetails_head_left_userRankContainer--text__wt81s b"
    )
      .text()
      .trim()
      .replace("Rank", "");

    const contestRating = $(".scoreCard_head__nxXR8")
      .find('.scoreCard_head_left--text__KZ2S1:contains("Contest Rating")')
      .siblings(".scoreCard_head_left--score__oSi_x")
      .text()
      .trim();

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

    const data = {
      username,
      rank: instituteRank || "Not Ranked",
      contestRating: isNaN(Number(contestRating)) ? 0 : Number(contestRating),
      total: total,
      easy: easy || "0",
      medium: medium || "0",
      hard: hard || "0",
    };
    // console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching GeeksForGeeks data:", error.message);
    throw new ApiError(500, "Error fetching GeeksForGeeks data");
  }
};

export default fetchGeeksForGeeksData;
