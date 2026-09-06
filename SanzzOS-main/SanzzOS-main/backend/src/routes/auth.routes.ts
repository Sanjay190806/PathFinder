import { Router } from 'express';
import { handleAuthConfig, handleLogin, handleLogout, handleMe, handleSignup, handleUpdateMe, handleGoogleAuth, handleGoogleCallback } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/auth/signup', handleSignup);
router.post('/auth/login', handleLogin);
router.post('/auth/logout', handleLogout);
router.get('/auth/me', requireAuth, handleMe);
router.get('/user/me', requireAuth, handleMe);
router.patch('/auth/me', requireAuth, handleUpdateMe);
router.patch('/user/me', requireAuth, handleUpdateMe);
router.get('/auth/config', handleAuthConfig);
router.get('/auth/google', handleGoogleAuth);
router.get('/auth/google/callback', handleGoogleCallback);

export default router;
