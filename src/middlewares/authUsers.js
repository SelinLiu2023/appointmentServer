import { usersDB } from "../db.js";


const RESULT_LIST_LIMIT = 10;
export  const checkUserExists = async (req,res,next)=>{
    try {
        const user = await usersDB.findOne({ email: req.body.email });
        req.loginRes = {};
        req.loginRes.userName = user.userName;
        req.loginRes.id = user._id;
        req.body.isUserExists = true;
        next();
        // console.log(user);
    } catch (error) {
        next(error);
    }
}
export const addToUsersCollection =async (req,res,next)=>{
    try {
        const user = await usersDB.findOne({ email: req.body.email });
        if(user !== null){
            const error = new Error("User is already registered.");
            error.status = 409;
            throw error;
        }
        await usersDB.insertOne(req.body);
        next();

    } catch (error) {
        next(error);
    }
}
export const searchUsers = async(req, res, next)=>{
    try {
        const keywords = req.query.keywords?.split(/[\s,]+/) || [];

        const limit = parseInt(req.query.limit) || RESULT_LIST_LIMIT; // 限制返回结果数量
        if (keywords.length === 0) {
            return res.status(400).json({ error: "Keywords are required" });
            const error = new Error("Keywords are required");
            error.status = 400;
            throw error;
        }
        const regexConditions = keywords.map((kw) => ({
            $or: [
                { userName: { $regex: kw, $options: "i" } }, // 模糊匹配用户名
                { email: { $regex: kw, $options: "i" } }, // 模糊匹配邮箱
            ],
        }));

        req.body.result = await usersDB
            .find(
                {$and: regexConditions},
                { projection: { _id: 1, userName: 1 } }
            )
            // .sort({ name: 1 }) // 按用户名排序
            .limit(limit) // 限制结果数量
            .toArray();

        next();
    } catch (error) {
        next(error);
    }
}