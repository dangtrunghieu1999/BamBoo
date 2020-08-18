const db = require('../db');

module.exports.requireAuth = function(req, res, next) {

// Lấy ra cookie khi đã signedCookie
if(!req.signedCookies.userID) {
	res.redirect('/auth/login');
	return;
}

let user = db.get('users').find({ id: req.signedCookies.userID }).value();

if(!user) {
	res.redirect('/auth/login');
	return ;

}
// Gán cho các middle ở sau biến user
res.locals.user = user; 

next();

};	