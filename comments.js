// Create web server

// Import Express
const express = require('express');
// Import Express Router
const router = express.Router();
// Import Comment model
const Comment = require('../models/comment');
// Import Post model
const Post = require('../models/post');
// Import User model
const User = require('../models/user');
// Import authentication middleware
const auth = require('../middleware/auth');

// Create a new comment
router.post('/api/comments', auth, async (req, res) => {
	// Create a new comment
	const comment = new Comment(req.body);
	try {
		// Save the comment
		await comment.save();
		// Find the comment's post
		const post = await Post.findById(req.body.post);
		// Add the comment to the post's comments
		post.comments.push(comment);
		// Save the post
		await post.save();
		// Find the comment's user
		const user = await User.findById(req.body.user);
		// Add the comment to the user's comments
		user.comments.push(comment);
		// Save the user
		await user.save();
		// Send the comment
		res.send(comment);
	} catch (error) {
		// Send the error
		res.status(500).send(error);
	}
});

// Edit a comment
router.patch('/api/comments/:id', auth, async (req, res) => {
	// Get the comment's id
	const _id = req.params.id;
	// Get the comment's updates
	const updates = Object.keys(req.body);
	// List of valid updates
	const validUpdates = ['text'];
	// Check if the updates are valid
	const isValidUpdate = updates.every((update) => validUpdates.includes(update));
	if (!isValidUpdate) {
		// Send an error
		return res.status(400).send({ error: 'Invalid updates!' });
	}
	try {
		// Find the comment
		const comment = await Comment.findOne({ _id });
		// Check if the comment exists
		if (!comment) {
			// Send an error
			return res.status(404).send();
		}
		// Update the comment
		updates.forEach((update) => (comment[update] = req.body[update]));
		// Save the comment
		await comment.save();
		// Send the comment
		res.send(comment);
	} catch (error) {