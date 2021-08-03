const { DataTypes } = require('sequelize');

const FeedItemType = {
  Homework: 'Homework',
  Lecture: 'Lecture',
  Section: 'Section',
};

const FeedActionType = {
  created: {
    newSubscriber: 'created__new_subscriber',
  },
};

module.exports.FeedModel = {
  _id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  section_full_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  item_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(Object.keys(FeedItemType)),
    allowNull: false,
  },
  body: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  post_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attachment_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
};

module.exports.FeedItemType = FeedItemType;
module.exports.FeedActionType = FeedActionType;