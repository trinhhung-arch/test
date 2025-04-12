const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pdf', 'document', 'presentation', 'video', 'image', 'text', 'file'],
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema); 