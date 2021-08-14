const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const { sequelize, Subjects, Courses, Sections } = require('../models');
const subjectCodeToName = require('../../data/2021-subjects.json');

const readCSV = async (filePath) => {
  const csvFile = await fs.promises.readFile(filePath);
  const csvData = csvFile.toString();
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
};

(async () => {
  const year = 2021;
  const term = 'fa';
  const filePath = path.join(__dirname, `../../data/${year}-${term}.csv`);
  const allSections = await readCSV(filePath);

  const shouldResetDatabase = true;
  await sequelize.sync({ force: shouldResetDatabase }).then(() => {
    console.log('Restarted db');
  });

  const sectionCount = allSections.length;
  const batchSize = 1000;
  const batchIters = Math.ceil(sectionCount / batchSize);
  const batch = { subjectData: [], courseData: [], sectionData: [] };
  const record = { subjects: [], courses: [], sections: [] };

  console.log(`Total Section Records: ${sectionCount}`);
  console.log(`Given Batch Size: ${batchSize}`);
  console.log(`Total Iterations: ${batchIters}`);

  let idx = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const section of allSections) {
    idx += 1;
    const {
      Name: courseName,
      Subject: subjectCode,
      Number: courseCode,
      Description: courseDesc,
    } = section;
    const courseFullCode = `${subjectCode}${courseCode}`;
    const sectionFullCode = `${courseFullCode}_${section.CRN}`;

    // skip weird data
    // eslint-disable-next-line no-continue
    if (!courseName || !subjectCode || !courseCode) continue;

    const subjectData = { code: subjectCode, name: subjectCodeToName[subjectCode] || subjectCode };

    const courseData = {
      subject: subjectCode, // e.g. CS
      code: Number(courseCode), // e.g. 124
      fullCode: courseFullCode, // e.g. CS124
      name: courseName, // e.g. Introduction to Computer Science I
      // optional
      description: courseDesc,
      creditHours: section['Credit Hours'] || '',
      degreeAttributes: section['Degree Attributes'] || '', // e.g. Gen Ed or Adv Composition
      scheduleInfo: section['Schedule Information'] || '',
      sectionInfo: section['Section Info'] || '', // e.g. Pre-req
    };

    const sectionData = {
      year: Number(section.Year) || year,
      term: section.Term.toLowerCase() || term,
      CRN: Number(section.CRN), // e.g. 74402
      fullCode: sectionFullCode, // e.g. CS124_74402
      course: courseFullCode, // e.g. CS124
      // optionals below
      code: section.Section || '', // e.g. AD1 (may not exist)
      partOfTerm: section['Part of Term'] || '',
      sectionTitle: section['Section Title'] || '',
      sectionCreditHours: section['Section Credit Hours'] || '',
      sectionStatus: section['Section Status'] || '',
      enrollmentStatus: section['Enrollment Status'] || '',
      type: section.Type || '',
      typeCode: section['Type Code'] || '',
      startTime: section['Start Time'] || '',
      endTime: section['End Time'] || '',
      daysOfWeek: section['Days of Week'] || '',
      room: section.Room || '',
      building: section.Building || '',
      instructors: section.Instructors || '',
    };

    // use record arr to prevent duplicate entries (for faster DB upsert)
    // if (!record.subjects.includes(subjectCode)) batch.subjectData.push(subjectData);
    // if (!record.courses.includes(courseCode)) batch.courseData.push(courseData);
    if (!record.subjects.includes(sectionFullCode)) batch.subjectData.push(subjectData);
    // if (!record.courses.includes(sectionFullCode)) batch.courseData.push(courseData);
    batch.courseData.push(courseData);
    batch.sectionData.push(sectionData);

    // record subject & course for above step in the next loop
    record.subjects.push(subjectCode);
    record.courses.push(courseCode);
    record.sections.push(sectionFullCode);

    // Bulk Upsert (update-create) once batch size is hit
    if (idx > batchSize) {
      try {
        await Subjects.bulkCreate(batch.subjectData, {
          validate: true,
          ignoreDuplicates: true,
          logging: false,
        });
        await Courses.bulkCreate(batch.courseData, {
          validate: true,
          ignoreDuplicates: true,
          logging: false,
        });
        await Sections.bulkCreate(batch.sectionData, {
          validate: true,
          ignoreDuplicates: true,
          logging: false,
        });
      } catch (e) {
        console.log(e);
        throw e;
      }

      // empty batch & reset
      batch.subjectData = [];
      batch.courseData = [];
      batch.sectionData = [];
      idx = 0;

      console.log('>>> [Parse Course CSV] Batch cleared... Going to the next batch... be patient!');
    }
  }
})();
