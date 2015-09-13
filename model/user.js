/**
 * Created by ngoctranfire on 9/9/15.
 */
var mongoose = require('mongoose');
var scrypt = require('scrypt');

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    console.log("Here is the email: " + email);
    return re.test(email);
}
var INVALID_EMAIL = "Invalid email";
var emailValidation = [validateEmail, INVALID_EMAIL];

var UserProfileSchema = new Schema(
    {
        email: {type: String, required: true, unique: true, lowercase: true, validate: emailValidation},
        password: {type: String, required: true},
        name: {
            first: {type: String},
            last: {type: String}
        },
        dob: {type: Date},
        created_at: {type: Date, default: Date.now},
        updated_at: {type: Date, default: Date.now}
    }
);

UserProfileSchema.methods.generateHash = function(rawPass, callback) {
    scrypt.kdf(rawPass, {N:1, r:1, p:1},
        function(err, result) {
            if (err) {
                console.log("Error generating password hash: " + err);
                callback(err);
            } else {
                //Note how scrypt parameters were passed as a JSON object
                console.log("Asynchronous result: " + result.toString("base64"));
                callback(err, result);
            }

        }
    );
};

UserProfileSchema.methods.isValidPassword = function(password, callback) {
    var userSchema = this;
    return scrypt.verifyKdf(userSchema.password, new Buffer(password),
        function onResult(err, result) {
            if (err) {
                console.log("error trying to validate password: " + err);
                callback(err, null);
            } else {
                callback(err, result);
            }
        }
    );
};

UserProfileSchema.pre('save',
    function onBeforeSave(next) {
        var userSchema = this;
        if (!this.isModified('password')) {
            return next();
        } else {
            this.generateHash(userSchema.password,
                function onHashResult(err, result) {
                    if(err) {
                        throw Error("Got some weird error trying to generate hash: " + err);
                    }
                    this.password = result;
                }
            );
        }
    }
);

var UserProfile = mongoose.model('UserProfile', UserProfileSchema);
module.exports = UserProfile;