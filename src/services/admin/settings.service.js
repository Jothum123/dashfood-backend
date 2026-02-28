const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style System Settings Service
 * Handles global configuration, white-labeling, and announcements.
 */

exports.getGlobalSettings = async (organizationId) => {
    // In a real Uber replica, global settings might live in a 'system_config' or 'organizations' table
    const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

    if (error) throw error;
    return data;
};

exports.updateGlobalSettings = async (organizationId, settings) => {
    const { data, error } = await supabase
        .from("organizations")
        .update({
            ...settings,
            updated_at: new Date().toISOString()
        })
        .eq("id", organizationId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.getWhiteLabelConfig = async (organizationId) => {
    const { data, error } = await supabase
        .from("organizations")
        .select("name, slug, logo_url")
        .eq("id", organizationId)
        .single();

    if (error) throw error;
    return data;
};

exports.createAnnouncement = async (announcementData) => {
    // Stub for platform-wide announcements
    console.log("[ANNOUNCEMENT] New platform announcement created:", announcementData);
    return {
        success: true,
        data: {
            id: "stub-announcement-id",
            ...announcementData,
            created_at: new Date().toISOString()
        }
    };
};
