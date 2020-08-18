const db = require('../db');
const shortid = require('shortid');
const md5 = require('md5');

// Render ra trang index, truyền vào danh sách object user
module.exports.index = function(req, res) {
	var page = req.query.page || 1;
	var perPage = 15;

	var start = (page - 1) * perPage;
	var end = page * perPage;
 

	res.render('users/index', {
		products: db.get('products').value().slice(start, end),
		user: res.locals.user
	});
};
// Khi nhấn vào search, nó sẽ lấy query params và tìm trong db và trả ra list user hợp lệ
module.exports.search = function(req, res) {
z
	console.log(req.query);
	let q = req.query.q;

	let users = db.get('users').value();
	
	var matchedUser = users.filter(function(user) {
		return user.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
	});

	res.render('users/index', {
		users: matchedUser
	});

}

// Khi nhấn vào create sẽ render ra trang create user
module.exports.create = function(req, res) {

	res.render('users/create')

};

// Trả về user hiện tại
module.exports.get = function(req, res) {
	// Lấy ra router params sau dấu :
	let id = req.params.id;

	// Lấy thằng user có id đó
	let user = db.get('users').find({id: id}).value();

	//Render ra view của thằng user đó
	res.render('users/view', {
		user : user
	});
};

module.exports.postCreate = function(req, res, next) {

	// Muốn sử dụng req.body phải cài body-pasrse
	// Set object.id thành một chuỗi ngẫu nhiên, không trùng lặp
	req.body.id = shortid.generate();
	req.body.password = md5(req.body.password);

	// Add object vào db
	 db.get('users').push(req.body).write();

	// Chuyển hướng trang đến /user
	 res.redirect('/auth/login');
};

module.exports.signout = function(req, res) {

	res.clearCookie('userID');
<<<<<<< HEAD

	res.redirect('/');
}

=======
>>>>>>> 9cc27510e7b4046bf76d9815ea87875cf45e4904

	res.redirect('/');
}