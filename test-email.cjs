require('dotenv').config({ path: '.env' });
const sendOTP = require('./auth-server/utils/sendOtp');

(async () => {
    try {
        console.log("Testing email with user:", process.env.BREVO_USER);
        // We will send to the brevo user itself for testing
        const targetEmail = process.env.BREVO_USER.replace('@smtp-brevo.com', '@gmail.com');
        await sendOTP("test@example.com", "123456");
        console.log("Email test completely finished successfully!");
    } catch (err) {
        console.error("Test failed with error:", err);
    }
})();
