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
Handler.prototype.onLogin = function(msg, session, next) {
	let self = this;
	let channel = msg.channel;
	let username = msg.username;

	let sessionService = self.app.get('sessionService');
	console.log('login username:' + username + ', channel :' + channel);
	// 重复登录
	if( !! sessionService.getByUid(username+'*'+channel)) {
		next(null, {
			code: 500,
			error: true
		});
		return;
	}

	var uid = msg.username + '*' + channel;
	console.log('uid : ' + uid)
	session.bind(uid);
	session.set('rid', channel);
	session.push('rid', function(err) {
		if(err) {
			console.error('set rid for session service failed! error is : %j', err.stack);
		}
	});
	session.on('closed', onLeave.bind(null, self.app));
	
	self.app.rpc.logic.logicRemote.onLogin(session, uid, self.app.get('serverId'), channel, true, function(users){
		next(null, {
			users:users
		});
	});

	console.log('onlogin Finished.');
};

Handler.prototype.onLeave = function(msg, session, next) {
	let self = this;
	let channel = msg.channel;
	let username = msg.username;
	let sessionService = self.app.get('sessionService');

	console.log('username: ' + username + ', channel: ' + channel);
	if( !! sessionService.getByUid(username+'*'+channel)) {
		self.app.rpc.logic.logicRemote.onLeave(session, username, self.app.get('serverId'), channel, function(users){
			next(null, {
				users:users
			});
		});
	
		let sessionService = self.app.get('sessionService');
		var uid = username + '*' + channel;
		sessionService.unbind(self.app.get('serverId'), uid, function(error){
			console.log(error);
		});
		sessionService.remove(self.app.get('serverId'));
		sessionService.kick(uid, function(){}, function(){});

		console.log('onLeave Finished.');
	}
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
