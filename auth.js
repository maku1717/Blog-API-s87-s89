const jwt = require("jsonwebtoken");

//Environment Setup
//import our .env for environment variables
require("dotenv").config();

//JSON Web Tokens
//Token Creation
module.exports.createAccessToken = (user) => {
  const data = {
    id: user._id,
    email: user.email,
    userName: user.userName,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};

//Token Verification
module.exports.verify = (req, res, next) => {
  let token = req.headers.authorization;

  if (typeof token === "undefined") {
    return res.send({ auth: "Failed. No Token" });
  } else {
    console.log(token);
    token = token.slice(7, token.length);
    // Bearer <actual token>
    console.log(token);

    //Token decryption
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decodedToken) {
      if (err) {
        return res.status(403).send({
          auth: "Failed",
          message: err.message,
        });
      } else {
        console.log("Result from verify method: ");
        console.log(decodedToken);

        req.user = decodedToken;

        next();
      }
    });
  }
};

// Verification of User if Admin
module.exports.verifyAdmin = (req, res, next) => {
  console.log("Result from verifyAdmin method");
  console.log(req.user);

  if (req.user.isAdmin) {
    next();
  } else {
    return res.status(403).send({
      auth: "Failed",
      message: "Action Forbidden",
    });
  }
};

//Error Handler
module.exports.errorHandler = (err, req, res, next) => {
  console.error(err);

  //Add status code 500
  const statusCode = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message: errorMessage,
      errorCode: err.code || "SERVER_ERROR",
      details: err.details || null,
    },
  });
};

//Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
};

// Prompt for this code
// Write a Node.js JWT authentication helper module that includes the following:

// 1. Import jsonwebtoken and load environment variables using dotenv.
// 2. Create a function `createAccessToken(user)` that signs a JWT using:
//    - id: user._id
//    - email: user.email
//    - isAdmin: user.isAdmin
//    The function must use `process.env.JWT_SECRET_KEY` for signing and return the signed token.

// 3. Create a middleware `verify` that:
//    - Reads the Authorization header
//    - If missing, returns { auth: "Failed. No Token" }
//    - Extracts the token from the format "Bearer <token>"
//    - Uses jwt.verify to decode the token
//    - If verification fails: return status 403 with { auth: "Failed", message: err.message }
//    - Otherwise: log the decoded token, store it in req.user, and call next()

// 4. Create `verifyAdmin` middleware:
//    - Logs req.user
//    - If req.user.isAdmin is true → next()
//    - Otherwise → return status 403 with { auth: "Failed", message: "Action Forbidden" }

// 5. Add an errorHandler middleware that:
//    - Logs the error
//    - Responds with status (err.status || 500)
//    - Returns a JSON object:
//        {
//          error: {
//            message: errorMessage,
//            errorCode: err.code || "SERVER_ERROR",
//            details: err.details || null
//          }
//        }

// 6. Create an isLoggedIn middleware:
//    - If req.user exists → next()
//    - Else → send status 401

// Generate the entire module exactly as described in CommonJS syntax (module.exports). Do not modify, simplify, or optimize the logic—follow the description exactly.
