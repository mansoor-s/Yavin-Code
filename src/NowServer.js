/*
    This Object defines methods which will act as event listeners for Nowjs calls from the client

*/
var util = require('util');

var NowServer = module.exports = function(nowjs, app, redisClient, config) {
    this.nowjs = nowjs;
    this.everyone = nowjs.initialize(app);
    this.config = config;
    this.db = redisClient;
    
    
    /*
        Register listeners
    */
    this.everyone.connected(this.connected());
    
    this.everyone.disconnected(this.disconnected());
    
    this.everyone.now.update_code = this.update_code();
};

/*
    Called when a new user is connected with Nowjs (sockets.io)
*/
NowServer.prototype.connected = function() {
    var self = this;
    return function() {
        var that = this;
        self.db.hgetall(that.now.sessID, function(err, userInfo) {
            var group = self.nowjs.getGroup(userInfo.roomSlug);
            group.addUser(that.user.clientId);
            group.now.user_connected(userInfo.userName);
            that.now.set_permission(userInfo.permission);
            console.log('user Info: ' + util.inspect(userInfo, null , null));
        });
    };
};

/*
    Called when a new user is disconnected from Nowjs (sockets.io)
*/
NowServer.prototype.disconnected = function() {
    var self = this;
    return function() {
        self.db.decr('users', function(err, val) {});
        var group = self.nowjs.getGroup(this.now.roomSlug);
        group.removeUser(this.user.clientId);
        if(group.count === 0) {
            self.db.decr('rooms', function(err, val) {});
        }
    };
};


/*
    Called when user with enough permissions requests that his peers update their editor
    Also checks for sufficient privilages
*/
NowServer.prototype.update_code = function() {
    this.everyone.consoleLog('TEST');
    var self = this;
    return function(data) {
        var that = this;
        self.db.hgetall(this.now.sessID, function(err, userInfo) {
            if (userInfo.permission < 2) {
                var group = self.nowjs.getGroup(userInfo.roomSlug);
                group.now.update_code_client(data);
            }
        });
    };
};
