     import { eventsDB } from "../db.js";
     import { usersDB } from "../db.js";
     import { ObjectId } from "mongodb";

     export const addNewEvent =async (req,res,next)=>{
        try {
           const newEventData = req.body;
           console.log("event",newEventData);

            const result = await eventsDB.insertOne(newEventData);
            const newEventId = result.insertedId;
            newEventData.id = newEventId;
            if(!ObjectId.isValid(newEventData.createdBy)){
                console.log("wrong id", newEventData.createdBy);

            }
            const objectId = new ObjectId(newEventData.createdBy);

            // // 更新创建者的 createdEvents 数组
            await usersDB.updateOne(
                { _id: objectId },
                { $push: { createdEvents: newEventId } }
            );
       
            // // 更新所有客人的 receivedEvents 数组
            const gastsAsObjectIds = newEventData.gasts.map((id) => new ObjectId(id));
            // console.log(gastsAsObjectIds);
            const matchedDocs = await usersDB.find({ _id: { $in: gastsAsObjectIds } }).toArray();
            // console.log("matchedDocs",matchedDocs);

            await usersDB.updateMany(
                { _id: { $in: gastsAsObjectIds } },
                { $push: { receivedEvents: newEventId } }
            );
       
            // 返回创建者的完整信息，包括更新后的 createdEvents 和 receivedEvents
            const creator = await usersDB.findOne(
                { _id: objectId }
            );
       
            // console.log('Updated Creator:', creator);
            req.newEventId = newEventId;

            // console.log("newEventId", req.newEventId)
            next();
    
        } catch (error) {
            next(error);
        }
    }
    export const findEvent =async (req,res,next)=>{
        try {
            console.log("findEvent",req.body);

            const { ids, userId } = req.body;
            const eventsObjectId = ids.map(eventId =>new ObjectId(eventId));
            const usersObjectId = new ObjectId(userId);
            console.log("eventsObjectId",eventsObjectId);
            console.log("usersObjectId",userId);

            const query = {
                _id: { $in: eventsObjectId },
                createdBy: userId
            }
            const events = await eventsDB.find(query).toArray();
            console.log("findEvent", events);

            req.events = events;
            next();
        } catch (error) {
            next(error);
        }
    }