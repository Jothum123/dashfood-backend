const { Expo } = require('expo-server-sdk');

const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`[Push] Token ${pushToken} is invalid`);
        return;
    }

    const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
    };

    try {
        const ticketChunk = await expo.sendPushNotificationsAsync([message]);
        console.log("[Push] Notification Sent:", ticketChunk);
    } catch (error) {
        console.error("[Push] Dispatch Error:", error);
    }
};

module.exports = { sendPushNotification };
