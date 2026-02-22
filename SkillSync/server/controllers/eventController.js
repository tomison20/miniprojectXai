import Event from '../models/Event.js';
import crypto from 'crypto';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer)
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, roles } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            roles,
            organizer: req.user._id,
            organization: req.user.organization // Multi-tenant scoping
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private (Student/Organizer) - Updated access level for clarity
export const getEvents = async (req, res) => {
    try {
        // Scoped to organization
        const query = {
            organization: req.user.organization
        };

        const events = await Event.find(query).populate('organizer', 'name').sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');
        if (event) res.json(event);
        else {
            res.status(404);
            throw new Error('Event not found');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
export const registerForEvent = async (req, res) => {
    try {
        const { role } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        const roleData = event.roles.find(r => r.name === role);
        if (!roleData || roleData.filled >= roleData.capacity) {
            res.status(400);
            throw new Error('Role unavailable');
        }

        if (event.volunteers.some(v => v.user.toString() === req.user._id.toString())) {
            res.status(400);
            throw new Error('Already registered');
        }

        // Generate QR Hash simulation
        const qrHash = crypto.randomBytes(16).toString('hex');

        event.volunteers.push({
            user: req.user._id,
            role,
            attendanceHash: qrHash
        });

        roleData.filled += 1;
        await event.save();

        res.status(201).json({ message: 'Registered', qrCode: qrHash });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Verify Attendance (QR Scan Simulation)
// @route   POST /api/events/:id/verify
// @access  Private (Organizer)
export const verifyAttendance = async (req, res) => {
    try {
        const { qrHash } = req.body;
        const event = await Event.findById(req.params.id);

        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized');
        }

        const volunteer = event.volunteers.find(v => v.attendanceHash === qrHash);
        if (!volunteer) {
            res.status(404);
            throw new Error('Invalid QR Code');
        }

        if (volunteer.status === 'attended') {
            res.status(400);
            throw new Error('Already marked present');
        }

        volunteer.status = 'attended';
        await event.save();

        res.json({ message: 'Attendance verified', user: volunteer.user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
