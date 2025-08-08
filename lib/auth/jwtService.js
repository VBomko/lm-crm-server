const jwt = require('jsonwebtoken');
const { supabase } = require('../../utils/supabase');

class JwtService {
  constructor() {
    this.ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production';
    this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    this.ACCESS_TOKEN_EXPIRES_IN = '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = '7d';
  }

  generateTokenPair(payload) {
    const accessToken = jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN });
    const refreshToken = jwt.sign({ userId: payload.userId }, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: 15 * 60,
      refreshTokenExpiresIn: 7 * 24 * 60 * 60,
    };
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET);
      return decoded;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET);
      return decoded;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  async refreshAccessToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return null;
    }

    try {
      const { data: userData, error } = await supabase
        .from('Users')
        .select('Id, Email, First_Name, Last_Name, Can_Login')
        .eq('Id', decoded.userId)
        .single();

      if (error || !userData || !userData.Can_Login) {
        console.error('User not found or inactive during token refresh:', error);
        return null;
      }

      const accessToken = jwt.sign(
        {
          userId: userData.Id,
          email: userData.Email,
          firstName: userData.First_Name,
          lastName: userData.Last_Name,
        },
        this.ACCESS_TOKEN_SECRET,
        { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
      );

      return {
        accessToken,
        expiresIn: 15 * 60,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  getRefreshTokenCookieOptions(isProduction = false) {
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }
}

const jwtService = new JwtService();

module.exports = { JwtService, jwtService };


