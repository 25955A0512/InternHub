const attendanceModel = require('../models/attendanceModel');
const internModel = require('../models/internModel');

const attendanceController = {

  // CHECK IN
  checkIn: async (req, res) => {
    try {
      // Get intern profile
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({ 
          message: 'Intern profile not found' 
        });
      }

      // Check if intern is active
      if (intern.status !== 'active') {
        return res.status(403).json({ 
          message: 'Your account is not active. Contact HR.' 
        });
      }

      // Check if already checked in today
      const existing = await attendanceModel.getTodayAttendance(intern.id);
      if (existing) {
        return res.status(400).json({ 
          message: 'Already checked in today!',
          attendance: existing
        });
      }

      // face_verified comes from frontend face recognition
      // true if face matched, false if skipped
      const face_verified = req.body.face_verified || false;

      // Record check in
      const attendance = await attendanceModel.checkIn(intern.id, face_verified);

      res.status(201).json({
        message: '✅ Check-in successful!',
        attendance
      });

    } catch (error) {
      console.error('Check-in error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // CHECK OUT
  checkOut: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({ 
          message: 'Intern profile not found' 
        });
      }

      // Check if checked in today
      const existing = await attendanceModel.getTodayAttendance(intern.id);
      if (!existing) {
        return res.status(400).json({ 
          message: 'You have not checked in today!' 
        });
      }

      // Check if already checked out
      if (existing.check_out_time) {
        return res.status(400).json({ 
          message: 'Already checked out today!' 
        });
      }

      const attendance = await attendanceModel.checkOut(intern.id);

      res.status(200).json({
        message: '✅ Check-out successful!',
        attendance
      });

    } catch (error) {
      console.error('Check-out error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET MY ATTENDANCE (Intern)
  getMyAttendance: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({ 
          message: 'Intern profile not found' 
        });
      }

      const attendance = await attendanceModel.getByIntern(intern.id);

      res.status(200).json({
        message: '✅ Attendance fetched successfully',
        count: attendance.length,
        attendance
      });

    } catch (error) {
      console.error('Get attendance error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET MY REPORT (Intern)
  getMyReport: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({ 
          message: 'Intern profile not found' 
        });
      }

      const report = await attendanceModel.getReport(intern.id);

      res.status(200).json({
        message: '✅ Attendance report fetched',
        report
      });

    } catch (error) {
      console.error('Get report error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET ALL ATTENDANCE (HR/Admin)
  getAllAttendance: async (req, res) => {
    try {
      const attendance = await attendanceModel.getAll();
      res.status(200).json({
        message: '✅ All attendance fetched',
        count: attendance.length,
        attendance
      });
    } catch (error) {
      console.error('Get all attendance error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET ATTENDANCE BY INTERN ID (HR/Admin/Mentor)
  getAttendanceByInternId: async (req, res) => {
    try {
      const attendance = await attendanceModel.getByIntern(req.params.id);
      const report = await attendanceModel.getReport(req.params.id);

      res.status(200).json({
        message: '✅ Attendance fetched',
        count: attendance.length,
        report,
        attendance
      });
    } catch (error) {
      console.error('Get intern attendance error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = attendanceController;