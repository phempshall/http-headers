'use strict';

var headers = {};

var filters = {
  urls: ["<all_urls>"],
  types: ["main_frame"]
};

/* headers received */
chrome.webRequest.onHeadersReceived.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId].response = details;
}, filters, ["responseHeaders"]);

/* headers sent */
chrome.webRequest.onSendHeaders.addListener(function(details) {
  headers[details.tabId] = headers[details.tabId] || {};
  headers[details.tabId].request = details;
}, filters, ["requestHeaders"]);

/* remove tab data from headers object when tab is onRemoved */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	delete headers[tabId];
});