// user.route.js
"use strict";
var async = require("async");
const express = require("express");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const geoip = require("geoip-lite");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
// var SibApiV3Sdk = require('sib-api-v3-sdk');
const config = require("../config");
// const client = require('twilio')(config.accountSid, config.authToken);
// const fast2sms = require('fast2sms');
var multer = require("multer");
// const Jimp = require('jimp');
// const jsQR = require("jsqr");
const path = require("path");
const adminRoute = express.Router();
var fs = require("fs");
const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
var dir = "./public/assets/images/users";
let User = require("../models/user");
let Demo = require("../models/demo");
let Orders = require("../models/order");
let Msg = require("../models/feedback");
const paypal = require("paypal-rest-sdk");
const user = require("../models/user");

var dir = path.join(__dirname, "..", "public", "data"),
  imgdir = path.join(__dirname, "..", "public", "images", "users"),
  dataPath = dir + "/messages.json",
  userPath = dir + "/users.json";
var refreshTokens = {};
const saltRounds = 8;

var i = "Eartheye"; // Issuer
var s = "info@eartheye.space"; // Subject
var a = "https://tasking.eartheye.space"; // Audience
var scope = "add and modify";
// SIGNING OPTIONS
var signOptions = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "24h", // expires in 10mins
};

var verifyOptions = {
  issuer: i,
  subject: s,
  audience: a,
  expiresIn: "5m", // expires in 10mins
  // expiresIn:  "15h",
  // expiresIn:  '15m',
  //algorithm:  ["RS256"]
};
var rand, mailOptions, host, link;
adminRoute.route("/all").get(function (req, res) {
  if (checkOri(req) == true) {
    User.find(function (err, users) {
      if (err) {
        console.log(err);
      } else {
        //console.log('server: ' + users);
        res.json(users);
      }
    });
  } else {
    console.log("Access denied.");
  }
});

// Find user by phone
adminRoute.route("/findUserByPhone/:phone").get(function (req, res) {
  // if (checkOri(req) == true) {
  let usernumber = req.params.phone;
  console.log(usernumber);
  User.findOne({ phone: usernumber }, function (err, user) {
    if (err) res.json(err);
    else res.json(user);
  });
  // }
});
adminRoute.route("/findUserById/:userid").get(function (req, res) {
  // if (checkOri(req) == true) {
  let userid = req.params.userid;
  // console.log(userid)
  User.findOne({ _id: userid }, function (err, user) {
    // console.log(user)
    if (err) res.json(err);
    else res.json(user);
  });
  // }
});

// Login
adminRoute.route("/login/:loginparams").get( async function (req, res) {
  var params = JSON.parse(decodeURIComponent(req.params.loginparams));
  let emailId = params.email;
  let password = params.password;
  let imgfile;
 //Verify user with recaptcha
  const captchaSecretKey = config.reCAPTCHASecretKey;
  const recaptchaToken = params.reCAPTCHAToken;
  const captchaVerificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + captchaSecretKey + "&response=" + recaptchaToken;

  const captcharesponse = await fetch(captchaVerificationUrl);
  const captchaResponseBody = await captcharesponse.json();

  if(captchaResponseBody.success !== undefined && !captchaResponseBody.success) {
    return res.json({Msg : "Failed captcha verification"});
  }

  const user = await User.findOne({ email: emailId });
  if (user == null) {
    return res.status(200).json({ Msg: "User not registered" });
  }
  
  const isLoggedin = await bcrypt.compare(password, user.password);
  if (isLoggedin == true) {
    // PAYLOAD
    var payload = {
      id: user._id,
      name: user.name,
      company: user.company,
      displayname: user.displayname,
      phone: user.phone,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive,
      photo: user.photo,
      subscriptionType: user.subscriptionType,
      address1: user.address1,
      address2: user.address2,
      city: user.city,
      country: user.country,
      zip_code: user.zip_code,
      acBalance: user.acBalance,
      creditHistory: user.creditHistory, //credit History
      debitHistory: user.debitHistory, //debit History
      paylater: user.paylater || false,
      verified: user.verified || false
    };
    // console.log(payload)
    var token = jwt.sign(payload, config.jwtSecret, signOptions);
    const refreshToken = randtoken.uid(256);
    refreshTokens[refreshToken] = user.email;
    res.json({ jwt: token, refreshToken: refreshToken });
  } else {
    res.status(200).json({ Msg: "Wrong password" });
  }
  // }else {console.log("Access denied.");}
});

// Find user for with phone
adminRoute.route("/finduser/:loginparams").get( async function (req, res) {
  var params = JSON.parse(decodeURIComponent(req.params.loginparams));
  let emailId = params.email;
  let password = params.password;
  let imgfile;

  const user = await User.findOne({ email: emailId });
  if (user == null) {
    return res.status(200).json({ Msg: "User not registered" });
  }
  
  const isLoggedin = await bcrypt.compare(password, user.password);
  if (isLoggedin == true) {
    // PAYLOAD
    var payload = {
      id: user._id,
      name: user.name,
      company: user.company,
      displayname: user.displayname,
      phone: user.phone,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive,
      photo: user.photo,
      subscriptionType: user.subscriptionType,
      address1: user.address1,
      address2: user.address2,
      city: user.city,
      country: user.country,
      zip_code: user.zip_code,
      acBalance: user.acBalance,
      creditHistory: user.creditHistory, //credit History
      debitHistory: user.debitHistory, //debit History
      paylater: user.paylater || false,
      verified: user.verified || false
    };
    // console.log(payload)
    var token = jwt.sign(payload, config.jwtSecret, signOptions);
    const refreshToken = randtoken.uid(256);
    refreshTokens[refreshToken] = user.email;
    res.json({ jwt: token, refreshToken: refreshToken });
  } else {
    res.status(200).json({ Msg: "Wrong password" });
  }
  // }else {console.log("Access denied.");}
});

/**
 * This fuction update user acount balance when user oder task via accout balance or add money to wallet
 */
adminRoute.post("/updateAccountBalance", (req, res) => {
  const amount = req?.body?.amount;
  const user = req?.body?.user;
  User.updateOne(
    { _id: user?.id },
    { acBalance: amount },
    (err, collection) => {
      if (err) throw err;
      console.log("Record updated successfully");
      res.send({ message: "success" });
    }
  );
});

// Find user for with phone
adminRoute.route("/findphone/:phone/:password").get(function (req, res) {
  //res.cookie('token1', 'token');
  // if (checkOri(req) == true) {
  let phoneNumber = req.params.phone;
  let password = req.params.password;
  let imgfile;
  // console.log(phoneNumber, password);
  User.findOne({ phone: phoneNumber }, function (err, user) {
    // console.log(user);
    //return;
    if (user == null) {
      res.status(200).json({ Msg: "User not registered" });
      // res.status(404).send("User not registered");
    } else {
      //res.json(user);
      // console.log(user);
      bcrypt.compare(password, user.password, function (err, isLoggedin) {
        // console.log(isLoggedin);
        if (isLoggedin == true) {
          // PAYLOAD
          var payload = {
            id: user._id,
            name: user.name,
            company: user.company,
            phone: user.phone,
            email: user.email,
            userType: user.userType,
            isActive: user.isActive,
            photo: user.photo,
            address: user.address,
          };
          // console.log(payload)
          var token = jwt.sign(payload, config.jwtSecret, signOptions);
          console.log("Token", token);
          const refreshToken = randtoken.uid(256);
          refreshTokens[refreshToken] = user.email;
          res.json({ jwt: token, refreshToken: refreshToken });
          //res.send({token});
          //console.log("Token - " + token);
          //var legit = jwt.verify(token, privateKEY, verifyOptions);
          //console.log("\nJWT verification result: " + JSON.stringify(legit));
          //return true;
          // res.end();
        } else {
          res.status(200).json({ Msg: "Wrong password" });
          // res.status(404).send("Wrong password");
          //res.json(err);
        }
      });
    }
  });
  // }else {console.log("Access denied.");}
});
var upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      var userDir = dir;
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
      }
      callback(null, userDir);
    },
    filename: function (req, file, callback) {
      callback(null, "img" + req.body.phone + path.extname(file.originalname));
    },
  }),

  fileFilter: function (req, file, callback) {
    // console.log(file);
    var ext = path.extname(file.originalname);
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".gif" &&
      ext !== ".jpeg" &&
      ext !== ".svg"
    ) {
      return callback(null, false);
    }
    callback(null, true);
  },
});

//add user
adminRoute.post("/adduser", upload.single("photoFile"), (req, res, next) => {
  // const logo = req.header('Origin') + '/assets/images/logo.png';
  // const logoAsBase64 = "data:image/png;base64,"+fs.readFileSync(logo, 'base64');
  // console.log(logo, logoAsBase64)
  // return;

  // decodedResultName = decodeURI(resultName);
  // adminRoute.post('/adduser', (req, res, next) =>{
  const file = req.file;
  const user = new User(req.body);
  // user.name = req.body.name;
  // console.log(user);
  if (file) {
    user.photo = file.filename;
  }

  user.isActive = false;
  user.otp = Math.floor(Math.random() * 899999 + 100000);

  var salt = bcrypt.genSaltSync(saltRounds);
  user.password = bcrypt.hashSync(user.password, salt);
  // user.deviceFP = req.fingerprint.hash;
  // user.geoip = geoip.lookup(req.ip);
  user
    .save()
    .then((user) => {
      console.log(user)
      rand = Math.floor((Math.random() * 100) + 54);
      host = req.get('host');
      link = "http://" + req.get('host') + "/admin/verifyEmail?id=" + user.email;
      const mailheaders = {
        apikey: "mykey",
        "Content-type": "application/json; charset=UTF-8",
      };
      const EESupport = req.header("Origin") + "/support";
      const emailbody = JSON.stringify({
        mailto: user.email,
        mailfrom: config.sendor,
        subject: "Registration with Eartheye",
        mailbody: `<h3>Dear ${user.name},</h3><br><br>Thank you for registering with Eartheye.<br>
        <div>Please Click on the link to verify your email.</div>${link}
        <br>
        <p>For any queries, please contact <a href='${EESupport}'>customer support</a> or send an email to support@eartheye.space.</p><br><h3>Eartheye Support Team</h3>`,
        //   mailbody: `Thank you for registering with Eartheye.<br><br>Please enter OTP <strong>${user.otp}</strong> when you login first time to activate your account.<br><br>Eartheye support team<br><a href='${EESupport}'>Eartheye</a>`
      });
      // console.log(emailbody);
      // res.status(200).json({'Msg': 'Successfully registered. You will receive a confirmation email to ' + user.email + ' in few minutes.'});
      // return
      {
        /* <a href='${req.header('Origin')}'><img style="width: 100px;" src="${logoAsBase64}"></a>` */
      }

      fetch(config.mailServer, {
        method: "POST",
        body: emailbody,
        headers: mailheaders,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Success") {
          } else {
            console.log(data);
          }
        });

      res.status(200).json({
        Msg:
          "Successfully registered. You will receive a confirmation email to " +
          user.email +
          " in few minutes.",
      });
      // const mailRes = fetch(config.mailServer, {
      // 	method: "POST",
      // 	body: emailbody,
      // 	headers: mailheaders
      // });

      // res.status(200).json({'Msg': 'Successfully registered. You will receive an e-mail to ' + user.email + ' in few minutes with OTP.'});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send("Unable to save user to database");
    });
});

// send OTP by fast2sms
adminRoute.get("/genOTP/:phone", async (req, res) => {
  // adminRoute.route('/genOTP').post(async function (req, res) {
  const otp = 100000 + Math.floor(Math.random() * 900000);
  const smsBody =
    "RSM never calls you asking for OTP. " +
    otp +
    " is OTP for registration of " +
    req.params.phone +
    ".";

  const numbers = [req.params.phone, "9819598754"];
  const response = await fast2sms.sendMessage({
    authorization: config.f2s_API_KEY,
    message: smsBody,
    numbers: numbers,
  });
  // console.log(response)
  res.json(otp);
});

// // send OTP by twilio
// adminRoute.route('/genOTP/:phone').get(function (req, res) {
// const otp = 100000 + Math.floor(Math.random() * 900000);
// const smsBody = "RSM never calls you asking for OTP. " + otp + " is OTP for registration of " + req.params.phone + ".";
// var phone = '';
// const numbers = ['+91' + req.params.phone, '+91' + '9819598754'];
// Promise.all(
// numbers.map(number => {
// phone = number;
// return client.messages.create({
// to: number,
// from: config.fromNumber,
// body: smsBody
// });
// })
// )
// .then(messages => {
// console.log('Messages sent!');
// })
// .catch(err => {
// if (err.code == '21608') {
// console.log('Twilio will send sms to verified number with free a/c. %s is not verified number with twilio.', phone);
// }
// // console.error(err);console.log(err.code);
// });

// // const sendto = ['+91' + '9136390654'];
// // console.log('Sending SMS.', sendto, otp);
// // client.messages
// // .create({
// // body: smsBody,
// // from: config.fromNumber,
// // to: sendto
// // })
// // .then(message => console.log(message.sid));

// res.json(otp);
// });

// Defined edit route
adminRoute.route("/edit/:id").get(function (req, res) {
  let id = req.params.id;
  User.findById(id, function (err, user) {
    res.json(user);
  });
});
//  modify user password
adminRoute.post("/changePassword/:id", (req, res, next) => {
  if (checkOri(req) == true) {
    let id = req.params.id;
    let oldPassword = req.body.oldPassword;
    User.findOne({ _id: id }, function (err, user) {
      if (user == null) {
        res.status(404).send("User not found");
      } else {
        bcrypt.compare(oldPassword, user.password, function (err, isLoggedin) {
          if (isLoggedin == true) {
            var salt = bcrypt.genSaltSync(saltRounds);
            var newPassword = bcrypt.hashSync(req.body.password, salt);
            User.updateOne({ _id: id }, { password: newPassword })
              .then((user) => {
                res.json("Successfully password updated");
              })
              .catch((err) => {
                res.status(400).send("unable to update password");
              });
          } else res.status(400).send("Old password is wrong");
        });
      }
    });
  }
});

adminRoute.post("/forgot", function (req, res, next) {
  // console.log(req.body.email)
  // res.json({Msg: 'Success'}); return
  async.waterfall(
    [
      function (done) {
        // crypto.randomBytes(20, function(err, buf) {
        //   var token = buf.toString('hex');
        //   done(err, token);
        // });

        var payload = {
          email: req.body.email,
        };
        signOptions.expiresIn = "1h";
        var token = jwt.sign(payload, config.jwtSecret, signOptions);
        //console.log(token);
        const err = null;
        done(err, token);
        //    done(token);
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      async function (token, user, done) {
        // console.log('2:-',token, user, done)
        // var smtpTransport = nodemailer.createTransport('SMTP', {
        //   service: 'SendGrid',
        //   auth: {
        // 	user: '!!! YOUR SENDGRID USERNAME !!!',
        // 	pass: '!!! YOUR SENDGRID PASSWORD !!!'
        //   }
        // });
        const mailheaders = {
          apikey: config.mailServerKey,
          "Content-type": "application/json; charset=UTF-8",
        };
        const EESupport = req.header("Origin") + "/support";
        const resetlink = `${req.header("Origin")}/resetpassword?token=${token}`;
        const mailbody = `
        <div>You are receiving this because you (or someone else) have requested the reset of the password for your account</div>
        <br>
        <div><br>Please click or paste the following link into your browser to complete the process:<br><a href='${resetlink}'>${resetlink}</a><br><br><strong>If you did not request this, please ignore this email and your password will remain unchanged.</strong><br><br>Eartheye support team.</div>
        <br>`;

        const emailbody = JSON.stringify({
          mailto: user.email,
          mailfrom: config.sendor,
          subject: "Eartheye Password Reset",
          mailbody: mailbody,
        });

        // user.email = 'rksingh_rk@yahoo.com'; //comment after testing



        fetch(config.mailServer, {
          method: "POST",
          body: emailbody,
          headers: mailheaders,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.message === "Success") {
            } else {
              console.log(data);
            }
          });
        // smtpTransport.sendMail(mailOptions, function(err) {
        // const msg =

        const msg = res.json(
          "You will receive an e-mail to " +
          user.email +
          " in few minutes with further instructions."
        );
        //   done(err, 'done');
        //   done(null, 'done');
        // });
      },
    ],
    function (err) {
      if (err) return next(err);
      //   res.redirect('/forgot');
    }
  );
});

adminRoute.post("/resetPassword/:token", function (req, res) {
  console.log("token", req.params.token, req.body.password);
  // User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
  User.findOne({ resetPasswordToken: req.params.token }, function (err, user) {
    if (!user) {
      res.status(400).json("Password reset token is invalid or has expired.");
      // return res.redirect('/forgot');
    } else {
      var salt = bcrypt.genSaltSync(saltRounds);
      var newPassword = bcrypt.hashSync(req.body.password, salt);
      // user.password = bcrypt.hashSync(newPassword, salt);
      User.updateOne(
        { resetPasswordToken: req.params.token },
        { password: newPassword }
      )
        .then((user) => {
          res.json("Successfully password updated");
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send("Unable to save user to database");
        });
      res.status(200).json("Valid token");
    }
  });
});

//change user photo
adminRoute.post(
  "/changePhoto/:id",
  upload.single("photoFile"),
  (req, res, next) => {
    const file = req.file;
    const newPhoto = file.filename;

    let id = req.params.id;
    // User.findOne({_id: id}, function (err, user){
    // if(user==null){
    // res.status(404).send("User not found");
    // } else {
    User.updateOne({ _id: id }, { photo: newPhoto })
      .then((result) => {
        res.json("Success");
      })
      .catch((err) => {
        res.status(400).send("unable to change photo");
      });
    // }
    // });
  }
);

// change user address
adminRoute.post("/changeAddress/:id", (req, res, next) => {
  if (checkOri(req) == true) {
    const newAddress = req.body;
   //  console.log(newAddress);
    let id = req.params.id;
    // User.findOne({_id: id}, function (err, user){
    // if(user==null){
    // res.status(404).send("User not found");
    // } else {
    User.updateOne({ _id: id }, { address1: req.body.address1,address2: req.body.address2,city:req.body.city,country:req.body.country,zip_code:req.body.zip_code})
      .then((user) => {
        res.json("Successfully address changed");
      })
      .catch((err) => {
        res.status(400).send("unable to update address");
      });
    // }
    // });
  }
});

adminRoute.post("/addfb", (req, res, next) => {
  // const username = req.body.username, company = req.body.company, email= req.body.email, subject = req.body.subject, content = req.body.messages;
  console.log(req.body);
  const msg = new Msg(req.body);
  msg
    .save()
    .then((result) => {
      console.log(result);
      const mailheaders = {
        apikey: "mykey",
        "Content-type": "application/json; charset=UTF-8",
      };
      const EESupport = req.header("Origin") + "/support";

      const mailbody = `<p>Dear <strong>${msg.username}</strong>,</p><div>Thank you for reaching us.</div><br><div>We will get back to you within 1 business day.</div><br><div class='word-wrap: break-word;'><strong>Your ${msg.subject}: </strong>${msg.messages}</div><br><p>For any queries, please contact customer support or send an email to support@eartheye.space.</p><br><h3>Eartheye Support Team</h3><br><a href='${EESupport}'>Eartheye</a>`;

      const emailbody = JSON.stringify({
        mailto: msg.email,
        mailfrom: config.sendor,
        subject: msg.subject,
        mailbody: `${mailbody}`,
      });
      // console.log(emailbody);

      fetch(config.mailServer, {
        method: "POST",
        body: emailbody,
        headers: mailheaders,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Success") {
          } else {
            console.log(data);
          }
        });

      res.status(200).json({
        Msg:
          "Successfully submitted. You will receive reply email to " +
          msg.email +
          " in a few minutes.",
      });
      // const mailRes = fetch(config.mailServer, {
      // 	method: "POST",
      // 	body: emailbody,
      // 	headers: mailheaders
      // });

      // res.status(200).json({'Msg': 'Successfully registered. You will receive an e-mail to ' + user.email + ' in few minutes with OTP.'});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send("Unable to save into database");
    });

  // res.json({Msg: 'Success'});
});

// Find msgs by id
adminRoute.route("/findMsgsById/:id").get(function (req, res) {
  // if (checkOri(req) == true) {
  let id = req.params.id;
  User.findOne({ _id: id }, function (err, user) {
    if (err) res.json(err);
    else res.json(user.questions);
  });
  // }
});

// Find user questions
adminRoute.post("/postQuest/:id", (req, res, next) => {
  if (checkOri(req) == true) {
    const id = req.params.id;
    const question = req.body.question;
    const filter = { _id: id };
    let quest = { question: question };
    User.findOne(filter)
      .then((user) => {
        user.questions.push(quest);
        user = new User(user);
        user.save().then((user) => {
          user.questions.push(quest);
          res.json(user.questions);
        });
      })
      .catch((err) => {
        res.status(400).send("unable to submit");
      });
  }
});

//  modify user status
adminRoute.route("/modify/:id").post(function (req, res) {
  User.updateOne(
    { _id: req.params.id },
    { userType: req.body.userType, isActive: req.body.isActive }
  )
    .then((user) => {
      res.json("Successfully field updated");
    })
    .catch((err) => {
      res.status(400).send("unable to update the database");
    });
});

//  Defined update route
adminRoute.route("/updateField/:id").post(function (req, res) {
  var id = req.params.id;
  var fieldNam = req.body.field;
  var val = req.body.val;
  //   console.log(id + ': ' + req.body.field + ': ' + val);
  User.updateOne(
    { _id: id },
    { $set: { [fieldNam]: val } },
    function (err, user) {
      if (err) res.json(err);
      else res.json("Successfully field updated");
    }
  );
});

// Defined delete | remove | destroy route
adminRoute.route("/delete/:id").get(function (req, res) {
  User.findByIdAndRemove({ _id: req.params.id }, function (err, user) {
    if (err) res.json(err);
    else res.json("Successfully removed");
  });
});

module.exports = adminRoute;

// save msg
async function saveMsg(user, subject, msg) {
  const userId = user.id;
  const name = user.name;
  const phone = user.phone;

  const msgObj = { userId, name, phone, subject, msg };
  let newMsg = new Msg(msgObj);
  newMsg
    .save()
    .then((res) => {
      // res.json(result);
      res.status(200).json("Success");
    })
    .catch((err) => {
      res.status(400).send("unable to add message to database");
    });
}
// Send msg
async function sendMsg(phone, title, smsBody) {
  // const response = await fast2sms.sendMessage({authorization: config.API_KEY, message: smsBody, numbers: phone});
  const numbers = ["+91" + phone];
  smsBody = phone + " - " + smsBody;
  Promise.all(
    numbers.map((number) => {
      return client.messages.create({
        to: number,
        from: config.fromNumber,
        body: smsBody,
      });
    })
  )
    .then((messages) => {
      console.log("Messages sent!");
    })
    .catch((err) => console.error(err));
  // console.log(phone, title, smsBody);
}

function checkOri(req) {
  var accessOK = true;
  // var host = req.get('host');
  var origin = req.get("origin");
  // //console.log('host: ' + host , 'origin: ' + origin);
  // if (origin === 'http://localhost:4200' ||
  // origin === 'http://localhost:1117' ||
  // origin === 'https://ist.freegyanhub.com') {
  // 	accessOK = true;
  // } else {accessOK = false;}
  return accessOK;
}
adminRoute.post("/addRequestDemo", (req, res, next) => {
  // const username = req.body.username, company = req.body.company, email= req.body.email, subject = req.body.subject, content = req.body.messages;
  // console.log(req.body,"res");
  const msg = new Demo(req.body);
  msg
    .save()
    .then((result) => {
      // console.log(result);
      const mailheaders = {
        apikey: config.mailServerKey,
        "Content-type": "application/json; charset=UTF-8",
      };
      const EESupport = req.header("Origin") + "/support";

      const mailbody = `<p>Dear <strong>${msg.name}</strong>,</p>
      <div>Thank you for reaching us.</div>
      <br>
      <div>We will get back to you within 1 business day.</div>
      <br>
      <div class='word-wrap: break-word;'><strong>Your Demo : </strong>${msg.messages}</div>
      <br><p>For any queries, please contact customer support or send an email to support@eartheye.space.</p>
      <br><h3>Eartheye Support Team</h3><br>`;

      const emailbody = JSON.stringify({
        mailto: msg.email,
        mailfrom: config.sendor,
        subject: "Request for Demo",
        mailbody: mailbody,
      });
      //console.log(emailbody);

      fetch(config.mailServer, {
        method: "POST",
        body: emailbody,
        headers: mailheaders,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Success") {
          } else {
            console.log(data, "data");
          }
        });

      res.status(200).json({
        Msg:
          "Successfully submitted. You will receive reply email to " +
          msg.email +
          " in a few minutes.",
      });
      // const mailRes = fetch(config.mailServer, {
      // 	method: "POST",
      // 	body: emailbody,
      // 	headers: mailheaders
      // });

      // res.status(200).json({'Msg': 'Successfully registered. You will receive an e-mail to ' + user.email + ' in few minutes with OTP.'});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send("Unable to save into database");
    });

  // res.json({Msg: 'Success'});
});

//Get personal details
adminRoute.route("/personal-info/:id").get(function (req, res) {
  let emailId = req.params.id;
  User.findOne({ email: emailId }, function (err, user) {
    // PAYLOAD
    var payload = {
      id: user._id,
      name: user.name,
      company: user.company,
      displayname: user.displayname,
      phone: user.phone,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive,
      photo: user.photo,
      subscriptionType: user.subscriptionType,
      address1: user.address1,
      address2: user.address2,
      city: user.city,
      country: user.country,
      zip_code: user.zip_code,
      acBalance: user.acBalance,
      creditHistory: user.creditHistory, //credit History
      debitHistory: user.debitHistory, //debit History
      paylater: user.paylater || false,
    };
    res.json(payload);
  });
});
//send email verification
adminRoute.route("/verifyEmail").get(function (req, res) {

  const spacesReplacedEmail = req.query.id.replaceAll(' ', '+');

  User.findOne({ email: spacesReplacedEmail }, function (err, user) {
    if (user == null) {
      res.status(200).json({ Msg: "User not registered" });
    } else {
      User.updateOne(
        { email: spacesReplacedEmail },
        { verified: true }
      )
        .then((user) => {
          res.redirect(config.login)
        })
        .catch((err) => {
          console.log(err);
          res.status(400).send("Unable to update user to database");
        });


    }
  });

});
adminRoute.route("/updateIsActive").get(function (req, res) {
  var id = req.params.id;
  var fieldNam = req.body.field;
  var val = req.body.val;
  console.log(id + ': ' + req.body.field + ': ' + val);
  User.updateMany({ "$set": { "verified": true } },
    function (err, user) {
      if (err) res.json(err);
      else res.json("Successfully field updated");
    }
  );
});

// adminRoute.route("/updateUUID").get(function (req, res) {
//   Task.find({}, function (err, result) {
//     result?.forEach(task => {
//       let sensorArray = [];

//       //  console.log(((task.request)))
//       var res1 = task.request.substring(0, task.request.length - 1)
//     //  console.log(res1.slice(res1.length - 2, res1.length));
//       var output = [res1.slice(0, res1.length - 1), '"', res1.slice(res1.length - 1)].join('');
//       console.log(output);
//       //  var b = JSON.parse(res1);
//       var str = res1.replace(/\\/g, '');
//       //  console.log(((str)));
//       task.request =[]
//       task.request.push(output)
//      console.log(((sensorArray)));
//       // JSON.parse(task.request).forEach(sensor => {
//       //   sensor.uuid = uuid;
//       //   sensorArray = sensor

//       // //    });
//       // Task.updateOne(
//       //   { id: task?.id },
//       //   { request:  task.request},
//       //   (err, collection) => {
//       //     if (err) throw err;
//       //     console.log(task?.id, "task?.id")
//       //   }
//       // );
//     });

//   });

// });
// adminRoute.route("/updateUUIDCollections").get(function (req, res) {
  
//   Collections.find({}, function (err, result) {
//     result?.forEach(collection => {
//       let sensorArray = [];
//       collection.sensors?.forEach(sensor => {
//         const uuid = uuidv4();
//            sensor.uuid = uuid;
//          sensorArray.push(sensor)
  
//         // Task.updateOne(
//         //   { id: task?.id },
//         //   { request:  task.request},
//         //   (err, collection) => {
//         //     if (err) throw err;
//         //     console.log(task?.id, "task?.id")
//         //   }
//         // );
//       });
//       console.log('sensorArray',sensorArray)

//       Collections.updateOne(
//         { id: collection?.id },
//         { sensors:  sensorArray},
//         (err, collection) => {
//           if (err) throw err;
//           console.log(collection?.id, "collection?.id")
//         }
//        );
//     });

//   });

// });
// adminRoute.route("/updateUUIDOrders").get(function (req, res) {
  
//   Orders.find({}, function (err, result) {
//     result?.forEach(order => {
//       let sensorArray = [];
//       order.orderdetail?.forEach(orderdetail => {
//         var parsedOrderDetails =JSON.parse(orderdetail)
//         const uuid = uuidv4();
//         parsedOrderDetails.uuid = uuid;
//          sensorArray.push(JSON.stringify(parsedOrderDetails))
//         orderdetail = JSON.stringify(parsedOrderDetails);
//         // Task.updateOne(
//         //   { id: task?.id },
//         //   { request:  task.request},
//         //   (err, collection) => {
//         //     if (err) throw err;
//         //     console.log(task?.id, "task?.id")
//         //   }
//         // );
//       });
    
//       order.orderdetail = sensorArray;
//       console.log('sensorArray after',order.taskid,order.id, order.orderdetail)
//       Orders.updateOne(
//         { taskid: order.taskid },
//         { orderdetail:  order.orderdetail},
//         (err, collection) => {
//           if (err) throw err;
//           console.log(order.taskid, "order?.taskid")
//         }
//        );
//     });

//   });
// });
