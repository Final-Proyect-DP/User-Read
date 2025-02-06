const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Cambiado de '../models/user' a '../models/User'
const logger = require('../config/logger');
const { verifyToken, handleAuthError } = require('../middlewares/authMiddleware');
const handleErrors = require('../utils/handleErrors');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for user management
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 address:
 *                   type: string
 *                 phone:
 *                   type: string
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid token
 */
router.get('/:id', 
  verifyToken, 
  handleAuthError, 
  async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId, 'username email firstName lastName address phone semester parallel career description');
    if (!user) {
      throw new Error('User not found');
    }
    logger.info(`User retrieved: ${userId}`);
    res.json(user);
  } catch (err) {
    const { status, response } = handleErrors(err, userId);
    res.status(status).json(response);
  }
});

module.exports = router;
