import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Find the specific user
  const student = await User.findById('69af0d61715099be9a024ea1');
  if (!student) {
    console.log('No student found');
    process.exit(1);
  }

  console.log('Found student:', student.email);
  console.log('Original Resume:', student.resume);

  student.resume = '/uploads/test-resume.pdf';
  await student.save();

  const refreshed = await User.findById(student._id);
  console.log('Updated Resume:', refreshed.resume);

  process.exit(0);
};

runTest();
