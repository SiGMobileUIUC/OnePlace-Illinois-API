const axios = require('axios');
const parser = require('fast-xml-parser');

const { Subjects, Courses } = require('../models');

const isArray = (a) => (!!a) && (a.constructor === Array);

/**
 * Parses XML from response into JSON
 * @param {AxiosResponse} res
 * @returns {JSON}
 */
const parseResponseXML = (res) => {
  const xmlData = res.data;
  return parser.parse(xmlData, { ignoreAttributes: false });
};

/**
 * Parses XML from response into JSON with attributes
 * @param {AxiosResponse} res
 * @returns {json}
 */
const parseResponseXMLWithAttributes = (res) => {
  const xmlData = res.data;
  return parser.parse(xmlData, { ignoreAttributes: false });
};

/**
 * @returns {Promise<array>} Array of years
 */
const getYears = async () => {
  return axios
    .get('https://courses.illinois.edu/cisapp/explorer/schedule.xml')
    .then(parseResponseXML)
    .then((data) => data['ns2:schedule'].calendarYears.calendarYear);
};

/**
 * @param {string} year
 * @returns {Promise<array>}
 */
const getTerms = async (year) => {
  if (!year) throw new Error('Invalid year');
  return axios
    .get(`https://courses.illinois.edu/cisapp/explorer/schedule/${year}.xml`)
    .then(parseResponseXML)
    .then((data) => data['ns2:calendarYear'].terms.term)
    .then((terms) => terms.map((term) => term.replace(/[\d\s]/g, '').toLowerCase()));
};

/**
 * @param {int} year
 * @param {string} term
 * @returns {Promise<object>} Object of key 'Subject Code' and value 'Subject Full Name'
 */
const getSubjects = async (year, term) => {
  if (!year || !term) throw new Error('Invalid parameter');
  return axios
    .get(`https://courses.illinois.edu/cisapp/explorer/schedule/${year}/${term}.xml`)
    .then(parseResponseXMLWithAttributes)
    .then((data) => data['ns2:term'].subjects.subject)
    .then((subjects) => subjects.reduce((obj, subject) => ({ ...obj, [subject['@_id']]: subject['#text'] }), {}));
};

/**
 * @param {int} year
 * @param {string} term
 * @param {string} subject
 * @returns {Promise<object>} Object of key 'Course Code' and value 'Course Full Name'
 */
const getCourses = async (year, term, subject) => {
  if (!year || !term || !subject) throw new Error('Invalid parameter');
  return axios
    .get(`https://courses.illinois.edu/cisapp/explorer/schedule/${year}/${term}/${subject}.xml`)
    .then(parseResponseXMLWithAttributes)
    .then((data) => data['ns2:subject'].courses.course)
    // some data contains only one course, which returns {} instead of [{}, {}, {}]
    .then((data) => (isArray(data) ? data : [data]))
    .then((courses) => courses.reduce((obj, course) => ({ ...obj, [course['@_id']]: course['#text'] }), {}));
};

/**
 * @param {int} year
 * @param {string} term
 * @param {string} subject
 * @param {int} course
 * @returns {Promise<object>} Object of key 'Section ID' and value 'Section Name'
 */
const getSections = async (year, term, subject, course) => {
  if (!year || !term || !subject || !course) throw new Error('Invalid parameter');
  return axios
    .get(`https://courses.illinois.edu/cisapp/explorer/schedule/${year}/${term}/${subject}/${course}.xml`)
    .then(parseResponseXMLWithAttributes)
    .then((data) => data['ns2:course'].sections.section)
    // some data contains only one section, which returns {} instead of [{}, {}, {}]
    .then((data) => (isArray(data) ? data : [data]))
    .then((sections) => sections.reduce((obj, section) => ({ ...obj, [section['@_id']]: section['#text'] }), {}));
};

/**
 * @param {int} year
 * @param {string} term
 * @param {string} subject
 * @param {int} course
 * @param {int} section
 * @returns {Promise<any>}
 */
const getMeetings = async (year, term, subject, course, section) => {
  if (!year || !term || !subject || !course || !section) throw new Error('Invalid parameter');
  return axios
    .get(`https://courses.illinois.edu/cisapp/explorer/schedule/${year}/${term}/${subject}/${course}/${section}.xml`)
    .then(parseResponseXMLWithAttributes)
    .then((data) => data['ns2:section'].meetings.meeting)
    .then((_meetings) => {
      const meetings = _meetings;
      meetings.type = meetings.type['#text'];
      meetings.id = meetings['@_id'];
      meetings.instructors = meetings.instructors.instructor['#text'];
      delete meetings['@_id'];
      return meetings;
    });
};

(async () => {
  const year = 2021;
  const term = 'fall';
  const subjects = await getSubjects(year, term);
  const subjectCodes = Object.keys(subjects);

  // Add Subjects to DB
  console.log(subjectCodes);
  for (const subjectCode of subjectCodes) {
    await Subjects.create({ code: subjectCode, name: subjects[subjectCode] });
  }

  // Fetch & Add Courses of Each Subject to DB
  // eslint-disable-next-line no-restricted-syntax
  for (const subjectCode of subjectCodes) {
    const courses = await getCourses(year, term, subjectCode);
    const courseCodes = Object.keys(courses);
    for (const courseCode of courseCodes) {
      const courseData = {
        subject: subjectCode,
        code: courseCode,
        full_code: `${subjectCode}_${courseCode}`,
        name: courses[courseCode],
        year,
        term,
      };
      await Courses.findOrCreate({
        where: courseData,
        // set the default properties if it doesn't exist
        defaults: courseData,
      });
    }
  }
})();

(async () => {
  const testFunc = '';
  // const testFunc = 'courses';

  let data;
  switch (testFunc) {
    case 'years':
      data = await getYears();
      break;
    case 'terms':
      data = await getTerms(2021);
      break;
    case 'subjects':
      data = await getSubjects(2021, 'fall');
      break;
    case 'courses':
      data = await getCourses(2021, 'fall', 'CS');
      break;
    case 'sections':
      data = await getSections(2021, 'fall', 'CS', 173);
      break;
    case 'meetings':
      data = await getMeetings(2021, 'fall', 'CS', 173, 30102);
      break;
    default:
      break;
  }

  console.log(data);
})();
