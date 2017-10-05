//require mongoose
var mongoose = require("mongoose");
//Create Schema Class
var Schema = mongoose.Schema;

//create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

//Create the Article model with the ArticleSchema
 var Article = mongoose.model("Article", ArticleSchema);

 // export the model
 module.exports = Article;