var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Senior = require("./models/senior");
var User = require("./models/user");
var Comment = require("./models/comment");
var flash = require("connect-flash");


var seedDB = require("./seeds");
var passport = require("passport");
var methodOverride = require("method-override");
var LocalStrategy = require("passport-local");

var commentRoutes = require("./routes/comments");
var SeniorRoutes = require("./routes/seniors");
var indexRoutes = require("./routes/index");
var reviewRoutes = require("./routes/reviews");

var phasesRoutes = require("./routes/phases");



mongoose.connect(process.env.DATABASEURL);

//mongoose.connect("mongodb://localhost/27017");

app.locals.moment = require('moment');
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again blabla",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/seniors", SeniorRoutes);
app.use("/seniors/:id/comments", commentRoutes);
app.use("/seniors/:id/reviews", reviewRoutes);
app.use("/phases", phasesRoutes);


//=============================================================================
//Starts the server

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The O-RA server has started!");
});

