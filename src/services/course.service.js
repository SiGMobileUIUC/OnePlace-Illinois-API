const axios = require('axios');
const cheerio = require('cheerio');
const httpStatus = require('http-status');
const { Op, literal } = require('sequelize');

const ApiError = require('../utils/ApiError');
const { Courses, Sections } = require('../models');
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

    // Order by more matches first (remove the empty []'s when conditions don't match)
    // ** Writing "TableName"."ColumnName" in search query is critical when JOINing tables that have same column names
    const resultOrder = [
      // first prioritize the subject_code
      inKeyword.subjectCode && inKeyword.courseCode ? [literal(`CASE WHEN "Courses"."full_code" = '${inKeyword.subjectCode}${inKeyword.courseCode}' THEN 1 ELSE 4 END`), 'asc'] : [],
      // then the course code
      inKeyword.courseCode ? [literal(`CASE WHEN "Courses"."code" = ${inKeyword.courseCode} THEN 2 ELSE 4 END`), 'asc'] : [],
      // then the subject code
      inKeyword.subjectCode ? [literal(`CASE WHEN "Courses"."subject" = '${inKeyword.subjectCode}' THEN 3 ELSE 4 END`), 'asc'] : [],
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
        JOIN on `Sections` to include section data
        ** LIMIT 1 when qs only_courses === true (one section is needed for 'year' and 'term')
        ** GET All when qs only_courses === false
     */
    dbOptions.include = [{
      model: Sections,
      required: true,
      attributes: itemAttributes.section,
    }];
    if (onlyCourses) dbOptions.include[0].limit = 1;

    // Get course data
    const courses = await Courses.findAll(dbOptions);

    // Refine course data & return
    return courses.map((_course) => {
      const course = _course.toJSON();
      const sections = course.Sections;

      // Year & Term - retrieved from the first section data
      const { year, term } = sections[0];
      const termID = ['fall', 'spring', 'summer'].indexOf(term);

      // Gen Eds (ie. degree attributes)
      // - courses with multiple Gen Eds (e.g. ANTH 103 or GEOG 101) are separated with ", and" in the csv
      //   so remove "and", split by "," and remove "course."
      const genEds = course.degree_attributes
        .replace(/\sand\s/, ' ').split(',')
        .map((genEd) => genEd.replace(/\scourse.$/, '')).filter((x) => x);

      // Modify course data
      course.year = year;
      course.semester = term;
      course.semesterID = termID;
      course.subjectId = course.subject; // this comes before course.subject
      course.subject = subjectCodeToName[course.subjectId] || '';
      course.genEd = genEds;
      course.fullCode = course.full_code;

      // if: only_courses == false, then: copy section to a renamed key (for storing)
      // else: will discard the section data
      if (!onlyCourses) course.sections = sections;

      delete course.Sections;
      delete course.code;
      delete course.full_code;
      delete course.degree_attributes;

      return course;
    });
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
