import { User } from "../mongoose.js";
import mongoose  from "mongoose";
const RESULT_LIST_LIMIT = 30;
export  const checkUserExists = async (req,res,next)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ email: email, password: password });
        if(!user){
            const err = new Error("Invalid email or password");
            err.status = 401;
            next(err);
        }
        req.loginRes = user;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const getUser = async(req,res,next)=>{
    try {
        const userId = req.params.id;
        const user = await User.findOne({ _id:  new mongoose.Types.ObjectId(userId)},{ email: 0, password: 0} );
        if(!user){
            const err = new Error("user not found");
            err.status = 401;
            next(err);
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const addToUsersCollection =async (req,res,next)=>{
    try {
        console.log("addToUsersCollection")
        const {email} = req.body;
        const user = await User.findOne({ email: email });
        if(user){
            console.log("User is already registered!");
            const err = new Error("User is already registered.");
            err.status = 409;
            next(err);
            return;
        }
        const newUser = await User.create(req.body);
        req.newUser = newUser;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const searchUsers = async(req, res, next)=>{
    try {
        const keywords = req.query.keywords?.split(/[\s,]+/) || [];
        const limit = parseInt(req.query.limit) || RESULT_LIST_LIMIT; 
        if (keywords.length === 0) {
            return res.status(400).json({ error: "Keywords are required" });
            const error = new Error("Keywords are required");
            error.status = 400;
            throw error;
        }
        const result = await User
            .find(
                { $text: { $search: keywords.join(" ") } },
                { _id: 1, userName: 1 } 
            )
            .sort({ score: { $meta: "textScore" } })
            .limit(limit) 
            .exec();
        req.result = result;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}