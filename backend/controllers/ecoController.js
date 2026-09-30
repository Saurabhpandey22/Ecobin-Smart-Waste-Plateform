/**
 * Ecobin Gamification & Rewards Controller
 */

const db = require('../config/db');

exports.getEcoSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.findOne('users', u => u.id === userId);
    const history = db.findMany('eco_points', e => e.user_id === userId, (a, b) => new Date(b.created_at) - new Date(a.created_at));
    const societies = db.findMany('leaderboard_societies', null, (a, b) => a.rank - b.rank);

    // Fetch top citizen users
    const allUsers = db.findMany('users', u => u.role === 'citizen', (a, b) => (b.eco_points || 0) - (a.eco_points || 0), 1, 10);
    const citizenLeaderboard = allUsers.map((u, idx) => ({
      rank: idx + 1,
      name: u.name,
      ward_area: u.ward_area,
      points: u.eco_points || 0
    }));

    res.status(200).json({
      success: true,
      points: user ? user.eco_points || 0 : 0,
      pointsHistory: history,
      citizenLeaderboard,
      societyLeaderboard: societies
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve eco summary.', error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { score, totalQuestions = 5 } = req.body;
    const userId = req.user.id;

    const pointsEarned = Number(score) * 10;
    const user = db.findOne('users', u => u.id === userId);

    if (user && pointsEarned > 0) {
      db.update('users', user.id, { eco_points: (user.eco_points || 0) + pointsEarned });
      db.insert('eco_points', {
        user_id: userId,
        points: pointsEarned,
        reason: `Completed Waste Segregation Quiz (${score}/${totalQuestions} correct)`
      });
    }

    const newTotal = (user ? user.eco_points || 0 : 0) + pointsEarned;

    res.status(200).json({
      success: true,
      message: `Quiz completed! You scored ${score}/${totalQuestions} and earned +${pointsEarned} Eco Points!`,
      pointsEarned,
      newTotalPoints: newTotal
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Quiz submission failed.', error: err.message });
  }
};
