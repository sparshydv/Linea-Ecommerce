const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User.model');

/**
 * Register a new user.
 * Hashes password before saving.
 */
async function registerUser({ email, password, name }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    authProvider: 'local',
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || null,
      role: user.role,
    },
    token,
  };
}

/**
 * Authenticate user and return token.
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.password) {
    const error = new Error('Use Google sign-in for this account');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is disabled');
    error.statusCode = 403;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || null,
      role: user.role,
    },
    token,
  };
}

/**
 * Authenticate or register a user with Google OAuth.
 */
async function loginWithGoogle({ code }) {
  if (!code) {
    const error = new Error('Authorization code is required');
    error.statusCode = 400;
    throw error;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'postmessage';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }

  const oauthClient = new OAuth2Client(clientId, clientSecret, redirectUri);
  const { tokens } = await oauthClient.getToken({ code, redirect_uri: redirectUri });

  if (!tokens.id_token) {
    const error = new Error('Google token exchange failed');
    error.statusCode = 401;
    throw error;
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    const error = new Error('Invalid Google identity');
    error.statusCode = 401;
    throw error;
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  const displayName = payload.name || payload.given_name || email.split('@')[0];
  const avatarUrl = payload.picture || null;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      email,
      name: displayName,
      avatarUrl,
      googleId,
      authProvider: 'google',
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
    }

    if (!user.name && displayName) {
      user.name = displayName;
    }

    if (!user.avatarUrl && avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    if (!user.isActive) {
      const error = new Error('Account is disabled');
      error.statusCode = 403;
      throw error;
    }

    await user.save();
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || null,
      role: user.role,
    },
    token,
  };
}

/**
 * Generate JWT token.
 */
function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
};
