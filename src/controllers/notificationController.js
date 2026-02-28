const supabase = require('../config/supabase');

const registerPushToken = async (req, res) => {
    const { userId, pushToken } = req.body;

    try {
        const { error } = await supabase
            .from('users')
            .update({ push_token: pushToken })
            .eq('id', userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error("[Notification] Registration Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerPushToken };
