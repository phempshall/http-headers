/** 
 *  HTTP Headers - https://www.paulhempshall.com/io/http-headers/
 *  Copyright (C) 2016-2019, Paul Hempshall. All rights reserved.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see https://opensource.org/licenses/GPL-3.0.
 */

'use strict';

const DOM = {
	'toggleButton' : document.getElementById('toggleButton'),
	'resetButton' : document.getElementById('resetButton'),
	'goToOptionsButton' : document.getElementById('goToOptionsButton'),
	'streamData' : document.getElementById('streamData'),
	'dataArea' : document.getElementById('dataArea'),
	'dataFormattedButton' : document.getElementById('o_live_output_formatted'),
	'dataRawButton' : document.getElementById('o_live_output_raw'),
	'filterByTabs' : document.getElementById('filterByTabs'),
	'filterByDirection' : document.getElementsByName('filterByDirection'),
	'filterByType' : document.getElementsByName('filterByType'),
	'filterByMethod' : document.getElementsByName('filterByMethod'),
	'filterByStatus' : document.getElementById('filterByStatus'),
	'filterByTabs_styleElement' : document.getElementById('filterByTabs_styleElement'),
	'filterByDirection_styleElement' : document.getElementById('filterByDirection_styleElement'),
	'filterByType_styleElement' : document.getElementById('filterByType_styleElement'),
	'filterByMethod_styleElement' : document.getElementById('filterByMethod_styleElement'),
	'filterByStatus_styleElement' : document.getElementById('filterByStatus_styleElement'),
	'clearFiltersButton' : document.getElementById('clearFiltersButton'),
	'donations' : document.getElementById('donations'),
};

var p = false; // pause
var n = 0; // number
var a = null; // active row
var s = true; // scroll
var t = document.getElementById(chrome.extension.getBackgroundPage().currentSettings.o_live_output); // default output type (formatted/raw)

function getStatusCodeStyle (statusCode) {
	statusCode = statusCode.toString();
	if (statusCode.match(/^1/)) { return 'status-100'	}
	if (statusCode.match(/^2/)) { return 'status-200'	}
	if (statusCode.match(/^3/)) { return 'status-300'	}
	if (statusCode.match(/^4/)) { return 'status-400'	}
	if (statusCode.match(/^5/)) { return 'status-500'	}
	return!1;
}

var generate_dom = {
	'shouldPrint' : function (details) {
		if (p === true) { return false; }

		let direction = (details.responseHeaders ? "in" : "out");
		for (let i = 0; i < chrome.extension.getBackgroundPage().currentSettings.o_live_direction.length; i++) {
			if (direction === chrome.extension.getBackgroundPage().currentSettings.o_live_direction[i].replace(/o_live_direction_/,'')) { 
				for (let i = 0; i < chrome.extension.getBackgroundPage().currentSettings.o_live_type.length; i++) {
					if (details.type === chrome.extension.getBackgroundPage().currentSettings.o_live_type[i].replace(/o_live_type_/,'')) { return true }
				}
			}
		}

		return false;
	},
	'filterByTabs' : function (tab, type) {
		if (type === 'new') {
			DOM.filterByTabs.innerHTML += '<option value="' + tab.id + '">' + tab.title + '</option>';
		}
		else if (type === 'update') {
		  for (let i = 0; i < DOM.filterByTabs.length; i++) {
		  	if (DOM.filterByTabs.options[i].value == tab.id) {
		  		DOM.filterByTabs.options[i].innerHTML = tab.title;
		  	}
		  }
		}
		else if (type === 'remove') {
		  for (let i = 0; i < DOM.filterByTabs.length; i++) {
		  	if (DOM.filterByTabs.options[i].value == tab) {
		  		DOM.filterByTabs.remove(i);
		  	}
		  }
		}		
	},
	'filterByStatus' : function () {
		for (status in httpStatusCodes) {
			DOM.filterByStatus.innerHTML += '<option value="' + status + '">' + status + ' :: ' + httpStatusCodes[status] + '</option>';
		}
	},
	'information' : function (row, type = 'o_live_output_raw') {
		if (type === 'o_live_output_formatted') {
			let details = JSON.parse(row.dataset.details);
			DOM.dataArea.innerHTML = '';

			if (details.requestHeaders) {
				DOM.dataArea.innerHTML += "#REQUEST\n";
			}
			else if (details.responseHeaders) {
				DOM.dataArea.innerHTML += "#RESPONSE\n";
			}

			DOM.dataArea.innerHTML += "Request ID: " + details.requestId + "\n";
			DOM.dataArea.innerHTML += "Type: " + details.type + "\n";
			DOM.dataArea.innerHTML += "Time: " + Date(details.timeStamp) + "\n";

			if (details.requestHeaders) {
				DOM.dataArea.innerHTML += "Method: " + details.method + " " + decodeURIComponent(details.url) + "\n\n";
				details.requestHeaders.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
				for (let i = 0; i < details.requestHeaders.length; i++) {
					DOM.dataArea.innerHTML += details.requestHeaders[i].name + ": " + details.requestHeaders[i].value + "\n";
				}
			}
			else if (details.responseHeaders) {
				DOM.dataArea.innerHTML += "Method: " + details.method + " " + decodeURIComponent(details.url) + "\n";
				DOM.dataArea.innerHTML += "Status: " + row.dataset.statusCode + " - " + httpStatusCodes[row.dataset.statusCode] + "\n\n";
				details.responseHeaders.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
				for (let i = 0; i < details.responseHeaders.length; i++) {
					DOM.dataArea.innerHTML += details.responseHeaders[i].name + ": " + details.responseHeaders[i].value + "\n";
				}				
			}
		}
		else if (type === 'o_live_output_raw') {
			DOM.dataArea.innerHTML = row.dataset.details;
		}
		else if (type === 'remove') {
			DOM.dataArea.innerHTML = '';
		}
	},
	'stream' : function (n, details, type = null) {
		if (type === 'remove') {
			DOM.streamData.tBodies[0].innerHTML = '';
			return!1;
		}

		let direction = (details.responseHeaders ? "RESP" : "REQ");

		let html = '';
				html += '<td>' + n + '</td>';
				html += '<td title="Request ID: ' + details.requestId + '">' + direction + '</td>';
				html += '<td title="' + Date(details.timeStamp) + '"><input type="text" value="' + Date(details.timeStamp) + '" readonly="readonly"></td>';
				html += '<td>' + details.method + '</td>';
				if (details.statusCode) {
					let sum = 'd04d058e57ce92bf697f7c233a8061bce1210a4b';
					html += '<td class="status ' + getStatusCodeStyle(details.statusCode) + '" title="'+ details.statusCode + ': ' + httpStatusCodes[details.statusCode] + '">' + details.statusCode + '</td>';
				}
				else {
					html += '<td class="status"></td>';
				}
				html += '<td title="' + details.url + '"><input type="text" value="' + details.url + '" readonly="readonly"></td>';

		let tr = document.createElement('tr');
				tr.dataset.number = n;
				tr.dataset.tab = details.tabId;
				tr.dataset.direction = direction;
				tr.dataset.requestId = details.requestId;
				tr.dataset.type = details.type;
				tr.dataset.method = details.method;
				tr.dataset.statusCode = details.statusCode || null;
				tr.dataset.details = JSON.stringify(details);
				tr.innerHTML = html;
				tr.addEventListener('click', function (e) {
			    if (e.ctrlKey) {
			      console.log('ctrl click');
			    }
			    if (e.shiftKey) {
			      console.log('shift click');
			    }
					if (a) {
						if (a === this) {
							this.classList.remove('stream-active');
							a = null;
							s = true;
							generate_dom.information(null, 'remove');
							return!1;
						}
						else {
							a.classList.remove('stream-active');
						}
					}
					this.classList.add('stream-active');
					a = this;
					s = false;
					generate_dom.information(this, t.id);
				});

		if (document.querySelectorAll('[data-request-id="' + details.requestId + '"][data-status-code="null"]').length === 1) {
			document.querySelectorAll('[data-request-id="' + details.requestId + '"][data-status-code="null"]')[0].dataset.statusCode = details.statusCode;
		}				

		DOM.streamData.tBodies[0].appendChild(tr);

		if (s === true) {
			DOM.streamData.scrollIntoView(false);
		}
	}
};


chrome.webRequest.onHeadersReceived.addListener(function (details) {
	if (generate_dom.shouldPrint(details) === false) { 
		return;
	}
	else {
	  n += 1;
	  generate_dom.stream(n, details);		
	}	
}, {
  urls: ["<all_urls>"],
  types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
}, ["blocking", "responseHeaders"]);

chrome.webRequest.onSendHeaders.addListener(function (details) {
	if (generate_dom.shouldPrint(details) === false) { 
		return;
	}
	else { 
	  n += 1;
	  generate_dom.stream(n, details);
	}
}, {
  urls: ["<all_urls>"],
  types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
}, ["requestHeaders"]);


/**
 * Create toggleButton
 */
DOM.toggleButton.addEventListener('click', function () {
	if (p === false) {
		// pause
		p = true;
		DOM.toggleButton.innerHTML = '&#x25BA;';
	}
	else if (p === true) {
		// resume
		p = false;
		DOM.toggleButton.innerHTML = '&#9646;&#9646;';
	}
});


/**
 * Create resetButton
 */
DOM.resetButton.addEventListener('click', function () {
	// temporary pause
	p = true;

	// remove data
	generate_dom.stream(null, null, 'remove');
	generate_dom.information(null, 'remove');

	// reset flags
	p = false; // un pause
	DOM.toggleButton.innerHTML = '&#9646;&#9646;';
	n = 0; // reset number
	a = null; // nullify active row
	s = true; // resume scrolling
});


/**
 * Information tab change (formatted/raw)
 */
DOM.dataFormattedButton.addEventListener('click', function () {
	tabChange(this);
});

DOM.dataRawButton.addEventListener('click', function () {
	tabChange(this);
});

function tabChange (button) {
	if (button.id === t.id) { 
		return!1
	}
	else {
		t.classList.remove('tabber-style-active');
		button.classList.add('tabber-style-active');
		t = button;
		if (a) {
			generate_dom.information(a, t.id)
		}
	}
}


/**
 *  Create filterByTabs
 */
chrome.windows.getAll({ populate: true }, function (windows) {
  windows.forEach(function (window) {
    window.tabs.forEach(function (tab) {
      generate_dom.filterByTabs(tab, 'new');
    });
  });
});

chrome.tabs.onCreated.addListener(function (tab) {
	generate_dom.filterByTabs(tab, 'new');
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.title) {
		generate_dom.filterByTabs(tab, 'update');
	}
});

chrome.tabs.onRemoved.addListener(function (tab) {
	generate_dom.filterByTabs(tab, 'remove');
});


/**
 * Create filterByStatus
 */
generate_dom.filterByStatus();


/**
 * bind_filter_handlers
 */
function bind_filter_handlers () {
	/* filterByTabs event */
	DOM.filterByTabs.addEventListener('change', function () {
		if (this.options[this.selectedIndex].value === '0') {
			DOM.filterByTabs_styleElement.innerHTML = '';
		}
		else {
			DOM.filterByTabs_styleElement.innerHTML = 'tbody tr:not([data-tab="' + this.options[this.selectedIndex].value + '"]){display:none}';
		}
	});

	/* filterByDirection event */
	for (let i = 0; i < DOM.filterByDirection.length; i++) {
		DOM.filterByDirection[i].addEventListener('change', function () {
			apply_filters(this);
		});
	}
	
	/* filterByType event */
	for (let i = 0; i < DOM.filterByType.length; i++) {
		DOM.filterByType[i].addEventListener('change', function () {
			apply_filters(this);
		});
	}
	
	/* filterByMethod event */
	for (let i = 0; i < DOM.filterByMethod.length; i++) {
		DOM.filterByMethod[i].addEventListener('change', function () {
			apply_filters(this);
		});
	}

	/* filterByStatus event */
	DOM.filterByStatus.addEventListener('change', function () {
		if (this.options[this.selectedIndex].value === '0') {
			DOM.filterByStatus_styleElement.innerHTML = '';
		}
		else {
			// :not([data-direction="REQ"])
			DOM.filterByStatus_styleElement.innerHTML = 'tbody tr:not([data-status-code="' + this.options[this.selectedIndex].value + '"]){display:none}';
		}
	});

	/* clearFiltersButton event */
	DOM.clearFiltersButton.addEventListener('click', function () {
		clear_filters();
	});
}
bind_filter_handlers();

function apply_filters (element, type = null) {
	let filters = '';
	let data_name = 'data-' + element.name.replace(/filterBy/,'').toLowerCase();
	
	for (let i = 0; i < DOM[element.name].length; i++) {
		if (DOM[element.name][i].checked) {
			filters += ':not([' + data_name + '="' + DOM[element.name][i].value + '"])';
		}
	}

	if (filters != '') {
		DOM[element.name + '_styleElement'].innerHTML = 'tbody tr' + filters + '{display:none}';
	}
	else {
		DOM[element.name + '_styleElement'].innerHTML = '';
	}
}

function clear_filters () {
	for (let i = 0; i < DOM.filterByDirection.length; i++) {
		DOM.filterByDirection[i].checked = false;
	}
	DOM.filterByDirection_styleElement.innerHTML = '';

	for (let i = 0; i < DOM.filterByType.length; i++) {
		DOM.filterByType[i].checked = false;
	}
	DOM.filterByType_styleElement.innerHTML = '';
	
	for (let i = 0; i < DOM.filterByMethod.length; i++) {
		DOM.filterByMethod[i].checked = false;
	}
	DOM.filterByMethod_styleElement.innerHTML = '';

	DOM.filterByTabs.selectedIndex = 0;
	DOM.filterByTabs_styleElement.innerHTML = '';

	DOM.filterByStatus.selectedIndex = 0;
	DOM.filterByStatus_styleElement.innerHTML = '';
}


/**
 * Create goToOptionsButton
 */
DOM.goToOptionsButton.addEventListener('click', function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('headerOptions.html'));
  }
});


/**
 * Document Loaded/Ready Functions
 */
document.addEventListener('DOMContentLoaded', function () {
  document.body.classList.add(chrome.extension.getBackgroundPage().currentSettings.o_theme);
  if (chrome.extension.getBackgroundPage().currentSettings.o_live_donation === 'o_live_donation_hide') {
  	DOM.donations.style.display = 'none';
  }

	if (t.id === 'o_live_output_formatted') {
		DOM.dataFormattedButton.classList.add('tabber-style-active');
	}
	else if (t.id === 'o_live_output_raw') {
		DOM.dataRawButton.classList.add('tabber-style-active');	
	}
});