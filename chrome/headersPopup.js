'use strict';

chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
  var results = document.getElementById('results'),
      headers = chrome.extension.getBackgroundPage().headers[tab[0].id];

  if (headers === undefined) {
    printError();
  }
  else {
    printResults();
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
        results.innerHTML += "<p><b>" + obj.statusLine + "</b></p>";
      }
      else {
        results.innerHTML += "<p><b>" + obj.method + " " + obj.url + "</b></p>";
      }
    }

    function printHeader (obj) {
      results.innerHTML += "<p><b>" + obj.name + ":</b> " + obj.value + "</p>";
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