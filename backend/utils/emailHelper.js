const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"InternHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
};

// Email Templates
const emailTemplates = {
  welcome: (email) => ({
    subject: '🎓 Welcome to InternHub!',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFF; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 800;">Welcome to InternHub! 🎓</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi there!</p>
          <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">Your account has been created successfully. You can now log in and complete your profile to get started with your internship journey.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; margin-top: 20px;">Login to InternHub →</a>
          <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">If you have any questions, reply to this email.</p>
        </div>
      </div>
    `
  }),

  approved: (name) => ({
    subject: '✅ Your Internship Application is Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFF; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #065F46 0%, #10B981 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 800;">Application Approved! ✅</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Congratulations, ${name}!</p>
          <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">Your internship application has been approved by HR. You are now an active intern at InternHub. Log in to see your assigned mentor and tasks.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; margin-top: 20px;">Go to Dashboard →</a>
        </div>
      </div>
    `
  }),

  taskAssigned: (name, taskTitle, deadline) => ({
    subject: `📋 New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFF; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 800;">New Task Assigned! 📋</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Hi ${name},</p>
          <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">Your mentor has assigned you a new task.</p>
          <div style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: 700; color: #111827; font-size: 16px;">${taskTitle}</p>
            <p style="margin: 8px 0 0; color: #EF4444; font-size: 13px; font-weight: 600;">⏰ Deadline: ${new Date(deadline).toLocaleDateString()}</p>
          </div>
          <a href="http://localhost:3000/login" style="display: inline-block; background: #4F46E5; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700;">View Task →</a>
        </div>
      </div>
    `
  }),

  certificate: (name) => ({
    subject: '🏆 Your Internship Certificate is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8FAFF; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #92400E 0%, #F59E0B 100%); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 800;">Certificate Ready! 🏆</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px;">Congratulations, ${name}!</p>
          <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">You have successfully completed your internship at InternHub! Your certificate of completion is ready to download.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background: #F59E0B; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; margin-top: 20px;">Download Certificate →</a>
        </div>
      </div>
    `
  })
};

module.exports = { sendEmail, emailTemplates };