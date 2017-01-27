const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: {type: String},
		lastName: {type: String}
	},
	content: {type: String, required: true}
})

postSchema.virtual('authorString').get(function() {
	return `${this.author.firstName} ${this.author.LastName}`;
});

postSchema.methods.apiRepr = function() {

	return {
		id: this._id,
		title: this.title,
		author: this.authorString,
		content: this.content
	};
}

const Post = mongoose.model('Posts', postSchema);

module.exports = {Post};