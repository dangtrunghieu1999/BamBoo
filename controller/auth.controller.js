const md5 = require('md5');
const shortid = require('shortid');
const db = require('../db');

// gửi mail
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// set up phương thức gửi mail
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

// 1.2 signup, render sign up
module.exports.signup = function(req, res) {
	res.render('auth/signup');
};

// forget pw, render forget password
module.exports.forgetPw = function(req, res) {
	res.render('auth/forgetpw');
};

// active, render active
module.exports.active = function(req, res) {
	res.render('auth/active');
};



// post login
module.exports.postLogin = function(req, res) {
	// Lay ra email và password
	let email = req.body.email;
	let password = req.body.password;

	// Lấy user từ db bằng email
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
	
	// Kiểm tra user đó có active không, nếu không thì chuyển sang trang active
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

	// Lấy user từ db bằng email
	let user = db.get('users').find({email: req.body.email}).value();

	// Nếu user đó email đó tồn tại thì thông báo lỗi
	if(user) {
		res.render('auth/signup', {
			errors: ['User already exists.'],
			values: req.body
		})

		return;
	}

	// Gán cho nó một cái id và active
	req.body.id = shortid.generate();
	req.body.active = 0;
	
	// setup project gửi mail, cái active
	var mailOptions = {
		to: req.body.email,
		subject: 'Code to active account',
		text: req.body.id
	};
	
	// bắt đầu sendmail
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	// Chuyển mật khẩu thành md5
	req.body.password = md5(req.body.password);
	
	// thêm user vào db
	db.get('users').push(req.body).write();

	//rederect
	// điều hướng sang trang active
	res.redirect('/auth/active');


}

// post sign up
module.exports.postForgetPw = function(req, res) {

	// Lấy cái email từ req.body gán vào biến email
	let email = req.body.email;

	// Lấy ra user đó bằng email
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


// set lại mật khẩu mới đó vào database
  db.get('users').find({email:email}).set('password', newPasswordMd5).write();	 // or .defaults depending on what you want to do 



	// redirect sang trang 
	res.redirect('/');


}

// signup, render forget password
module.exports.postActive = function(req, res) {
	// lấy biến email và code gán vào 2 biến
	let email = req.body.email;
	let code = req.body.code;
	// tìm kiếm user theo email
	let user = db.get('users').find({email: email}).value();
	
	// email không tồn tại thì thông báo lỗi
	if(!user) {
		res.render('auth/signup', {
			errors: ['Email wrong !.'],
			values: req.body
		})

		return;
	}
	
	// code không đúng thì thông báo lỗi
	if(user.id !== code) {
		res.render('auth/signup', {
			errors: ['Code wrong !.'],
			values: req.body
		})

		return;
	}
	
	// set user đó là cái active
	db.get('users').find({email:email}).set('active', 1).write();

	// rederect tới trang chủ
	res.redirect('/')

	
};

// 3.2 nhận yêu cầu từ router và xử lý các logic cho view
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

	// 3.3 lấy user từ db bằng field email
	let user = db.get('users').find({email: req.body.email}).value();

	// 3.4 nếu tồn tại user thì render lại trang và hiển thị thông báo lỗi
	if(user) {
		res.render('auth/signup', {
			errors: ['User already exists.'],
			values: req.body
		})

		return;
	}

	// 3.5 nếu không tồn tại user thì 
	// gán cho nó 1 cái id
	req.body.id = shortid.generate();
	// gán 1 cái active = 0
	req.body.active = 0;
	// gửi về mail lấy từ form vừa nhập đoạn code id để active tài khoản
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

	// 3.6 Chuyển mật khẩu thành md5
	req.body.password = md5(req.body.password);
	// 3.7 ghi tất cả thông tin xuống db
	db.get('users').push(req.body).write();

	// 3.8 set cho nó một cái cookie và có signed
	// 4. redirect sang trang user
	
	res.redirect('/auth/active');


}
