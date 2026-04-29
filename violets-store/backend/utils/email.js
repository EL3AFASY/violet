const nodemailer = require('nodemailer');
const Order = require('../models/Order');

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendOrderConfirmation = async (order) => {
  if (process.env.SMTP_USER === 'your@gmail.com') return; // Placeholder skip

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: order.user.email,
    subject: `Order #${order._id} Confirmation - Violet's`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order ID: ${order._id}</p>
      <p>Total: $${order.totalPrice}</p>
      <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
      <p>Status: ${order.status}</p>
      <p>Ships soon!</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order email sent');
  } catch (error) {
    console.error('Email error:', error);
  }
};

module.exports = { sendOrderConfirmation };
