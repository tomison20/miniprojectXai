import Event from '../models/Event.js';
import crypto from 'crypto';
import * as XLSX from 'xlsx';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer)
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, roles, coOrganizers } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            roles,
            organizer: req.user._id,
            coOrganizers: coOrganizers || [],
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
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email organization')
            .populate('coOrganizers', 'name email avatar')
            .populate('volunteers.user', 'name email avatar headline');
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

        if (event.organizer.toString() !== req.user._id.toString() && !event.coOrganizers.some(id => id.toString() === req.user._id.toString())) {
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

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer)
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        if (event.organizer.toString() !== req.user._id.toString() && !event.coOrganizers.some(id => id.toString() === req.user._id.toString())) {
            res.status(403);
            throw new Error('Not authorized to update this event');
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        if (event.organizer.toString() !== req.user._id.toString() && !event.coOrganizers.some(id => id.toString() === req.user._id.toString())) {
            res.status(403);
            throw new Error('Not authorized to delete this event');
        }

        await event.deleteOne();

        res.json({ message: 'Event removed perfectly' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove a volunteer from an event
// @route   DELETE /api/events/:id/volunteers/:volunteerId
// @access  Private (Organizer)
export const removeVolunteer = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        if (event.organizer.toString() !== req.user._id.toString() && !event.coOrganizers.some(id => id.toString() === req.user._id.toString())) {
            res.status(403);
            throw new Error('Not authorized');
        }

        // Find the volunteer to adjust role counts
        const volunteerIndex = event.volunteers.findIndex(v => v._id.toString() === req.params.volunteerId);
        
        if (volunteerIndex === -1) {
            res.status(404);
            throw new Error('Volunteer record not found');
        }

        const volunteerRole = event.volunteers[volunteerIndex].role;
        const roleData = event.roles.find(r => r.name === volunteerRole);

        if (roleData && roleData.filled > 0) {
            roleData.filled -= 1;
        }

        event.volunteers.splice(volunteerIndex, 1);
        await event.save();

        res.json({ message: 'Volunteer removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Export volunteer list to Excel for an event
// @route   GET /api/events/:id/export
// @access  Private (Organizer)
export const exportEventVolunteers = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('volunteers.user', 'name email headline course'); 

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user._id.toString() && !event.coOrganizers.some(id => id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = event.volunteers.map(vol => ({
            'Name': vol.user?.name || 'Unknown',
            'Email': vol.user?.email || 'N/A',
            'Class/Course': vol.user?.course || 'N/A',
            'Headline': vol.user?.headline || 'N/A',
            'Role': vol.role,
            'Attendance Status': vol.status,
            'Registered At': new Date() // Since we don't have individual timestamps, just log export date or omit.
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Event Registrations');

        worksheet['!cols'] = [
            { wch: 30 }, { wch: 35 }, { wch: 25 }, { wch: 40 },
            { wch: 25 }, { wch: 20 }, { wch: 15 }
        ];

        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        const filename = `event_registrations_${event.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
