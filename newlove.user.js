/*
   (c) Ian Young 2007
   This program is free software; you can redistribute it and/or modify it 
   under the terms of the GNU General Public License as published by the Free
   Software Foundation; either version 2 of the License, or (at your option)
   any later version.
   This program is distributed in the hope that it will be useful, but WITHOUT
   ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
   FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
   more details.
   You should have received a copy of the GNU General Public License along
   with this program; if not, write to the Free Software Foundation, Inc., 59
   Temple Place, Suite 330, Boston, MA 02111-1307 USA 
*/
// Revision History
// 1.0 - Initial release
// 1.1 - Added ability to watch everyone's quicklove
// 1.1c - Erin [nichols] reworked this to work in chrome! (works in firefox too!)
// ==UserScript==
// @name           NewLove
// @namespace      http://www.grinnellplans.com
// @description    Shows only new planlove in the quicklove page.
// @include        http://grinnellplans.com/search.php?mysearch=*&planlove=1*
// @include        http://www.grinnellplans.com/search.php?mysearch=*&planlove=1*
// @match          http://grinnellplans.com/search.php?mysearch=*&planlove=1*
// @match          http://www.grinnellplans.com/search.php?mysearch=*&planlove=1*
// ==/UserScript==

// credit Joe Simmons http://greasefire.userscripts.org/users/JoeSimmons
var isGM = (typeof getValue != 'undefined' && typeof getValue('a', 'b') != 'undefined'),
getValue = (isGM ? getValue : (function(name, def) {var s=localStorage.getItem(name); return (s=="undefined" || s=="null") ? def : s})),
setValue = (isGM ? setValue : (function(name, value) {return localStorage.setItem(name, value)})),
deleteValue = (isGM ? GM_deleteValue : (function(name, def) {return localStorage.setItem(name, def)}));

/**
 * Credit Jesse Mwaura
 * Return this object formatted as a <a href="http://en.wikipedia.org/wiki/JSON">JSON</a> <code>String</code>.
 * @returns A <code>String</code> representing this object in JSON format.
 * @type String
 */
Object.prototype.toJSON = function() {
	var opts=arguments[0] || {functions:false};
	switch (typeof this) {
	
		case 'object':
			if (this) {
				var list = [];
				if (undefined === this.getClass) {
					if (this instanceof Array) {
						for (var i = 0; i < this.length;i++) {
							if (this[i] === null) {
								list.push('null');
							} else if (this[i] === undefined) {
								list.push('undefined');
							} else if (undefined !== this[i].getClass){
								list.push(String(this[i].toString()).toJSON(opts));
							} else if(opts.functions==false && typeof this[prop]=='function'){
								continue;
							} else {
								list.push(this[i].toJSON(opts));
							}
						}
						return '[' + list.join(',') + ']';
					} else {
						for (var prop in this) {
							if (this[prop] === null) {
								list.push('"' + prop + '": null');
							} else if (this[prop] === undefined) {
								list.push('"' + prop + '": undefined');
							} else if (undefined !== this[prop].getClass){
								list.push('"' + prop + '":' + String(this[prop].toString()).toJSON(opts));
							} else if (opts.functions==false && typeof this[prop]=='function'){
								continue;
							} else {
								list.push('"' + prop + '":' + this[prop].toJSON(opts));
							}
						}
						return '{' + list.join(',') + '}';
					}
				} else { 
					return '"' + String(this).replace(/\\/g, "\\\\")
						.replace(/["]/g, "\\\"") + '"';
				}
			} else {
				return 'null';
			}
		case 'function':	
		case 'string':
		case 'number':
		case 'boolean':
			return this.toJSON(opts);
	}
}

Function.prototype.toJSON = function(){
	var opts=arguments[0] || {functions:false};
	if (opts.functions) return this.toString();
	else return undefined;
	
}
	
String.prototype.toJSON = function() {
	return '"' + String(this).replace(/["]/g, '\\\"')
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '')
		.replace(/\t/g, '\\t')+ '"';
}

Boolean.prototype.toJSON = function() {
	return this.toString();
}
	
Number.prototype.toJSON = function() {
	return this.toString();
}

Date.prototype.toJSON = function(){
	return this.toString().toJSON();
}

/* Credit Douglas Crockford <http://javascript.crockford.com/remedial.html> */
String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, "");
};
// Gets the name of the author a given result is associated with
function getAuthor(node) {
	var links = node.getElementsByTagName('a');
	return links[0].innerHTML;
}
// Check given item against all members of the given array. Returns true if the item is found in the array
function arrayContains(arr, obj) {
	if (!arr) return false;
	for (var i=0; i<arr.length; i++) {
		//GM_log("Checking string\n" + obj + "\nagainst\n" + arr[i]);
		if (arr[i].trim() == obj.trim()) {
			//GM_log("Match found");
			return true;
		}
	}
	return false;
}
// Reset the username and history (simulate a fresh install)
function resetValues(e) {
	if (window.confirm("Reset username and saved planlove?")) {
		setValue("username", "");
		setValue("planloveHash" + guessUsername, "");
	}
}
// Do not count new planlove as read
function saveOldlove() {
	setValue("planloveHash" + guessUsername, oldlove.toJSON());
}
// Figure out if this is actually the quicklove page, as opposed to 
// a regular search. Hackity hack!
username = getValue("username");

// We need to determine the username. Let's make a guess based on
// the current url of the page.
var urly = window.location.href;
var startIndex = urly.indexOf("mysearch=") + 9;
var endIndex = urly.indexOf("&", startIndex);
var guessUsername = urly.substring(startIndex, endIndex);
if (!username) {
	// Ask for confirmation of the username
	username = window.prompt("What's your username?\n\nIf you want to stalk other people's newlove as well as your own, enter 'everyone' here.", guessUsername).toLowerCase();
	if (!username) return false; // give up
	setValue("username", username);
}
// Now, if the page we're currently on isn't searching for that
// username, fuggedaboudit.
if (username != guessUsername && username != "everyone") {
	GM_log("False alarm, this isn't a quicklove page. Exiting.");
	return false;
}
// Add items to the menu
GM_registerMenuCommand("Reset username", resetValues, "", "", "R");
GM_registerMenuCommand("Save as unread", saveOldlove, "", "", "u");
var startTime = new Date();
var origTime = new Date();
// Find all 'sub-lists' in the page
var loves = document.evaluate(
		'//ul[@id="search_results"]/li//ul/li',
		document,
		null,
		XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
		null);
var timeDiff1 = new Date() - startTime;
startTime = new Date();

// Get the stored planlove from last time
oldlove_str = getValue("planloveHash" + guessUsername);

// Convert from the stored string to a hashtable of arrays
try {
	var oldlove = eval("(" + oldlove_str + ")");
	// Test it to see if it's null
	oldlove["foo"];
} catch (e) {
	var oldlove = {};
}
newlove = {}
var timeDiff2 = new Date() - startTime;
startTime = new Date();
// Iterate through the list of search results
var foo;
for (var i=0; i<loves.snapshotLength; i++) {
	foo = loves.snapshotItem(i);
	var author = getAuthor(foo.parentNode.parentNode);
	content = foo.firstChild.innerHTML;
	// Check each lovin' against list of author's previous lovin'
	if (arrayContains(oldlove[author], content)) {
		// It's old, remove it
		foo.parentNode.removeChild(foo);
	}
	// Fetch the array of planlove for the current author
	var temp_arr = newlove[author];
	// Create it if it doesn't exist
	if (!temp_arr) { temp_arr = []; }
	// Add it to the new list of planlove
	temp_arr[temp_arr.length] = content;
	newlove[author] = temp_arr;
}
var timeDiff3 = new Date() - startTime;
startTime = new Date();
// Store the new list value as a string (hacked this way because
// we can only store strings, ints, and booleans
try{
    setValue("planloveHash" + guessUsername, newlove.toSource());
} catch(e) {
    setValue("planloveHash" + guessUsername, newlove.toJSON());
}
var timeDiff4 = new Date() - startTime;
var timeDiffTot = new Date() - origTime;
GM_log("Time spent: (1) " + timeDiff1 + " (2) " + timeDiff2 + " (3) " + timeDiff3 + " (4) " + timeDiff4 + " (total) " +  timeDiffTot);
