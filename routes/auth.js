const express = require('express')
const jwt = require('jsonwebtoken');
const ExpressError = require('../expressError');
const User = require('../models/user');
const { SECRET_KEY } = require('../config')

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
    try{
        const {username, password } = req.body;

        if (!username || !password) throw new ExpressError('Must include username and password', 400);
    
        const validUser = await User.authenticate(username, password);
    
        if(!validUser) throw new ExpressError('Invalid username/password', 400);
    
        User.updateLoginTimestamp(username);
        const user = await User.get(username);

        const token = await jwt.sign({username: user.username}, SECRET_KEY);
    
        return res.json({msg: 'logged in!', token})
    } catch (err) {
        next(err)
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try{
        const user = await User.register(req.body);

        if(!user) throw new ExpressError('Registration failed', 500);

        const token = await jwt.sign({username: user.username}, SECRET_KEY);

        return res.json({msg:'registered!', token})

    } catch (err) {
        next(err)
    }
})

module.exports =  router;