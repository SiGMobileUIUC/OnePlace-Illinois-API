const FeedItemType = {
  Homework: 0,
  Lecture: 1,
  Section: 2,
};

const FeedActionType = {
  created: {
    sectionSubscriber: 'created__section_subscriber',
  },
  deleted: {
    sectionSubscriber: 'deleted__section_subscriber',
  },
};

module.exports = {
  FeedItemType, FeedActionType,
};
