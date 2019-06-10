module.exports = function(app) {
	return new LogicRemote(app);
};

var LogicRemote = function(app) {
	this.app = app;
	this.channelService = app.get('channelService');
};

/**
 * Add user into chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
LogicRemote.prototype.onLogin = function(uid, sid, name, flag, cb) {
	let channel = this.channelService.getChannel(name, flag);
	let username = uid.split('*')[0];
	let sexType = uid.split('*')[1];
	let wechatId = uid.split('*')[2];

	let param = {
		route: 'onLogin',
		user: username,
		sex: sexType,
		wechat: wechatId
	};

	channel.pushMessage(param);

	if( !! channel) {
		channel.add(uid, sid);
	}

	cb(this.get(name, flag));
};


/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
LogicRemote.prototype.get = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[0];
	}
	return users;
};

/**
 * Get user weChatId from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
LogicRemote.prototype.getWeChat = function(name, flag) {
	var users = [];
	var channel = this.channelService.getChannel(name, flag);
	if( !! channel) {
		users = channel.getMembers();
	}
	for(var i = 0; i < users.length; i++) {
		users[i] = users[i].split('*')[2];
	}
	return users;
};


/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
LogicRemote.prototype.onLeave = function(uid, sid, name, cb) {
	var channel = this.channelService.getChannel(name, false);
	// leave channel
	if( !! channel) {
		channel.leave(uid, sid);
	}
	let username = uid.split('*')[0];
	let sexType = uid.split('*')[1];
	let wechatId = uid.split('*')[2];

	let param = {
		route: 'onLeave',
		user: username,
		sex: sexType,
		wechat: wechatId
	};

	channel.pushMessage(param);
	cb();
};