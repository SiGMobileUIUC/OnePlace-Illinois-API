import  express  from 'express';
import { pool } from '../db/db.js';
import { loginMoodle } from '../puppeteer/puppeteer.js';
const router = express.Router();

// get a list of courses the user has.
router.get('/courses', async function(req, res, next) {
    res.send({type: 'GET'});
});

// new user logging in, add to db.
router.post('/login', async function(req, res, next) {
    const {netid, password} = req.body;
    let cookies = await loginMoodle(netid, password);
    if (cookies === null) {
        res.status(500).send({
            status: "failed",
            type: 'POST',
            data: null,
            details: "Login Credentials failed."
        });
        return;
    }
    let jsonCookies = JSON.stringify(cookies, null, 2);
    try {
        const user = await pool.query("INSERT INTO users (netid, cookies) VALUES ($1, $2)", [netid, jsonCookies]);
    } catch (e) {
        // debugger;
        console.log(e.message);
        res.status(500).send({
            status: "failed",
            type: 'POST',
            data: null,
            details: "Failed to store cookies"
        });
        return;
    }

    res.send({
        status: "success",
        type: 'POST',
        data: {
            netid: netid
        }
    });
    return;
});

// update the user's credentials.
router.put('/login', async function(req, res, next) {
    res.send({type: 'PUT'});
});

// delete a user from db.
router.delete('/logout', async function(req, res, next) {
    const {netid} = req.body;
    const user = await pool.query("DELETE FROM users WHERE netid = $1", [netid]);
    res.send({type: 'DELETE'});
});

export {router};