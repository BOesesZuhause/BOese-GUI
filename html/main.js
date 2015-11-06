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

	socket.on("uiSendRules", function(data) {
		$('#accordion_rules').empty();
		for (var i = 0; i < data.length; i++) {
			addRuleAccordion(data[i]);
		}
	});

	socket.on('uiSendNewRuleNr', function(ruleNr) {
		newRuleNr = ruleNr;
		gotNewRuleNr = true;
		console.log(gotNewRuleNr);
	});


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
		$('#accordion_rules').append('<div class="group"><h3>Rule ' + ((rule !== null) ? rule.RuleId : newRuleNr) + ' </h3><div class="ruleDiv" id="ruleDiv_' + ruleNr + '"></div></div>');
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
		return '<label class="lbl_RuleInput" for="ruleOutChk_' + ruleNr + '_' + text + '">' + text + '</label>'
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

