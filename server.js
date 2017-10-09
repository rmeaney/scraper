var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.Promise = Promise;

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

require("./routes/api-routes.js")(app);

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

require("./routes/api-routes.js")(app);


//listen on port 3001
var port = process.env.Port || 3001;
app.listen(port, function(){
	console.log("App running on port 3001");
});