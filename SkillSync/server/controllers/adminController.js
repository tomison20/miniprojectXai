import Organization from '../models/Organization.js';
import OrganizationRequest from '../models/OrganizationRequest.js';
import User from '../models/User.js';

// @desc    Seed Organization and Admin
// @route   POST /api/admin/seed
// @access  Public (Dev only)
export const seedData = async (req, res) => {
    try {
        const orgEncoded = {
            name: "AJCE",
            uniqueCode: "AJCE2026",
            domain: "ajce.in",
            themeColor: "#1E293B" // Slate 800
        };

        let org = await Organization.findOne({ uniqueCode: orgEncoded.uniqueCode });
        if (!org) {
            org = await Organization.create(orgEncoded);
        }

        const adminEmail = "admin@ajce.in";
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            const admin = await User.create({
                name: "System Administrator",
                email: adminEmail,
                password: "admin123", // Default for dev seeding
                role: "admin",
                organization: org._id
            });
            await Wallet.create({ user: admin._id });
            return res.status(201).json({
                message: 'Organization and Admin Seeding Successful',
                organization: org,
                admin: { email: adminEmail, password: "admin123" }
            });
        }

        res.status(200).json({ message: 'Seeding already complete', organization: org });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all organization requests
// @route   GET /api/admin/org-requests
// @access  Private (Admin only)
export const getOrgRequests = async (req, res) => {
    try {
        const requests = await OrganizationRequest.find().sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject organization request
// @route   PUT /api/admin/org-requests/:id
// @access  Private (Admin only)
export const manageOrgRequest = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const request = await OrganizationRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        request.adminNotes = adminNotes;
        await request.save();

        if (status === 'approved') {
            // Create actual organization
            await Organization.create({
                name: request.name,
                uniqueCode: request.code,
                domain: request.domain,
                createdBy: req.user._id
            });
        }

        res.json({ message: `Request ${status} successfully`, request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getPlatformStats = async (req, res) => {
    try {
        const students = await User.countDocuments({ role: 'student' });
        const organizers = await User.countDocuments({ role: 'organizer' });
        const organizations = await Organization.countDocuments();
        const pendingRequests = await OrganizationRequest.countDocuments({ status: 'pending' });

        res.json({
            students,
            organizers,
            organizations,
            pendingRequests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all non-admin users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .populate('organization', 'name uniqueCode')
            .sort('-createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user status (disable/enable)
// @route   PUT /api/admin/users/:id/disable
// @access  Private (Admin only)
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot disable another administrator' });
        }

        user.isDisabled = !user.isDisabled;
        await user.save();

        res.json({ message: `User account has been ${user.isDisabled ? 'disabled' : 'enabled'}`, isDisabled: user.isDisabled });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Edit user details as admin
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot edit another administrator' });
        }

        const { name, email, role, headline, course, bio } = req.body;

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.headline = headline !== undefined ? headline : user.headline;
        user.course = course !== undefined ? course : user.course;
        user.bio = bio !== undefined ? bio : user.bio;

        if (role === 'organizer') {
            user.userType = 'organizer';
        } else if (role === 'student' && user.userType === 'organizer') {
            user.userType = 'freelancer';
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user completely
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete another administrator' });
        }

        await User.deleteOne({ _id: user._id });

        res.json({ message: 'User removed from the database successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all organizations
// @route   GET /api/admin/organizations
// @access  Private (Admin only)
export const getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find()
            .populate('createdBy', 'name email')
            .sort('-createdAt');
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Edit organization details
// @route   PUT /api/admin/organizations/:id
// @access  Private (Admin only)
export const updateOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        const { name, uniqueCode, domain, themeColor } = req.body;

        org.name = name || org.name;
        org.uniqueCode = uniqueCode || org.uniqueCode;
        org.domain = domain !== undefined ? domain : org.domain;
        org.themeColor = themeColor || org.themeColor;

        const updatedOrg = await org.save();
        res.json(updatedOrg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete organization completely
// @route   DELETE /api/admin/organizations/:id
// @access  Private (Admin only)
export const deleteOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);

        if (!org) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        // Before deleting an org, we'd theoretically want to alert users or reassign them, 
        // but for now we follow the exact cascading delete request.
        await Organization.deleteOne({ _id: org._id });

        res.json({ message: 'Organization removed from the database successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all platform gigs (for admin monitoring)
// @route   GET /api/admin/gigs
// @access  Private (Admin only)
import Gig from '../models/Gig.js'; // Ensure Gig is imported
export const getAllGigs = async (req, res) => {
    try {
        const gigs = await Gig.find()
            .populate('organizer', 'name email')
            .populate('organization', 'name uniqueCode')
            .populate('assignedTo', 'name email')
            .sort('-createdAt');
        res.json(gigs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all user portfolios across the platform
// @route   GET /api/admin/portfolios
// @access  Private (Admin only)
export const getAllPortfolios = async (req, res) => {
    try {
        // Aggregate to extract portfolios from all students into a flat list
        const aggregation = await User.aggregate([
            { $match: { role: 'student', portfolio: { $exists: true, $not: { $size: 0 } } } },
            { $unwind: '$portfolio' },
            {
                $lookup: {
                    from: 'organizations',
                    localField: 'organization',
                    foreignField: '_id',
                    as: 'orgDetails'
                }
            },
            { $unwind: { path: '$orgDetails', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: '$_id',
                    userName: '$name',
                    userEmail: '$email',
                    userCourse: '$course',
                    organizationName: '$orgDetails.name',
                    portfolioId: '$portfolio._id',
                    title: '$portfolio.title',
                    description: '$portfolio.description',
                    link: '$portfolio.link',
                    image: '$portfolio.image',
                    date: '$portfolio.date'
                }
            },
            { $sort: { 'date': -1 } }
        ]);

        res.json(aggregation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
