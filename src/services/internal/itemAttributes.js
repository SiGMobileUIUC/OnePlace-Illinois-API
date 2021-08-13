const course = [
  'subject',
  'code',
  'name',
  'description',
  'creditHours',
  'degreeAttributes',
  ['scheduleInfo', 'classScheduleInformation'],
  ['sectionInfo', 'courseSectionInformation'],
];

const section = [
  'year',
  'term',
  'CRN',
  'code',
  'course',
  'partOfTerm',
  'sectionTitle',
  'sectionStatus',
  'sectionCreditHours',
  'enrollmentStatus',
  'type',
  'typeCode',
  'startTime',
  'endTime',
  'daysOfWeek',
  'room',
  'building',
  'instructors',
];

const feed = [
  'email',
  'sectionFullCode',
  'itemId',
  'type',
  'body',
  'action',
  'attachmentUrl',
  'postDate',
];

const library = [
  'course',
  'section',
  'createdAt',
  'isActive',
  // 'inTrash',
];

module.exports = {
  course, section, feed, library,
};
