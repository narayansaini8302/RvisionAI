
const express = require('express')
const authRouter = express.Router()
const authController = require('../controller/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', authController.register)


/** @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', authController.login)

/** @route POST /api/auth/logout
 * @desc Logout a user
 * @access Public
 */
authRouter.post('/logout', authController.logout)

/** @route GET /api/auth/get-me
 * @desc Get the authenticated user's information
 * @access Private
 */
authRouter.get('/get-me', authMiddleware.authUser, authController.getMe)




module.exports = authRouter;