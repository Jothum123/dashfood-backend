const supabase = require('../config/supabase');

/**
 * High-fidelity stubs for Merchant Console pillars.
 * These will be expanded into full service-layer implementations.
 */

const getDashboardOverview = async (req, res) => {
    // Replica of Uber Home Tab metrics
    res.json({
        orders_today: 128,
        revenue_today: 5230,
        avg_prep_time: 11,
        late_orders: 4,
        active_stores: 6
    });
};

const getStores = async (req, res) => {
    res.json({ success: true, stores: [] });
};

const getMenu = async (req, res) => {
    res.json({ success: true, categories: [], items: [] });
};

const getPerformance = async (req, res) => {
    res.json({
        prep_time: 12,
        acceptance_rate: 0.98,
        completion_rate: 0.95
    });
};

const getUsers = async (req, res) => {
    res.json({ success: true, users: [] });
};

const getReports = async (req, res) => {
    res.json({ success: true, reports: [] });
};

const getIssues = async (req, res) => {
    res.json({ success: true, issues: [] });
};

const getSettings = async (req, res) => {
    res.json({ success: true, settings: {} });
};

module.exports = {
    getDashboardOverview,
    getStores,
    getMenu,
    getPerformance,
    getUsers,
    getReports,
    getIssues,
    getSettings
};
