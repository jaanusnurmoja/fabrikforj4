/**
 * Admin SwapList Editor
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
document.addEventListener("DOMContentLoaded", () => {

	var from = document.querySelector('#jform_current_groups-from');
	var to = document.querySelector('#jform_current_groups');
	if (from === null || to === null) {
		return;	// No groups defined
	}
	document.querySelector('#jform_current_groups-add').addEventListener('click', function (e) {
		document.querySelector('#jform__createGroup0').checked = true;
		addSelectedToList(from, to);
		delSelectedFromList(from);
	});

	document.querySelector('#jform_current_groups-remove').addEventListener('click', function (e) {
		addSelectedToList(to, from);
		delSelectedFromList(to);
	});

	document.querySelector('#jform_current_groups-up').addEventListener('click', function (e) {
		moveInList(-1);
	});

	document.querySelector('#jform_current_groups-down').addEventListener('click', function (e) {
		moveInList(+1);
	});


	document.querySelector('#adminForm').onsubmit = function (e) {
		Array.from(to.getElementsByTagName('option')).forEach(function (opt) {
			console.dir(opt);
			opt.selected = true;
		});
		return true;
	};

	function addSelectedToList(from, to) {
		var i;
		var srcLen = from.length;
		var tgtLen = to.length;
		var tgt = "x";

		// Build array of target items
		for (i = tgtLen - 1; i > -1; i--) {
			tgt += "," + to.options[i].value + ",";
		}

		// Pull selected resources and add them to list
		for (i = 0; i < srcLen; i++) {
			if (from.options[i].selected && tgt.indexOf("," + from.options[i].value + ",") === -1) {
				opt = new Option(from.options[i].text, from.options[i].value);
				to.options[to.length] = opt;
			}
		}
	};

	function delSelectedFromList(from) {
		var srcLen = from.length;
		for (var i = srcLen - 1; i > -1; i--) {
			if (from.options[i].selected) {
				from.options[i] = null;
			}
		}
	};

	function moveInList(to) {
		var srcList = to;
		var index = to.selectedIndex;
		var total = srcList.options.length - 1;

		if (index === -1) {
			return false;
		}
		if (to === +1 && index === total) {
			return false;
		}
		if (to === -1 && index === 0) {
			return false;
		}

		var items = [];
		var values = [];

		for (i = total; i >= 0; i--) {
			items[i] = srcList.options[i].text;
			values[i] = srcList.options[i].value;
		}
		for (i = total; i >= 0; i--) {
			if (index === i) {
				srcList.options[i + to] = new Option(items[i], values[i], 0, 1);
				srcList.options[i] = new Option(items[i + to], values[i + to]);
				i--;
			} else {
				srcList.options[i] = new Option(items[i], values[i]);
			}
		}
		srcList.focus();
		return true;
	};
});