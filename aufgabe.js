import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    "name": {type: String, minlength:3, required:true},
    "description": {type: String},
    "price": {type: Number, min:0.001, required: true},
    "category": {type: String, enum: ["Elektronik","Kleidung","Bücher"],required: true},
    "quantityInStock" : {type: Number, min: 0, default: 0 },
    "lastModified" : {type: Date, default: Date.now},
});

const userSchema = new mongoose.Schema({
    "firstName" :{type: String, minlength:2, required:true},
    "lastName" :{type: String, minlength:2, required:true},
    "email":{type: String,required:true, unique: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/]},
    "password": {
        type: String,
        required: true,
        minlength: 8
    },
    orders:[{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
    }]
});

const orderSchema = new mongoose.Schema({
    "createdBy" : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    "productsList" : [{
        _id: {type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        "quantity": {type: Number, min: 1, required: true},
    }],
    "status" : {type: String, enum: ["offen","bezahlt","versandt"],required: true, default : "offen"},
    "created" : {type: Date, default: Date.now},
    "totalPrice": {type: Number, min: 0.01, required: true},
});