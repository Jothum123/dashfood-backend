const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dashdrive_enterprise_secret';

/**
 * Mock Merchant Login for enterprise replication.
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    // TODO: Verify with Supabase auth
    // For now, return a signed token for a mock owner
    const mockUser = {
        id: 'user-123',
        email: email,
        role: 'Owner', // Owner, Admin, Manager, Staff, Analyst
        tenant_id: 'cfd01e92-8b1d-4afd-8d27-0a18aa8564ed',
        store_id: '476e91d7-3b2a-4e83-680a-7f61ff95bf3c'
    };

    const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '24h' });

    res.json({
        success: true,
        token: `Bearer ${token}`,
        user: mockUser
    });
};

module.exports = { login };
