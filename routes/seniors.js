var express = require("express");
var router = express.Router();
var Senior = require("../models/senior");
var middleware = require("../middleware");
var Review = require("../models/review");
var Comment = require("../models/comment");
var async = require("async");
var await = require("await");


//*************************
// Image Uploader
//*************************

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//*************************
// Senior routes
//*************************

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Seniors from DB
        Senior.find({name: regex}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              if(allSeniors.length < 1) {
                  noMatch = "No talents match that query, please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/seniors');
              }
              res.render("seniors/index",{ Seniors:allSeniors, noMatch: noMatch, page: 'seniors'});
           }
        }).populate("comments");
    } else {
        // Get all Seniors from DB
        Senior.find({}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              res.render("seniors/index",{ Seniors:allSeniors, Comment: Comment, noMatch: noMatch, page: 'seniors'});
           }
        }).populate("comments");
    }
});

router.get("/indexyoung", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Seniors from DB
        Senior.find({name: regex}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              if(allSeniors.length < 1) {
                  noMatch = "No talents match that query, please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/seniors/indexyoung');
              }
              res.render("seniors/indexyoung",{ Seniors:allSeniors, noMatch: noMatch, page: 'young'});
           }
        }).populate("comments");
    } else {
        // Get all Seniors from DB
        Senior.find({}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              res.render("seniors/indexyoung",{ Seniors:allSeniors, Comment: Comment, noMatch: noMatch, page: 'young'});
           }
        }).populate("comments");
    }
});

router.get("/indexcompany", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Seniors from DB
        Senior.find({name: regex}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              if(allSeniors.length < 1) {
                  noMatch = "No talents match that query, please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/seniors/indexcompany');
              }
              res.render("seniors/indexcompany",{ Seniors:allSeniors, noMatch: noMatch, page: 'indexcompany'});
           }
        }).populate("comments");
    } else {
        // Get all Seniors from DB
        Senior.find({}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              res.render("seniors/indexcompany",{ Seniors:allSeniors, Comment: Comment, noMatch: noMatch, page: 'company'});
           }
        }).populate("comments");
    }
});

router.get("/indexentertainment", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Seniors from DB
        Senior.find({name: regex}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              if(allSeniors.length < 1) {
                  noMatch = "No talents match that query, please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/seniors/indexentertainment');
              }
              res.render("seniors/indexentertainment",{ Seniors:allSeniors, noMatch: noMatch, page: 'indexentertainment'});
           }
        }).populate("comments");
    } else {
        // Get all Seniors from DB
        Senior.find({}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              res.render("seniors/indexentertainment",{ Seniors:allSeniors, Comment: Comment, noMatch: noMatch, page: 'entertainment'});
           }
        }).populate("comments");
    }
});

router.get("/allcombined", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Seniors from DB
        Senior.find({name: regex}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              if(allSeniors.length < 1) {
                  noMatch = "No talents match that query, please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/allcombined');
              }
              res.render("seniors/allcombined",{ Seniors:allSeniors, noMatch: noMatch, page: 'allcombined'});
           }
        }).populate("comments");
    } else {
        // Get all Seniors from DB
        Senior.find({}, function(err, allSeniors){
           if(err){
               console.log(err);
           } else {
              res.render("seniors/allcombined",{ Seniors:allSeniors, Comment: Comment, noMatch: noMatch, page: 'allcombined'});
           }
        }).populate("comments");
    }
});

//CREATE - add new Senior to the database

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the senior object under image property
      req.body.senior.image = result.secure_url;
      // add image's public_id to senior object
      req.body.senior.imageId = result.public_id;
      // add author to senior
      req.body.senior.author = {
        id: req.user._id,
        username: req.user.username
      }
      
      Senior.create(req.body.senior, function(err, senior) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/seniors/' + senior.id);
      });
    });
});

//NEW - Show form to create new Senior
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("seniors/new");
});

// SHOW - shows more info about one Senior

router.get("/:id", function (req, res) {
    //find the senior with provided ID
    Senior.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundSenior) {
        if(err || !foundSenior){
            console.log(err);
            req.flash('error', 'Sorry, that Senior does not exist!');
            return res.redirect('/seniors');
        } else {
            //render show template with that senior
            res.render("seniors/show", {Senior: foundSenior});
        }
    });
});

// EDIT Senior ROUTE
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkSeniorOwnership, function(req, res){
  //render edit template with that Senior
  res.render("seniors/edit", {Senior: req.Senior});
});

// UPDATE Senior ROUTE

router.put("/:id", upload.single('image'), middleware.isLoggedIn, middleware.checkSeniorOwnership, function(req, res){
    Senior.findById(req.params.id, async function(err, senior){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                if (req.file.path != null) {
                    try {
                      cloudinary.v2.uploader.destroy(senior.imageId);
                      var result = await cloudinary.v2.uploader.upload(req.file.path);
                      senior.imageId = result.public_id;
                      senior.image = result.secure_url;
                    } catch(err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                    senior.name = req.body.name;
                    senior.description = req.body.description;
                    senior.skill = req.body.skill;
                    senior.personType = req.body.personType;
                    senior.price = req.body.price;
                    senior.save();
                    req.flash("success","Successfully Updated!");
                    res.redirect("/seniors/" + senior._id);
                }
            }
            else {
                    senior.name = req.body.name;
                    senior.description = req.body.description;
                    senior.skill = req.body.skill;
                    senior.personType = req.body.personType;
                    senior.price = req.body.price;
                    senior.save();
                    req.flash("success","Successfully Updated!");
                    res.redirect("/seniors/" + senior._id);
            }
        }
    });
});

// DESTROY Senior ROUTE


// DESTROY TEACHER ROUTE
router.delete("/:id", middleware.checkSeniorOwnership, function (req, res) {
    Senior.findById(req.params.id, function (err, senior) {
        if (err) {
            res.redirect("/seniors");
        } else {
            // deletes all comments associated with the senior
            Comment.remove({"_id": {$in: senior.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/seniors");
                }
                // deletes all reviews associated with the senior
                Review.remove({"_id": {$in: senior.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/seniors");
                    }
                    //  delete the senior
                    senior.remove();
                    req.flash("success", "Talent deleted successfully!");
                    res.redirect("/seniors");
                });
            });
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;