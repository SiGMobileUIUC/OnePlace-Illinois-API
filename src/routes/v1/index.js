const express = require('express');
const coursesRoute = require('./course.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/course',
    route: coursesRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
