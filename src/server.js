import express from "express";
import cors from "cors";
import { checkUserExists } from "./middlewares/authUsersMongoose.js";
import { addToUsersCollection } from "./middlewares/authUsersMongoose.js";
import { searchUsers } from "./middlewares/authUsersMongoose.js";
// import { addToGroupCollection } from "./middlewares/groups.js";
import { addNewEvent } from "./middlewares/eventMongoose.js"
import { findOneEvent } from "./middlewares/eventMongoose.js";
import { updateInvitation } from "./middlewares/eventMongoose.js";
import { connectDB } from "./mongoose.js";
import { updateEvent } from "./middlewares/eventMongoose.js";
const app = express();
const port = 3000;

app.use(cors());


app.use(express.json());
app.use((req,res, next)=>{
    console.log("request received", req.body);
    next();
});

(async () => {
    try {
            // 初始化数据库连接
    await connectDB();

    app.post("/login",[checkUserExists], (req,res)=>{
        console.log("req.loginRes",req.loginRes);
        res.status(200).json(req.loginRes);
    });
    
    app.post("/register", [addToUsersCollection],(req,res)=>{
        console.log("req.newUser",req.newUser);
        res.status(200).json(req.newUser);
    });
    app.get("/search",[searchUsers],(req,res)=>{
        console.log(req.result);
        res.status(200).json(req.result);
    });
    // app.post("/group",[addToGroupCollection],(req,res)=>{
    //     // console.log(req.body);
    //     res.status(200).json(req.body.result);
    // });
    app.post("/event",[addNewEvent],(req,res)=>{
        res.status(200).json(req.newEventId);
    });
    app.patch("/event/:id",[updateInvitation],(req,res)=>{
        // res.status(200).json({event:req.event,updateCompleted:req.updateCompleted});
    });
    app.put("/event/:id",[updateEvent],(req,res)=>{
        res.status(200).json({result: req.result});
    });
    app.post("/api/files/query",[findOneEvent],(req,res)=>{

        res.status(200).json(req.event);
    });
    app.use((err, req, res, next)=>{
        // console.error(err.stack);
        res.status(err.status || 400).json({ message: err.message });
    });
    app.listen(port,()=>{
        console.log(`Server started at port : ${port}`);
    });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1); // 连接失败时退出进程
    }

    })();