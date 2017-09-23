/* -------------------------
	 DEFAULT WIDGET FUNCTIONS
-------------------------- */

// Called by HTML body element's onload event when the widget is ready to start
function load()
{
	if (window.widget) {
		new AppleInfoButton($('infoButton'), $('front'), "black", "black", showBack);
		new AppleGlassButton($('doneButton'), getLocalizedString('Done'), showFront);
	}
	loadPreferences();
	sheet.init();
}

function unload() {
	if (!unload.canceled) {
		saveMiniSheet();
	}
}

// Called when the widget has been removed from the Dashboard
function remove() {
	setInstancePreferenceForKey(null, kDataKey);
	unload.canceled = true;
}

// Called when the widget has been hidden
function hide() {
	saveMiniSheet();
    blur();
}

// Called when the widget loses focus
function blur() {
    sheet.input.value = '';
	if (sheet.actTd) {
		sheet.embed();
	}
	if (sheet.selTd) {
		sheet.deselect(sheet.selTd);
	}
}


function getLocalizedString (key)
{
	try {
		var ret = localizedStrings[key];
		if (ret == undefined)
			ret = key;
		return ret;
	} catch (ex) {}

	return key;
}

// Called when the info button is clicked to show the back of the widget
function showBack(event) {
	var front = $("front");
	var back  = $("back");

	if (window.widget) {
		widget.prepareForTransition("ToBack");
	}

	front.style.display = "none";
	back.style.display = "block";

	if (window.widget) {
		setTimeout('widget.performTransition();', 0);
	}
	saveMiniSheet();
}

// Called when the done button is clicked from the back of the widget
function showFront(event) {
	var front = $("front");
	var back  = $("back");

	if (window.widget) {
		widget.prepareForTransition("ToFront");
	}

	front.style.display = "block";
	back.style.display = "none";

	if (window.widget) {
		setTimeout('widget.performTransition();', 0);
	}
}

if (window.widget) {
	widget.onremove = remove;
	widget.onhide = hide;
	window.onblur = blur;
}

/* ------------------------- 
	   COMMON FUNCTIONS
-------------------------- */

function $(id) {
	return document.getElementById(id);
}

function hasClass(e, cls) {
	return e.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
function addClass(e, cls) {
	if (!this.hasClass(e, cls)) e.className += ' ' + cls;
}
function removeClass(e, cls) {
	if (hasClass(e, cls)) {
		var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
		e.className=e.className.replace(reg,' ');
	}
}



Array.prototype.toNumber = function() {
	var n = 0;
	for (var i = 0, len = this.length; i < len; i++) {
		n = this[i] * 1;
		this[i] = (isNaN(n)) ? 0 : n;
	}
	return this;
}

function saveMiniSheet() {
	var arr = new Array(),
	str = '';

	for(var cel in sheet.data){
		arr.push('"' + cel + '":"' + sheet.data[cel] + '"');
	}
	str = "{" + arr.join(",") + "}";

	if (window.widget) {
		widget.setPreferenceForKey(str, kDataKey);
	} else {
		setCookie(str);
	}
}

/* -------------------------
	   PREFERENCES
-------------------------- */

var kDataKey	  = "data";
var kDefaultData  = {
	"A1":"", "A2":"", "A3":"", "A4":"", "A5":"", "A6":"",
	"B1":"", "B2":"", "B3":"", "B4":"", "B5":"", "B6":"",
	"C1":"", "C2":"", "C3":"", "C4":"", "C5":"", "C6":"",
	"D1":"", "D2":"", "D3":"", "D4":"", "D5":"", "D6":""
};

function loadPreferences() {
	if (window.widget) {
		sheet.data = preferenceForKey(kDataKey);
	} else {
		sheet.data = getCookie();
	}
}

function preferenceForKey(key) {
	var result = null, data;

	if (window.widget) {
		data = widget.preferenceForKey(key);
		if (data && data.length > 0) {
			result = eval('(' + data + ')');
		}
	}
	if (!result) {
		result = eval("kDefault" + key.substring(0,1).toUpperCase() + key.substring(1));
	}
	return result;
}

/* -------------------------
	   COOKIE FUNCTIONS
-------------------------- */

function setCookie(value) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + 30);
	document.cookie = 'minisheet=' + escape(value) + ';expires=' + exdate.toUTCString();
}

function getCookie() {
	var c_name = 'minisheet';
	if (document.cookie.length > 0) {
		c_start=document.cookie.indexOf(c_name + '=');
		if (c_start!=-1) {
			c_start=c_start + c_name.length+1;
			c_end=document.cookie.indexOf(';',c_start);
			if (c_end==-1) c_end=document.cookie.length;
			return eval('(' + unescape(document.cookie.substring(c_start,c_end)) + ')');
		}
	}

	return kDefaultData;
}

/* -------------------------
	   HANDLE SPREADSHEET
-------------------------- */

var sheet = {
	actTd: null,
	actCe: null,
	selTd: null,
	input: $('inputline'),
	values: {},

	update: function (cid) {
		var val, obj;
		for(var cel in sheet.values){
			if (cel != cid) {
				obj = new Formula(sheet.data[cel]);
				val = obj.parse();
				$(cel).firstChild.innerHTML = val;
				sheet.values[cel] = val;
			}
		}
	},
	focus: function (e) {
		sheet.activate(e);
		setTimeout(function(){
			sheet.actCe.focus()
		},0);
	},
	activate: function (e, rmv) {
		var td = (e.currentTarget) ? e.currentTarget : e,
		inp;

		if (sheet.actTd != null) {
			sheet.embed();
		}

		td.innerHTML = '<input />';
		inp = td.firstChild;
		if (!isNaN(sheet.data[td.id]) && sheet.data[td.id]) {
			inp.className = 'number';
		}
		if (!rmv) {
			inp.value = sheet.data[td.id];
		}

		$('inputline').value = sheet.data[td.id];
		inp.addEventListener('keydown', sheet.actKey, false);
		td.removeEventListener('mousedown', sheet.focus, false);
		document.removeEventListener('keydown', sheet.selKey, false);

		sheet.actTd = td;
		sheet.actCe = inp;

		return inp;
	},
	actKey: function(e) {
		var id  = sheet.actTd.id,
		nxt = id;

		switch (e.keyCode) {
			case 224: // cmd firefox
			case 91:  // cmd safari
			case 16:  // shift
			case 17:  // ctrl
				break;
			case 27:  // escape
				sheet.embed(false);
				sheet.deselect(sheet.selTd);
				break;
			case 13:  // enter
				sheet.embed();
				sheet.select($(nxt));
				break;
			case 9:  // tab
				e.preventDefault();
				sheet.embed();
				sheet.select($(nxt));
				break;
			default:
				setTimeout(function(){
					sheet.input.value = sheet.actCe.value;
				},0);
		}
	},
	selKey: function(e) {
		var id  = sheet.selTd.id,
		cel = new Cell(id),
		nxt = id;

		switch (e.keyCode) {
			case 224: // cmd (firefox)
			case 91:  // cmd (safari)
				sheet.activate(sheet.selTd);
				sheet.actCe.focus();
				sheet.actCe.select();
				break;
			case 16: // shift
			case 17: // ctrl
				break;
			case 27: // escape
				sheet.deselect(sheet.selTd);
				sheet.input.value = '';
				break;
			case 37: // left
				nxt = cel.moveLeft();
				break;
			case 38: // up
				nxt = cel.moveUp();
				break;
			case 9: // tab
				e.preventDefault();
			case 39: // right
				nxt = cel.moveRight();
				break;
			case 13: // enter
			case 40: // down
				nxt = cel.moveDown();
				break;
			default:
				sheet.activate(sheet.selTd, true);
				sheet.actCe.focus();
				setTimeout(function(){
					sheet.input.value = sheet.actCe.value;
				},0);
		}
		if (id != nxt) {
			sheet.select($(nxt));
		}
	},
	inpKey: function(e) {
		var td  = sheet.selTd,
		id  = td.id,
		cel = new Cell(id),
		nxt = id;

		switch (e.keyCode) {
			case 224: // command
			case 16: // shift
			case 17: // ctrl
			case 38: // up
			case 40: // down
				break;
			case 13: // enter
				nxt = cel.moveDown();
				sheet.select($(nxt));
				sheet.input.blur();
				break;
			case 27: // escape
				sheet.embed(false);
				sheet.deselect(sheet.selTd);
				sheet.input.blur();
				break;
			default:
				if (!sheet.actTd) {
					sheet.activate(sheet.selTd, true);
					sheet.input.value = '';
					sheet.input.focus();
				}
				setTimeout(function(){
					sheet.actCe.value = sheet.input.value;
				},0);
		}
	},
	embed: function() {
		var td = sheet.actTd, val = '', sav = true, cls;

		if (arguments[0] != null) {
			sav = arguments[0];
		}

		if (sav) {
			val = td.firstChild.value;
			if (val.charAt(0) == '=') {
				var obj = new Formula(val);
				val = obj.parse();
				sheet.data[td.id] = obj.string;
				sheet.values[td.id] = val;
				cls = ' class="number"';
			} else {
				sheet.data[td.id] = val;
				delete sheet.values[td.id];
				cls = (!isNaN(val)) ? ' class="number"' : '';
			}
		} else {
			val = sheet.data[td.id];
			cls = (!isNaN(val)) ? ' class="number"' : '';
		}

		td.innerHTML = '<div' + cls + '>' + val + '</div>';
		td.addEventListener('mousedown', sheet.select, false);
		document.removeEventListener('click', sheet.embed, false);
		document.removeEventListener('keydown', sheet.actKey, false);
		sheet.actTd = null;
		sheet.input.value = '';

		sheet.update(td.id);
	},
	deselect: function (e) {
		removeClass(e.firstChild, 'select');
		removeClass($('col' + e.id.substr(0,1)), 'hilight');
		removeClass($('row' + e.id.substr(1)), 'hilight');
		e.removeEventListener('mousedown', sheet.focus, false);
		e.addEventListener('mousedown', sheet.select, false);
		document.removeEventListener('keydown', sheet.selKey, false);
		sheet.selTd = null;
	},
	select: function(e) {
		var td = (e.currentTarget) ? e.currentTarget : e;

		if (sheet.actTd != null) {
			sheet.embed();
		}

		// deselect the old cell
		if (sheet.selTd) {
			sheet.deselect(sheet.selTd);
		}

		// select the new cell
		sheet.selTd = td;
		addClass(td.firstChild, 'select');
		addClass($('col' + td.id.substr(0,1)), 'hilight');
		addClass($('row' + td.id.substr(1)), 'hilight');
		td.removeEventListener('mousedown', sheet.select, false);
		td.addEventListener('mousedown', sheet.focus, false);

		sheet.input.value = sheet.data[td.id];
		document.addEventListener('keydown', sheet.selKey, false);
	},
	init: function() {
		var div, obj, val, td,
		lst = $('data').getElementsByTagName('td');

		for (var i = 0, len = lst.length; i < len; i++) {
			td = lst[i];
			if (td.className != 'rowLabel') {
				div = document.createElement('div');
				val = sheet.data[td.id];
				if (val.charAt(0) == '=') {
					obj = new Formula(val);
					val = obj.parse();
					sheet.values[td.id] = val;
					div.className = 'number';
				} else if (!isNaN(val) && val.length > 0) {
					div.className = 'number';
				}
				div.innerHTML = val;
				td.addEventListener('mousedown', sheet.select, false);
				td.appendChild(div);
			}
		}

		sheet.input.addEventListener('keydown', sheet.inpKey, false);
		sheet.input.addEventListener('keydown', function(e){
			e.stopPropagation()
		}, false);
		sheet.input.addEventListener('focus', function(e){
			if (!sheet.selTd) {
				sheet.selTd = $('A1');
			}
			if (!sheet.actTd) {
				sheet.activate(sheet.selTd);
			}
		}, false);
		sheet.input.value = '';
	}
}
