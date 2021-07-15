const axios = require('axios');
const cheerio = require('cheerio');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Fetch courses from Illinois website using our own options
 * @param {object} options
 * @returns {Promise>}
 */
const searchCourses = async (options) => {
  try {
    const keyword = options.keyword.toLowerCase();
    const { term, year } = options;

    const url = `https://courses.illinois.edu/search?keyword=${keyword}&term=${term}&year=${year}&length=10`;
    const relayedRes = await axios.get(url);
    const $ = cheerio.load(relayedRes.data);

    const $resultRows = $('#search-result-dt > tbody > tr');
    const years = [];
    const terms = [];
    const subjects = [];
    const numbers = [];
    const names = [];

    $resultRows.each((i, row) => {
      const cols = $(row).children('td');
      const courseFullCode = $(cols[3]).html().split(' '); // e.g. 'STAT 200' => ['STAT', '200']
      // for courseName, remove tab \t, newline \n, and \r, and then trim whitespace
      const courseName = $(cols[4]).find('a').text().replace(/[\t\n\r]/gm,'').trim();
      years.push($(cols[1]).html());
      terms.push($(cols[2]).html());
      names.push(courseName);
      subjects.push(courseFullCode[0]);
      numbers.push(courseFullCode[1]);
    });

    const courses = years.map((year, i) => {
      return {
        year,
        term: terms[i],
        subjectId: subjects[i],
        subjectNumber: numbers[i],
        name: names[i],
      };
    });

    return courses;
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
}

module.exports = {
  searchCourses,
};
