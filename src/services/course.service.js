const axios = require('axios');
const cheerio = require('cheerio');
const httpStatus = require('http-status');
const { Op, literal } = require('sequelize');

const ApiError = require('../utils/ApiError');
const { Courses } = require('../models');
const { searchSections } = require('./section.service');
const itemAttributes = require('./internal/itemAttributes');
const subjectCodeToName = require('../../data/2021-subjects.json');

const isUpperCase = (str) => str === str.toUpperCase();

/**
 * Search courses on local Postgres
 * @param options
 * @returns {Promise<*|*>}
 */
const searchCourses = async (options) => {
  try {
    const { keyword, page, per_page: perPage, only_courses: onlyCourses } = options;
    const keywordArr = keyword.split(' ');

    /*
        Design queries
        -- for query, use iLike, which is 'like' (%keyword%) but case-insensitive.
     */

    const orQueries = [
      { name: { [Op.iLike]: `%${keyword}%` } },
    ];
    const inKeyword = {
      courseCode: undefined,
      subjectCode: undefined,
    };

    // Analyze whole keyword
    if (/intro\s/i.test(keyword)) {
      const expandKeyword = keyword.replace(/intro/i, 'Introduction');
      orQueries.push({ name: { [Op.iLike]: `%${expandKeyword}%` } });
    }

    // Analyze each word of the keyword
    keywordArr.forEach((word) => {
      const isAllLetters = /^[a-zA-Z]+$/.test(word);
      const isAllDigits = /^[0-9]+$/.test(word);

      if (isAllDigits) {
        // may be a code, like 124 -- use equals as it's integer
        inKeyword.courseCode = word;
        orQueries.push({ code: { [Op.eq]: Number(word) } });
      } else if (isAllLetters && isUpperCase(word)) {
        // may be a subject, like CS (only allow uppercase)
        inKeyword.subjectCode = word;
        orQueries.push({ subject: { [Op.eq]: word } });
      }
    });

    // order by more matches first (remove the empty []'s when conditions don't match)
    const resultOrder = [
      // first prioritize the subject_code
      inKeyword.subjectCode && inKeyword.courseCode ? [literal(`CASE WHEN full_code = '${inKeyword.subjectCode}${inKeyword.courseCode}' THEN 1 ELSE 4 END`), 'asc'] : [],
      // then the course code
      inKeyword.courseCode ? [literal(`CASE WHEN code = ${inKeyword.courseCode} THEN 2 ELSE 4 END`), 'asc'] : [],
      // then the subject code
      inKeyword.subjectCode ? [literal(`CASE WHEN subject = '${inKeyword.subjectCode}' THEN 3 ELSE 4 END`), 'asc'] : [],
      ['name', 'asc'],
    ].filter((x) => x.length > 0);

    const dbOptions = {
      attributes: itemAttributes.course,
      where: { [Op.or]: orQueries },
      order: resultOrder,
      limit: Math.max(10, perPage),
      offset: Math.max(0, perPage * (page - 1)),
    };

    /*
        Search and refine matched courses
     */

    // const foundCount = await Courses.count({ where: { [Op.or]: orQueries }});

    let courses = await Courses.findAll(dbOptions);

    // Get additional Course and Sections data
    const tmpSections = {};

    for (const course of courses) {
      const courseFullCode = `${course.subject}${course.code}`;
      const internalOptions = { attributes: itemAttributes.section };
      // eslint-disable-next-line no-await-in-loop
      tmpSections[courseFullCode] = await searchSections({ code: courseFullCode }, internalOptions);
    }

    courses = courses.map((_course) => {
      const course = _course;
      const courseFullCode = `${course.subject}${course.code}`;
      const sections = tmpSections[courseFullCode];

      const sectionCodeList = sections.map((section) => `${section.code}_${section.CRN}`);
      const { year, term } = sections[0].dataValues; // get from the first section
      const termID = ['fall', 'spring', 'summer'].indexOf(term);
      // courses with multiple Gen Eds (e.g. ANTH 103 or GEOG 101) are separated with ", and" in the csv
      // so remove "and", split by "," and remove "course."
      const genEds = course.degree_attributes.replace(/\sand\s/, ' ').split(',').map((genEd) => genEd.replace(/\scourse.$/, '')).filter((x) => x);

      // modify course data
      course.year = year;
      course.semester = term;
      course.semesterID = termID;
      course.subjectId = course.subject; // this comes before course.subject
      course.subject = subjectCodeToName[course.subjectId] || '';
      course.genEd = genEds;
      course.sections = sectionCodeList;

      delete course.code;
      delete course.degree_attributes;

      return course;
    });

    // return only course data
    if ((typeof onlyCourses === 'boolean' && onlyCourses) || onlyCourses === 'true') return courses;

    courses = courses.map((_course) => {
      const course = _course;
      const courseFullCode = `${course.subjectId}${course.courseId}`;
      course.sections = tmpSections[courseFullCode];
      return course;
    });

    return courses;
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

/**
 * Fetch courses from Illinois website using our own options
 * @param {object} options
 * @returns {Promise>}
 */
const searchCoursesThroughWebsites = async (options) => {
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

    const courses = years.map((yr, i) => ({
      year: yr,
      term: terms[i],
      subjectId: subjects[i],
      subjectNumber: numbers[i],
      name: names[i],
    }));

    return courses;
  } catch (e) {
    console.log(e);
    if (e instanceof ApiError) throw e;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};

module.exports = {
  searchCourses,
};
