const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  originalName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const File = mongoose.model("File", FileSchema);

module.exports = File;
