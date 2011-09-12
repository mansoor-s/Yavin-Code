var express = require('express'),
    nowjs = require('now'),
    RedisStore = require('connect-redis');

var config = require('./config.js'),
    NowServer = require('./src/NowServer.js');

var app = express.createServer();

var redisStore = new RedisStore({db: 0});
var redisClient = redisStore.client;

// initialized on per client bases
var nowServer = new NowServer(nowjs, app, redisClient, config);

// enable connect sessions
app.use(express.cookieParser());
app.use(express.session({ secret: config.server.session_secret, store: new RedisStore({db: 1}) }));

// setup public accesable files
app.use(express.static(__dirname + '/public'));


app.listen(config.server.port);

app.get('/', function(req, res) {

    redisClient.get('users', function(err, numUsers){
        redisClient.get('users', function(err, numRooms){
            res.render(__dirname + '/views/index.ejs', {
                layout: false,
                active_rooms: numRooms || 0,
                active_users: numUsers || 0
            });
        });
    });
});

app.get('/app/:roomSlug', function(req, res) {
    //check if the room exists
    var roomName = 'room_' + req.params.roomSlug;
    var roomUsers = roomName + '_users';
    var userName = config.general.user_prefix;
    var roomPermissions = roomName + '_permissions';
    var first_user = false;
    
    // increase the number of active users
    redisClient.incr('users', function(err, val) {});
    
    redisClient.exists(roomName, function(err, val) {
        if (val === 0) {
        
            // increase the number of active users
            redisClient.incr('rooms', function(err, val) {});
            
            first_user = true;
            redisClient.hincrby(roomName, 'users', 1, function(err, val) {
                req.session[roomName + '_userName'] = userName + val;
                
                redisClient.hmset(req.sessionID,
                    'userName', req.session[roomName + '_userName'],
                    'roomSlug', roomName,
                    'permission', '0',
                    function(err, val) {
                        req.session[roomName] = true;
                        req.session[roomPermissions] = 0;
                        res.cookie(roomName + '_sessID', req.sessionID);
                        respond(req, res);
                    });
                    
            });
        } else {
            if(!req.session[roomName]) {
                req.session[roomName] = true;
                res.cookie(roomName + '_sessID', req.sessionID);
                req.session[roomPermissions] = 2;
                
                redisClient.hincrby(roomName, 'users', 1, function(err, val) {
                    req.session[roomName + '_userName'] = userName + val;
                    redisClient.hmset(req.sessionID,
                        'userName', req.session[roomName + '_userName'],
                        'roomSlug', roomName,
                        'permission', '2',
                        function(err, val) {
                            respond(req, res);
                        });
                });
            } else {
                respond(req, res);
            }
        }
    });

    function respond(req, res) {
        res.render(__dirname + '/views/app.ejs', {
            layout: false,
            user_name: req.session[roomName + '_userName'],
            first_user: first_user,
            room_slug: req.params.roomSlug
        });
    }
});


/*
    TODO...

*/
app.get('/app/:roomSlug/settings/:setting=:value', function(req, res) {


});
