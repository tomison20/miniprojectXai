import EventParticipation from '../models/EventParticipation.js';
import Event from '../models/Event.js';
import Gig from '../models/Gig.js';
import Portfolio from '../models/Portfolio.js';
import Achievement from '../models/Achievement.js';

// @desc    Get participation history
// @route   GET /api/participation
export const getMyParticipation = async (req, res) => {
    try {
        const history = await EventParticipation.find({
            student: req.user._id,
            organization: req.user.organization
        }).populate('event', 'title date location');
        res.json(history);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Log participation (Organizer marks student as attended)
// @route   POST /api/participation/verify
export const verifyParticipation = async (req, res) => {
    try {
        const { studentId, eventId, hours } = req.body;

        // Ensure student and event belong to the same institution
        const participation = await EventParticipation.findOneAndUpdate(
            { student: studentId, event: eventId, organization: req.user.organization },
            {
                status: 'completed',
                hoursContributed: hours,
                verifiedAt: Date.now()
            },
            { upsert: true, new: true }
        );

        res.json(participation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get total contribution stats (aggregated from all activity)
// @route   GET /api/participation/stats
export const getMyStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const orgId = req.user.organization;

        // 1. EventParticipation hours (verified events)
        const participationResult = await EventParticipation.aggregate([
            { $match: { student: userId, status: 'completed' } },
            { $group: { _id: null, totalHours: { $sum: "$hoursContributed" }, count: { $sum: 1 } } }
        ]);
        const participation = participationResult[0] || { totalHours: 0, count: 0 };

        // 2. Volunteer events attended (status = 'attended')
        const eventsAttended = await Event.countDocuments({
            organization: orgId,
            'volunteers': { $elemMatch: { user: userId, status: 'attended' } }
        });

        // 3. Volunteer events registered
        const eventsRegistered = await Event.countDocuments({
            organization: orgId,
            'volunteers': { $elemMatch: { user: userId, status: 'registered' } }
        });

        // 4. Completed gigs (assigned to this student and completed)
        const gigsCompleted = await Gig.countDocuments({
            organization: orgId,
            assignedTo: userId,
            status: 'completed'
        });

        // 5. Active gigs (assigned/submitted)
        const gigsActive = await Gig.countDocuments({
            organization: orgId,
            assignedTo: userId,
            status: { $in: ['assigned', 'submitted'] }
        });

        // 6. Portfolio projects count
        const portfolioCount = await Portfolio.countDocuments({
            student: userId,
            organization: orgId
        });

        // 7. Achievements count
        const achievementCount = await Achievement.countDocuments({
            student: userId,
            organization: orgId
        });

        // --- Calculate totals ---
        // Total contribution hours: verified hours + 2h per attended event + 3h per completed gig
        const totalHours = participation.totalHours
            + (eventsAttended * 2)
            + (gigsCompleted * 3);

        // Activities completed = verified participations + attended events + completed gigs
        const completedActivities = participation.count
            + eventsAttended
            + gigsCompleted;

        // SkillSync Score: weighted formula
        // - 10 pts per contribution hour
        // - 15 pts per completed gig
        // - 10 pts per attended event
        // - 5 pts per portfolio project
        // - 8 pts per achievement
        // - 2 pts per active event registration
        // - 5 pts per active gig
        const contributionScore =
            (totalHours * 10)
            + (gigsCompleted * 15)
            + (eventsAttended * 10)
            + (portfolioCount * 5)
            + (achievementCount * 8)
            + (eventsRegistered * 2)
            + (gigsActive * 5);

        res.json({
            totalHours,
            completedActivities,
            contributionScore
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

