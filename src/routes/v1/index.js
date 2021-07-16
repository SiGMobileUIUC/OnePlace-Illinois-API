const express = require('express');

const config = require('../../config/config');
const courseRoute = require('./course.route');
const sectionRoute = require('./section.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/course',
    route: courseRoute,
  },
  {
    path: '/section',
    route: sectionRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
