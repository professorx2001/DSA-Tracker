import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Platform }from "./index.js"

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim : true,
    },
    username: {
        //by default I will take Leetcode username
        type: String,
        unique: true,
        required : true,
        trim : true,
        lowercase : true

    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum : ["user", "admin"]
    },
    avatar: {
        type: String,
        default: ""
    },
    aboutMe: {
        type: String,
        default: ""
    },
    school: {
        type: String,
        default: ""
    },
    countryName: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    jobTitle: {
        type: String,
        default: ""
    },
    refreshToken : {
        type : String
    },
    platforms : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Platform"
        }
    ]
}, {timestamps: true}
); 


userSchema.methods.isPasswordMatch = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        userId: this._id,
        email: this.email,
        username: this.username,
        role: this.role
    }, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}   
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        userId: this._id,
    }, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}   

const User = mongoose.model("User", userSchema);
export default User;

