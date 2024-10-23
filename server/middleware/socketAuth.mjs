import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
  
  if (!token) {
    // Allow connection without token for now, but mark as unauthorized
    socket.auth = { authorized: false };
    return next();
  }

  try {
    const decoded = verifyToken(token);
    if (decoded) {
      socket.auth = {
        authorized: true,
        user: decoded
      };
      return next();
    }
  } catch (err) {
    return next(new Error('Authentication error'));
  }

  socket.auth = { authorized: false };
  return next();
};
