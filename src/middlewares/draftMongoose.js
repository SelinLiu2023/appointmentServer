import mongoose from "mongoose";
import { Draft } from "../mongoose.js";
import { User } from "../mongoose.js";

export const addDraft = async(req,res,next)=>{
    try {
        const newDraftData = req.body;
        const {createdBy} = newDraftData;
        const draft = await Draft.create(newDraftData);
        const date = new Date();
        const result = await User.updateOne(
            { _id: createdBy },
            { $push: { savedDrafts: {_id: draft._id,
                        title: draft.title,
                        saveTime: date,
                    } } }
        );
        next();
    } catch (error) {
        next(error);
    }
};
export const getDraft = async(req,res,next)=>{
    try {
        const id = req.params.id;
        const draftObjectId = new mongoose.Types.ObjectId(id);
        const draft = await Draft.findOne({_id: draftObjectId});
        req.result = draft;
        next();
    } catch (error) {
        next(error);
    }
};
export const replaceDraft = async(req,res,next)=>{
    try {
        const id = req.params.id;
        const draftObjectId = new mongoose.Types.ObjectId(id);
        const {createdBy} = req.body;

        await Draft.replaceOne({_id: draftObjectId}, req.body);
        const date = new Date();
        const result = await User.updateOne(
            { _id: createdBy, "savedDrafts._id": draftObjectId },
            { $set: {
                    "savedDrafts.$.saveTime": date,
                    } } 
        );
        console.log("draft success replaced", req.body)
        req.result = result;

        next();
    } catch (error) {
        console.log(error)
        next(error);
    }
};
export const deleteDraft = async(req,res,next)=>{
    try {
        const id = req.params.id;
        const draftObjectId = new mongoose.Types.ObjectId(id);
        const draft = await Draft.findOneAndDelete({_id: draftObjectId});
        const userId = draft.createdBy;
        const result = await User.updateOne(
            { _id: userId },
            { $pull: { savedDrafts: {_id: draft._id,} } }
        );
        req.result = result;
        next();
    } catch (error) {
        next(error);
    }
};