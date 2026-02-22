import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Multi-tenant Scoping
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    image: { type: String }, // Cover image for the event

    roles: [{
        name: String, // e.g., "Usher", "Photographer"
        description: String,
        capacity: Number,
        filled: { type: Number, default: 0 }
    }],

    volunteers: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String, // Must match one of the roles.name
        status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
        registeredAt: { type: Date, default: Date.now },
        attendanceHash: { type: String } // For QR verification
    }],

    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },

    createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
