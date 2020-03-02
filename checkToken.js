let jwt = require('jsonwebtoken');
// const config = require('./config.js');

let checkToken = (req, res, next) => {
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
    
  jwt.verify(token, 'mohitkadel', function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      
    // if everything good, save to request for use in other routes
    req.userId = decoded.userId;
    next();
  });
};

module.exports = checkToken