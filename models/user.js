/** User class for message.ly */
const bcrypt = require('bcrypt');
const {BCRYPT_WORK_FACTOR} = require('../config');
const db = require('../db');
const ExpressError = require('../expressError');


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    const hashPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
              INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
              VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING username, password, first_name, last_name, phone`, [username, hashPassword, first_name, last_name, phone]);

    if(result.rows.length === 0) throw new ExpressError('Could not register', 400)

    return result.rows[0]
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(`SELECT username, password FROM users
                            WHERE username = $1`, [username]);
    

    if(result.rows.length === 0) throw new ExpressError('Invalid username/password', 400)
    
    const hashPassword = result.rows[0].password;

    return await bcrypt.compare(password, hashPassword)
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(`UPDATE users 
                    SET last_login_at=CURRENT_TIMESTAMP
                    WHERE username = $1
                    RETURNING username
                    `, [username]);

    if (!result.rows[0]) throw new ExpressError('No user found', 404);
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(`SELECT username, first_name, last_name, phone FROM users;`)

    return results.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const results = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1;`, [username])

    if(results.rows.length === 0) throw new ExpressError('User not found', 404)

    return results.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const results = await db.query (
      `SELECT id, to_username, body, sent_at, read_at, u.first_name, u.last_name, u.phone 
      FROM messages AS m
      JOIN users AS u ON to_username = u.username
      WHERE from_username = $1`, [username])

    if(results.rows.length === 0) throw new ExpressError('No messages from user', 404)

    const messages = results.rows.map(m => ({
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
    }))

    return messages
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const results = await db.query (
      `SELECT id, from_username, body, sent_at, read_at, u.first_name, u.last_name, u.phone 
      FROM messages AS m
      JOIN users AS u ON from_username = u.username
      WHERE to_username = $1`, [username]);

    if(results.rows.length === 0) throw new ExpressError('No messages to user', 404)

      const messages = results.rows.map(m => ({
        id: m.id,
        from_user: {
          username: m.from_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at,
    }));

    return messages
  }
}


module.exports = User;