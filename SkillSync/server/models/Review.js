import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Organizer
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Freelancer
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
