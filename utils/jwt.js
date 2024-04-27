const jwt = require("jsonwebtoken");

const generateToken = () => {
  return new Promise((res, rej) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    jwt.sign(
      { code },
      process.env.JWT_KEY,
      {
        expiresIn: "2h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          rej("No se pudo generar el JWT");
        } else {
          res(token);
        }
      }
    );
  });
};

const verifyToken = (token = "") => {
  try {
    const {} = jwt.verify(token, process.env.JWT_KEY);
    return [true, uid];
  } catch (error) {
    return [false, null];
  }
};

module.exports = {
  generateToken,
  verifyToken
};
