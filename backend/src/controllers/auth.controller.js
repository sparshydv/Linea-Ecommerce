const { registerUser, loginUser, loginWithGoogle } = require('../services/auth.service');
const { HTTP_STATUS } = require('../constants/httpStatus');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser({ email, password, name });
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { code } = req.body;
    const result = await loginWithGoogle({ code });
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getCurrentUser = (req, res) => {
  res.status(HTTP_STATUS.OK).json({ success: true, data: req.user });
};

module.exports = {
  register,
  login,
  googleLogin,
  getCurrentUser,
};
