import { User } from "../mongoose.js";
const RESULT_LIST_LIMIT = 10;

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
        await User.create(req.body);
        console.log("Document inserted successfully!");
        next();
    } catch (error) {
        console.log(error);

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
        // const regexConditions = keywords.map((kw) => ({
        //     $or: [
        //         { userName: { $regex: kw, $options: "i" } }, // 模糊匹配用户名
        //         { email: { $regex: kw, $options: "i" } }, // 模糊匹配邮箱
        //     ],
        // }));

        const result = await User
            .find(
                { $text: { $search: keywords.join(" ") } },
                { _id: 1, userName: 1 } 
            )
            // .sort({ name: 1 }) // 按用户名排序
            .sort({ score: { $meta: "textScore" } })
            .limit(limit) // 限制结果数量
            .exec();

        req.result = result;

        next();
    } catch (error) {
        console.log(error);

        next(error);
    }
}