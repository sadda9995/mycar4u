/**
 * Email Template System for Mycar4u
 * Provides professionally styled HTML templates with a consistent layout.
 */

const COMPANY_NAME = 'Mycar4u';
const BRAND_COLOR = '#dc2626'; // Red-600
const TEXT_COLOR = '#111827';
const MUTED_COLOR = '#6b7280';
const BG_COLOR = '#ffffff';
const CARD_BG = '#f9fafb';

/**
 * Base layout for all emails
 */
const baseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${COMPANY_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_COLOR}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                            <h1 style="margin: 0; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">
                                ${COMPANY_NAME}
                            </h1>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 40px 40px 40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: ${CARD_BG}; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: ${MUTED_COLOR};">
                                &copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                                You received this email because you're a user of our platform.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Login OTP Template
 */
exports.otpTemplate = (otp) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Login OTP</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Use the following one-time password to sign in to your account. This code will expire in 5 minutes.
    </p>
    <div style="background-color: ${CARD_BG}; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: ${TEXT_COLOR}; font-family: monospace; user-select: all; cursor: pointer;">${otp}</span>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        Tip: You can click the code above to select it all, then copy and paste it into the login page.
    </p>
`);

/**
 * Staff Invitation Template
 */
exports.inviteTemplate = ({ name, role, activationLink }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Admin Invitation</h2>
    <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Hi ${name || 'there'},
    </p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        You've been invited to join the <strong>${COMPANY_NAME}</strong> admin console as a <strong>${role.replace('_', ' ')}</strong>. 
        Click the button below to activate your account and set your password.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${activationLink}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; transition: background-color 0.2s;">
            Activate Account
        </a>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        This invitation link is valid for 24 hours. If you did not expect this invitation, please ignore this email.
    </p>
`);

/**
 * Password Reset Template
 */
exports.passwordResetTemplate = ({ resetLink }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Reset Password</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        We received a request to reset your admin password. Click the button below to choose a new one.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetLink}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none;">
            Reset Password
        </a>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        This link is valid for 60 minutes. If you didn't request a password reset, you can safely ignore this email.
    </p>
`);

/**
 * Welcome Email Template
 */
exports.welcomeTemplate = (name) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Welcome to ${COMPANY_NAME}!</h2>
    <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Hi ${name || 'there'},
    </p>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        We're thrilled to have you with us. Your account is now active, and you're ready to explore our premium fleet of vehicles. 
        Whether it's a weekend getaway or a business trip, we've got the perfect car for you.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none;">
            Start Browsing
        </a>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        If you have any questions, our support team is always here to help.
    </p>
`);

/**
 * Booking Confirmation Template
 */
exports.bookingConfirmationTemplate = ({ bookingId, carName, startDate, endDate, totalAmount }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Booking Confirmed!</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Your reservation is confirmed. Here are your booking details:
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Booking ID</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">#${bookingId}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Vehicle</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${carName}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Pick-up</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${startDate}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Drop-off</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${endDate}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding-top: 12px; color: ${TEXT_COLOR}; font-size: 16px; font-weight: 700;">Total Amount</td>
                <td style="padding-top: 12px; color: ${BRAND_COLOR}; font-size: 18px; font-weight: 800; text-align: right;">₹${totalAmount}</td>
            </tr>
        </table>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px; text-align: center;">
        Please bring your original Driver's License and ID proof at the time of pick-up.
    </p>
`);

/**
 * Security Alert (New Login)
 */
exports.securityAlertTemplate = ({ device, location, time }) => baseLayout(`
    <div style="background-color: #fee2e2; border-radius: 8px; padding: 12px; margin-bottom: 24px; text-align: center;">
        <span style="color: #b91c1c; font-weight: 700; font-size: 14px;">SECURITY ALERT</span>
    </div>
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">New Login Detected</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        We noticed a new login to your Mycar4u account. If this was you, you can ignore this email.
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Device: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${device}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Location: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${location}</span></p>
        <p style="margin: 0; font-size: 14px; color: ${MUTED_COLOR};">Time: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${time}</span></p>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        If you did not log in, please <a href="${process.env.APP_URL || 'http://localhost:3000'}/settings" style="color: ${BRAND_COLOR}; text-decoration: none; font-weight: 600;">secure your account immediately</a> by changing your password.
    </p>
`);

/**
 * Booking Cancellation Template
 */
exports.bookingCancellationTemplate = ({ bookingId, carName, refundAmount }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Booking Cancelled</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Your booking for the <strong>${carName}</strong> (ID: #${bookingId}) has been successfully cancelled.
    </p>
    ${refundAmount > 0 ? `
    <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">
            A refund of <strong>₹${refundAmount}</strong> has been initiated and will reflect in your account within 5-7 business days.
        </p>
    </div>
    ` : ''}
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        We hope to see you again soon! If you cancelled by mistake, you can always make a new reservation on our app.
    </p>
`);

/**
 * Booking Reminder Template
 */
exports.bookingReminderTemplate = ({ carName, pickupTime, location }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Reminder: Your Trip Starts Tomorrow!</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Get ready! Your rental for the <strong>${carName}</strong> starts in 24 hours.
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Pickup Time: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${pickupTime}</span></p>
        <p style="margin: 0; font-size: 14px; color: ${MUTED_COLOR};">Location: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${location}</span></p>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/bookings" style="display: inline-block; border: 1px solid ${BRAND_COLOR}; color: ${BRAND_COLOR}; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
            View Booking Details
        </a>
    </div>
`);

/**
 * Rental Started Template
 */
exports.rentalStartedTemplate = ({ carName, bookingId, odometer }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: #059669; font-size: 22px; font-weight: 700;">Your Trip Has Started!</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        The keys are yours! You've successfully picked up the <strong>${carName}</strong>. Drive safe and enjoy the journey.
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Booking ID: <span style="color: ${TEXT_COLOR}; font-weight: 600;">#${bookingId}</span></p>
        <p style="margin: 0; font-size: 14px; color: ${MUTED_COLOR};">Start Odometer: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${odometer} km</span></p>
    </div>
    <p style="margin: 0; color: ${MUTED_COLOR}; font-size: 14px; line-height: 20px;">
        In case of any issues during your trip, please use the "Emergency Support" button in the app.
    </p>
`);

/**
 * Rental Ended & Summary Template
 */
exports.rentalEndedTemplate = ({ carName, distance, duration, totalAmount }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Thanks for riding with us!</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        We hope you had a great trip with the <strong>${carName}</strong>. Your rental has been successfully closed.
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: ${TEXT_COLOR};">Trip Summary</h3>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Total Distance</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${distance} km</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Duration</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${duration}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding-top: 12px; color: ${TEXT_COLOR}; font-size: 16px; font-weight: 700;">Final Bill</td>
                <td style="padding-top: 12px; color: ${BRAND_COLOR}; font-size: 18px; font-weight: 800; text-align: right;">₹${totalAmount}</td>
            </tr>
        </table>
    </div>
    <div style="text-align: center; margin-bottom: 24px;">
        <p style="margin: 0 0 16px 0; font-size: 16px; color: ${TEXT_COLOR}; font-weight: 600;">How was your experience?</p>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/feedback" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
            Rate Your Trip
        </a>
    </div>
`);

/**
 * Payment Receipt Template
 */
exports.paymentReceiptTemplate = ({ transactionId, amount, date, method }) => baseLayout(`
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Payment Receipt</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        Thank you for your payment. This email serves as a formal receipt for your transaction.
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Transaction ID</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${transactionId}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Date</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${date}</td>
            </tr>
            <tr>
                <td style="padding-bottom: 12px; color: ${MUTED_COLOR}; font-size: 14px;">Method</td>
                <td style="padding-bottom: 12px; color: ${TEXT_COLOR}; font-size: 14px; font-weight: 600; text-align: right;">${method}</td>
            </tr>
            <tr>
                <td style="padding-top: 12px; color: ${TEXT_COLOR}; font-size: 16px; font-weight: 700;">Amount Paid</td>
                <td style="padding-top: 12px; color: ${BRAND_COLOR}; font-size: 18px; font-weight: 800; text-align: right;">₹${amount}</td>
            </tr>
        </table>
    </div>
`);

/**
 * Admin: New Booking Alert
 */
exports.adminNewBookingTemplate = ({ bookingId, customerName, carName, city }) => baseLayout(`
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 12px; margin-bottom: 24px; text-align: center;">
        <span style="color: #1e40af; font-weight: 700; font-size: 14px;">NEW BOOKING RECEIVED</span>
    </div>
    <h2 style="margin: 0 0 16px 0; color: ${TEXT_COLOR}; font-size: 22px; font-weight: 700;">Action Required</h2>
    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 24px;">
        A new booking has been placed. Please ensure the vehicle is ready for pick-up.
    </p>
    <div style="background-color: ${CARD_BG}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Booking: <span style="color: ${TEXT_COLOR}; font-weight: 600;">#${bookingId}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Customer: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${customerName}</span></p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: ${MUTED_COLOR};">Car: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${carName}</span></p>
        <p style="margin: 0; font-size: 14px; color: ${MUTED_COLOR};">City: <span style="color: ${TEXT_COLOR}; font-weight: 600;">${city}</span></p>
    </div>
    <div style="text-align: center;">
        <a href="${process.env.APP_ADMIN_URL || 'http://localhost:3001'}/bookings/${bookingId}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
            Open in Dashboard
        </a>
    </div>
`);
