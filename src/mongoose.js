import mongoose  from "mongoose";
const uri = 'mongodb://localhost:27017';
const dbName = 'myAppointments';
export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/myAppointments");
        console.log("MongoDB connected myAppointments!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        // process.exit(1);
        throw error;
    }
};
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
        }
    ],

    receivedEvents:[
        {
            _id: {type: mongoose.Schema.Types.ObjectId, ref: "Event"},
            creatorName:{ type: String}, 
            title:{ type: String},
            startTime:{ type: String},
            endTime:{ type: String},
        }
    ],
});

userSchema.index({ userName: "text", email: "text" });

const eventSchema = new mongoose.Schema({
    title: { type: String},
    isReadByCreator: { type: Boolean},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
            isJoinIn: { type: Boolean },
            isRead: { type: Boolean },
            feedback: { type: String },
        },
    ],
    tasks: [
        {
            title: { type: String },
            description: { type: String },
            performerCount: { type: Number },
            performers:[
                {type: mongoose.Schema.Types.ObjectId, ref: "User"} 
            ]
        },
    ],
    wishes: [
        {
            title: { type: String },
            description: { type: String },
            providerCount: { type: Number },
            providers:[
                {type: mongoose.Schema.Types.ObjectId, ref: "User"} 
            ]
        },
    ]
});

export const User = mongoose.model("user", userSchema);
export const Event = mongoose.model("event", eventSchema);
