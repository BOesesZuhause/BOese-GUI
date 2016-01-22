'use strict';
var WebSocketClient = require('websocket').client;
var EventEmitter = require('events').EventEmitter
var client = new WebSocketClient();
var DistributorComm = new EventEmitter();

// Variables
// ---------
var distributorConnection = null;
var connectorId = -1;
var connectorPw = null;
var connectorTLS = false;


DistributorComm.connect = function(distributorURI, id, pw, tls) {
    if (id != null && id !== undefined) {
        connectorId = id;
    }
    if (pw != null && pw !== undefined) {
        connectorPw = pw;
    }
    if (tls != null && tls !== undefined) {
        connectorTLS = tls;
    }
    client.connect(distributorURI, null, null, null, connectorTLS ? {rejectUnauthorized : false} : {});
}

DistributorComm.setConnectorId = function(id) {
    connectorId = id;
}

DistributorComm.setConnectorPw = function(pw) {
    connectorPw = pw;
}

DistributorComm.sendUserRequestAllData = function() {
    DistributorComm.sendUserRequestAllConnectors();
    DistributorComm.sendUserRequestAllDevices();
    DistributorComm.sendUserRequestAllZones();
    DistributorComm.sendUserRequestAllRules();
    DistributorComm.sendUserRequestAllRepeatRules();
    DistributorComm.sendUserRequestTemps();
    DistributorComm.sendUserRequestAllUnits();
}

DistributorComm.sendUserSendValue = function(msg) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(9),
                        DeviceId : msg.DeviceId,
                        DeviceComponentId : msg.DeviceComponentId,
                        Value : msg.Value,
                        Timestamp : msg.Timestamp
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserCreateNewRepeatRules = function(repeatRuleList) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(96),
                        Rules : repeatRuleList
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserCreateRules = function(ruleList) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(90),
                        Rules : ruleList
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserCreateZones = function(zoneList) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(92),
                        Zones : zoneList
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserCreateUnits = function(unitList) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(94),
                        Units : unitList
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserConfirmTemps = function(confirmedTemps) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(82),
                        TmpConnectors : confirmedTemps.TmpConnectors,
                        TmpDevices : confirmedTemps.TmpDevices,
                        TmpDeviceComponents : confirmedTemps.TmpDeviceComponents
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserRequestTemps = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(80)};
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserRequestConnectors = function(connnectorIds) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(54),
                        ConnectorIds : connnectorIds
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserRequestAllRepeatRules = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(63)};
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
} 

DistributorComm.sendUserRequestAllRules = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(59)};
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserRequestDeviceComponents = function(deviceIds) {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(52),
                        DeviceIds : deviceIds
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

DistributorComm.sendUserRequestAllDevices = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(50),
                        IsUserRequest : true
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

/**
    Function to request all connectors
*/
DistributorComm.sendUserRequestAllConnectors = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(55)};
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
} 

/**
    Function to request all zones
*/
DistributorComm.sendUserRequestAllZones = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(57)};
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

/**
    Function to request all units
*/
DistributorComm.sendUserRequestAllUnits = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(61),
                        IsUserRequest : true
                        };
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

/**
    Function to request a new connection
*/
DistributorComm.sendRequestConnection = function() {
    if (distributorConnection !== null) {
        var reqConn = {Header : generateHeader(1),
                        ConnectorName : "BOese-GUI",
                        IsUserConnector : true
                        };
        if (connectorPw != null) {
            reqConn.Password = connectorPw;
        }
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

/**
    Helper to generate message header
    @param
        messageType     Int     Nr of message
*/
var generateHeader = function(messageType) {
    return  {
            MessageType : messageType, 
            ConnectorId : connectorId,
            Status : 0,
            Timestamp : new Date().getTime()}
}

/**
    Function to send a heartbeat reply
*/
var userSendHartBeat = function(msg) {
    if (distributorConnection !== null) {
        if (distributorConnection.connected) {
            distributorConnection.send(JSON.stringify(msg));
            console.log(JSON.stringify(msg));
        }
    }
}

client.on('connectFailed', function(error) {
    DistributorComm.emit('connectFailed', error);
});

client.on('connect', function(connection) {
    distributorConnection = connection;
    DistributorComm.emit('connect', "successfully connected to distributor");

    connection.on('error', function(error) {
        DistributorComm.emit('connectError', error);
        distributorConnection = null;
    });
    connection.on('close', function() {
        DistributorComm.emit('connectClose', "connection closed");
        distributorConnection = null;
    });

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: ");
            try {
                console.log(JSON.parse(message.utf8Data));
                var obj = JSON.parse(message.utf8Data);
            } catch(e) {
                console.log('DistributorComm: JSON parser error');
                console.log(e);
                return;
            }
            switch(obj.Header.MessageType) {
                case 120:
                    userSendHartBeat(obj);
                    break;
                case 2: // ConfirmConnection
                    connectorId = obj.ConnectorId;
                    connectorPw = obj.Password;
                    DistributorComm.emit('ConfirmConnection', connectorId, connectorPw);
                    break;
                case 9: // SendValue
                    if (obj.DeviceId !== undefined && obj.DeviceComponentId !== undefined && obj.Value !== undefined && obj.Timestamp !== undefined) {
                        var sv = {  DeviceId : obj.DeviceId,
                                    DeviceComponentId : obj.DeviceComponentId,
                                    Value : obj.Value,
                                    Timestamp : obj.Timestamp}
                        DistributorComm.emit('SendValue', sv);
                    }
                    break;
                case 10: // ConfirmValue
                    if (obj.DeviceId !== undefined && obj.DeviceComponentId !== undefined) {
                        var cv = {  DeviceId : obj.DeviceId,
                                    DeviceComponentId : obj.DeviceComponentId}
                        DistributorComm.emit('ConfirmValue', cv);
                    }
                    break;
                case 12: // SendNotification
                    if (obj.NotificationType !== undefined && obj.Timestamp !== undefined 
                            && obj.NotificationText !== undefined) {
                        var sn = {
                                    NotificationType : obj.NotificationType,
                                    Timestamp : obj.Timestamp,
                                    NotificationText : obj.NotificationText
                                }
                        DistributorComm.emit('SendNotification', sn);
                    }
                    break;
                case 13: // SendStatus
                    if (obj.DeviceComponentId !== undefined && obj.StatusCode !== undefined) {
                        var ss = {DeviceComponentId : obj.DeviceComponentId, StatusCode : obj.StatusCode, Timestamp : obj.Timestamp};
                        DistributorComm.emit('SendStatus', ss);
                    }
                    break; 
                case 51: // UserSendDevices
                    if (obj.Devices !== undefined) {
                        DistributorComm.emit('UserSendDevices', obj.Devices);
                    }
                    break;
                case 53: //UserSendDeviceComponents
                    if (obj.DeviceId !== undefined && obj.Components !== undefined) {
                        var usdc = {    DeviceId : obj.DeviceId,
                                        Components : obj.Components}
                        DistributorComm.emit('UserSendDeviceComponents', usdc);
                    }
                    break;
                case 56: // UserSendConnectors
                    if (obj.Connectors !== undefined) {
                        DistributorComm.emit('UserSendConnectors', obj.Connectors);
                    }
                    break; 
                case 58: // UserSendZones
                    if (obj.Zones !== undefined) {
                        DistributorComm.emit('UserSendZones', obj.Zones);
                    }
                    break;
                case 60: // UserSendRules
                    if (obj.Rules !== undefined) {
                        DistributorComm.emit('UserSendRules', obj.Rules);
                    }
                    break;
                case 62: // UserSendUnits
                    if (obj.Units !== undefined) {
                        DistributorComm.emit('UserSendUnits', obj.Units);
                    }
                    break;
                case 64: // UserSendRepeatRules
                    if (obj.Rules !== undefined) {
                        DistributorComm.emit('UserSendRepeatRules', obj.Rules);
                    }
                    break;
                case 81: // UserSendTemps
                    var ust = {}; 
                    if (obj.TmpConnectors !== undefined) {
                        ust.TmpConnectors = obj.TmpConnectors;
                    } else {
                        ust.TmpConnectors = [];
                    }
                    if (obj.TmpDevices !== undefined) {
                        ust.TmpDevices = obj.TmpDevices;
                    } else {
                        ust.TmpDevices = [];
                    }
                    if (obj.TmpDeviceComponents !== undefined) {
                        ust.TmpDeviceComponents = obj.TmpDeviceComponents;
                    } else {
                        ust.TmpDevices = [];
                    }
                    DistributorComm.emit('UserSendTemps', ust);
                    break;
                case 91: // UserConfirmRules
                    if (obj.Rules !== undefined) {
                        DistributorComm.emit('UserConfirmRules', obj.Rules);
                    }
                    break;
                case 93: // UserConfirmZones
                    if (obj.Zones !== undefined) {
                        DistributorComm.emit('UserConfirmZones', obj.Zones);
                    }
                    break;
                case 95: // UserConfirmUnits
                    if (obj.Units !== undefined) {
                        DistributorComm.emit('UserConfirmUnits', obj.Units);
                    }
                    break;
                case 97: // UserConfirmRepeatRules
                    if (obj.Rules !== undefined) {
                        DistributorComm.emit('UserConfirmRepeatRules', obj.Rules);
                    }
                    break;
            }
            
        }
    });
});

module.exports = DistributorComm;