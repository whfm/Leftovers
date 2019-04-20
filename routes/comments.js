var express = require("express");
var router = express.Router({mergeParams: true});
var Recipe = require("../models/recipe");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//*************************
// Comments routes
//*************************

router.get("/new", middleware.isLoggedIn, function(req, res) {
    Recipe.findById(req.params.id, function(err, Recipe){
        if (err) {
            console.log(err);
        } 
        else {
             res.render("comments/new", {Recipe:Recipe});
        }
    });
});

// Comments create
router.post("/", middleware.isLoggedIn, function(req, res){
    Recipe.findById(req.params.id, function(err, Recipe) {
       if(err){
           res.redirect("/recipes");
       } 
       else {
           Comment.create(req.body.comment, function(err, comment){
              if(err){
                  req.flash("error", "Something went wrong");
                  console.log(err);
              } 
              else {
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  Recipe.comments.push(comment);
                  Recipe.save();
                  req.flash("success", "Successfully added comment!");
                  res.redirect("/recipes/" + Recipe._id);
              }
           });
       }
    });
});

// Comments edit route

router.get("/:comment_id/edit",function(req, res){
    Comment.findById(req.params.comment_id,function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
           res.render("comments/edit", {Recipe_id: req.params.id, comment: foundComment}); 
        }
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err){
            res.redirect("back");
        } 
        else {
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment deleted!");
            res.redirect("/recipes/" + req.params.id);
        }
    });
});

module.exports = router;
