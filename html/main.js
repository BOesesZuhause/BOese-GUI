var accordionOptions = {header: "> div > h3", heightStyle: "content", collapsible: true};

$(document).ready(function () {
	var ruleNr = 0;
	var newRuleNr = 0;
	var gotNewRuleNr;

	$(function() {
		$('body').css('background-color', '#D5D5D5');
		$('#tabs').tabs();
		$('#headline_span h1:first').text("BOESE").css({'color': 'red', 'font-size': '50px'});
		$('#tabs ul:first li:eq(0) a').text("Übersicht");
		$('#tabs ul:first li:eq(1) a').text("Geräte");
		$('#tabs ul:first li:eq(2) a').text("Regeln");
		$('#tabs ul:first li:eq(3) a').text("Benutzer");
		$('#tabs ul:first li:eq(4) a').text("Zonen");
		$('#tabs ul:first li:eq(5) a').text("Benachrichtigungen");
		$('#accordion').accordion({header: "> div > h3", heightStyle: "content", collapsible: true})
					.sortable({
						axis: "y",
						handle: "h3",
						stop: function(event, ui) {
							ui.item.children("h3").triggerHandler("focusout");
							$(this).accordion("refresh");
						}
					});
		$('#accordion_rules').accordion(accordionOptions);
		$('#btn_rule_add').button().click(function(event) {
						event.preventDefault();
						addRuleAccordion(null);
						$('#accordion_rules').accordion("refresh");
					});
		$('#btn_rule_save').button().click(function(event) {
						event.preventDefault();
						var accRuleLength = $('#accordion_rules').children().length;
						var newRuleList = [];
						var error = true;
						var parser = new DOMParser();
						for (var i = 0; i < accRuleLength; i++) {
							var ruleDivChilds = $('#ruleDiv_' + i).children();
							var newRule = {};
							$('#ruleDiv_' + i).children().each(function() {
								if ($(this).attr("name") !== undefined) {
									switch($(this).attr("name")) {
										case "RuleId":
											newRule.RuleId = $(this).val();
											break;
										case "Active":
											newRule.Active = $(this).prop('checked');
											break;
										case "InsertDate":
											var date = new Date($(this).val())
											newRule.InsertDate = date.getTime();
											break;
										case "ModifyDate":
											var date = new Date($(this).val())
											newRule.ModifyDate = date.getTime();
											break;
										case "Permissions":
											var xmlString = $(this).val();
											var xmlDoc=parser.parseFromString(xmlString,"text/xml");
											if(xmlDoc.getElementsByTagName("parsererror").length>0) {
												$(this).css("background-color", "red");
												console.log("Error: XML: Permission")
												newRule.Permissions = null;
											} else {
												$(this).css("background-color", "white");
												newRule.Permissions = xmlString;
											}
											break;
										case "Conditions":
											var xmlString = $(this).val();
											var xmlDoc=parser.parseFromString(xmlString,"text/xml");
											if(xmlDoc.getElementsByTagName("parsererror").length>0) {
												$(this).css("background-color", "red");
												console.log("Error: XML: Conditions")
												newRule.Conditions = null;
											} else {
												$(this).css("background-color", "white");
												newRule.Conditions = xmlString;
											}
											break;
										case "Actions":
											var xmlString = $(this).val();
											var xmlDoc=parser.parseFromString(xmlString,"text/xml");
											if(xmlDoc.getElementsByTagName("parsererror").length>0) {
												$(this).css("background-color", "red");
												console.log("Error: XML: Actions")
												newRule.Actions = null;
											} else {
												$(this).css("background-color", "white");
												newRule.Actions = xmlString;
											}
											break;
									}
								}
							});
							// TODO add here to change existing rules
							if ((newRule.RuleId < 0) 
									&& (newRule.Actions != null)
									&& (newRule.Conditions != null)
									&& (newRule.Permissions != null)) {
								renameProperty(newRule, "RuleId", "TempRuleId");
								newRuleList.push(newRule);
								error = false;
							} else if (newRule.RuleId >= 0) {
								
							}
						}
						if (!error) {
							console.log(newRuleList);
							socket.emit('createNewRule', newRuleList);
						} else {
							console.log("Error");
						}
						
					});
	});
	var socket = io();
	socket.emit('requestRules', null);
	socket.emit('requestDevices', null);
	socket.emit('requestDeviceComponents', null);

	socket.on('uiSendDevices', function(data) {
		$('#accordion').empty();
		for (var i = 0; i < data.length; i++) {
			addDeviceAccordion(data[i]);
		}
	});

	socket.on('uiSendDeviceComponents', function(data) {
		for (var i = 0; i < data.length; i++) {
			var devId = data[i].DeviceId;
			var deCos = data[i].DeviceComponents;
			$('#deviceDiv_' + devId + '_accordion').empty();
			for (var j = 0; j < deCos.length; j++) {
				addDeviceComponentAccordion(devId, deCos[j]);
			}
			$('#deviceDiv_' + devId + '_accordion').accordion("refresh");
			
		}
		//console.log(data);
	})

	socket.on("uiSendRules", function(data) {
		$('#accordion_rules').empty();
		for (var i = 0; i < data.length; i++) {
			addRuleAccordion(data[i]);
		}
	});

	socket.on('uiSendNewRuleNr', function(ruleNr) {
		newRuleNr = ruleNr;
		gotNewRuleNr = true;
	});

	var btn_deco_value_set = function(event, deviceId, deviceComponentId) {
		event.preventDefault();
	}

	var addDeviceComponentAccordion = function(deviceId, deCo) {
		$('#deviceDiv_' + deviceId + '_accordion').append('<div class="group"><h3>' 
						+ deCo.ComponentName 
						+ '</h3><div class="deviceComponentDiv" id="deviceComponentDiv_' 
						+ deCo.DeviceComponentId 
						+ '"></div></div>');
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "ComponentID", deCo.DeviceComponentId));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Description", deCo.Description));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Name", deCo.ComponentName));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Value", deCo.Value));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Value_Timestamp", deCo.Timestamp));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Status", deCo.Status));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "IsActor", deCo.Actor));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Unit", deCo.Unit));
		if (deCo.Actor) {
			$('#deviceComponentDiv_' + deCo.DeviceComponentId).append('<input type="submit" id="btn_deco_value_set_' + deviceId + '_' + deCo.DeviceComponentId + '" value="Value setzen">');
			$('#btn_deco_value_set_' + deviceId + '_' + deCo.DeviceComponentId).button().click(btn_deco_value_set(event, deviceId, deCo.DeviceComponentId));
		}
	}

	var createDeviceCompDivInput = function(deviceNr, deviceComponentNr, text, content) {
		return '<label class="lbl_DeviceInput" for="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '">' + text + '</label>'
				+ '<input class="deviceOutInput" name="' + text + '" id="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '" value="' + content + '" /><br />';
	}

	var addDeviceAccordion = function(device) {
		$('#accordion').append('<div class="group"><h3>' + device.DeviceName + '</h3><div class="deviceDiv" id="deviceDiv_' + device.DeviceId + '"></div></div>');
		$('#deviceDiv_' + device.DeviceId).append(createDeviceDivInput(device.DeviceId, "DeviceID", device.DeviceId));
		$('#deviceDiv_' + device.DeviceId).append(createDeviceDivInput(device.DeviceId, "ZoneID", device.ZoneId));
		$('#deviceDiv_' + device.DeviceId).append('<div id="deviceDiv_' + device.DeviceId + '_accordion"></div>');
		$('#deviceDiv_' + device.DeviceId + '_accordion').accordion(accordionOptions);
		$('#accordion').accordion("refresh");
	}

	var createDeviceDivInput = function(deviceNr, text, content) {
		return '<label class="lbl_DeviceInput" for="deviceOutInp_' + deviceNr + '_' + text + '">' + text + '</label>'
				+ '<input class="deviceOutInput" name="' + text + '" id="deviceOutInp_' + deviceNr + '_' + text + '" value="' + content + '" /><br />';
	}

	var addRuleAccordion = function(rule) {
		if (rule == null) {
			gotNewRuleNr = false;
			var date = new Date();
			socket.emit('requestNewRuleNr', function (ruleNr) { 
				newRuleNr = ruleNr;
				addRuleAccordionHTML(null);
			});
		} else {
			addRuleAccordionHTML(rule);
		}
		
	}

	var addRuleAccordionHTML = function(rule) {
		$('#accordion_rules').append('<div class="group"><h3>Rule ' + ((rule !== null) ? rule.RuleId : "New") + ' </h3><div class="ruleDiv" id="ruleDiv_' + ruleNr + '"></div></div>');
		$('#ruleDiv_' + ruleNr).append('<input type="hidden" name="RuleId" value="' + ((rule !== null) ? rule.RuleId : newRuleNr) + '">')
		$('#ruleDiv_' + ruleNr).append(createRuleDivCheck(ruleNr, "Active", (rule !== null) ? rule.Active: true));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "InsertDate", (rule !== null) ? getDateTime(new Date(rule.InsertDate)) : getDateTime(new Date())));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "ModifyDate", (rule !== null) ? getDateTime(new Date(rule.ModifyDate)) : getDateTime(new Date())));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "Permissions", (rule !== null) ? escapeHtml(rule.Permissions) : ""));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "Conditions", (rule !== null) ? escapeHtml(rule.Conditions) : ""));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "Actions", (rule !== null) ? escapeHtml(rule.Actions) : ""));
		$('#accordion_rules').accordion("refresh");
		$('#accordion_rules').accordion({active:"h3:last"});
		ruleNr++;
	}


	var createRuleDivCheck = function(ruleNr, text, checked) {
		return '<label class="lbl_RuleInput" for="ruleOutChk_' + ruleNr + '_' + text + '">' + text + '</label>'
				+ '<input type="checkbox" class="ruleOutCheck" name="' + text + '" id="ruleOutChk_' + ruleNr + '_' + text + '" ' + (checked ? 'checked' : '') + '><br />';
	}

	var createRuleDivInput = function(ruleNr, text, content) {
		return '<label class="lbl_RuleInput" for="ruleOutInp_' + ruleNr + '_' + text + '">' + text + '</label>'
				+ '<input class="ruleOutInput" name="' + text + '" id="ruleOutInp_' + ruleNr + '_' + text + '" value="' + content + '" /><br />';
	}


	function getDateTime(date) {
		var hour = date.getHours();
		hour = (hour < 10 ? "0" : "") + hour;
		var min  = date.getMinutes();
		min = (min < 10 ? "0" : "") + min;
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		month = (month < 10 ? "0" : "") + month;
		var day  = date.getDate();
		day = (day < 10 ? "0" : "") + day;
		return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":00";
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

	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};

	function escapeHtml(string) {
		return String(string).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	}
});

