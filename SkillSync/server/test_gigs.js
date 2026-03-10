import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Gig from './models/Gig.js';

dotenv.config();

const testGigs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const gigs = await Gig.find().populate('organizer').lean();
        console.log(JSON.stringify(gigs, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
};

testGigs();
