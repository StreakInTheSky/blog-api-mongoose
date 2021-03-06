const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: {type: String, required: true},
		lastName: {type: String},
	},
	content: {type: String, required: true}
})

postSchema.virtual('authorString').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`;
});

postSchema.methods.apiRepr = function() {

	return {
		id: this._id,
		title: this.title,
		author: this.authorString,
		content: this.content
	};
}

const BlogPost = mongoose.model('Posts', postSchema);

module.exports = {BlogPost};