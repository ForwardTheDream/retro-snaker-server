module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
  next(null, {code: 200, msg: 'game server is ok.'});
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
	var result = {
		topic: 'publish',
		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
	};
  next(null, result);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
	var result = {
		topic: 'subscribe',
		payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
	};
  next(null, result);
};

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.onLogin = function(msg, session, next) {
	let self = this;
	let channel = msg.channel;
	let username = msg.username;
	let sexType = msg.sex;
	let wechatId = msg.wechat;
	var sessionService = self.app.get('sessionService');

	// 重复登录
	if( !! sessionService.getByUid(wechatId+'*'+channel)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	session.bind(wechatId+'*'+channel);
	session.set('rid', channel);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onLeave.bind(null, self.app));

	//put user into channel
	self.app.rpc.logic.logicRemote.onLogin(session, username+'*'+sexType+'*'+wechatId, self.app.get('serverId'), channel, true, function(users){
		next(null, {
			users:users
		});
	});
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}
	app.rpc.logic.logicRemote.onLeave(session, session.uid, app.get('serverId'), session.get('rid'), null);
};
