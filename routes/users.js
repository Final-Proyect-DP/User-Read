const express = require('express');
const router = express.Router();
const User = require('../models/user');
const logger = require('../config/logger');
const { verifyToken, handleAuthError } = require('../middlewares/authMiddleware');
const handleErrors = require('../utils/handleErrors');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API para gestión de usuarios
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene un usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de autenticación
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *         description: Usuario no encontrado
 *       401:
 *         description: Token no válido
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
    logger.info(`Usuario recuperado: ${userId}`);
    res.json(user);
  } catch (err) {
    const { status, response } = handleErrors(err, userId);
    res.status(status).json(response);
  }
});

module.exports = router;
