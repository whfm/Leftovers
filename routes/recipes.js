var express = require("express");
var router = express.Router();
var Recipe = require("../models/recipe");
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
// Recipe routes
//*************************

router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Recipes from DB
        Recipe.find({name: regex}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              if(allRecipes.length < 1) {
                  noMatch = "We could not find any recipe that matches your criteria. Please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/recipes');
              }
              res.render("recipes/index",{ Recipes:allRecipes, noMatch: noMatch, page: 'recipes'});
           }
        }).populate("comments");
    } else {
        // Get all Recipes from DB
        Recipe.find({}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              res.render("recipes/index",{ Recipes:allRecipes, Comment: Comment, noMatch: noMatch, page: 'recipes'});
           }
        }).populate("comments");
    }
});

router.get("/breakfast", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Recipes from DB
        Recipe.find({name: regex}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              if(allRecipes.length < 1) {
                  noMatch = "We could not find any recipe that matches your criteria. Please try again.";
                  req.flash("error", noMatch);
                  return res.redirect('/recipes/breakfast');
              }
              res.render("recipes/breakfast",{ Recipes:allRecipes, noMatch: noMatch, page: 'breakfast'});
           }
        }).populate("comments");
    } else {
        // Get all Recipes from DB
        Recipe.find({}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              res.render("recipes/breakfast",{ Recipes:allRecipes, Comment: Comment, noMatch: noMatch, page: 'breakfast'});
           }
        }).populate("comments");
    }
});

router.get("/lunch", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Recipes from DB
        Recipe.find({name: regex}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              if(allRecipes.length < 1) {
                  noMatch = "We could not find any recipe that matches your criteria. Please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/recipes/lunch');
              }
              res.render("recipes/lunch",{ Recipes:allRecipes, noMatch: noMatch, page: 'lunch'});
           }
        }).populate("comments");
    } else {
        // Get all Recipes from DB
        Recipe.find({}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              res.render("recipes/lunch",{ Recipes:allRecipes, Comment: Comment, noMatch: noMatch, page: 'lunch'});
           }
        }).populate("comments");
    }
});

router.get("/dinner", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Recipes from DB
        Recipe.find({name: regex}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              if(allRecipes.length < 1) {
                  noMatch = "We could not find any recipe that matches your criteria. Please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/recipes/dinner');
              }
              res.render("recipes/dinner",{ Recipes:allRecipes, noMatch: noMatch, page: 'dinner'});
           }
        }).populate("comments");
    } else {
        // Get all Recipes from DB
        Recipe.find({}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              res.render("recipes/dinner",{ Recipes:allRecipes, Comment: Comment, noMatch: noMatch, page: 'dinner'});
           }
        }).populate("comments");
    }
});

router.get("/dessert", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all Recipes from DB
        Recipe.find({name: regex}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              if(allRecipes.length < 1) {
                  noMatch = "We could not find any recipe that matches your criteria. Please try again.";
                  req.flash('error', noMatch);
                  return res.redirect('/dessert');
              }
              res.render("recipes/dessert",{ Recipes:allRecipes, noMatch: noMatch, page: 'dessert'});
           }
        }).populate("comments");
    } else {
        // Get all Recipes from DB
        Recipe.find({}, function(err, allRecipes){
           if(err){
               console.log(err);
           } else {
              res.render("recipes/dessert",{ Recipes:allRecipes, Comment: Comment, noMatch: noMatch, page: 'dessert'});
           }
        }).populate("comments");
    }
});

//CREATE - add new Recipe to the database

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the recipe object under image property
      req.body.recipe.image = result.secure_url;
      // add image's public_id to recipe object
      req.body.recipe.imageId = result.public_id;
      // add author to recipe
      req.body.recipe.author = {
        id: req.user._id,
        username: req.user.username
      }
      
      Recipe.create(req.body.recipe, function(err, recipe) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/recipes/' + recipe.id);
      });
    });
});

//NEW - Show form to create new Recipe
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("recipes/new");
});

// SHOW - shows more info about one Recipe

router.get("/:id", function (req, res) {
    //find the recipe with provided ID
    Recipe.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundRecipe) {
        if(err || !foundRecipe){
            console.log(err);
            req.flash('error', 'Sorry, that Recipe does not exist!');
            return res.redirect('/recipes');
        } else {
            //render show template with that recipe
            res.render("recipes/show", {Recipe: foundRecipe});
        }
    });
});

// EDIT Recipe ROUTE
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkRecipeOwnership, function(req, res){
  //render edit template with that Recipe
  res.render("recipes/edit", {Recipe: req.Recipe});
});

// UPDATE Recipe ROUTE

router.put("/:id", upload.single('image'), middleware.isLoggedIn, middleware.checkRecipeOwnership, function(req, res){
    Recipe.findById(req.params.id, async function(err, recipe){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                if (req.file.path != null) {
                    try {
                      cloudinary.v2.uploader.destroy(recipe.imageId);
                      var result = await cloudinary.v2.uploader.upload(req.file.path);
                      recipe.imageId = result.public_id;
                      recipe.image = result.secure_url;
                    } catch(err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                    recipe.name = req.body.name;
                    recipe.description = req.body.description;
                    recipe.preparation = req.body.preparation;
                    recipe.skill = req.body.skill;
                    recipe.recipeType = req.body.recipeType;
                    recipe.price = req.body.price;
                    recipe.save();
                    req.flash("success","Successfully Updated!");
                    res.redirect("/recipes/" + recipe._id);
                }
            }
            else {
                    recipe.name = req.body.name;
                    recipe.description = req.body.description;
                    recipe.preparation = req.body.preparation;
                    recipe.skill = req.body.skill;
                    recipe.recipeType = req.body.recipeType;
                    recipe.price = req.body.price;
                    recipe.save();
                    req.flash("success","Successfully Updated!");
                    res.redirect("/recipes/" + recipe._id);
            }
        }
    });
});

// DESTROY Recipe ROUTE


// DESTROY TEACHER ROUTE
router.delete("/:id", middleware.checkRecipeOwnership, function (req, res) {
    Recipe.findById(req.params.id, function (err, recipe) {
        if (err) {
            res.redirect("/recipes");
        } else {
            // deletes all comments associated with the recipe
            Comment.remove({"_id": {$in: recipe.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/recipes");
                }
                // deletes all reviews associated with the recipe
                Review.remove({"_id": {$in: recipe.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/recipes");
                    }
                    //  delete the recipe
                    recipe.remove();
                    req.flash("success", "Recipe deleted successfully!");
                    res.redirect("/recipes");
                });
            });
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;