const db = require('../db');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { firstName, lastName, email, password, dateOfBirth, phoneNumber, profilePicUrl } = req.body;

    // Check if user already exists
    const existingUser = await db('Users').where({ email }).first();
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const [userId] = await db('Users').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      date_of_birth: dateOfBirth,
      profile_pic_URL: profilePicUrl || null
    });

    // Insert phone number if provided
    if (phoneNumber) {
      await db('PhoneNumbers').insert({
        user_id: userId,
        phone_number: phoneNumber
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId,
      email
    });

    // Get created user (without password)
    const user = await db('Users')
      .select('user_id', 'first_name', 'last_name', 'email', 'date_of_birth', 'profile_pic_URL', 'created_at')
      .where({ user_id: userId })
      .first();

    return successResponse(res, {
      token,
      user
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db('Users').where({ email }).first();
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      email: user.email
    });

    // Return user data (without password)
    const userData = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      date_of_birth: user.date_of_birth,
      profile_pic_URL: user.profile_pic_URL,
      post_count: user.post_count,
      followers_count: user.followers_count,
      following_count: user.following_count,
      created_at: user.created_at
    };

    return successResponse(res, {
      token,
      user: userData
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  try {
    const { userId } = req.user;

    const user = await db('Users')
      .select('user_id', 'first_name', 'last_name', 'email', 'date_of_birth', 'profile_pic_URL', 
              'post_count', 'followers_count', 'following_count', 'created_at')
      .where({ user_id: userId })
      .first();

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user', 500);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
};
