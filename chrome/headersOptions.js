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

// Saves options to chrome.storage
function save_options() {
	let newSettings = {
		'o_theme': null,
		'o_live_output': null,
		'o_live_direction': [],
		'o_live_type': [],
		'o_live_donation': null,		
	};

	for (let i = 0; i < document.getElementsByName('o_theme').length; i++) {
		if (document.getElementsByName('o_theme')[i].checked) {
			newSettings.o_theme = document.getElementsByName('o_theme')[i].id;
		}
	}
	for (let i = 0; i < document.getElementsByName('o_live_output').length; i++) {
		if (document.getElementsByName('o_live_output')[i].checked) {
			newSettings.o_live_output = document.getElementsByName('o_live_output')[i].id;
		}
	}
	for (let i = 0; i < document.getElementsByName('o_live_direction').length; i++) {
		if (document.getElementsByName('o_live_direction')[i].checked) {
			newSettings.o_live_direction.push(document.getElementsByName('o_live_direction')[i].id);
		}
	}
	for (let i = 0; i < document.getElementsByName('o_live_type').length; i++) {
		if (document.getElementsByName('o_live_type')[i].checked) {
			newSettings.o_live_type.push(document.getElementsByName('o_live_type')[i].id);
		}
	}
	for (let i = 0; i < document.getElementsByName('o_live_donation').length; i++) {
		if (document.getElementsByName('o_live_donation')[i].checked) {
			newSettings.o_live_donation = document.getElementsByName('o_live_donation')[i].id;
		}
	}

  chrome.storage.sync.set(
  	newSettings, 
  	function() {
	    let status = document.getElementById('status');
	    status.textContent = 'Options saved.';
	    setTimeout(function() {
	      status.innerHTML = '&nbsp;';
	    }, 1550);
  	}
  );

 	chrome.extension.getBackgroundPage().currentSettings = newSettings;
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get(
		chrome.extension.getBackgroundPage().defaultSettings, 
 		function (settings) {
 			document.getElementById(settings.o_theme).checked = true;
 			document.getElementById(settings.o_live_output).checked = true;
 			for (let i = 0; i < settings.o_live_direction.length; i++) {
 				document.getElementById(settings.o_live_direction[i]).checked = true;
 			}
 			for (let i = 0; i < settings.o_live_type.length; i++) {
 				document.getElementById(settings.o_live_type[i]).checked = true;
 			}
 			document.getElementById(settings.o_live_donation).checked = true;

 			chrome.extension.getBackgroundPage().currentSettings = settings;
 		}
 	);
}

function default_options () {
	document.getElementById(chrome.extension.getBackgroundPage().defaultSettings.o_theme).checked = true;
	document.getElementById(chrome.extension.getBackgroundPage().defaultSettings.o_live_output).checked = true;
	for (let i = 0; i < chrome.extension.getBackgroundPage().defaultSettings.o_live_direction.length; i++) {
		document.getElementById(chrome.extension.getBackgroundPage().defaultSettings.o_live_direction[i]).checked = true;
	}
	for (let i = 0; i < chrome.extension.getBackgroundPage().defaultSettings.o_live_type.length; i++) {
		document.getElementById(chrome.extension.getBackgroundPage().defaultSettings.o_live_type[i]).checked = true;
	}
	document.getElementById(chrome.extension.getBackgroundPage().defaultSettings.o_live_donation).checked = true;

  chrome.storage.sync.set(
  	chrome.extension.getBackgroundPage().defaultSettings, 
  	function() {
	    let status = document.getElementById('status');
	    status.textContent = 'Default options restored.';
	    setTimeout(function() {
	      status.innerHTML = '&nbsp;';
	    }, 1550);
  	}
  );

 	chrome.extension.getBackgroundPage().currentSettings = chrome.extension.getBackgroundPage().chrome.extension.getBackgroundPage().defaultSettings;
}

document.addEventListener('DOMContentLoaded', function () {
	restore_options();
  document.body.classList.add(chrome.extension.getBackgroundPage().currentSettings.o_theme);
});
document.getElementById('save').addEventListener('click', function () {
	save_options();
  document.body.className = '';
  document.body.classList.add(chrome.extension.getBackgroundPage().currentSettings.o_theme);
});
document.getElementById('defaults').addEventListener('click', function () {
	if (confirm('Are you sure you want to restore the default options?')) {
	  default_options();
	  document.body.className = '';
	  document.body.classList.add(chrome.extension.getBackgroundPage().currentSettings.o_theme);	  
	} else {
		return!1;
	}	
});
