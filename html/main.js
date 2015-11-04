$(document).ready(function () {
	var ruleNr = 0;
	var newRuleNr = 0;

	$(function() {
		$('body').css('background-color', '#D5D5D5');
		$('#tabs').tabs();
		$('#headline_span h1:first').text("BOESE").css({'color': 'red', 'font-size': '50px'});
		$('#tabs ul:first li:eq(0) a').text("Übersicht");
		$('#tabs ul:first li:eq(1) a').text("Geräte");
		$('#tabs ul:first li:eq(2) a').text("Regeln");
		$('#tabs ul:first li:eq(3) a').text("Benutzer");
		$('#accordion').append('<div class="group"><h3>Device 1</h3><div>GeräteInfo 1</div></div>');
		$('#accordion').append('<div class="group"><h3>Device 2</h3><div>GeräteInfo 2</div></div>');
		$('#accordion').append('<div class="group"><h3>Device 3</h3><div>GeräteInfo 3</div></div>');
		$('#accordion').accordion({header: "> div > h3", heightStyle: "content", collapsible: true})
					.sortable({
						axis: "y",
						handle: "h3",
						stop: function(event, ui) {
							ui.item.children("h3").triggerHandler("focusout");
							$(this).accordion("refresh");
						}
					});
		$('#accordion_rules').accordion({header: "> div > h3", heightStyle: "content", collapsible: true});
		$('#btn_rule_add').button().click(function(event) {
						event.preventDefault();
						addRuleAccordion(null);
						$('#accordion_rules').accordion("refresh");
					});
		$('#btn_rule_save').button().click(function(event) {
						event.preventDefault();
						var accRuleLength = $('#accordion_rules').children().length;
						var newRuleList = [];
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
								renameProperty(newRule, "RuleId", "TempRuleId")
								newRuleList.push(newRule);
							}
							console.log(newRuleList);
						}
						socket.emit('createNewRule', newRuleList);
					});
	});
	var socket = io();
	socket.emit('requestRules', null);

	socket.on("uiSendRules", function(data) {
		$('#accordion_rules').empty();
		for (var i = 0; i < data.length; i++) {
			addRuleAccordion(data[i]);
		}
	});


	var addRuleAccordion = function(rule) {
		if (rule == null) --newRuleNr;
		$('#accordion_rules').append('<div class="group"><h3>Rule ' + ((rule !== null) ? rule.RuleId : newRuleNr) + ' </h3><div class="ruleDiv" id="ruleDiv_' + ruleNr + '"></div></div>');
		$('#ruleDiv_' + ruleNr).append('<input type="hidden" name="RuleId" value="' + ((rule !== null) ? rule.RuleId : newRuleNr) + '">')
		$('#ruleDiv_' + ruleNr).append(createRuleDivCheck(ruleNr, "Active", (rule !== null) ? rule.Active: true));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "InsertDate", (rule !== null) ? rule.InsertDate : getDateTime()));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "ModifyDate", (rule !== null) ? rule.ModifyDate : getDateTime()));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "Permissions", (rule !== null) ? rule.Permissions : ""));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "Conditions", (rule !== null) ? rule.Conditions : ""));
		$('#ruleDiv_' + ruleNr).append(createRuleDivInput(ruleNr, "Actions", (rule !== null) ? rule.Actions : ""));
		$('#accordion_rules').accordion("refresh");
		ruleNr++;
	}


	var createRuleDivCheck = function(ruleNr, text, checked) {
		return '<label class="lbl_RuleInput" for="ruleOutChk_' + ruleNr + '_' + text + '">' + text + '</label>'
				+ '<input type="checkbox" class="ruleOutCheck" name="' + text + '" id="ruleOutChk_' + ruleNr + '_' + text + '" ' + (checked ? 'checked' : '') + '><br />';
	}

	var createRuleDivInput = function(ruleNr, text, content) {
		return '<label class="lbl_RuleInput" for="ruleOutChk_' + ruleNr + '_' + text + '">' + text + '</label>'
				+ '<input class="ruleOutInput" name="' + text + '" id="ruleOutInp_' + ruleNr + '_' + text + '" value="' + content + '" /><br />';
	}


	function getDateTime() {
		var date = new Date();
		var hour = date.getHours();
		hour = (hour < 10 ? "0" : "") + hour;
		var min  = date.getMinutes();
		min = (min < 10 ? "0" : "") + min;
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		month = (month < 10 ? "0" : "") + month;
		var day  = date.getDate();
		day = (day < 10 ? "0" : "") + day;
		return year + "." + month + "." + day + " " + hour + ":" + min;
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
});

