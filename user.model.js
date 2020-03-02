var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
// Setup schema

var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024,
        trim: true
    },
    tasks: [
        {
            title: {
                type: String,
                required: true
            },
            description: String,
            create_date: {
                type: Date,
                default: Date.now
            },
            update_date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    create_date: {
        type: Date,
        default: Date.now
    },
    update_date: {
        type: Date,
        default: Date.now
    }
});


userSchema.pre('save', function(next) {

  const user = this;
  if(!user.isModified || !user.isNew) { // don't rehash if it's an old user
    next();
  } else {
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) {
        console.log('Error hashing password for user', user.name);
        next(err);
      } else {
        user.password = hash;
        next();
      }
    });
  }
})

// Export Task model
module.exports = mongoose.model('user', userSchema);
