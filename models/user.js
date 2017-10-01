var bcrypt = require('bcrypt');
var _ = require('underscore');
var crypto = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
	var User = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [6, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: (user, options) => {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		}
	});

	// Instance Methods
	User.prototype.toPublicJSON = function() {
		var json = this.toJSON();
		return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
	};

	User.prototype.generateToken = function(type) {
		if (!_.isString(type)) {
			return undefined;
		}

		try {
			var stringData = JSON.stringify({
				id: this.get('id'),
				type: type
			});
			var encryptedData = crypto.AES.encrypt(stringData, 'abc123!@#').toString();
			var token = jwt.sign({
				token: encryptedData
			}, 'qwerty098')

			return token;
		} catch (e) {
			return undefined;
		}
	}

	//Class Methods
	User.authenticate = (body) => {
		return new Promise ((resolve, reject) => {
			if (typeof body.email !== 'string' || typeof body.password !== 'string') {
				return reject();
			}

			User.findOne({
				where: {
					email: body.email
				}
			}).then((user) => {
				if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
					return reject();
				}

				resolve(user);
			}, (e) => {
				reject();
			})
		});
	};

	User.findByToken = (token) => {
		return new Promise ((resolve, reject) => {
			try {
				var decodedJWT = jwt.verify(token, 'qwerty098');
				var bytes = crypto.AES.decrypt(decodedJWT.token, 'abc123!@#');
				var tokenData = JSON.parse(bytes.toString(crypto.enc.Utf8));

				User.findById(tokenData.id).then((user) => {
					if (user) {
						resolve(user);
					} else {
						reject();
					}
				}, (e) => {
					reject();
				})
			} catch (e) {
				reject();
			}
		})
	}

	return User;
}