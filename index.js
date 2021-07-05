import express from 'express';
import { router } from './src/routes/api.js';
import bodyParser from 'body-parser';
import { createClient} from 'redis';
import { promisify } from 'util';
import helmet from 'helmet';

const client = createClient(6379, process.env.REDIS_HOST || '127.0.0.1');
const GET_ASYNC = promisify(client.get).bind(client);
const SET_ASYNC = promisify(client.setex).bind(client);

// set up express app
const app = express();

app.use(helmet());

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