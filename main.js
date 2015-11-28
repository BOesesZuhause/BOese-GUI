#!/usr/bin/env node
var WebSocketClient = require('websocket').client;
var express = require('express');
var app = new express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var client = new WebSocketClient();
var storage = require('node-persist');


var connector = {id : -1, pw : null};
var deviceIdArray = [];
var connectorIdArray = [];
var deviceList = [];
var deviceComponentList = [];
var connectors = [];
var zones = [];
var rules = [];
var newRules = [];
var newZones = [];
var units = [];
var newUnits = [];
var temporaries = {TmpConnectors : [], TmpDevices : [], TmpDeviceComponents : []};
var distributorConnection = null;

var newRuleNr = 0;
var newZoneNr = 0;
var newUnitNr = 0;


storage.initSync({dir:'storageData/'});
storage.getItem("connector", function (err, value) {
    if (!err && value !== undefined) {
        connector = value;
    } else {
        connector.id = -1;
        connector.pw = null;
    }
});

// Socket.IO for webpage
app.use("/html", express.static(__dirname + '/html'));
app.use('/html', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/html/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('requestTemps', function(msg) {
        socket.emit('uiSendTemps', temporaries);
    });

    socket.on('confirmTemps', function(msg) {
        sendUserConfirmTemps(distributorConnection, msg);
        setTimeout(function() { 
            sendUserRequestTemps(distributorConnection);
            sendUserRequestAllDevices(distributorConnection);
        }, 3000);
    });

    socket.on('requestDevices', function(msg) {
        socket.emit('uiSendDevices', deviceList);
    });

    socket.on('requestDeviceComponents', function(msg) {
        socket.emit('uiSendDeviceComponents', deviceComponentList);
    });

    socket.on('requestRules', function(msg) {
        socket.emit('uiSendRules', rules);
    });

    socket.on('requestUnits', function(msg) {
        socket.emit('uiSendUnits', units);
    });

    socket.on('requestNewRuleNr', function(func) {
        func(--newRuleNr);
    });

    socket.on('requestNewZoneNr', function(func) {
        func(--newZoneNr);
    });

    socket.on('requestNewUnitNr', function(func) {
        func(--newUnitNr);
    });

    socket.on('createNewRule', function(ruleList) {
        newRules = ruleList;
        sendUserCreateRules(distributorConnection, newRules);
        setTimeout(function() {
            sendUserRequestAllRules(distributorConnection);
        }, 3000);
    });

    socket.on('requestZones', function(msg) {
        socket.emit('uiSendZones', zones);
    });

    socket.on('createNewZone', function(zoneList) {
        newZones = zoneList;
        sendUserCreateZones(distributorConnection, newZones);
        setTimeout(function() {
            sendUserRequestAllZones(distributorConnection);
        }, 3000);
    });

    socket.on('createNewUnit', function(unitList) {
        newUnits = unitList;
        sendUserCreateUnits(distributorConnection, unitList);
        setTimeout(function() {
            sendUserRequestAllUnits(distributorConnection);
        }, 3000);
    });

    socket.on('request_reloadDistributorData', function(msg) {
        sendUserRequestAllData(distributorConnection);
    });

    socket.on('userSendValue', function(msg) {
        sendUserSendValue(distributorConnection, msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



// Websockets for Destributor

client.connect('ws://localhost:8081/events/', null, null, null, null);
// client.connect('ws://192.168.23.178:8081/events/', null, null, null, null);

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
        distributorConnection = null;
    });
    connection.on('close', function() {
        console.log('WebSocket Client Connection Closed');
        distributorConnection = null;
        client.connect('ws://localhost:8081/events/', null, null, null, null);
    });
    distributorConnection = connection;

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: ");
            console.log(JSON.parse(message.utf8Data));
            var obj = JSON.parse(message.utf8Data);
            switch(obj.Header.MessageType) {
                case 120:
                    userSendHartBeat(connection, obj);
                    break;
            	case 2:
                    connector.id = obj.ConnectorId;
                    connector.pw = obj.Password;
                    storage.setItem("connector", connector);
                    sendUserRequestAllData(connection);
            		break;
                case 9: // SendValue
                    if (obj.DeviceId && obj.DeviceComponentId && obj.Value && obj.Timestamp) {
                        for (var i = 0; i < deviceComponentList.length; i++) {
                            if (deviceComponentList[i].DeviceId == obj.DeviceId) {
                                deviceComponentList[i].DeviceComponents.Value = obj.Value;
                                deviceComponentList[i].DeviceComponents.Timestamp = obj.Timestamp;
                            }
                        }
                        io.emit('uiSendDeviceComponents', deviceComponentList);
                    }
                    break;
                case 10: // ConfirmValue
                    // TODO whatever?? will be called if this connector sends a value that is valid
                    break;
                case 51: // UserSendDevices
                    if (obj.Devices) {
                        for (var i = 0; i < obj.Devices.length; i++) {
                            addToObjectArray(deviceList, "DeviceId", obj.Devices[i]);
                        }
                    }
                    for (key in deviceList) {
                        deviceIdArray.push(deviceList[key].DeviceId);
                        if (!(deviceList[key].ConnectorId in connectorIdArray)) {
                            connectorIdArray.push(deviceList[key].ConnectorId);
                        }
                    }
                    io.emit('uiSendDevices', deviceList);
                    sendUserRequestDeviceComponents(connection, deviceIdArray);
                    break;
                case 53: //UserSendDeviceComponents
                    var deCo = {};
                    var devId = -1;
                    if (obj.DeviceId) {
                        devId = obj.DeviceId;
                        deCo = obj.Components;
                    }
                    if (typeof deCo !== 'undefined' && deCo && deCo.length > 0) {
                        var deCoObj = {'DeviceId' : devId, 'DeviceComponents' : deCo};
                        var foundDevice = false;
                        for (var i = 0; i < deviceComponentList.length; i++) {
                            if (deviceComponentList[i].DeviceId == devId) {
                                foundDevice = true;
                                for (var j = 0; j < deCo.length; j++) {
                                    addToObjectArray(deviceComponentList[i].DeviceComponents, 'DeviceComponentId', deCo[j]);
                                }
                            }
                        }
                        if (!foundDevice) {
                            addToObjectArray(deviceComponentList, 'DeviceId', deCoObj);
                        }
                    }
                    io.emit('uiSendDeviceComponents', deviceComponentList);
                    break;
                case 56: // UserSendConnectors
                    if (obj.Connectors) {
                        connectors = obj.Connectors;
                    }
                    break; 
                case 58: // UserSendZones
                    if (obj.Zones) {
                        zones = obj.Zones;
                    }
                    io.emit('uiSendZones', zones);
                    break;
                case 60: // UserSendRules
                    if (obj.Rules) {
                        rules = obj.Rules;
                    } else {
                        rules = [];
                    }
                    if (newRules.length > 0) { // TODO show user incorrect rules
                        for (var i = 0; i < newRules.length; i++) {
                            renameProperty(newRules[i], "TempRuleId", "RuleId");
                            rules.push(newRules[i]);
                        }  
                    }
                    io.emit("uiSendRules", rules);
                    break;
                case 62: // UserSendUnits
                    if (obj.Units) {
                        units = obj.Units;
                    } else {
                        units = [];
                    }
                    if (newUnits.length > 0) { // TODO show user incorrect rules
                        for (var i = 0; i < newUnits.length; i++) {
                            renameProperty(newUnits[i], "TempUniId", "UnitId");
                            units.push(newUnits[i]);
                        }  
                    }
                    io.emit('uiSendUnits', units);
                    break;
                case 81: // UserSendTemps
                    if (obj.TmpConnectors) {
                        temporaries.TmpConnectors = obj.TmpConnectors;
                    } else {
                        temporaries.TmpConnectors = [];
                    }
                    if (obj.TmpDevices) {
                        temporaries.TmpDevices = obj.TmpDevices;
                    } else {
                        temporaries.TmpDevices = [];
                    }
                    if (obj.TmpDeviceComponents) {
                        temporaries.TmpDeviceComponents = obj.TmpDeviceComponents;
                    } else {
                        temporaries.TmpDevices = [];
                    }
                    io.emit('uiSendTemps', temporaries);
                    break;
                case 91: // UserConfirmRules
                    if (obj.Rules) {
                        for (var newRule in newRules) {
                            for (var j = 0; j < obj.Rules.length; j++) {
                                if (newRule.TempRuleId == obj.Rules.TempRuleId) {
                                    newRules.splice(newRules.indexOf(newRule), 1);
                                }
                            }
                        }
                        sendUserRequestAllRules(connection);
                    }
                    break;
                case 93: // UserConfirmZones
                    if (obj.Zones) {
                        for (var newZone in newZones) {
                            for (var j = 0; j < obj.Zones.length; j++) {
                                if (newZone.TempZoneId == obj.Zones.TempZoneId) {
                                    newZones.splice(newZones.indexOf(newZone), 1);
                                }
                            }
                        }
                    }
                    break;
                case 95: // UserConfirmUnits
                    if (obj.Units) {
                        for (var newUnit in newUnits) {
                            for (var j = 0; j < obj.Units.length; j++) {
                                if (newUnit.TempZoneId == obj.Units.TempUnitId) {
                                    newUnits.splice(newUnits.indexOf(newUnit), 1);
                                }
                            }
                        }
                    }
                    break;
            }
            
        }
    });
    sendRequestConnection(connection);
});

var sendUserSendValue = function(connection, msg) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(9),
                        DeviceId : msg.DeviceId,
                        DeviceComponentId : msg.DeviceComponentId,
                        Value : msg.Value,
                        Timestamp : msg.Timestamp
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var userSendHartBeat = function(connection, msg) {
    if (connection !== null) {
        if (connection.connected) {
            connection.send(JSON.stringify(msg));
            console.log(JSON.stringify(msg));
        }
    }
}

var sendUserRequestAllData = function(connection) {
    sendUserRequestAllDevices(connection);
    sendUserRequestAllConnectors(connection);
    sendUserRequestAllZones(connection);
    sendUserRequestAllRules(connection);
    sendUserRequestTemps(connection);
    sendUserRequestAllUnits(connection);
}

var sendUserCreateZones = function(connection, zoneList) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(92),
                        Zones : zoneList
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserCreateUnits = function(connection, unitList) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(94),
                        Units : unitList
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserConfirmTemps = function(connection, confirmedTemps) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(82),
                        TmpConnectors : confirmedTemps.TmpConnectors,
                        TmpDevices : confirmedTemps.TmpDevices,
                        TmpDeviceComponents : confirmedTemps.TmpDeviceComponents
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserRequestTemps = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(80)};
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserCreateRules = function(connection, ruleList) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(90),
                        Rules : ruleList
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserRequestAllRules = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(59)};
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
} 

var sendUserRequestAllZones = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(57)};
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
} 

var sendUserRequestAllConnectors = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(55)};
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
} 

var sendUserRequestConnectors = function(connection, connnectorIds) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(54),
                        ConnectorIds : connnectorIds
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserRequestDeviceComponents = function(connection, deviceIds) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(52),
                        DeviceIds : deviceIds
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendRequestConnection = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(1),
                        ConnectorName : "BoeseWebConnector",
                        IsUserConnector : true
                        };
        if (connector.pw != null) {
            reqConn.Password = connector.pw;
        }
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserRequestAllDevices = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(50),
                        IsUserRequest : true
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var sendUserRequestAllUnits = function(connection) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(61),
                        IsUserRequest : true
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
            console.log(JSON.stringify(reqConn));
        }
    }
}

var generateHeader = function(messageType) {
    return  {
            MessageType : messageType, 
            ConnectorId : connector.id,
            Timestamp : new Date().getTime()}
}


var renameProperty = function (object, oldName, newName) {
    // Do nothing if the names are the same
    if (oldName == newName) {
        return object;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (object.hasOwnProperty(oldName)) {
        object[newName] = object[oldName];
        delete object[oldName];
    }
    return object;
};

var addToObjectArray = function (array, key, newObject) {
    var replace = false;
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == newObject[key]) {
            replace = true;
            array[i] = newObject;
        }
    }
    if (!replace) {
        array.push(newObject);
    }
}
