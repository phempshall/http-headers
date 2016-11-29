'use strict';

chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
  var results = document.getElementById('results'),
      headers = chrome.extension.getBackgroundPage().headers[tab[0].id];

  function printError () {
    var error = {
      container: document.createElement('p'),
      text: document.createTextNode("Error: could not get http headers, please try refreshing the page.")
    }
    error.container.className = "error-text";
    error.container.appendChild(error.text)
    results.appendChild(error.container);
  }

  function printResults () {
    Object.keys(headers).forEach(function(key) {
 console.log(headers[key]);
      headers[key][key + 'Headers'].sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});

      printHeading(key);

      for (var i = 0; i < headers[key][key + 'Headers'].length; i++) {
        printHeader(headers[key][key + 'Headers'][i]);
      }
    });

    function printHeading (key) {
      var n = key[0].toUpperCase() + key.substring(1);
      var h = document.createElement('h2'),
          t = document.createTextNode(n);
      h.appendChild(t);
      results.appendChild(h);
    }

    function printHeader (obj) {
      var p = document.createElement('p'),
          b = document.createElement('b'),
          t_name = document.createTextNode(obj.name + ': '),
          t_value = document.createTextNode(obj.value);
      b.appendChild(t_name);

      p.appendChild(b);
      p.appendChild(t_value);
      results.appendChild(p);
    }
  }


  if (headers === undefined) {
    printError();
  }
  else {
    printResults();
  }
});