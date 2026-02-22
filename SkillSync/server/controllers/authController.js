import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Organization from '../models/Organization.js';
import jwt from 'jsonwebtoken';
import axios from 'axios'; // For EmailJS REST API

// Generate Token
const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Secure in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};

// Send Welcome Email
const sendWelcomeEmail = async (user) => {
    // ... (Use existing logic, simplified for brevity in this replace block if unchanged, but I must provide full replacement for the block)
    if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_PUBLIC_KEY) {
        // console.warn('EmailJS not configured. Skipping welcome email.');
        return;
    }

    const data = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
            to_name: user.name,
            to_email: user.email,
            message: 'Welcome to SkillSync! We are excited to have you join our academic marketplace.'
        }
    };

    try {
        await axios.post('https://api.emailjs.com/api/v1.0/email/send', data);
    } catch (error) {
        console.error('EmailJS Error:', error.response?.data || error.message);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, instituteCode } = req.body;

        if (!name || !email || !password || !instituteCode) {
            res.status(400);
            throw new Error('Please provide all required fields, including Institute Code');
        }

        // Validate Institute Code
        const organization = await Organization.findOne({ uniqueCode: instituteCode });
        if (!organization) {
            res.status(400);
            throw new Error('Invalid Institute Code');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            organization: organization._id,
            role: 'student', // Default role
            userType: 'freelancer' // Default userType
        });

        if (user) {
            await Wallet.create({ user: user._id });
            generateToken(res, user._id);

            // Non-blocking email send
            sendWelcomeEmail(user);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: {
                    name: organization.name,
                    id: organization._id
                }
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).populate('organization', 'name uniqueCode');

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(res, user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                token
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('organization', 'name uniqueCode');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
