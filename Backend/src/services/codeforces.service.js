import axios from "axios";
import ApiError from "../utils/apiError.js";


const fetchCodeforcesData = async (username) => {
    const codeforces_API_URL = `https://codeforces.com/api/user.info?handles=${username}&checkHistoricHandles=false`;
    //Passing checkHistoricHandles=false to get the current user info only not their previous handles/username changes.
    try {
        const response = await axios.get(codeforces_API_URL);

        console.log(response.data.result[0]);

        return response.data.result[0];
    } catch (error) {
        console.error("Error fetching Codeforces data:", error.message);
        throw new ApiError(500, "Error fetching Codeforces data");
    }
};

export default fetchCodeforcesData;
