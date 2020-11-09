'use strict';

const mongoose = require('mongoose');
const Model = require('../mongo.js');

const schema = mongoose.model('histories', {
  startDate: {type: String},
  name: {type: String, require: true},
  description: {type: String},
  courses: [
    {
      name: { type: String },
      expectedHours: { type: Number },
      noOfChapters: { type: Number },
      chapters: [
        {
          name: { type: String },
          duration: { type: Number },
          state: { type: String, required: true, enum: ['not-studied', 'in-progress', 'completed'] },
          percentage: {type: Number},
          timeTaken: {type: Number},
        },
      ],
      isCompleted: { type: Boolean },
    },
  ],
  student_id: { type: String, required: true, unique: true, sparse: true},
});

class History extends Model {
  constructor() {
    super(schema);
  }

  get(student_id) {
    console.log('reading student_id', student_id);
    return student_id ? this.schema.find({student_id}) : this.schema.find({});
  }

  findId(_id) {
    console.log('reading student_id', _id);
    return _id ? this.schema.find({_id}) : this.schema.find({});
  }

  put(student_id) {
    return student_id ? this.schema.findOneAndUpdate({student_id}) : this.schema.find({});
  }

  async updateLesson(_id, record) {
    if (_id) {
      let doc = await this.schema.findOne({_id});
      console.log('found the document lesson to update!!', doc);
      doc.timeTaken += record.time;
      doc.percentage += record.completed;

      return await doc.save();
    } else {
      return Promise.reject();
    }
  }

  delete(student_id) {
    return student_id ? this.schema.findOneAndRemove({student_id}) : Promise.reject();
  }
}

module.exports = new History;