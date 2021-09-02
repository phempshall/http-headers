/** 
	HTTP Headers - https://www.paulhempshall.com/io/http-headers/
	Copyright (C) 2016-2021, Paul Hempshall. All rights reserved.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
	
	No redistribution without prior written consent.
 */

'use strict';

chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
  var results = document.getElementById('results'),
      headers = chrome.extension.getBackgroundPage().headers[tab[0].id];

  document.body.classList.add(chrome.extension.getBackgroundPage().currentSettings.o_theme);

  if (headers === undefined) {
    printError();
  }
  else {
    printResults();
  }

  function sanitize (data) {
    data = data.replace(/</g, "&lt;");
    data = data.replace(/>/g, "&gt;");
    return data;
  }

  function clearResults () {
    results.innerHTML = '';
  }

  function printError () {
    var error = "Error: could not get http headers, please try refreshing the page.";

    clearResults();
    results.innerHTML += "<p class=\"error-text\">" + error + "</p>"
  }

  function printResults () {
    clearResults();

    // print request
    headers['request']['requestHeaders'].sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
    printHeading('request');
    printKeys('request');

    // print response
    headers['response']['responseHeaders'].sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
    printHeading('response');
    printKeys('response');

    
    function calcTime () {
      return ((headers['response'].timeStamp - headers['request'].timeStamp) / 1000).toFixed(4);
    }

    function printHeading (key) {
      var t = key[0].toUpperCase() + key.substring(1);

      if (key === 'response') {
        results.innerHTML += "<h2>" + t + " <small>(in " + calcTime() + "s)</small></h2>";
      }
      else {
        results.innerHTML += "<h2>" + t + "</h2>";
      }
    }

    function printStatus (obj) {
      if (obj.statusLine) {
        results.innerHTML += "<p><b>" + sanitize(obj.statusLine) + "</b></p>";
      }
      else {
        results.innerHTML += "<p><b>" + sanitize(obj.method) + " " + sanitize(obj.url) + "</b></p>";
      }
    }

    function printHeader (obj) {
      results.innerHTML += "<p><b>" + sanitize(obj.name) + ":</b> " + sanitize(obj.value) + "</p>";
    }

    function printKeys (key) {
      for (var i = 0; i < headers[key][key + 'Headers'].length; i++) {
        if (i === 0) {
          printStatus(headers[key]);
        }
        printHeader(headers[key][key + 'Headers'][i]);
      }
    }
  }
});


document.getElementById('live_headers_link').addEventListener('click', launchLiveHeaders, false);

function launchLiveHeaders (e) {
  e.preventDefault();
  
  chrome.tabs.create(
    {
      url: chrome.extension.getURL("headersLive.html")
    }
  );
}
