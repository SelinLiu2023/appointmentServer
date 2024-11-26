import { MongoClient } from "mongodb";

const uri = 'mongodb://localhost:27017';
const dbName = 'yourAppointments';
const client = new MongoClient(uri);
const db = client.db(dbName);

export const usersDB = db.collection("users");
export const groupsDB = db.collection("groups");
export const eventsDB = db.collection("events");
export async function connectToDb() {
    try {
        if (!client.isConnected?.()) {
            await client.connect();
            console.log('Connected to MongoDB!');
        }
    } catch (error) {
        console.error('Connection failed:', error);
        throw error;
    } 
}
