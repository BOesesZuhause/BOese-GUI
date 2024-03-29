var accordionOptions = {header: "> div > h3", heightStyle: "content", collapsible: true};
var STATUSARRAY = [];
STATUSARRAY[-1] = 'NO_STATUS';
STATUSARRAY[1] = 'ACTIVE';
STATUSARRAY[2] = 'INACTIVE';
STATUSARRAY[3] = 'DEFECT';
STATUSARRAY[4] = 'UNAVAILABLE';
STATUSARRAY[5] = 'COMMUNICATION_FAILURE';
STATUSARRAY[6] = 'UNKNOWN';
STATUSARRAY[7] = 'DELETED';
STATUSARRAY[100] = 'BATTERY';
STATUSARRAY[110] = 'ACTOR_DOES_NOT_REACT';

var NOTIFICATIONTYPES = [];
NOTIFICATIONTYPES[-1] = "NO_TYPE";
NOTIFICATIONTYPES[0] = "INFO";
NOTIFICATIONTYPES[1] = "WARNING";
NOTIFICATIONTYPES[2] = "ERROR";
NOTIFICATIONTYPES[3] = "CRITICAL_ERROR";

var DEFAULT_RULE = {};
DEFAULT_RULE.Permission = "<PERMISSION></PERMISSION>";
DEFAULT_RULE.Condition = "<CONDITION></CONDITION>";
DEFAULT_RULE.Action = "<ACTION></ACTION>";

$(document).ready(function () {
	var ruleNr = 0;
	var repeatRuleNr = 0;
	var newRuleNr = 0;
	var newRepeatRuleNr = 0;
	var newZoneNr = 0;
	var newUnitNr = 0;
	var zones = null;
	var units = null;

	$(function() {
		$('body').css('background-color', '#D5D5D5');
		// $('#logo_span').html('<img src="html/img/boeseLogo.png" />');
		$('#headline_span').html('<img src="html/img/BOese-rot.png" />');
		// $('#headline_span h1:first').text("BOese").css({'color': 'red', 'font-size': '50px'});
		$('#tabs').tabs();
		$('#tabs ul:first li:eq(0) a').text("Übersicht");
		$('#tabs ul:first li:eq(1) a').text("Geräte");
		$('#tabs ul:first li:eq(2) a').text("Regeln");
		$('#tabs ul:first li:eq(3) a').text("Benutzer");
		$('#tabs ul:first li:eq(4) a').text("Zonen");
		$('#tabs ul:first li:eq(5) a').text("Units");
		$('#tabs ul:first li:eq(6) a').text("Benachrichtigungen");
		$('#accordion').accordion({header: "> div > h3", heightStyle: "content", collapsible: true})
					.sortable({
						axis: "y",
						handle: "h3",
						stop: function(event, ui) {
							ui.item.children("h3").triggerHandler("focusout");
							$(this).accordion("refresh");
						}
					});
		
		$('#accordion_repeat_rules').accordion(accordionOptions);
		$('#accordion_rules').accordion(accordionOptions);
		$('#accordion_overview_temps').accordion(accordionOptions);
		$('#btn_reload_distibutor_data').button().click(function(event) {
						event.preventDefault();
						socket.emit('request_reloadDistributorData', 1);
					});
		$('#btn_repeat_rule_add').button().click(function(event) {
						event.preventDefault();
						addRepeatRuleAccordion(null);
						$('#accordion_repeat_rules').accordion("refresh");
					});
		$('#btn_repeat_rule_save').button().click(function(event) {
						event.preventDefault();
						var newRepeatRuleList = [];
						$('.repeatRuleDiv').each(function() {
							var repeatRuleId = parseInt($(this).find('.RepeatRuleId').val());
							if (repeatRuleId < 0) { // new repeat rule
								var tempRepeatRuleId = repeatRuleId;
								repeatRuleId = -1;
								var cronString = $(this).find('.CronString').val();
								var repeatsAfterEnd = parseInt($(this).find('.RepeatsAfterEnd').val());
								var value = parseFloat($(this).find('.Value').val());
								var ruleId = parseInt($(this).find('.RuleId').val());
								var deviceComponentId = parseInt($(this).find('.DeviceComponentId').val());
								newRepeatRuleList.push({
									RepeatRuleId : repeatRuleId,
									TempRepeatRuleId : tempRepeatRuleId,
									CronString : cronString,
									RepeatsAfterEnd : repeatsAfterEnd,
									Value : value,
									RuleId : ruleId,
									DeviceComponentId : deviceComponentId
								});
							}
						});
						socket.emit('createNewRepeatRule', newRepeatRuleList);
					});
		$('#btn_rule_add').button().click(function(event) {
						event.preventDefault();
						addRuleAccordion(null);
						$('#accordion_rules').accordion("refresh");
					});
		$('#btn_rule_save').button().click(function(event) {
						event.preventDefault();
						var accRuleLength = $('#accordion_rules').children().length;
						var newRuleList = [];
						var error = false;
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
											xmlString = xmlString.replace(/\s|\t|\r\n|\n|\r/g, "" );
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
											xmlString = xmlString.replace(/\s|\t|\r\n|\n|\r/g, "" );
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
											xmlString = xmlString.replace(/\s|\t|\r\n|\n|\r/g, "" );
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
										default:
											console.log("Unknown type");
											break;
									}
								} else {}
								// TODO add here to change existing rules
								if (newRule.RuleId < 0) {
									if ((newRule.Actions != null)
											&& (newRule.Conditions != null)
											&& (newRule.Permissions != null)) {
										renameProperty(newRule, "RuleId", "TempRuleId");
										newRuleList.push(newRule);
									} else {
										console.log("Rule ID: " + newRule.RuleId);
										console.log(newRule.Actions);
										console.log(newRule.Conditions);
										console.log(newRule.Permissions);
										//error = true;
									}
								} else if (newRule.RuleId >= 0) {
								}
							});
						}
						if (newRuleList.length != 0) {
							socket.emit('createNewRule', newRuleList);
						} else {
							//console.log("Error");
						}
						
					});
		$('#btn_zone_add').button().click(function(event) {
						event.preventDefault();
						socket.emit('requestNewRuleNr', function (zoneNr) { 
							newZoneNr = zoneNr;
							$('#zone_tab').append(
							'<tr class="neuZoneRow">' + 
								'<td class="zoneInput_TempZone">' + newZoneNr + '</td>' +
								'<td><input class="zoneInput_SuperZone" name="superZone_' + newZoneNr + '" value="1" /></td>' +
								'<td><input class="zoneInput_ZoneName" name="zoneName_' + newZoneNr + '" value="Neue Zone" /></td>' +
							'</tr>'
							);
						});
					});
		$('#btn_zone_save').button().click(function(event) {
						event.preventDefault();
						var zones = [];
						$('.neuZoneRow').each(function() {
							var tempZoneId = parseInt($(this).find('.zoneInput_TempZone').text());
							var superZoneId = parseInt($(this).find('.zoneInput_SuperZone').val());
							var zoneName = $(this).find('.zoneInput_ZoneName').val();
							zones.push({ZoneId : -1, TempZoneId : tempZoneId, SuperZoneId : superZoneId, ZoneName : zoneName});
						});
						socket.emit('createNewZone', zones);
					});

		$('#btn_unit_add').button().click(function(event) {
						event.preventDefault();
						socket.emit('requestNewUnitNr', function (unitNr) { 
							newUnitNr = unitNr;
							$('#unit_tab').append(
							'<tr class="neuUnitRow">' + 
								'<td class="unitInput_TempUnit">' + newUnitNr + '</td>' +
								'<td><input class="unitInput_UnitName" name="unitName_' + newUnitNr + '" value="" /></td>' +
								'<td><input class="unitInput_UnitSymbol" name="unitSymbol_' + newUnitNr + '" value="" /></td>' +
							'</tr>'
							);
						});
					});
		$('#btn_unit_save').button().click(function(event) {
						event.preventDefault();
						var units = [];
						$('.neuUnitRow').each(function() {
							var tempUnitId = parseInt($(this).find('.unitInput_TempUnit').text());
							var unitName = $(this).find('.unitInput_UnitName').val();
							var unitSymbol = $(this).find('.unitInput_UnitSymbol').val();
							units.push({UnitId : -1, TempUnitId : tempUnitId, UnitName : unitName, UnitSymbol : unitSymbol});
						});
						socket.emit('createNewUnit', units);
					});
	});

	var socket = io();
	socket.emit('requestZones', null);
	socket.emit('requestUnits', null);
	socket.emit('requestRules', null);
	socket.emit('requestRepeatRules', null);
	socket.emit('requestDevices', null);
	socket.emit('requestDeviceComponents', null);
	socket.emit('requestTemps', null);
	socket.emit('requestStatusList', null);
	socket.emit('requestNotificationList', null);

	socket.on('uiSendStatusList', function(data) {
		$('#deviceComponentDiv_' + data.DeviceComponentId).each(function() {
			$(this).children().each(function() {
				var suffix = '_' + data.DeviceComponentId + '_Value';
				if ($(this).attr('id').substr(-suffix.length) == suffix) {
					$(this).val(data.Status + ': ' + STATUSARRAY[data.Status]);
				} else {}
			});
		});
		// $('#notification_status_table').empty();
		// $('#notification_status_table').append('<tr><th>Time</th><th>DeviceComponentId</th><th>StatusCode</th><th>StatusNachricht</th></tr>');
		// for (var i = 0; i < data.length; i++) {
		// 	$('#notification_status_table').append('<tr><td>' + getDateTime(new Date(data[i].Timestamp)) + '</td><td>' + data[i].DeviceComponentId + '</td><td>' + STATUSARRAY[data[i].StatusCode] + '</td></tr>');
		// }
	});

	socket.on('uiSendNotificationList', function(data) {
		$('#notification_notification_table').empty();
		$('#notification_notification_table').append('<tr><th>Time</th><th>NotificationType</th><th>NotificationText</th></tr>');
		for (var i = 0; i < data.length; i++) {
			$('#notification_notification_table').append('<tr><td>' + getDateTime(new Date(data[i].Timestamp)) + '</td><td>' + NOTIFICATIONTYPES[parseInt(data[i].NotificationType)] + '</td><td>' + data[i].NotificationText + '</td></tr>');
		}
	});

	socket.on('uiSendDevices', function(data) {
		data.sort(compareDeviceId);
		$('#accordion').empty();
		for (var i = 0; i < data.length; i++) {
			addDeviceAccordion(data[i]);
		}
	});

	socket.on('uiSendDeviceComponents', function(data) {
		// console.log(data);
		for (var i = 0; i < data.length; i++) {
			var devId = data[i].DeviceId;
			var deCos = data[i].DeviceComponents;
			deCos.sort(compareDeviceComponentId);
			$('#deviceDiv_' + devId + '_accordion').empty();
			for (var j = 0; j < deCos.length; j++) {
				addDeviceComponentAccordion(devId, deCos[j]);
			}
			$('#deviceDiv_' + devId + '_accordion').accordion("refresh");
			
		}
	});

	socket.on('uiSendValue', function(data) {
		$('#deviceComponentDiv_' + data.DeviceComponentId).each(function() {
			$(this).children().each(function() {
				if ($(this).attr('id') == 'deviceComponentOutInp_' + data.DeviceId + '_' + data.DeviceComponentId + '_Value') {
					$(this).val(data.Value);
				} else if ($(this).attr('id') == 'deviceComponentOutInp_' + data.DeviceId + '_' + data.DeviceComponentId + '_Value_Timestamp') {
					$(this).html(getDateTime(new Date(data.Timestamp)));
				} else {}
			});
		});
	});

	socket.on('uiSendTemps', function(data) {
		$('#accordion_overview_temps').empty();
		var isOneTmp = false;	
		if (data.TmpConnectors !== undefined && data.TmpConnectors != null && data.TmpConnectors.length > 0) {
			isOneTmp = true;
			$('#accordion_overview_temps').append(
					  '<div class="group"><h3>TempConnectors</h3><div class="deviceDiv" id="accordion_overview_con">'
					+ '<table id="overviewDiv_con_tab"><tr><th>TempID</th><th>Name</th><th>IsUserConnector</th><th>Bestätigen</th></tr></table></div></div>');
			for (var i = 0; i < data.TmpConnectors.length; i++) {
				$('#overviewDiv_con_tab').append(
					'<tr class="overviewDiv_con_tab_row">'
					+ '<td  class="overviewDiv_con_tab_id">' + data.TmpConnectors[i].ConnectorTmpId + '</td>'
					+ '<td>' + data.TmpConnectors[i].ConnectorName + '</td>'
					+ '<td>' + data.TmpConnectors[i].IsUserConnector + '</td>'
					+ '<td><input class="confirm_temp" type="checkbox"></td>'
					+ '</tr>'
					);
			}
		} else {}
		if (data.TmpDevices !== undefined && data.TmpDevices != null && data.TmpDevices.length > 0) {
			isOneTmp = true;
			var zoneSelectStr = '<select name="zoneSelect" class="zoneSelect">';
			for (var i = 0; i < zones.length; i++) {
				zoneSelectStr = zoneSelectStr.concat('<option value="' + zones[i].ZoneId + '">'+ zones[i].ZoneName +'</option>');
			}
			zoneSelectStr = zoneSelectStr.concat('</select>');
			$('#accordion_overview_temps').append(
					  '<div class="group"><h3>TempDevices</h3><div class="deviceDiv" id="accordion_overview_dev">'
					+ '<table id="overviewDiv_dev_tab"><tr><th>TempID</th><th>Name</th><th>ConnectorId</th><th>Zone</th><th>Bestätigen</th></tr></table></div></div>');
			for (var i = 0; i < data.TmpDevices.length; i++) {
				$('#overviewDiv_dev_tab').append(
					'<tr class="overviewDiv_dev_tab_row">'
					+ '<td class="overviewDiv_dev_tab_devId">' + data.TmpDevices[i].DeviceTmpId + '</td>'
					+ '<td>' + data.TmpDevices[i].DeviceName + '</td>'
					+ '<td>' + data.TmpDevices[i].ConnectorId + '</td>'
					+ '<td class="overviewDiv_dev_tab_devZone" id="overviewDiv_dev_tab_devZone_' + data.TmpDevices[i].DeviceTmpId + '">' + zoneSelectStr + '</td>' // TODO auswahlliste mit allen zones
					+ '<td><input class="confirm_temp" type="checkbox"></td>'
					+ '</tr>'
					);
				$('.zoneSelect').selectmenu({width: 200});
				// $('overviewDiv_dev_tab_devZone_' + data.TmpDevices[i].DeviceTmpId).append(insertZoneSelectable());
				// $('overviewDiv_dev_tab_devZone_' + data.TmpDevices[i].DeviceTmpId).selectmenu();
			}
		} else {}
		if (data.TmpDeviceComponents !== undefined && data.TmpDeviceComponents != null && data.TmpDeviceComponents.length > 0) {
			isOneTmp = true;
			var unitSelectStr = '<select name="unitSelect" class="unitSelect">';
			for (var i = 0; i < units.length; i++) {
				unitSelectStr = unitSelectStr.concat('<option value="' + units[i].UnitId + '">'+ units[i].UnitName +'</option>');
			}
			unitSelectStr = unitSelectStr.concat('</select>');
			$('#accordion_overview_temps').append(
					  '<div class="group"><h3>TmpDeviceComponents</h3><div class="deviceDiv" id="accordion_overview_deco">'
					+ '<table id="overviewDiv_deco_tab">'
					+ '<tr><th>TempID</th><th>DeviceId</th><th>ConnectorId</th><th>Name</th><th>Description</th><th>Actor</th><th>Unit</th><th>UnitId</th><th>New Name</th><th>Bestätigen</th></tr></table></div></div>');
			for (var i = 0; i < data.TmpDeviceComponents.length; i++) {
				$('#overviewDiv_deco_tab').append(
					'<tr class="overviewDiv_deco_tab_row">'
					+ '<td class="overviewDiv_deco_tab_decoId">' + data.TmpDeviceComponents[i].ComponentTmpId + '</td>'
					+ '<td>' + data.TmpDeviceComponents[i].DeviceId + '</td>'
					+ '<td>' + data.TmpDeviceComponents[i].ConnectorId + '</td>'
					+ '<td>' + data.TmpDeviceComponents[i].Name + '</td>'
					+ '<td>' + data.TmpDeviceComponents[i].Description + '</td>'
					+ '<td>' + data.TmpDeviceComponents[i].Actor + '</td>'
					+ '<td>' + data.TmpDeviceComponents[i].Unit + '</td>'
					+ '<td class="overviewDiv_deco_tab_unitId">' + unitSelectStr + '</td>' // TODO auswahlliste mit allen units
					+ '<td><input class="overviewDiv_deco_tab_name" value="' + data.TmpDeviceComponents[i].Name + '" /></td>' // TODO eingabefeld für den Namen
					+ '<td><input class="confirm_temp" type="checkbox"></td>'
					+ '</tr>'
					);
				$('.unitSelect').selectmenu({width: 200});
			}
		} else {}
		$('#accordion_overview_temps').accordion("refresh");
		if (isOneTmp) {
			$('#accordion_overview_temps').append('<input id="btn_vonfirm_temps" type="submit" value="Temps bestätigen" />');
			$('#btn_vonfirm_temps').button()
				.click(function(event) {
					event.preventDefault();
					var confirmTemps = {TmpConnectors : [], TmpDevices : [], TmpDeviceComponents : []};
					$('.overviewDiv_con_tab_row').each(function() {
						if ($(this).find('.confirm_temp').prop('checked')) {
							confirmTemps.TmpConnectors.push(parseInt($(this).find('.overviewDiv_con_tab_id').text()));
						}
					});
					$('.overviewDiv_dev_tab_row').each(function() {
						if ($(this).find('.confirm_temp').prop('checked')) {
							confirmTemps.TmpDevices.push({
								DeviceTmpId : parseInt($(this).find('.overviewDiv_dev_tab_devId').text()),
								ZoneId : parseInt($(this).find('.zoneSelect').val())
								});
						}
					});

					$('.overviewDiv_deco_tab_row').each(function() {
						if ($(this).find('.confirm_temp').prop('checked')) {
							confirmTemps.TmpDeviceComponents.push({
								ComponentTmpId : parseInt($(this).find('.overviewDiv_deco_tab_decoId').text()),
								UnitId : parseInt($(this).find('.unitSelect').val()),
								Name : $(this).find('.overviewDiv_deco_tab_name').val()
								});
						}
					});
					socket.emit('confirmTemps', confirmTemps);
				});
		} else {
			$('#accordion_overview_temps').append("Es gibt aktuell nichts temporäres zum Bestätigen");
		}
	});

	socket.on("uiSendRepeatRules", function(data) {
		$('#accordion_repeat_rules').empty();
		repeatRuleNr = 0;
		data.sort(compareRepeatRuleId);
		for (var i = 0; i < data.length; i++) {
			addRepeatRuleAccordion(data[i]);
		}
	});

	socket.on("uiSendRules", function(data) {
		$('#accordion_rules').empty();
		ruleNr = 0;
		data.sort(compareRuleId)
		for (var i = 0; i < data.length; i++) {
			addRuleAccordion(data[i]);
		}
	});

	socket.on('uiSendZones', function(data) {
		zones = data;
		zones.sort(compareZoneId);
		$('#div_zone_tab').empty();
		$('#div_zone_tab').html('<table id="zone_tab"><tr><th>ZoneId</th><th>SuperZoneId</th><th>ZoneName</th></tr></table>');
		for (var i = 0; i < zones.length; i++) {
			$('#zone_tab').append(
				'<tr>' + 
					'<td>' + zones[i].ZoneId + '</td>' +
					'<td>' + zones[i].SuperZoneId + '</td>' +
					'<td>' + zones[i].ZoneName + '</td>' +
				'</tr>'
				);
		}
	});

	socket.on('uiSendUnits', function(data) {
		units = data;
		units.sort(compareUnitId);
		$('#div_unit_tab').empty();
		$('#div_unit_tab').html('<table id="unit_tab"><tr><th>UnitId</th><th>UnitName</th><th>UnitSymbol</th></tr></table>');
		for (var i = 0; i < units.length; i++) {
			$('#unit_tab').append(
				'<tr>' + 
					'<td>' + units[i].UnitId + '</td>' +
					'<td>' + units[i].UnitName + '</td>' +
					'<td>' + units[i].UnitSymbol + '</td>' +
				'</tr>'
				);
		}
	});

	var insertZoneSelectable = function(element) {
		var str = '<select name="zoneSelect" class="zoneSelect">';
		if (zones != null){
			for (var i = 0; i < zones.length; i++) {
				str = str + '<option value="' + zones[i].ZoneId + '">' + zones[i].ZoneName + '</option>';
			}
		}
		return str + '</select>';
	}

	var btn_deco_value_set = function(event, deviceId, deviceComponentId) {
		event.preventDefault();
		var val = $('#deviceComponentOutInp_' + deviceId + '_' + deviceComponentId + '_Value').val();
		var sendValue = {	DeviceId : deviceId, 
							DeviceComponentId : deviceComponentId,
							Value : parseFloat(val),
							Timestamp : new Date().getTime()
						}
		socket.emit('userSendValue', sendValue);
	}

	var addDeviceComponentAccordion = function(deviceId, deCo) {
		$('#deviceDiv_' + deviceId + '_accordion').append('<div class="group"><h3>' 
						+ deCo.ComponentName 
						+ '</h3><div class="deviceComponentDiv" id="deviceComponentDiv_' 
						+ deCo.DeviceComponentId 
						+ '"></div></div>');
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "ComponentID", deCo.DeviceComponentId, false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Description", deCo.Description, false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Name", deCo.ComponentName, false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Value", deCo.Value, true));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Value_Timestamp", getDateTime(new Date(deCo.Timestamp)), false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Status", deCo.Status + ': ' + STATUSARRAY[deCo.Status], false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "IsActor", deCo.Actor, false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Unit", deCo.Unit, false));
		// if (deCo.Actor) {
			$('#deviceComponentDiv_' + deCo.DeviceComponentId).append('<input type="submit" id="btn_deco_value_set_' + deviceId + '_' + deCo.DeviceComponentId + '" value="Value setzen">');
			$('#btn_deco_value_set_' + deviceId + '_' + deCo.DeviceComponentId).button().click(function(event) {
				btn_deco_value_set(event, deviceId, deCo.DeviceComponentId);
			});
		// }
	}

	var createDeviceCompDivInput = function(deviceNr, deviceComponentNr, text, content, isInput) {
		return '<label class="lbl_DeviceInput" for="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '">' + text + '</label>'
				+ (!isInput ? 
						'<span class="deviceOutInput" name="' + text + '" id="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '">' + content + '</span><br />' 
					:   '<input class="deviceOutInput" name="' + text + '" id="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '" value="' + content + '" /><br />');
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

	var addRepeatRuleAccordion = function(rule) {
		if (rule == null) {
			var date = new Date();
			socket.emit('requestNewRepeatRuleNr', function (repeatRuleNr) { 
				newRepeatRuleNr = repeatRuleNr;
				addRepeatRuleAccordionHTML(null);
			});
		} else {
			addRepeatRuleAccordionHTML(rule);
		}
	}

	var addRuleAccordion = function(rule) {
		if (rule == null) {
			var date = new Date();
			socket.emit('requestNewRuleNr', function (rNr) { 
				newRuleNr = rNr;
				addRuleAccordionHTML(null);
			});
		} else {
			addRuleAccordionHTML(rule);
		}
		
	}

	var addRepeatRuleAccordionHTML = function(rule) {
		$('#accordion_repeat_rules').append('<div class="group"><h3>Rule ' + ((rule !== null) ? rule.RepeatRuleId : "New") + ' </h3><div class="repeatRuleDiv" id="repeatRuleDiv_' + repeatRuleNr + '"></div></div>');
		$('#repeatRuleDiv_' + repeatRuleNr).append('<input type="hidden" class="RepeatRuleId" name="RepeatRuleId" value="' + ((rule !== null) ? rule.RepeatRuleId : newRepeatRuleNr) + '">');
		$('#repeatRuleDiv_' + repeatRuleNr).append(createRepeatRuleDivInput(repeatRuleNr, "CronString", (rule !== null) ? rule.CronString : ""));
		$('#repeatRuleDiv_' + repeatRuleNr).append(createRepeatRuleDivInput(repeatRuleNr, "RepeatsAfterEnd", (rule !== null) ? rule.RepeatsAfterEnd : ""));
		$('#repeatRuleDiv_' + repeatRuleNr).append(createRepeatRuleDivInput(repeatRuleNr, "Value", (rule !== null) ? rule.Value : ""));
		$('#repeatRuleDiv_' + repeatRuleNr).append(createRepeatRuleDivInput(repeatRuleNr, "RuleId", (rule !== null) ? rule.RuleId : ""));
		$('#repeatRuleDiv_' + repeatRuleNr).append(createRepeatRuleDivInput(repeatRuleNr, "DeviceComponentId", (rule !== null) ? rule.DeviceComponentId : ""));
		$('#accordion_repeat_rules').accordion("refresh");
		repeatRuleNr++;
	}

	var createRepeatRuleDivInput = function(rNr, text, content) {
		return '<label class="lbl_RuleInput" for="repeatRuleOutInp_' + rNr + '_' + text + '">' + text + '</label>'
				+ '<input class="ruleOutInput ' + text + '" name="' + text + '" id="repeatRuleOutInp_' + rNr + '_' + text + '" value="' + content + '" /><br />';
	}

	var addRuleAccordionHTML = function(rule) {
		$('#accordion_rules').append('<div class="group"><h3>Rule ' + ((rule !== null) ? rule.RuleId : "New") + ' </h3><div class="ruleDiv" id="ruleDiv_' + ruleNr + '"></div></div>');
		$('#ruleDiv_' + ruleNr).append('<input type="hidden" name="RuleId" value="' + ((rule !== null) ? rule.RuleId : newRuleNr) + '">');
		$('#ruleDiv_' + ruleNr).append(createRuleDivCheck(ruleNr, "Active", (rule !== null) ? rule.Active: true));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "InsertDate", (rule !== null) ? getDateTime(new Date(rule.InsertDate)) : getDateTime(new Date())));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "ModifyDate", (rule !== null) ? getDateTime(new Date(rule.ModifyDate)) : getDateTime(new Date())));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInputTA(ruleNr, "Permissions", (rule !== null) ? escapeHtml(rule.Permissions) : DEFAULT_RULE.Permission, 2));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInputTA(ruleNr, "Conditions", (rule !== null) ? escapeHtml(rule.Conditions) : DEFAULT_RULE.Condition, 8));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInputTA(ruleNr, "Actions", (rule !== null) ? escapeHtml(rule.Actions) : DEFAULT_RULE.Action, 8));
		$('#accordion_rules').accordion("refresh");
		ruleNr++;
	}


	var createRuleDivCheck = function(rNr, text, checked) {
		return '<label class="lbl_RuleInput" for="ruleOutChk_' + rNr + '_' + text + '">' + text + '</label>'
				+ '<input type="checkbox" class="ruleOutCheck" name="' + text + '" id="ruleOutChk_' + rNr + '_' + text + '" ' + (checked ? 'checked' : '') + '><br />';
	}

	var createRuleDivInput = function(rNr, text, content) {
		return '<label class="lbl_RuleInput" for="ruleOutInp_' + rNr + '_' + text + '">' + text + '</label>'
				+ '<input class="ruleOutInput" name="' + text + '" id="ruleOutInp_' + rNr + '_' + text + '" value="' + content + '" /><br />';
	}

	var createRuleDivInputTA = function(rNr, text, content, rowNr) {
		return '<label class="lbl_RuleInput" for="ruleOutInp_' + rNr + '_' + text + '">' + text + '</label>'
				+ '<textarea rows="' + rowNr + '" cols="110" name="' + text + '" id="ruleOutInp_' + rNr + '_' + text + '">' + content + '</textarea><br />';
				// + '<input class="ruleOutInput" name="' + text + '" id="ruleOutInp_' + rNr + '_' + text + '" value="' + content + '" /><br />';
	}

	var compareDeviceId = function(a, b) {
		if (a.DeviceId < b.DeviceId) {
			return -1;
		} else if (a.DeviceId > b.DeviceId) {
			return 1;
		} else {
			return 0;
		}
	}

	var compareDeviceComponentId = function(a, b) {
		if (a.DeviceComponentId < b.DeviceComponentId) {
			return -1;
		} else if (a.DeviceComponentId > b.DeviceComponentId) {
			return 1;
		} else {
			return 0;
		}
	}

	var compareZoneId = function(a, b) {
		if (a.ZoneId < b.ZoneId) {
			return -1;
		} else if (a.ZoneId > b.ZoneId) {
			return 1;
		} else {
			return 0;
		}
	}

	var compareUnitId = function(a, b) {
		if (a.UnitId < b.UnitId) {
			return -1;
		} else if (a.UnitId > b.UnitId) {
			return 1;
		} else {
			return 0;
		}
	}
	
	var compareRuleId = function(a, b) {
		if (a.RuleId < b.RuleId) {
			return -1;
		} else if (a.RuleId > b.RuleId) {
			return 1;
		} else {
			return 0;
		}
	}
	
	var compareRepeatRuleId = function(a, b) {
		if (a.RepeatRuleId < b.RepeatRuleId) {
			return -1;
		} else if (a.RepeatRuleId > b.RepeatRuleId) {
			return 1;
		} else {
			return 0;
		}
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

