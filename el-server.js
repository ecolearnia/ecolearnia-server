var Hapi = require("hapi");
var config = require('ecofyjs-config');

config.load('./config/el-server.conf.json');
var port = config.get('port');
var logConf = config.get('log');

var server = new Hapi.Server();
server.connection(
    { 
      port: port, 
      labels: 'main',
      routes: { cors: true } 
    }
  );

server.register([
      { register: require("./index"), options: { log: logConf} }
], function(err) {
    if (err) throw err;
    server.start(function() {
        console.log("EcoLearnia-Server started @ " + server.info.uri);
    });
});