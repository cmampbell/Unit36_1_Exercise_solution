const express = require('express')
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const User = require('../models/user');
const { SECRET_KEY } = require('../config');
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth');
const Message = require('../models/message');

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async (req, res, next) => {
    try{
        const message = await Message.get(req.params.id);
        if (!foundMessage) throw new ExpressError('Message not found', 404);

        console.log(req.body.user)

        if(message.to_user !== req.body.user.username || message.from_user !== req.body.user.username){
            throw new ExpressError('Unauthorized to view this message', 401)
        }
        return res.json(message)
    } catch(err) {
        return next(err);
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req,res,next) => {
    try{
        const {to_username, body} = req.body
        const from_username = req.user.username;

        if(!to_username || !body || !from_username) throw new ExpressError('Must include all required data', 400)
        const message = await Message.create({from_username, to_username, body})

        return res.json({message: {message}})
    } catch (err) {
        next(err)
    }
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', async (req, res, next) => {
    try{
        const foundMessage = await Message.get(req.params.id);
        if (!foundMessage) throw new ExpressError('Message not found', 404);

        console.log(req.user.username)
        console.log(foundMessage)

        if (foundMessage.to_user.username !== req.user.username) throw new ExpressError('Must be recipient to mark as read', 401)

        const message = await Message.markRead(req.params.id);
        
        return res.json(message);
    } catch (err){
        next(err)
    }
})


module.exports = router