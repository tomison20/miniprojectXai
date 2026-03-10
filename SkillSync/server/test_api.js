import mongoose from 'mongoose';
import User from './models/User.js';
import { updateUserProfile } from './controllers/authController.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const student = await User.findById('69af0d61715099be9a024ea1');
    console.log('Original Resume Before PUT:', student.resume);

    // Mock Express Request and Response
    const req = {
        user: { _id: student._id },
        body: {
            resume: '/uploads/test-via-api.pdf'
        }
    };

    const res = {
        status: function(s) { this.statusCode = s; return this; },
        json: function(data) { console.log('Response JSON:', data.resume); }
    };

    try {
        await updateUserProfile(req, res);
    } catch(err) {
        console.error('API Error:', err);
    }

    process.exit(0);
};

runTest();
