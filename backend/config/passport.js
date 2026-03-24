const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    // Check if user exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (existing.rows[0]) {
      // User exists — return them
      return done(null, existing.rows[0]);
    }

    // Create new user with Google
    const hashedPassword = await bcrypt.hash(
      `google_${profile.id}`, 10
    );

    const newUser = await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ($1, $2, 'intern')
       RETURNING *`,
      [email, hashedPassword]
    );

    return done(null, newUser.rows[0]);

  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  done(null, result.rows[0]);
});

module.exports = passport;