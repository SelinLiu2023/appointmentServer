import { User } from "../mongoose.js";
import mongoose  from "mongoose";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const RESULT_LIST_LIMIT = 30;
export  const checkUserExists = async (req,res,next)=>{
    try {
        const {email, password} = req.body;
        // const user = await User.findOne({ email: email, password: password });
        const user = await User.findOne({ email: email});

        if(!user){
            const err = new Error("Invalid email or password");
            err.status = 401;
            return next(err);
        }
        console.log("user.password", user.password)
        console.log("password", password)
        //add password bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch && (password !== user.password)) {
            const err = new Error("Invalid email or password.");
            err.status = 401;
            return next(err);
        }
        if (!user.isVerified) {
            // console.log("User email is not verified, sending verification email...");
            // // 生成一个随机验证 Token
            // const verificationToken = crypto.randomBytes(32).toString("hex");
            // // 存入数据库
            // user.verificationToken = verificationToken;
            // await user.save();
            // // 构造验证链接
            // const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;

            // const resend = new Resend('re_8h79iySu_EsVTTcumzuJXeYYyiqtuvh1s');
            // // 发送验证邮件
            // await resend.emails.send({
            //     from: "AppoimentsServer <onboarding@resend.dev>",
            //     to: [user.email],
            //     subject: "Verify your email",
            //     html: `<p>Please verify your email by clicking the link below:</p>
            //            <a href="${verificationUrl}">Verify Email</a>`,
            // });

            return res.status(403).json({ message: "Email not verified. A verification email has been sent." });
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
        const result = await User.findOne({ _id:  new mongoose.Types.ObjectId(userId)},{ email: 0, password: 0} ).populate({
            path: "createdEvents._id", // 嵌套路径，指向 Event 引用
            select: "title startTime endTime status", // 选择需要的字段
        }).populate({
            path: "receivedEvents._id", // 嵌套路径，指向 Event 引用
            select: "title startTime endTime status", // 选择需要的字段
        }).populate({
            path: "savedDrafts._id", // 嵌套路径，指向 Event 引用
            select: "title", // 选择需要的字段
        }).lean();
        const user = {
            ...result,
            createdEvents: result.createdEvents.map(event=>({
                _id: event._id._id,
                title: event._id.title,
                startTime: event._id.startTime,
                endTime: event._id.endTime,
                status:event._id.status,
                isRead: event.isRead,
            })),
            receivedEvents: result.receivedEvents.map(event=>({
                _id: event._id._id,
                title: event._id.title,
                startTime: event._id.startTime,
                endTime: event._id.endTime,
                status:event._id.status,
                isRead: event.isRead,
                creatorName: event.creatorName,
            })),
            savedDrafts: result.savedDrafts.map(event=>({
                _id: event._id._id,
                title: event._id.title,
                saveTime: event.saveTime,
            })),
        }
        console.log("user",user)

        // const user = await User.findOne({ _id:  new mongoose.Types.ObjectId(userId)},{ email: 0, password: 0} );        
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
        const {email, userName} = req.body;
        const user = await User.findOne({ email: email });  
        if(user){
            console.log("User is already registered!");
            const err = new Error("User is already registered.");
            err.status = 409;
            next(err);
            return;
        }

        //add password bcrypt hash
        const {password}= req.body;
        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        
        // const newUser = await User.create(req.body);
        const newUser = await User.create({...req.body,
                                            password:hashedPassword
                                        });
        req.newUser = newUser;

        console.log("registration, sending verification email...");
            // 生成一个随机验证 Token
            const verificationToken = crypto.randomBytes(32).toString("hex");
            // 存入数据库
            newUser.verificationToken = verificationToken;
            await newUser.save();
            // 构造验证链接
            const verificationUrl = `http://localhost:3000/verify-email?token=${verificationToken}`;
            const resend = new Resend('re_8h79iySu_EsVTTcumzuJXeYYyiqtuvh1s');
            // 发送验证邮件
            console.log("Email sent to:", newUser.email);
            const { data, error } = await resend.emails.send({
                from: "AppoimentsServer <onboarding@resend.dev>",
                to: [newUser.email],
                subject: "Verify your email",
                html: `<p>Please verify your email by clicking the link below:</p>
                        <a href="${verificationUrl}">Verify Email</a>`,
            });
            if (error) {
                console.error("Resend email error:", error);
            } else {
                console.log("Email sent successfully:", data);
            }
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query; // 获取 URL 参数中的 token

        if (!token) {
            return res.status(400).json({ message: "Invalid verification token." });
        }

        // 查找用户
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token." });
        }

        // 标记用户为已验证
        user.isVerified = true;
        user.verificationToken = null; // 清空 token，防止重复使用
        await user.save();

        res.status(200).json({ message: "Email successfully verified. You can now log in." });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

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