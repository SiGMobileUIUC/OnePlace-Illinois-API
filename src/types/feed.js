const FeedItemType = {
  Homework: 0,
  Lecture: 1,
  Section: 2,
};

const FeedActionType = {
  created: {
    sectionSubscriber: 'User followed this section.',
  },
  deleted: {
    sectionSubscriber: 'User unfollowed this section.',
  },
};

module.exports = {
  FeedItemType, FeedActionType,
};
