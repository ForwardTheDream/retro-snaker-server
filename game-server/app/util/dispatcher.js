let crc = require('crc');

module.exports.dispatch = function(uid, connectors){
    let index = Math.abs(crc.crc32(uid)) % connectors.length;
    return connectors[index];
}