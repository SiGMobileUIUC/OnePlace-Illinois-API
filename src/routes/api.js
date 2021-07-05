import  express  from 'express';
import { courseExplorerListQuery } from '../puppeteer/puppeteer.js';
import { GET_ASYNC, SET_ASYNC } from '../../index.js';
const router = express.Router();

// get a list of courses based on a query.

router.get('/courses/search', async function(req, res, next) {
    try {
        const query = req.query.query.toLowerCase();
        let cacheData = await GET_ASYNC(query.trim());
        
        if (cacheData !== undefined && cacheData !== null) {
            res.send({
                status: "success",
                data: JSON.parse(cacheData)
            });
            return;
        }

        let cachedJson = await courseExplorerListQuery(query).catch(next);
        let parsedJson = JSON.parse(cachedJson);
        await SET_ASYNC(query.trim(), 86400, cachedJson);
        res.send({
            status: "success",
            data: parsedJson
        });
    } catch (e) {
        console.log(e);
        res.status(422).send({
            status: "failed",
            error: e.message,
        })
    }
});

// SCRAPPED
/* // new user logging in, add to db.
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
}); */

export {router};