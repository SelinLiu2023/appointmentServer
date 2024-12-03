import { User } from "../mongoose.js";
import { Event } from "../mongoose.js";
import mongoose  from "mongoose";
export const addNewEvent =async (req,res,next)=>{
    try {
        const newEventData = req.body;
        const {createdBy} = newEventData;
        if(!mongoose.Types.ObjectId.isValid(newEventData.createdBy)){
        console.log("wrong id", newEventData.createdBy);
        const err = new Error("wrong id");
        throw err;
        }
        newEventData.gasts = newEventData.gasts.map(gast =>({
            ...gast,
        }));
        const newEvent = await Event.create(newEventData);
        const newEventId = newEvent._id;
        newEventData.id = newEventId;
        await User.updateOne(
            { _id: createdBy },
            { $push: { createdEvents: {_id: newEventId,
                        title: newEvent.title,
                        startTime:newEvent.startTime,
                        endTime: newEvent.endTime,
                        status: 0,
                        isRead: true
                    } } }
        );
        const gastsAsObjectIds = newEvent.gasts.map((gast) => gast._id);
        await User.updateMany(
            { _id: { $in: gastsAsObjectIds } },
            { $push: { receivedEvents: {_id: newEventId,
                                    creatorName: newEvent.creatorName,
                                    title: newEvent.title,
                                    startTime:newEvent.startTime,
                                    endTime: newEvent.endTime,
                                    status: 0,
                                    isRead: false } } }
        );
        req.newEventId = newEventId;
        next();

    } catch (error) {
        console.log(error)
        next(error);
    }
};
export const findOneEvent =async (req,res,next)=>{
    try {

        const { id, userId } = req.body;
        const eventObjectId = new mongoose.Types.ObjectId(id);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const event = await Event.findOne({_id : eventObjectId});
        if(userId === event.createdBy.toString()){
            await User.updateOne({_id: userObjectId, "createdEvents._id": eventObjectId}, {$set: {"createdEvents.$.isRead" : true}})
        }else if (event.gasts.find(gast=>gast._id.equals(userObjectId))){
            await User.updateOne({_id: userObjectId, "receivedEvents._id": eventObjectId}, {$set: {"receivedEvents.$.isRead" : true}})
        }
        req.event = event;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const updateInvitation =async (req,res, next)=>{
    try {
        const id = req.params.id;
        const eventObjectId = new mongoose.Types.ObjectId(id);
        if(req.body.editByCreator === 1) next();
        const {action, guestId, isJoinIn,tasks, guestName} = req.body;
        const guestObjectId = new mongoose.Types.ObjectId(guestId);
        //no task
        const findEvent = await Event.findOneAndUpdate({ _id: eventObjectId, "gasts._id": guestObjectId},
        {$set: {"gasts.$.isJoinIn": isJoinIn}});
        await User.updateOne({_id: findEvent.createdBy, "createdEvents._id": eventObjectId}, {$set: {"createdEvents.$.isRead" : false, "createdEvents.$.status" : 1}})
        if(action === 0){
            req.result = result;
            res.status(200).json(req.result);
            return;
        }else if(action === 1){
            let tasksCount = tasks.length;
            let updated = false;
            const event = await Event.findOne({ _id: eventObjectId});
            const guest = event.gasts.find(gast=>gast._id.toString() === guestId);
            guest.isJoinIn = isJoinIn;
            for(let item of tasks){
                const findTask = event.tasks.find(task=> task.id == item);
                if(findTask.performerCount > findTask.performers.length &&  !findTask.performers.find(performer=>performer._id.toString() === guestId)){
                    findTask.performers.push({_id: guestObjectId, userName:guestName});
                    updated = true;
                    tasksCount--;
                }else if(findTask.performers.find(performer=>performer._id.toString() === guestId)){
                    findTask.performers = findTask.performers.filter(performer=>performer._id.toString() !== guestId);
                    updated = true;
                    tasksCount--;
                }
            }
            if(updated){
                await event.save();
                req.event = event;
                console.log(event)
            }
            if(tasksCount === 0){
                req.updateCompleted =true;
            }else{
                req.updateCompleted =false;
            }
            res.status(200).json({event:req.event,updateCompleted:req.updateCompleted});
            return;
        }else if(action == -1){
            const result = await Event.updateOne(
                {_id :eventObjectId},
                {$pull: {"tasks.$[elem].performers": {_id: guestObjectId}}},
                {arrayFilters:[
                    {"elem.id": {$in: tasks}}
                ]}
                );
            req.result = result;
            res.status(200).json(req.result);
            return;
        }
        next();
    } catch (error) {
        console.log(error)
    }
};
export const updateEvent =async (req,res, next)=>{
    try {
        const id = req.params.id;
        const eventObjectId = new mongoose.Types.ObjectId(id);
        const event = await Event.findOne({_id: eventObjectId});
        const newGuestsIds = req.body.gasts.map(guest=>guest._id);
        const oldGuestsIds = event.gasts.map(guest=>guest._id.toString());
        const addGuests = newGuestsIds.filter(guest=>!oldGuestsIds.find(item=>item=== guest)).map(item=>new mongoose.Types.ObjectId(item));
        await User.updateOne({_id: event.createdBy, "createdEvents._id": eventObjectId}, {$set: {"createdEvents.$.isRead" : true, "createdEvents.$.status" : 1}})
        const userUpdate = await User.updateMany({_id: {$in: newGuestsIds}, "receivedEvents._id": eventObjectId}, {$set: {"receivedEvents.$[elem].isRead" : false, "receivedEvents.$[elem].status" : 1}}, {arrayFilters: [{"elem._id" : eventObjectId}]});
        if(addGuests.length >0){
            const result = await User.updateMany({_id: {$in: addGuests} }, {$push: {receivedEvents: {_id: event._id,
                                                    creatorName: event.creatorName,
                                                    title: event.title,
                                                    startTime:event.startTime,
                                                    endTime: event.endTime,
                                                    status : 0,
                                                    isRead: false } }});
        }
        const deleteGuests = oldGuestsIds.filter(guest=>!newGuestsIds.find(item=>item=== guest)).map(item=>new mongoose.Types.ObjectId(item));
        if(deleteGuests.length >0){
            await User.updateMany({_id: {$in: deleteGuests} }, {$pull: {receivedEvents: {_id: event._id}}});
        }
        const result = await Event.replaceOne({_id: eventObjectId}, req.body);
        req.result= result;
        next();
    } catch (error) {
        console.log(error);
    }
};