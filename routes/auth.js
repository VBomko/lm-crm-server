const express = require('express');
const router = express.Router();

const {
  loginHandler,
  refreshHandler,
  logoutHandler,
  verifyHandler,
  authMiddleware,
} = require('../lib/auth/authApiHandlers');

router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);
router.get('/verify', verifyHandler);

// Example protected route
router.get('/protected/user', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Protected route accessed successfully', user: req.user });
});

module.exports = router;


