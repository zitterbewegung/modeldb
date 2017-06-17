var assert = require('assert');
var thrift = require('thrift');
var types = require('../thrift/PredictionStore_types.js');
var Service = require('../thrift/PredictionStoreService.js');
const argv = require('yargs')
    .usage("Usage: $0 [options]")
    .example("$0 --host backend")
    .default({
        'host': 'localhost',
        'port': '9090'
    })
    .help('help')
    .argv

var transport = thrift.TFramedTransport;
var protocol = thrift.TBinaryProtocol;

var connection = thrift.createConnection(argv.host, argv.port, {
  transport : transport,
  protocol : protocol
});

connection.on('error', function(err) {
  assert(false, err);
});

var client = thrift.createClient(Service, connection);

module.exports = {
  "client": client,
  "transport": transport
}
