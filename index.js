const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const checkToken = require('./checkToken');

let User = require('./user.model');

var port = process.env.PORT || 8080;

// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
   extended: true
}));

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/todo-list', { useNewUrlParser: true});

var db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")


let getTask = function (req, res) {
    User.findOne({ _id: req.params.id }, function (err, user) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Task retrieved successfully",
            data: user.tasks
        });
    });
};

let getUser = function (req, res) {
    User.findOne({ _id: req.params.id }, function (err, user) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "User retrieved successfully",
            data: user
        });
    });
};

let updateTask = function (req, res) {
    User.update({'tasks._id': req.params.taskId}, {'$set': {
        'tasks.$.title': req.body.title,
        'tasks.$.description': req.body.description,
        'tasks.$.update_date': Date.now
    }}, function(err, user) {
        if(err) {
            res.send(err);
        }
        else if(!user) {
            res.status(401).send("Task not found");
        }
        else {
            result.data = user;
            res.status(200).send(result);
        }
    })
};

let createTask = function (req, res) {
	let task = {};
	task.title = req.body.title;
	task.description = req.body.description;

    let result = {};
    User.findByIdAndUpdate(req.params.id, { $push: { tasks: task  } }, {useFindAndModify: false}, (err, user) => {
    	if(err) {
            res.send(err);
    	}
        else if(!user) {
            res.status(401).send("User not found");
        }
    	else {
    		result.data = user;
            res.status(200).send(result);
    	}
    })
};

let login = function (req, res) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;
    User.findOne({ username: user.username }, (err, userRes) => {
    	let status = 200;
    	let result = {};
    	const options = { expiresIn: '2d', issuer: 'https://localhost' };
	    const secret = "mohitkadel";
    	if (!err && userRes) {  

    		// Create a token
		    const payload = { userId: userRes._id };
		    const token = jwt.sign(payload, secret, options);

    		bcrypt.compare(user.password, userRes.password).then(match => {
              if (match) {
                result.data = userResx;
                result.token = token;
              } else {
                status = 401;
                result.error = 'Authentication error';
              }
              res.status(status).send(result);
            })
    	}
    	// If user not found then create new user
    	else {console.log('here')
    		// save the contact and check for errors
		    user.save(function (err, userSaved) {
                if (err)
		            res.send(err);
		        else {
		        	// Create a token
				    const payload = { userId: userSaved._id };
				    const token = jwt.sign(payload, secret, options);

		        	result.data = user;
			        result.token = token;
			        res.status(201).send(result);
		        }
		    });
    	}
    })
};

router.get('/', function() {
	console.log("hi")
});

router.post('/login', login);

router.get('/user/:id', checkToken, getUser);

router.get('/user/:id/task', checkToken, getTask);

router.post('/user/:id/task', checkToken, createTask);

router.put('/user/:id/task/:taskId', checkToken, updateTask);

app.use(router)

var server = app.listen(port, function() {
	console.log("server started at port " + port);
})

