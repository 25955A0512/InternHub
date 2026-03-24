const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const certificateModel = require('../models/certificateModel');
const internModel = require('../models/internModel');
const evaluationModel = require('../models/evaluationModel');
const notify = require('../utils/notificationHelper');
const { sendEmail, emailTemplates } = require('../utils/emailHelper');
const pool = require('../config/db');

const certificateController = {

  generateCertificate: async (req, res) => {
    try {
      const { intern_id } = req.body;

      // Get intern details
      const intern = await internModel.getById(intern_id);
      if (!intern) {
        return res.status(404).json({ message: 'Intern not found' });
      }

      // Check if already exists
      const existing = await certificateModel.getByIntern(intern_id);
      if (existing) {
        return res.status(400).json({
          message: 'Certificate already generated',
          certificate: existing
        });
      }

      // Get evaluation score
      const evaluations = await evaluationModel.getByIntern(intern_id);
      const latestEval = evaluations[0];

      // Generate QR data
      const qrData = `INTERN-CERT-${intern_id}-${Date.now()}`;

      // Generate QR image
      const qrCodeImage = await QRCode.toDataURL(qrData);

      // Create PDF
      const fileName = `certificate-${intern_id}-${Date.now()}.pdf`;
      const filePath = path.join('uploads', fileName);

      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── PDF DESIGN ──

      // Background
      doc.rect(0, 0, 842, 595).fill('#f8f9ff');

      // Outer border
      doc.rect(20, 20, 802, 555).lineWidth(3).stroke('#4F46E5');

      // Inner border
      doc.rect(30, 30, 782, 535).lineWidth(1).stroke('#818CF8');

      // Top accent bar
      doc.rect(20, 20, 802, 6).fill('#4F46E5');

      // Title
      doc.fillColor('#1E1B4B')
         .fontSize(42)
         .font('Helvetica-Bold')
         .text('INTERNSHIP CERTIFICATE', 0, 75, { align: 'center' });

      // Decorative line
      doc.moveTo(200, 130).lineTo(642, 130).lineWidth(1).stroke('#818CF8');

      // Subtitle
      doc.fillColor('#6B7280')
         .fontSize(14)
         .font('Helvetica')
         .text('This is to proudly certify that', 0, 148, { align: 'center' });

      // Intern Name
      doc.fillColor('#4F46E5')
         .fontSize(38)
         .font('Helvetica-Bold')
         .text(intern.full_name, 0, 175, { align: 'center' });

      // Decorative line under name
      doc.moveTo(250, 225).lineTo(592, 225).lineWidth(1).stroke('#E5E7EB');

      // College
      doc.fillColor('#374151')
         .fontSize(13)
         .font('Helvetica')
         .text(`from ${intern.college}`, 0, 238, { align: 'center' });

      // Body text
      doc.fillColor('#6B7280')
         .fontSize(13)
         .text('has successfully completed the internship program as', 0, 262, { align: 'center' });

      // Role
      doc.fillColor('#1E1B4B')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(intern.role_applied, 0, 285, { align: 'center' });

      // Score
      if (latestEval) {
        doc.fillColor('#4F46E5')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`Overall Score: ${latestEval.total_score}/100`, 0, 320, { align: 'center' });
      }

      // Date
      doc.fillColor('#9CA3AF')
         .fontSize(11)
         .font('Helvetica')
         .text(`Issue Date: ${new Date().toDateString()}`, 0, 355, { align: 'center' });

      // QR Code
      const qrImageBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
      doc.image(qrImageBuffer, 370, 390, { width: 90, height: 90 });
      doc.fillColor('#9CA3AF')
         .fontSize(9)
         .text('Scan to verify certificate', 345, 485, { align: 'center', width: 150 });

      // Signature area left
      doc.moveTo(80, 480).lineTo(260, 480).lineWidth(1).stroke('#D1D5DB');
      doc.fillColor('#6B7280')
         .fontSize(11)
         .text('Authorized Signatory', 80, 490);

      // Signature area right
      doc.moveTo(480, 480).lineTo(660, 480).lineWidth(1).stroke('#D1D5DB');
      doc.fillColor('#6B7280')
         .fontSize(11)
         .text('Program Director', 490, 490);

      // Bottom accent
      doc.rect(20, 549, 802, 6).fill('#4F46E5');

      // InternHub branding
      doc.fillColor('#9CA3AF')
         .fontSize(9)
         .text('Powered by InternHub — Internship Management Platform', 0, 560, { align: 'center' });

      doc.end();

      // Wait for file finish
      stream.on('finish', async () => {
        const certificate = await certificateModel.create(
          intern_id,
          `uploads/${fileName}`,
          qrData
        );

        // ✅ Get intern user_id and email
        const internUserData = await pool.query(
          'SELECT u.email, i.user_id FROM users u JOIN interns i ON i.user_id = u.id WHERE i.id = $1',
          [intern_id]
        );

        if (internUserData.rows[0]) {
          const { email, user_id } = internUserData.rows[0];

          // ✅ In-app notification
          await notify(
            user_id,
            '🏆 Certificate Ready!',
            'Your internship certificate has been generated! Go to the Certificate tab to download it.',
            'success'
          );

          // ✅ Email notification
          const emailContent = emailTemplates.certificate(intern.full_name);
          await sendEmail(email, emailContent.subject, emailContent.html);
        }

        res.status(201).json({
          message: '✅ Certificate generated successfully!',
          certificate,
          download_url: `http://localhost:5000/uploads/${fileName}`
        });
      });

    } catch (error) {
      console.error('Generate certificate error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getMyCertificate: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({ message: 'Intern profile not found' });
      }

      const certificate = await certificateModel.getByIntern(intern.id);
      if (!certificate) {
        return res.status(404).json({
          message: 'Certificate not yet generated. Contact HR.'
        });
      }

      res.status(200).json({
        message: '✅ Certificate fetched',
        certificate,
        download_url: `http://localhost:5000/${certificate.certificate_url}`
      });

    } catch (error) {
      console.error('Get certificate error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyCertificate: async (req, res) => {
    try {
      const { qr_code } = req.params;
      const certificate = await certificateModel.verifyByQR(qr_code);

      if (!certificate) {
        return res.status(404).json({
          message: '❌ Invalid certificate. Not found in our records.',
          valid: false
        });
      }

      res.status(200).json({
        message: '✅ Certificate is valid!',
        valid: true,
        certificate
      });

    } catch (error) {
      console.error('Verify certificate error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = certificateController;
