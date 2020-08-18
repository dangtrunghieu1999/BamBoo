const md5 = require('md5');
const shortid = require('shortid');
const db = require('../db');

// gửi mail
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
	service: 'gmail',
	host: 'smtp.gmail.com',
	auth: {
		user: 'thuongnguyen.nlu78@gmail.com',
		pass: 'chkdskbong'
	}
}));



// login, render login
module.exports.login = function(req, res) {
	res.render('auth/login');
};

// signup, render sign up
module.exports.signup = function(req, res) {
	res.render('auth/signup');
};

// signup, render forget password
module.exports.forgetPw = function(req, res) {
	res.render('auth/forgetpw');
};

// signup, render forget password
module.exports.active = function(req, res) {
	res.render('auth/active');
};



// post login
module.exports.postLogin = function(req, res) {
	// Lay ra email và sdt
	let email = req.body.email;
	let password = req.body.password;

	// Kiem tra email có trong db không?
	let user = db.get('users').find({email: email}).value();

	// Nếu không có thì hiển thị lỗi và return
	if(!user) {
		res.render('auth/login', {
			errors: ['User does not exist.'],
			values: req.body
		})
		// render: path, object

		return;
	}

	if(user.active === 0) {
		res.redirect('./active');
		// render: path, object

		return;
	}

	// Nếu có thì transform password thành md5 và so sánh trong database
	let hashPassword = md5(password);

	// Nếu password trong database khác với password đã hash
	// thì hiển thị thông báo lỗi
	if(user.password !== hashPassword) {
		res.render('auth/login', {
			errors: ['Wrong password.']
		})

		return;
	}

	// Nếu okie, thì set cho nó một cái cookie và có signed, redirect sang trang user
	res.cookie('userID', user.id, {signed: true});
	res.redirect('/user');

}

// post sign up
module.exports.postSignup = function(req, res) {

	/**
	 * 1. Nếu email đã tồn tại thì thông báo lỗi
	 * 2. Nếu email chưa tồn tại
	 * 	2.1. Gắn cho nó một cái id
	 *  2.2. Đổi mật khẩu thành md5
	 *  2.3. Đăng nhập nó
	 *  2.4. Riderect tới trang chủ
	 */

	 //req.body.email: dữ liệu email từ form nhập lên

	// Kiểm tra email có trong db không?
	let user = db.get('users').find({email: req.body.email}).value();

	// Nếu có thì hiển thị lỗi và return
	if(user) {
		res.render('auth/signup', {
			errors: ['User already exists.'],
			values: req.body
		})

		return;
	}

	// Gán cho nó một cái id
	req.body.id = shortid.generate();
	req.body.active = 0;

	var mailOptions = {
		to: req.body.email,
		subject: 'Code to active account',
		text: req.body.id
	};

	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	// Chuyển mật khẩu thành md5
	// Dùng md5 để mã hóa mật khẩu khi đưa vào db
	req.body.password = md5(req.body.password);



	db.get('users').push(req.body).write();

	// Nếu okie, thì set cho nó một cái cookie và có signed, redirect sang trang user

	res.redirect('/auth/active');


}

// post forget password
module.exports.postForgetPw = function(req, res) {

	/**
	 * 1. Nếu email đã tồn tại thì thông báo lỗi
	 * 2. Nếu email chưa tồn tại
	 * 	2.1. Gắn cho nó một cái id
	 *  2.2. Đổi mật khẩu thành md5
	 *  2.3. Đăng nhập nó
	 *  2.4. Riderect tới trang chủ
	 */

	// Lấy cái email từ req.body gán vào biến email
	let email = req.body.email;

	// Kiểm tra email đó đó có tồn tại không databse hay không
	let user = db.get('users').find({email: email}).value();

	// Nếu không tồn tại thì hiển thị lỗi và return
	if(!user) {
		res.render('auth/signup', {
			errors: ['User doesn\'t exists.'],
			values: req.body
		})

		return;
	}
	
	// Nếu tồn tại thì gửi qua email đó mật khẩu mới

	var newPassword = shortid.generate();
	var newPasswordMd5 = md5(newPassword);

	var mailOptions = {
		to: email,
		subject: 'New Password',
		text: newPassword
	};

	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});



  db.get('users').find({email:email}).set('password', newPasswordMd5).write();	 // or .defaults depending on what you want to do 



	// Nếu okie, thì set cho nó một cái cookie và có signed, redirect sang trang user
	res.redirect('/');


}

// signup, render forget password
module.exports.postActive = function(req, res) {
	
	let email = req.body.email;
	let code = req.body.code;

	let user = db.get('users').find({email: email}).value();

	if(!user) {
		res.render('auth/active', {
			errors: ['Email wrong !.'],
			values: req.body
		})

		return;
	}

	if(user.id !== code) {
		res.render('auth/active', {
			errors: ['Code wrong !.'],
			values: req.body
		})

		return;
	}

	db.get('users').find({email:email}).set('active', 1).write();

	res.redirect('/')

	
};



