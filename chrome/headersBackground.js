/** 
	HTTP Headers - https://www.paulhempshall.com/io/http-headers/
	Copyright (C) 2016-2021, Paul Hempshall. All rights reserved.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
	
	No redistribution without prior written consent.
 */

'use strict';

var defaultSettings = {
	'o_theme': 'o_theme_light',
	'o_live_output': 'o_live_output_formatted',
	'o_live_direction': ['o_live_direction_in', 'o_live_direction_out'],
	'o_live_type': ['o_live_type_main_frame', 'o_live_type_sub_frame', 'o_live_type_stylesheet', 'o_live_type_script', 'o_live_type_image', 'o_live_type_object', 'o_live_type_xmlhttprequest', 'o_live_type_other'],
	'o_live_donation': 'o_live_donation_show',
};
var currentSettings;

var headers = {};

var filters = {
  urls: ["<all_urls>"],
  types: ["main_frame"]
};

/* headers sent */
chrome.webRequest.onSendHeaders.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId].request = details;
}, filters, ["requestHeaders"]);

/* headers received */
chrome.webRequest.onHeadersReceived.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId].response = details;
}, filters, ["responseHeaders"]);

/* remove tab data from headers object when tab is onRemoved */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	delete headers[tabId];
});

function get_options() {
  chrome.storage.sync.get(
		defaultSettings,
 		function (settings) {
 			currentSettings = settings;
 		}
 	);
}
get_options();
