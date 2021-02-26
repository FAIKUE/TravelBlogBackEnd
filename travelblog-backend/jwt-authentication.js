const jwt = require('jsonwebtoken');
const jwtAcessTokenSecret = 'traveblogsecret';

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
        const token = authHeader.split(' ')[1];
  
        jwt.verify(token, jwtAcessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
  
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({'success': false, 'message': 'Auth token is not supplied.'});
    }
  };

module.exports = { jwtAcessTokenSecret, authenticateJWT }