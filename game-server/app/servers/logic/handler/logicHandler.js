var logicRemote = require('../remote/logicRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to Client create snake
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.onEnterRoom = function(msg, session, next) {
	console.log('onEnterRoom:' + msg.content);
	var rid = session.get('rid');
	var username = msg.content.split('*')[0];
	var gender = msg.content.split('*')[1];
	var avatarUrl = msg.content.split('*')[2];
	var channel = msg.content.split('*')[3];
	if (rid == undefined) {
		var uid = msg.username + '*' + channel;
		session.bind(uid);
		session.set('rid', channel);
		session.push('rid', function(err) {
			if(err) {
				console.error('set rid for session service failed! error is : %j', err.stack);
			}
		});
		rid = session.get('rid');
	}

	console.log('username:' + username + ', gender:' + gender + ', avatarUrl:' + avatarUrl);

	var channelService = this.app.get('channelService');
	var param = {
		route: 'onEnterRoom',
		msg: msg.content,
		from: username,
		target: msg.target,
		gender: gender,
		avatarUrl: avatarUrl,
	};
	channel = channelService.getChannel(rid, false);

	console.log('rid:' + rid);
	console.log('channel:' +channel);
	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		console.log('tuid : ' + tuid);
		var tsid = channel.getMember(tuid)['sid'];
		console.log('tsid : ' + tsid);
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route,
		username:username
	});
};

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.onOperateSnake = function(msg, session, next) {
	console.log('onOperateSnake:' + msg.content);
	var rid = session.get('rid');
	if (rid == undefined) {
		var uid = msg.from + '*' + msg.channel;
		session.bind(uid);
		session.set('rid', channel);
		session.push('rid', function(err) {
			if(err) {
				console.error('set rid for session service failed! error is : %j', err.stack);
			}
		});

		rid = session.get('rid');
	}

	var username = msg.from;
	var channelService = this.app.get('channelService');
	var param = {
		route: 'onOperateSnake',
		msg: msg.content,
		from: username,
		target: msg.target
	};
	channel = channelService.getChannel(rid, false);

	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route
	});
};

/**
 * Send messages to Client create snake
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.onSnakeDead = function(msg, session, next) {
	console.log('onSnakeDead:' + msg.content);
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		route: 'onSnakeDead',
		player: msg.content,
		from: username,
		target: msg.target
	};
	channel = channelService.getChannel(rid, false);

	console.log('rid:' + rid);
	console.log('channel:' +channel);
	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route,
		player: msg.content
	});
};


/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.onUpdateTick = function(msg, session, next) {
	console.log('onOperateSnake:' + msg.content);
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		route: 'onUpdateTick',
		player: msg.content,
		from: username,
		target: msg.target
	};
	channel = channelService.getChannel(rid, false);

	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route
	});
};