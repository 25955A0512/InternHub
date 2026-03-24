const evaluationModel = require('../models/evaluationModel');
const mentorModel = require('../models/mentorModel');
const internModel = require('../models/internModel');

const evaluationController = {

  // CREATE EVALUATION (mentor only)
  createEvaluation: async (req, res) => {
    try {
      const {
        intern_id, attendance_score, task_score,
        quality_score, communication_score,
        teamwork_score, remarks
      } = req.body;

      // Validate all scores
      if (!intern_id || attendance_score === undefined ||
          task_score === undefined || quality_score === undefined ||
          communication_score === undefined || teamwork_score === undefined) {
        return res.status(400).json({
          message: 'All scores and intern_id are required'
        });
      }

      // Validate score range (0-100)
      const scores = [attendance_score, task_score, quality_score,
                      communication_score, teamwork_score];
      const validScores = scores.every(s => s >= 0 && s <= 100);
      if (!validScores) {
        return res.status(400).json({
          message: 'All scores must be between 0 and 100'
        });
      }

      // Get mentor profile
      const mentor = await mentorModel.getByUserId(req.user.id);
      if (!mentor) {
        return res.status(404).json({
          message: 'Mentor profile not found'
        });
      }

      const evaluation = await evaluationModel.createEvaluation({
        intern_id,
        mentor_id: mentor.id,
        attendance_score,
        task_score,
        quality_score,
        communication_score,
        teamwork_score,
        remarks
      });

      res.status(201).json({
        message: '✅ Evaluation submitted successfully',
        evaluation
      });

    } catch (error) {
      console.error('Create evaluation error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET MY EVALUATIONS (intern)
  getMyEvaluations: async (req, res) => {
    try {
      const intern = await internModel.getByUserId(req.user.id);
      if (!intern) {
        return res.status(404).json({
          message: 'Intern profile not found'
        });
      }

      const evaluations = await evaluationModel.getByIntern(intern.id);
      res.status(200).json({
        message: '✅ Evaluations fetched successfully',
        count: evaluations.length,
        evaluations
      });

    } catch (error) {
      console.error('Get evaluations error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // GET ALL EVALUATIONS (hr/admin)
  getAllEvaluations: async (req, res) => {
    try {
      const evaluations = await evaluationModel.getAll();
      res.status(200).json({
        message: '✅ All evaluations fetched',
        count: evaluations.length,
        evaluations
      });
    } catch (error) {
      console.error('Get all evaluations error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  },


    getLeaderboard: async (req, res) => {
  try {
    const leaderboard = await evaluationModel.getLeaderboard();
    res.status(200).json({
      message: '✅ Leaderboard fetched',
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

};

module.exports = evaluationController;