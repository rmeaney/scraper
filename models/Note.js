// require mongoose
var mongoose = require("mongoose");

//create a schema class
var Schema = mongoose.Schema;

// Create the note schema
var NoteSchema = new Schema({
	title: {
		type :String
	},
	body: {
		type:String
	}
});

// Create the Note Model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

//Export the Note Model
module.exports = Note;

