const parser = require('fast-xml-parser');

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
  // const testFunc = 'meetings';
  const testFunc = 'sections';

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

  const coursesRef = db.collection('courses');

  const subjectYear = 2021;
  const subjectTerm = 'fall';
  const subjectCode = 'CS';
  const courseData = await getCourses(subjectYear, subjectTerm, subjectCode);
  console.log(courseData);

  for (const courseCode of Object.keys(courseData)) {
    const courseName = courseData[courseCode];
    const docName = `${subjectCode}_${courseCode}`;

    await coursesRef.doc(docName).set({
      name: courseName,
      code: courseCode,
      subject: subjectCode,
    });
  }

})();
