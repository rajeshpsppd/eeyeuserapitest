const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mongoose = require('mongoose'),
	db = mongoose.connection,
	cookieParser = require('cookie-parser'),
    config = require('./config'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	indexRoute = require('./routes/index.route'),
	adminRoute = require('./routes/admin.route'),
	// taskRoute = require('./routes/task.route'),
	port = config.port;

	if(!config.jwtSecret) {
		console.log("ERROR: Set jwtSecret in config");
		return -99;
	}
	if(!config.reCAPTCHASecretKey) {
		console.log("ERROR: Set reCAPTCHASecretKey in config");
		return -99;
	}

	const app = express();


	var whitelist = config.whitelist;
	var corsOptionsDelegate = function (req, callback) {
		var corsOptions;
		if (whitelist.indexOf(req.header('Origin')) !== -1) {
		corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
		} else {
		corsOptions = { origin: true } // disable CORS for this request
		}
		callback(null, corsOptions) // callback expects two parameters: error and options
	};
	
	process.setMaxListeners(Infinity); // <== Important line
	
	mongoose.set('useNewUrlParser', true);
	mongoose.set('useFindAndModify', false);
	mongoose.set('useCreateIndex', true);
	mongoose.set('useUnifiedTopology', true);

	mongoose.Promise = global.Promise;
	const dbURI = config.DB || process.env.MONGODB_URI;

	var isConnectedBefore = false;
	var connect = function() {
		  mongoose.connect(dbURI, { useNewUrlParser: true, auto_reconnect:true }).then(
		  () => {console.log('Database is connected') },
		  err => { console.log('Can not connect to the database'+ err)}
		);
	};
	connect();

	db.on('error', function() {
		console.log('Could not connect to MongoDB');
	});

	db.on('disconnected', function(){
		console.log('Lost MongoDB connection...');
		if (!isConnectedBefore)
			connect();
	});
	db.on('connected', function() {
		isConnectedBefore = true;
		console.log('Connection established to MongoDB');
	});

	db.on('reconnected', function() {
		console.log('Reconnected to MongoDB');
	});

	// Close the Mongoose connection, when receiving SIGINT
	process.on('SIGINT', function() {
		db.close(function () {
			console.log('Force to close the MongoDB conection');
			process.exit(0);
		});
	})
	
	app.use(bodyParser.json({limit: '20mb', extended: true}))

	app.use(bodyParser.urlencoded({
		limit: "50mb",
		extended: false
	}));
	app.use(cookieParser());
	app.use(cors(corsOptionsDelegate));
	// Express Session middleware
	app.use(session({
	  resave: false,
	  secret: 'Rama EarthEye',
	  saveUninitialized: true,
	  store: new MongoStore({mongooseConnection: mongoose.connection}),
	  unset: 'destroy',
	  name: 'session cookies name',
	  cookie: {
		path: '/',
		httpOnly: true,
		maxAge: 180 * 60 * 1000
	  }
	}));
	
	app.use(express.static(path.join(__dirname, 'public')));
		
	app.use('/', indexRoute);
	app.use('/admin', adminRoute);
	// app.use('/task', taskRoute);
		
	const server = app.listen(port, () => {
		console.log('CORS-enabled web server(%s) listening on port %s...', server.address().address, server.address().port);
	});
	// const io = require('socket.io')(server);
	// app.set('socketio', io);
	// io.on('connect', socket => {
		// socket.emit('id', socket.id) // send each client their socket id
	// })					
