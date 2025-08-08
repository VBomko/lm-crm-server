const { authController } = require('./authController');
const { jwtService } = require('./jwtService');

async function loginHandler(req, res) {
  try {
    console.log('[auth] POST /api/auth/login called');
    console.log('[auth] Request headers:', req.headers);
    console.log('[auth] Request body:', req.body);
    console.log('[auth] Request method:', req.method);
    console.log('[auth] Request URL:', req.url);
    
    const { email, password } = req.body || {};
    console.log('[auth] login body email:', email);
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const result = await authController.login({ email, password });
    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const tokenPair = jwtService.generateTokenPair({
      userId: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
    });

    res.cookie('refreshToken', tokenPair.refreshToken, jwtService.getRefreshTokenCookieOptions(isProduction));

    res.status(200).json({
      success: true,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: result.expiresIn,
      refreshTokenExpiresIn: result.refreshTokenExpiresIn,
      user: result.user,
    });
  } catch (error) {
    console.error('Login handler error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function refreshHandler(req, res) {
  try {
    console.log('[auth] POST /api/auth/refresh called');
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: 'Refresh token not found' });
      return;
    }

    const result = await authController.refreshToken(refreshToken);
    if (!result.success) {
      res.clearCookie('refreshToken');
      res.status(401).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Refresh handler error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function logoutHandler(req, res) {
  try {
    console.log('[auth] POST /api/auth/logout called');
    const refreshToken = req.cookies?.refreshToken;
    await authController.logout(refreshToken);
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout handler error:', error);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
}

async function verifyHandler(req, res) {
  try {
    console.log('[auth] GET /api/auth/verify called');
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Access token required' });
      return;
    }

    const userData = await authController.verifyToken(token);
    if (!userData) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    console.error('Verify handler error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);
    if (!token) {
      res.status(401).json({ success: false, error: 'Access token required' });
      return;
    }

    const userData = await authController.verifyToken(token);
    if (!userData) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
      return;
    }

    req.user = userData;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  loginHandler,
  refreshHandler,
  logoutHandler,
  verifyHandler,
  authMiddleware,
};


