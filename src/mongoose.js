import { MongoNetworkError } from "mongodb";
import mongoose  from "mongoose";
const uri = 'mongodb://localhost:27017';
const dbName = 'myAppointments';
export const connectDB = async () => {
    try {
        // mongoose.connection.on("error",()=>{
        //     console.log()
        // })
        // mongoose.connection.on("connect",()=>{
        //     console.log()
        // })
        await mongoose.connect("mongodb://localhost:27017/myAppointments");
        console.log("MongoDB connected myAppointments!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        // process.exit(1);
        throw error;
    }
};
// export const connectDB = 
const userSchema = new mongoose.Schema({
    userName: { type: String},
    email: { type: String, select: false, required: true  },
    password: { type: String, select: false, required: true },
    mobileNumber: { type: String },
    otherContact: { type: String },
    createdEvents:[
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref: "Event"},
            title:{ type: String},
            startTime:{ type: String},
            endTime:{ type: String},
            status: { type: Number},
            isRead: { type: Boolean}
        }
    ],

    receivedEvents:[
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref: "Event"},
            creatorName:{ type: String}, 
            title:{ type: String},
            startTime:{ type: String},
            endTime:{ type: String},
            status: { type: Number},
            isRead: { type: Boolean}
        }
    ],
    savedDrafts:[
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref: "Event"},
            title:{ type: String},
            saveTime: { type: Date},
        }
    ]
});

userSchema.index({ userName: "text", email: "text" });

const eventSchema = new mongoose.Schema({
    title: { type: String},
    // isReadByCreator: { type: Boolean},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: Number },
    creatorName :{ type: String},
    mobileNumber: { type: String },
    otherContact: { type: String },
    type: { type: String},
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    address: { type: String},
    description: { type: String},
    canceled: { type: Boolean},
    gasts: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            userName: { type: String },
            isJoinIn: { type: Number },
            isRead: { type: Boolean },
            feedback: { type: String },
        },
    ],
    tasks: [
        {
            title: { type: String },
            description: { type: String },
            performerCount: { type: Number },
            id: { type: String },
            performers:[
                {
                    _id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
                    userName: { type: String },
                }
            ]
        },
    ],
    wishes: [
        {
            title: { type: String },
            description: { type: String },
            providerCount: { type: Number },
            id: { type: String },
            providers:[
                {
                    _id: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
                    userName: { type: String },
                }
            ]
        },
    ],
},{ versionKey: false });
const draftSchema = new mongoose.Schema({
    "title": {type: String},
},{ timestamps: true });
export const Draft = mongoose.model("draft", eventSchema);
export const User = mongoose.model("user", userSchema);
export const Event = mongoose.model("event", eventSchema);
