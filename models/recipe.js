var mongoose = require("mongoose");
 
var RecipeSchema = new mongoose.Schema({
   name: String,
   price: String,
   image: String,
   imageId: String,
   description: String,
   preparation: String,
   recipeType: String,
   createdAt: { type: Date, default: Date.now },
   author: {
      id:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   reviews: [
     {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Review"
     }
   ],
   rating: {
     type: Number,
     default: 0
   },
   skill: String
});
 
module.exports = mongoose.model("Recipe", RecipeSchema);