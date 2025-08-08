const { supabase } = require('../../utils/supabase');
const { jwtService } = require('./jwtService');
const { passwordService } = require('./passwordService');

class AuthController {
  async login(request) {
    try {
      console.log('[auth] controller.login invoked');
      const { email, password } = request;

      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
        }

      const { data: userData, error: dbError } = await supabase
        .from('Users')
        .select('Id, Email, First_Name, Last_Name, Password, Can_Login')
        .eq('Email', String(email).toLowerCase())
        .single(); 

      console.log('[auth] user lookup result error?', !!dbError, 'found?', !!userData);

      if (dbError || !userData) {
        console.error('User lookup error:', dbError);
        return { success: false, error: 'Invalid email or password' };
      }

      if (!userData.Can_Login) {
        return { success: false, error: 'Your account is disabled. Please contact support.' };
      }

      let isPasswordValid = false;
      if (userData.Password) {
        if (userData.Password.startsWith('$2a$') || userData.Password.startsWith('$2b$')) {
          isPasswordValid = await passwordService.verifyPassword(password, userData.Password);
        } else {
          isPasswordValid = userData.Password === password;
          if (isPasswordValid) {
            const hashedPassword = await passwordService.hashPassword(password);
            await supabase.from('Users').update({ Password: hashedPassword }).eq('Id', userData.Id);
          }
        }
      }

      if (!isPasswordValid) {
        console.log('[auth] invalid password for', email);
        return { success: false, error: 'Invalid email or password' };
      }

      const tokenPair = jwtService.generateTokenPair({
        userId: userData.Id,
        email: userData.Email,
        firstName: userData.First_Name,
        lastName: userData.Last_Name,
      });

      const response = {
        success: true,
        accessToken: tokenPair.accessToken,
        expiresIn: tokenPair.accessTokenExpiresIn,
        refreshTokenExpiresIn: tokenPair.refreshTokenExpiresIn,
        user: {
          id: userData.Id,
          email: userData.Email,
          firstName: userData.First_Name,
          lastName: userData.Last_Name,
        },
      };
      console.log('[auth] login success for', email);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return { success: false, error: 'Refresh token is required' };
      }

      const result = await jwtService.refreshAccessToken(refreshToken);
      if (!result) {
        return { success: false, error: 'Invalid or expired refresh token' };
      }

      return {
        success: true,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        refreshTokenExpiresIn: 7 * 24 * 60 * 60,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Token refresh failed' };
    }
  }

  async logout(refreshToken) {
    try {
      if (refreshToken) {
        const decoded = jwtService.verifyRefreshToken(refreshToken);
        if (decoded) {
          console.log(`Logging out user: ${decoded.userId}`);
        }
      }
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true, message: 'Logged out successfully' };
    }
  }

  async verifyToken(accessToken) {
    try {
      const decoded = jwtService.verifyAccessToken(accessToken);
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async getUserPermissions(userId) {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('Can_Login')
        .eq('Id', userId)
        .single();

      if (error || !data) {
        return { canLogin: false };
      }

      return { canLogin: data.Can_Login === true };
    } catch (error) {
      console.error('Error checking user permissions:', error);
      return { canLogin: false };
    }
  }
}

const authController = new AuthController();

module.exports = { AuthController, authController };


