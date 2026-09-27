import jwt from 'jsonwebtoken';

/**
 * Generates signed JSON Web Token for authenticated user.
 * @param {string} id - User ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;

  if (!secret || !secret.trim()) {
    throw new Error('JWT_SECRET is not configured. Set it in backend/.env.');
  }

  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};
