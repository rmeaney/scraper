// dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// grab models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js")

//scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//Initialize express
var app = express();

// Use morgan and Body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));
// Make public a static dir
app.use(express.static("public"));

//Database configuration with mongoose
mongoose.connect("mongodb://localhost/myscraperdb2");
var db = mongoose.connection;

//show any mongoose errors
db.on("error", function(error){
	console.log("Mongoose Error: ", error);
});
db.once("open", function() {
	console.log("Mongoose connection Successful");
});

// Routes
//A get request to scrape the site
 app.get("/scrape", function(req, res) {
 	//First grab the body of the html with this request function
 	request("https://www.nytimes.com/", function(error, response, html) {
 		//then we load that into cheerio,
 		var $ = cheerio.load(html);
 		// Now, we grab every h2 within an article tag, and do the following
 		$("article h2").each(function(i, element) {
 			var result = {};

 			//add the text and href of every link, and save them as properties for the result object
 			result.title = $(this).children("a").text();
 			result.link = $(this).children("a").attr("href");

 			// Using our Article model, create a new entry
 			// This effectively passes the result object to the entry (and the title and link)
 			var entry = new Article(result);

 			//Now, save that entry to the db
 			entry.save(function(err,doc) {
 				if (err){
 					console.log(err);
 				}else{
 					console.log(doc);
 				}
 			});

 		});
 	});
 	//tell the browser that we finished scraping the server
 	res.send("Scrape Complete")
 });

 //This will grab the articles we scraped from mongoDB
 app.get("/articles", function(req, res) {
 	//Grab every doc in the articles array
 	Article.find({}, function(error,doc) {
	 	//error logging
	 	if(error){
	 		console.log(error);
	 	} 
	 	// or send the doc to the browser as a json object
	 	else{
	 		res.json(doc);
	 	}
	 });
 });
 // Grab an article by its ObjectId
 app.get("/articles/:id", function(req,res){
 	//using the id passed in the id parameter, prepare a query that finds the matching one in our db
 	Article.findOne({ "_id": req.params.id })
 	// and populate all of the notes associated with it
 	.populate("note")
 	//now executre the query
 	.exec(function(error, doc) {
 		// Log any errors
 		if(error){
 			console.log(error);
 		}
 		// Otherwise, send the doc to the browser as a json object
 		else {
 			res.json(doc);
 		}
 	});
 });

 // Create a new note or replace an existing note
 app.post("/articles/:id", function(req, res) {
 	// Create a new note and pass the req.body to the entry
 	var newNote = new Note(req.body);
 	//and save the note to the db
 	newNote.save(function(error, doc) {
 		//log errors
 		if(error) {
 			console.log(error);
 		}
 		else {
 			Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
 			//Execute above query
 			.exec(function(err, doc) {
 				// log errors
 				if (err) {
 					console.log(err);
 				}
 				else{
 					//send doc to browser
 					res.send(doc);
 				}
 			});

 		}
 	})
 })

//listen on port 3001
var port = process.env.Port || 3001;
app.listen(port, function(){
	console.log("App running on port 3001");
});