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
var deviceComponentList = {};
var connectors = {};
var zones = {};
var rules = {};
var newRules = [];
var distributorConnection = null;

var newRuleNr = 0;


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

    socket.on('requestRules', function(msg) {
        socket.emit("uiSendRules", rules);
    });

    socket.on('requestNewRuleNr', function(func) {
        func(--newRuleNr);
    });

    socket.on('createNewRule', function(ruleList) {
        newRules = ruleList;
        sendUserCreateRules(distributorConnection, newRules);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



// Websockets for Destributor

client.connect('ws://localhost:8081/events/', null, null, null, null);

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
            console.log("Received: '" + message.utf8Data + "'");
            var obj = JSON.parse(message.utf8Data);
            switch(obj.Header.MessageType) {
            	case 2:
                    console.log("Message 2: Confirm Connection");
                    console.log("PW: " + obj.Password);
                    console.log("Con ID: " + obj.ConnectorId);
                    connector.id = obj.ConnectorId;
                    connector.pw = obj.Password;
                    storage.setItem("connector", connector);
                    sendUserRequestAllDevices(connection);
                    sendUserRequestAllConnectors(connection);
                    sendUserRequestAllZones(connection);
                    sendUserRequestAllRules(connection);
            		break;
                case 51: // UserSendDevices
                    if (obj.Devices) {
                        deviceList = obj.Devices;
                    }
                    //console.log(deviceList);
                    for (key in deviceList) {
                        deviceIdArray.push(deviceList[key].DeviceId);
                        if (!(deviceList[key].ConnectorId in connectorIdArray)) {
                            connectorIdArray.push(deviceList[key].ConnectorId);
                        }
                    }
                    sendUserRequestDeviceComponents(connection, deviceIdArray);
                    break;
                case 53: //UserSendDeviceComponents
                    var deCo = {};
                    var devId = -1;
                    if (obj.DeviceId) {
                        devId = obj.DeviceId;
                        deCo = obj.Components;
                    }
                    if (typeof deCo !== 'undefined' && deCo) {
                        deviceComponentList[devId] = deCo;
                    }
                    break;
                case 56: // UserSendConnectors
                    if (obj.Connectors) {
                        connectors = obj.Connectors;
                    }
                    console.log("Received Connectors:");
                    console.log(connectors);
                    break; 
                case 58: // UserSendZones
                    if (obj.Zones) {
                        zones = obj.Zones;
                    }
                    console.log("Received Zones");
                    console.log(zones);
                    break;
                case 60: // UserSendRules
                    console.log("UserSendRules");
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
            }
            
        }
    });
    sendRequestConnection(connection);
});

var sendUserCreateRules = function(connection, ruleList) {
    if (connection !== null) {
        var reqConn = {Header : generateHeader(90),
                        Rules : ruleList
                        };
        if (connection.connected) {
            connection.send(JSON.stringify(reqConn));
        }
        console.log(JSON.stringify(reqConn));
    }
}

var sendUserRequestAllRules = function(connection) {
    var reqConn = {Header : generateHeader(59)};
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
    }
} 

var sendUserRequestAllZones = function(connection) {
    var reqConn = {Header : generateHeader(57)};
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
    }
} 

var sendUserRequestAllConnectors = function(connection) {
    var reqConn = {Header : generateHeader(55)};
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
    }
} 

var sendUserRequestConnectors = function(connection, connnectorIds) {
    var reqConn = {Header : generateHeader(54),
                    ConnectorIds : connnectorIds
                    };
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
    }
}

var sendUserRequestDeviceComponents = function(connection, deviceIds) {
    var reqConn = {Header : generateHeader(52),
                    DeviceIds : deviceIds
                    };
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
    }
}

var sendRequestConnection = function(connection) {
    var reqConn = {Header : generateHeader(1),
                    ConnectorName : "BoeseWebConnector",
                    IsUserConnector : true
                    };
    if (connector.pw != null) {
        reqConn.Password = connector.pw;
    }
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
    }
}

var sendUserRequestAllDevices = function(connection) {
    var reqConn = {Header : generateHeader(50),
                    IsUserRequest : true
                    };
    if (connection.connected) {
        connection.send(JSON.stringify(reqConn));
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