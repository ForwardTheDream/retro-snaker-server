var logicRemote = require('../remote/logicRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.onTickUpdate = function(msg, session, next) {
	let channel = session.get('channel');
	let username = session.uid.split('*')[0];
	let channelService = this.app.get('channelService');
	let param = {
		route: 'onTickUpdate',
		msg: msg.content,
		from: username,
		target: msg.target
	};
	channel = channelService.getChannel(channel, false);

	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		let tuid = msg.target + '*' + channel;
		let tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route
	});
};