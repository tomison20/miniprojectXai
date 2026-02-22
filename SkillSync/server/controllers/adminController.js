import Organization from '../models/Organization.js';

// @desc    Seed Organization
// @route   POST /api/admin/seed
// @access  Public (Dev only)
export const seedData = async (req, res) => {
    try {
        const orgEncoded = {
            name: "AJCE",
            uniqueCode: "AJCE2026",
            domain: "ajce.in"
        };

        const exists = await Organization.findOne({ uniqueCode: orgEncoded.uniqueCode });
        if (exists) {
            return res.status(200).json({ message: 'Organization AJCE already exists', organization: exists });
        }

        const org = await Organization.create(orgEncoded);
        res.status(201).json({ message: 'Organization Verified', organization: org });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
