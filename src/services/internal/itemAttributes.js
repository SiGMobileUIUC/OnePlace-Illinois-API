const course = [
  'subject',
  'code',
  'name',
  'description',
  ['credit_hours', 'creditHours'],
  'degree_attributes', // keep this as is for genEd parsing
  ['schedule_info', 'classScheduleInformation'],
  ['section_info', 'courseSectionInformation'],
];

const section = [
  'year',
  'term',
  'CRN',
  'code',
  ['part_of_term', 'partOfTerm'],
  ['section_title', 'sectionTitle'],
  ['section_status', 'sectionStatus'],
  ['section_credit_hours', 'sectionCreditHours'],
  ['enrollment_status', 'enrollmentStatus'],
  'type',
  ['type_code', 'typeCode'],
  ['start_time', 'startTime'],
  ['end_time', 'endTime'],
  ['days_of_week', 'daysOfWeek'],
  'room',
  'building',
  'instructors',
];

const feed = [
  'email',
  ['section_full_code', 'sectionFullCode'], // `section_full_code` AS `sectionFullCode`
  'item_id',
  'type',
  'body',
  'action',
  ['attachment_url', 'attachmentUrl'], // `attachment_url` AS `attachmentUrl`
  ['createdAt', 'postDate'], // `createdAt` AS `postDate`
];

module.exports = {
  course, section, feed,
};