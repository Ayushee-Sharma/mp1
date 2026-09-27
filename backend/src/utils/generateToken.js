import jwt from 'jsonwebtoken';

/**
 * Generates signed JSON Web Token for authenticated user.
 * @param {string} id - User ObjectId string
 * @returns {string} Signed JWT token
 */
export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'reaching_the_unreached_jwt_secret_dev_2026_xyz!',
    {
      expiresIn: '30d',
    }
  );
};
