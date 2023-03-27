const express = require('express')
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth')

const router = new express.Router();
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', ensureLoggedIn, (req, res, next) => {
    try{
        const users = User.all()
        return res.json(users)
    } catch(err) {
        return next(err)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, (req, res, next) => {
    try{
        const user = User.get(req.params.username)
        return res.json(user);
    } catch (err) {
        return next(err)
    }
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, (req, res, next) => {
    try{
        const messages = User.messagesTo(req.params.username);
        return res.json(messages);
    } catch (err) {
        return next(err);
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', ensureCorrectUser, (req, res, next) => {
    try{
        const messages = User.messagesFrom(req.params.username);
        return res.json(messages);
    } catch (err) {
        return next(err);
    }
})

module.exports = router;