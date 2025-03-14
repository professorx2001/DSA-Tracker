import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ApiError, asyncHandler } from "../utils/index.js";

 const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
        throw new ApiError(401, "Authorization token not found.");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(decodedToken?.userId).select("-password -refreshToken -watchHistory");
        
        if (!user) {
            throw new ApiError(401, "User not found.");
        }

        req.user = user;
        next(); 

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token expired. Please log in again.");
        }
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid access token.");
        }
        throw new ApiError(401, error.message || "Authentication failed.");
    }
});

export default verifyJWT;