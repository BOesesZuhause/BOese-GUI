var accordionOptions = {header: "> div > h3", heightStyle: "content", collapsible: true};

$(document).ready(function () {
	var ruleNr = 0;
	var newRuleNr = 0;
	var newZoneNr = 0;
	var newUnitNr = 0;
	var gotNewRuleNr;
	var zones = null;
	var units = null;

	$(function() {
		$('body').css('background-color', '#D5D5D5');
		$('#tabs').tabs();
		$('#headline_span h1:first').text("BOESE").css({'color': 'red', 'font-size': '50px'});
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
		
		$('#accordion_rules').accordion(accordionOptions);
		$('#accordion_overview_temps').accordion(accordionOptions);
		$('#btn_reload_distibutor_data').button().click(function(event) {
						event.preventDefault();
						socket.emit('request_reloadDistributorData', 1);
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
							socket.emit('createNewRule', newRuleList);
						} else {
							console.log("Error");
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
	socket.emit('requestDevices', null);
	socket.emit('requestDeviceComponents', null);
	socket.emit('requestTemps', null);

	socket.on('uiSendDevices', function(data) {
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
			$('#deviceDiv_' + devId + '_accordion').empty();
			for (var j = 0; j < deCos.length; j++) {
				addDeviceComponentAccordion(devId, deCos[j]);
			}
			$('#deviceDiv_' + devId + '_accordion').accordion("refresh");
			
		}
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
				$('.zoneSelect').selectmenu();
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

	socket.on('uiSendZones', function(data) {
		zones = data;
		$('#div_zone_tab').empty();
		$('#div_zone_tab').html('<table id="zone_tab"><tr><th>ZoneId</th><th>SuperZoneId</th><th>ZoneName</th></tr></table>');
		for (var i = 0; i < data.length; i++) {
			$('#zone_tab').append(
				'<tr>' + 
					'<td>' + data[i].ZoneId + '</td>' +
					'<td>' + data[i].SuperZoneId + '</td>' +
					'<td>' + data[i].ZoneName + '</td>' +
				'</tr>'
				);
		}
	});

	socket.on('uiSendUnits', function(data) {
		units = data;
		$('#div_unit_tab').empty();
		$('#div_unit_tab').html('<table id="unit_tab"><tr><th>UnitId</th><th>UnitName</th><th>UnitSymbol</th></tr></table>');
		for (var i = 0; i < data.length; i++) {
			$('#unit_tab').append(
				'<tr>' + 
					'<td>' + data[i].UnitId + '</td>' +
					'<td>' + data[i].UnitName + '</td>' +
					'<td>' + data[i].UnitSymbol + '</td>' +
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
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Value_Timestamp", deCo.Timestamp, false));
		$('#deviceComponentDiv_' + deCo.DeviceComponentId).append(createDeviceCompDivInput(deviceId, deCo.DeviceComponentId, "Status", deCo.Status, false));
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
				+ (!isInput ? '<span class="deviceOutInput" name="' + text + '" id="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '">' + content + '</span><br />' 
					: '<input class="deviceOutInput" name="' + text + '" id="deviceComponentOutInp_' + deviceNr + '_' + deviceComponentNr + '_' + text + '" value="' + content + '" /><br />');
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

