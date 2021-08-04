const express = require('express');

const courseRoute = require('./course.route');
const sectionRoute = require('./section.route');
const libraryRoute = require('./library.route');
const userRoute = require('./user.route');
const feedRoute = require('./feed.route');
const finalResponder = require('../../middlewares/final-responder');

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
  {
    path: '/library',
    route: libraryRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/feed',
    route: feedRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// Final middleware for all /api/v1 routes
router.use('*', finalResponder);

module.exports = router;
