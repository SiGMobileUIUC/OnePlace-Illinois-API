import express from 'express';
import { router } from './src/routes/api.js';
import bodyParser from 'body-parser';
import { createClient} from 'redis';
import { promisify } from 'util';

const REDIS_PORT = process.env.PORT || 6379;
const client = createClient(REDIS_PORT);
const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.setex).bind(client);

// set up express app
const app = express();

app.use(bodyParser.json());

app.use('/api', router);

app.use(function(e, req, res, next) {
    console.log(e.message);
    res.status(422).send({
        status: "failed",
        error: e,
    });
});

// listen for requests

app.listen(process.env.PORT || 4000, function() {
    console.log("Now listening to requests.");
});

export {client, SET_ASYNC, GET_ASYNC};