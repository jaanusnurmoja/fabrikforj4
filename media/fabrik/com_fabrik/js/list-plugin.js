/**
 * List Plugin
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { Fabrik } from '@fbfabrik';

class FbListPlugin {

	defaults = {
		requireChecked: true,
		canAJAX       : true
	};

	constructor (options) {
		this.options = options;
		this.options = { // options merges with defaults
			...this.defaults,
			...this.options
		};
		this.result = true; // set this to false in window.fireEvents to stop
		// current action (e.g. stop ordering when
		// fabrik.list.order run)
		if (this.getList() === 'null') {
			return;
		} else {
			// Viz doesn't have getForm method;
			if (typeof this.getList().getForm === 'function') {
				this.listform = this.getList().getForm();
				var l = this.listform.getElement('input[name=listid]');
				// in case its in a viz
				if (l === 'null') {
					return;
				}
				this.listid = l.value;
			} else {
				this.listform = this.getList().container.getElement('form');
			}
		}

		this.watchButton();
	}

	/**
	 * get the list object that the plugin is assigned to
	 */

	getList () {
		var b = Fabrik.blocks['list_' + this.options.ref];
		if (b === 'null') {
			b = Fabrik.blocks['visualization_' + this.options.ref];
		}
		return b;
	}

	/**
	 * get a html nodes row id - so you can pass in td or tr for example
	 * presumes each row has a fabrik_row class and its id is in a string 'list_listref_rowid'
	 */

	getRowId (node) {
		if (!node.classList.contains('fabrik_row')) {
			node = node.getParent('.fabrik_row');
		}
		return node.id.split('_').getLast();
	}

	clearFilter.from();

	watchButton () {
		var self = this;
		// Do relay for floating menus
		if (this.options.name === 'null') {
			return;
		}
		// Might need to be this.listform and not document
		document.addEvent('click:relay(.' + this.options.name + ')', function (e, element) {
		// In an event, this refers to the element that received the event. So it does NOT refer to the class
			// Check that the button clicked belongs to this this.list
			if (element.get('data-list') !== this.list.options.listRef) {
				return;
			}
			e.preventDefault();
			var row, chx;
			// if the row button is clicked check its associated checkbox
			if (e.target.parentElement.matches('.fabrik_row')) {
				row = e.target.parentElement.matches('.fabrik_row');
				if (row.getElement('input[name^=ids]')) {
					chx = row.getElement('input[name^=ids]');
					this.listform.getElements('input[name^=ids]').set('checked', false);
					chx.set('checked', true);
				}
			}

			// check that at least one checkbox is checked
			var ok = false;
			this.listform.getElements('input[name^=ids]').forEach(function (c) {
				if (c.checked) {
					ok = true;
				}
			});
			if (!ok && this.options.requireChecked) {
				alert(Joomla.Text._('COM_FABRIK_PLEASE_SELECT_A_ROW'));
				return;
			}
			var n = this.options.name.split('-');
			this.listform.getElement('input[name=fabrik_listplugin_name]').value = n[0];
			this.listform.getElement('input[name=fabrik_listplugin_renderOrder]').value = n.getLast();
			this.buttonAction();
		});
	}

	buttonAction () {
		var task = this.options.canAJAX ? 'list.doPlugin' : 'list.doPlugin.noAJAX';
		this.list.submit(task);
	}
}
