// import { eventsDB } from "../db.js";
import { User } from "../mongoose.js";
// import { ObjectId } from "mongodb";
import { Event } from "../mongoose.js";
import mongoose  from "mongoose";

export const addNewEvent =async (req,res,next)=>{
   try {
    console.log("addNewEvent");
      const newEventData = req.body;
      const {createdBy} = newEventData;
      if(!mongoose.Types.ObjectId.isValid(newEventData.createdBy)){
        console.log("wrong id", newEventData.createdBy);
        const err = new Error("wrong id");
        throw err;
    }
    console.log("event",newEventData);
    newEventData.isReadByCreator = false;
        newEventData.gasts = newEventData.gasts.map(gast =>({
            ...gast,
            isRead:false,
            // isJoinIn:false,

        }));
        const newEvent = await Event.create(newEventData);

       const newEventId = newEvent._id;
       newEventData.id = newEventId;
 

       // // 更新创建者的 createdEvents 数组
       await User.updateOne(
           { _id: createdBy },
           { $push: { createdEvents: {_id: newEventId,
                                        // creatorName: newEvent.creatorName,
                                        title: newEvent.title,
                                        startTime:newEvent.startTime,
                                        endTime: newEvent.endTime} } }
       );
  
       // // 更新所有客人的 receivedEvents 数组
       const gastsAsObjectIds = newEvent.gasts.map((gast) => gast._id);
       // console.log(gastsAsObjectIds);
    //    const matchedDocs = await User.find({ _id: { $in: gastsAsObjectIds } });
       // console.log("matchedDocs",matchedDocs);

       await User.updateMany(
           { _id: { $in: gastsAsObjectIds } },
           { $push: { receivedEvents: {_id: newEventId,
                                        creatorName: newEvent.creatorName,
                                        title: newEvent.title,
                                        startTime:newEvent.startTime,
                                        endTime: newEvent.endTime } } }
       );
  
       // 返回创建者的完整信息，包括更新后的 createdEvents 和 receivedEvents
    //    const creator = await User.findOne(
    //        { _id: createdBy }
    //    );
  
       // console.log('Updated Creator:', creator);
       req.newEventId = newEventId;

       // console.log("newEventId", req.newEventId)
       next();

   } catch (error) {
    console.log(error)
       next(error);
   }
}
export const findOneEvent =async (req,res,next)=>{
   try {

       const { id, userId } = req.body;

       const query = {
           _id: id,
           createdBy: userId
       }
       const event = await Event.findOne(query);
       if(event.createdBy._id.toString() === userId){
            event.isReadByCreator = true;
       }
       for(let gast of event.gasts){
        if(gast._id.toString() === userId){
            gast.isRead = true;
        }
       }
       await event.save();
       console.log("findOneEvent", event);

       req.event = event;
       next();
   } catch (error) {
    console.log(error);
       next(error);
   }
}
export const findEvent =async (req,res,next)=>{
    try {
 
        const { ids, userId } = req.body;
 
        const query = {
            _id: { $in: ids },
            createdBy: userId
        }
        const events = await Event.find(query);
        console.log("findEvent", events);
 
        req.events = events;
        next();
    } catch (error) {
        console.log(error);

        next(error);
    }
 }