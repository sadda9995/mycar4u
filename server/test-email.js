const mongoose = require('mongoose');
require('dotenv').config();
const { sendEmail } = require('./utils/notifier');
const { otpTemplate, paymentReceiptTemplate } = require('./utils/emailTemplates');
const { generatePdf } = require('./utils/pdfGenerator');

async function testMail() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');
    
    console.log('Generating PDF and sending test email to asherprajan@gmail.com...');
    
    try {
        const otp = '1234';
        const receiptDetails = {
            transactionId: 'TXN_' + Date.now(),
            amount: '15,500',
            date: new Date().toLocaleDateString(),
            method: 'Razorpay (Visa)'
        };

        // 1. Generate the HTML for the receipt
        const receiptHtml = paymentReceiptTemplate(receiptDetails);

        // 2. Convert that HTML into a PDF buffer
        const pdfBuffer = await generatePdf(receiptHtml);

        // 3. Send the email with the PDF attached
        const success = await sendEmail({
            to: 'asherprajan@gmail.com',
            from: 'Accounts <billing@mycar4u.com>',
            subject: 'Your Booking Receipt - Mycar4u',
            text: `Your payment of ₹${receiptDetails.amount} was successful. Please find your receipt attached.`,
            html: receiptHtml, // We use the same HTML for the email body
            templateName: 'booking_receipt',
            attachments: [
                {
                    filename: `Receipt_${receiptDetails.transactionId}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        if (success) {
            console.log('✅ Test email with PDF attachment sent successfully!');
        } else {
            console.log('❌ Failed to send test email. Check your RESEND_API_KEY in .env');
        }
    } catch (err) {
        console.error('Test failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

testMail().catch(console.error);
