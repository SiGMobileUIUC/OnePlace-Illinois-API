import express from 'express';
import { router } from './src/routes/api.js';
import bodyParser from 'body-parser';

// set up express app

const app = express();

app.use(bodyParser.json());

app.use('/api', router);

app.use(function(e, req, res, next) {
    debugger;
    console.log(e.message);
});

// listen for requests

app.listen(process.env.PORT || 4000, function() {
    console.log("Now listening to requests.");
});