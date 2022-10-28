const mongoose = require('mongoose');

const { model } = mongoose;

const User = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  numcontrol: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Post = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Notice = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Event = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    optional: true,
  }],
}, {
  timestamps: true,
  versionKey: false,
});

const Club = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  checkin: {
    type: String,
    required: true,
  },
  departure: {
    type: String,
    required: true,
  },
  days: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    optional: true,
  }],
}, {
  timestamps: true,
  versionKey: false,
});

const Consultant = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  checkin: {
    type: String,
    required: true,
  },
  departure: {
    type: String,
    required: true,
  },
  days: {
    type: String,
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    optional: true,
  }],
}, {
  timestamps: true,
  versionKey: false,
});

const Directory = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Friend = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  fried: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  pending: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const UserModel = model('Users', User);
const PostModel = model('Posts', Post);
const NoticeModel = model('Notices', Notice);
const EventModel = model('Events', Event);
const ClubModel = model('Clubs', Club);
const ConsultantModel = model('Consultants', Consultant);
const DirectoryModel = model('Directorys', Directory);
const FriendModel = model('Friends', Friend);

module.exports = {
  UserModel,
  PostModel,
  NoticeModel,
  EventModel,
  ClubModel,
  ConsultantModel,
  DirectoryModel,
  FriendModel,
};
