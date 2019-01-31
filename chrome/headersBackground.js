/** 
 *	HTTP Headers - https://www.paulhempshall.com/io/http-headers/
 *	Copyright (C) 2016-2019, Paul Hempshall. All rights reserved.
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see https://opensource.org/licenses/GPL-3.0.
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