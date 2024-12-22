/**
 * List
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// F5: Removed csv code to separate csv-list.js file
// F5: Temporary leave jQuery code. Change to vanilla JS later. Some functions are already changed.
// F5: Not all functions may be used or can be solved in php/css

// TEST: Replaced $H() by Map()
// ALL if (typeof(value) === 'null') => changed to (value === 'null')
// TEST: if (typeof(data) !== 'object')
// removed (comment out) all Fabrik.loader
	
import {Fabrik} from "@fabrik"; 

export class FbList {

	actionManager = null;

	defaults = {
		'admin'              : false, // F5: not used here
		'filterMethod'       : 'onchange',
		'ajax'               : false,
		'ajax_links'         : false,
		'links'              : {'edit': '', 'detail': '', 'add': ''},
		'form'               : '',
		'hightLight'         : '#ccffff',
		'primaryKey'         : '', // F5: not used here
		'headings'           : [],
		'labels'             : {}, // F5: not used here
		'Itemid'             : 0,
		'formid'             : 0, // F5: not used here
		'canEdit'            : true, // F5: not used here
		'canView'            : true, // F5: not used here
		'page'               : 'index.php', // F5: not used here
		'actionMethod'       : 'floating', // F5: not used here
		'formels'            : [], // elements that only appear in the form F5: not used here
		'data'               : [], // [{col:val, col:val},...] (depreciated) F5: not used here
		'itemTemplate'       : '',
		'floatPos'           : 'left', // F5: not used here
		'advancedFilters'    : null, // F5: not used here
		'popup_width'        : 300,
		'popup_height'       : 300,
		'popup_offset_x'     : null,
		'popup_offset_y'     : null,
		'groupByOpts'        : {},
		'isGrouped'          : false,
		'listRef'            : '',
		'fabrik_show_in_list': [],
		'singleOrdering'     : false,
		'tmpl'               : '',
		'groupedBy'          : '',
		'toggleCols'         : false
	};

	constructor (id, options) {
		var self = this; 
		this.id = id;
		this.options = options;
		this.options = {
			...this.defaults,
			...this.options
		}
		this.getForm();	
		this.result = true; //used with plugins to determine if list actions should be performed
		this.plugins = [];
		this.list = document.querySelector('#list_' + this.options.listRef);
		this.rowTemplate = false;
		if (this.options.toggleCols) {
			this.toggleCols = new FbListToggle(this.form);
		}
		if (this.options.doGroupby) { // F5: Added to save loading JS file if not needed
			this.groupToggle = new FbGroupedToggler(this.form, this.options.groupByOpts);
		}
		//new FbListKeys(this); // F5: Do we use this ?
		if (this.list) {
			if (this.list.tagName === 'table') {
				this.tbody = this.list.querySelector('tbody');
			}
			if (this.tbody === 'null') {
				this.tbody = this.list.querySelector('.fabrik_groupdata');
			}
		}
		this.watchAll(false);
		Fabrik.addEvent('fabrik.form.submitted', function () {
			self.updateRows();
		});

		// Reload state only if reset filters is not on
		if (!this.options.resetFilters && ((window.history && history.pushState) &&
			history.state && this.options.ajax)) {
			this._updateRows(history.state); //can history.state be not an object?
		}

		this.mediaScan();

		Fabrik.fireEvent('fabrik.list.loaded', [this]);
	}

	setRowTemplate(parent) {
		if (!this.rowTemplate) {
			this.rowTemplate = parent.clone().empty();

			// Hail Mary, probably an empty div template
			if (this.rowTemplate.length === 0) {
				this.rowTemplate = jQuery(this.tbody).children().not('.groupDataMsg').first();
			}
		}

		return this.rowTemplate;
	}

	/**
	 * Used for db join select states.
	 */
	rowClicks() {
		var self = this, rowId, json;
		jQuery(this.list).on('click', '.fabrik_row', function () {
			rowId = this.id.split('_').pop();
			json = {
				errors: {},
				data  : {
					rowid: rowId
				},
				rowid : rowId,
				listid: self.id
			};
			Fabrik.fireEvent('fabrik.list.row.selected', json);
		});
	}

	watchAll(ajaxUpdate) {
		ajaxUpdate = ajaxUpdate ? ajaxUpdate : false;
		this.watchNav();
		this.storeCurrentValue();
		if (!ajaxUpdate) {
			this.watchRows();
			this.watchFilters();
		}
		this.watchOrder();
		this.watchEmpty();
		if (!ajaxUpdate) {
			this.watchGroupByMenu();
			this.watchButtons();
		}
	}

	/**
	 * Watch the group by buttons when list rendering as ajax
	 */
	watchGroupByMenu() {
		var self = this;
		if (this.options.ajax) {
			jQuery(this.form).on('click', '*[data-groupBy]', function (e) {
				self.options.groupedBy = jQuery(this).data('groupby');
				//if (e.rightClick) {
				//	return;
				//}
				e.preventDefault();
				self.updateRows();
			});
		}
	}

	// F5: Function watchButtons is part of csv, but temporary added because function is called by watchAll
	// F5: Later we move watchButtons to csv-list and make it a module, so we can call it here
	watchButtons () {
		var self = this;
		this.exportWindowOpts = {
			modalId    : 'exportcsv',
			type       : 'modal',
			id         : 'exportcsv',
			title      : 'Export CSV',
			loadMethod : 'html',
			minimizable: false,
			width      : 360,
			height     : 240,
			content    : '',
			modal: true,
			bootstrap  : true,
			visible: true,
			onContentLoaded: function () {
				var win = this;
				window.setTimeout(function () {
					win.fitToContent();
				}, 1000);

			}
		};
		this.exportWindowOpts.width = parseInt(this.options.csvOpts.popupwidth,10)>0 ? this.options.csvOpts.popupwidth : 360;
		this.exportWindowOpts.optswidth = parseInt(this.options.csvOpts.optswidth,10)>0 ? this.options.csvOpts.optswidth : 240;
		if (this.options.view === 'csv') {

			// For csv links e.g. index.php?option=com_fabrik&view=csv&listid=10
			this.openCSVWindow();
		} else {
			jQuery(this.form).find('.csvExportButton').each(function (x, b) {
				b = jQuery(b);
				if (b.classList.contains('custom') === false) {
					b.on('click', function (e) {
						e.preventDefault();
						self.openCSVWindow();
					});
				}
			});
		}
	}

/* csv part 1 */ 

	makeSafeForCSS(name) {
		return name.replace(/[^a-z0-9]/g, function(s) {
			var c = s.charCodeAt(0);
			if (c == 32) return '-';
			if (c >= 65 && c <= 90) return s.toLowerCase();
			return ('000' + c.toString(16)).slice(-4);
		});
	}

/* csv part 2 */ 

	addPlugins(a) {
		var self = this;
		a.forEach(function (p) {
			p.list = self;
		});
		this.plugins = a;
	}

	firePlugin(method) {
		var args = Array.prototype.slice.call(arguments), self = this;
		args = args.slice(1, args.length);
		this.plugins.forEach(function (plugin) {
			Fabrik.fireEvent(method, [self, args]);
		});
		return this.result === false ? false : true;
	}

	/**
	 * Watch the empty data button
	 */
	watchEmpty() {
		var self = this,
		b = jQuery(this.form).find('.doempty');
		b.on('click', function (e) {
			e.preventDefault();
			if (window.confirm(Joomla.Text._('COM_FABRIK_CONFIRM_DROP'))) {
				self.submit('list.doempty');
			}
		});
	}

	/**
	 * Watch order buttons
	 */
	watchOrder() {
		var elementId = false, i, icon, otherIcon, src,
			form = jQuery(this.form), self = this,
			hs = form.find('.fabrikorder, .fabrikorder-asc, .fabrikorder-desc');
		hs.off('click');
		hs.on('click', function (e) {
			var img = 'ordernone.png',
				orderDir = '',
				newOrderClass = '',
				bsClassAdd = '',
				bsClassRemove = '',
				h = jQuery(this),
				td = h.closest('.fabrik_ordercell');

			if (h.prop('tagName') !== 'A') {
				h = td.find('a');
			}

			/**
			 * Figure out what we need to change the icon from / to.  We don't know in advance for
			 * bootstrapped templates what icons will be used, so the fabrik-order-header layout
			 * will have set data-sort-foo properties of each of the three states.  Another wrinkle
			 * is that we can't just set the new icon class blindly, because there
			 * may be other classes
			 * on the icon.  For instancee BS3 using Font Awesome will have "fa fa-sort-foo".
			 * So we have
			 * to specifically remove the current class and add the new one.
			 */

			switch (h.attr('class')) {
				case 'fabrikorder-asc':
					newOrderClass = 'fabrikorder-desc';
					bsClassAdd = h.data('data-sort-desc-icon');
					bsClassRemove = h.data('data-sort-asc-icon');
					orderDir = 'desc';
					img = 'orderdesc.png';
					break;
				case 'fabrikorder-desc':
					newOrderClass = 'fabrikorder';
					bsClassAdd = h.data('data-sort-icon');
					bsClassRemove = h.data('data-sort-desc-icon');
					orderDir = '-';
					img = 'ordernone.png';
					break;
				case 'fabrikorder':
					newOrderClass = 'fabrikorder-asc';
					bsClassAdd = h.data('data-sort-asc-icon');
					bsClassRemove = h.data('data-sort-icon');
					orderDir = 'asc';
					img = 'orderasc.png';
					break;
			}
			td.attr('class').split(' ').forEach(function (c) {
				if (c.includes('_order')) {
					elementId = c.replace('_order', '').replace(/^\s+/g, '').replace(/\s+$/g, '');
				}
			});
			if (!elementId) {
				fconsole('woops didnt find the element id, cant order');
				return;
			}
			h.attr('class', newOrderClass);
//			if (Fabrik.bootstrapped) {
				icon = h.find('*[data-isicon]');
//			} else  {
//				i = h.find('img');
//				icon = h.firstElementChild;
//			}

			// Swap images - if list doing ajax nav then we need to do this
			if (self.options.singleOrdering) {
				form.find('.fabrikorder, .fabrikorder-asc, .fabrikorder-desc')
					.each(function (otherH) {
//						if (Fabrik.bootstrapped) {
							otherIcon = otherH.firstElementChild;
							switch (otherH.className) {
								case 'fabrikorder-asc':
									otherIcon.removeClass(otherH.data('sort-asc-icon'));
									otherIcon.addClass(otherH.data('sort-icon'));
									break;
								case 'fabrikorder-desc':
									otherIcon.removeClass(otherH.data('sort-desc-icon'));
									otherIcon.addClass(otherH.data('sort-icon'));
									break;
								case 'fabrikorder':
									break;
							}
//						} else {
//							i = otherH.find('img');
//							if (i.length > 0) {
//								src = i.attr('src');
//								src = src.replace('ordernone.png', '')
//									.replace('orderasc.png', '').replace('orderdesc.png', '');
//								src += 'ordernone.png';
//								i.attr('src', src);
//							}
//						}
					});
			}

//			if (Fabrik.bootstrapped) {
				icon.removeClass(bsClassRemove);
				icon.addClass(bsClassAdd);
//			} else {
//				if (i) {
//					src = i.attr('src');
//					src = src.replace('ordernone.png', '').replace('orderasc.png', '')
//						.replace('orderdesc.png', '');
//					i.attr('src', src);
//				}
//			}

			self.fabrikNavOrder(elementId, orderDir);
			e.preventDefault();
		});

	}

	/**
	 * Get dom nodes with class fabrik_filter
	 * @returns {jQuery}
	 */
	getFilters() {
		return jQuery(this.form).find('.fabrik_filter');
	}

	/**
	 * Store filter current values when the list is set to update on filter change
	 * rather than filter form submission
	 */
	storeCurrentValue() {
		if (this.options.filterMethod !== 'submitform') {
			this.getFilters().forEach(function (x, f) {
				f = jQuery(f);
				f.data('initialvalue', f.val());
			});
		}
	}

	/**
	 * Watch filters, for changes which may trigger the list to be re-rendered
	 */
	watchFilters() {
		var e = '',
			self = this,
			submit = jQuery(this.form).find('.fabrik_filter_submit');

		this.getFilters().each(function (x, f) {
			//f = jQuery(f);
			e = f.getAttribute('tagName') === 'SELECT' || f.getAttribute('type') === 'checkbox' ? 'change' : 'blur';
			if (self.options.filterMethod !== 'submitform') {
				f.off(e);
				f.on(e, function (e) {
					e.preventDefault();
					if (f.getAttribute('type') === 'checkbox' || f.data('initialvalue') !== f.val()) {
						self.doFilter();
					}
				});
			}
		});

		// Watch submit if present regardless of this.options.filterMethod
		submit.off();
		submit.on('click', function (e) {
			e.preventDefault();
			self.doFilter();
		});
		this.getFilters().on('keydown', function (e) {
			if (e.keyCode === 13) {
				e.preventDefault();
				self.doFilter();
			}
		});
	}

	/**
	 * Perform list filter
	 */
	doFilter() {
		var res = Fabrik.fireEvent('list.filter', [this]).eventResults;
		if (res === null) {
			this.submit('list.filter');
		}
		if (res.length === 0 || !res.includes(false)) {
			this.submit('list.filter');
		}
	}

	/**
	 * Highlight active row, deselect others
	 * @param {jQuery} activeTr
	 */
	setActive(activeTr) {
		this.list.getElements('.fabrik_row').forEach(function (tr) {
			tr.removeClass('activeRow');
		});
		activeTr.addClass('activeRow');
	}

	/**
	 * Get the active list row for a given mouse event.
	 * If none found return the current active row
	 *
	 * @param {event} e
	 * @returns {jQuery}
	 */
	getActiveRow(e) {
		var row = jQuery(e.target).closest('.fabrik_row');
		if (row.length === 0) {
			row = Fabrik.activeRow;
		}
		return row;
	}

	watchRows() {
		if (!this.list) {
			return;
		}
		this.rowClicks();
	}

	getForm() {
		if (!this.form) {
			this.form = document.querySelector('#' + this.options.form);
		}
		return this.form;
	}

	/**
	 * Un-check all the row's checkboxes
	 */
	uncheckAll() {
		jQuery(this.form).find('input[name^=ids]').each(function (i, c) {
			c.checked = '';
		});
	}

	/**
	 * Check if there are some selected records to delete and asks the user if they really want to delete
	 * those records
	 * Returns false to stop the list's form from being submitted
	 *
	 * @returns {boolean}
	 */
	submitDeleteCheck() {
		var ok = false,
			delCount = 0;
		jQuery(this.form).find('input[name^=ids]').each(function (x, c) {
			if (c.checked) {
				delCount++;
				ok = true;
			}
		});
		if (!ok) {
			window.alert(Joomla.Text._('COM_FABRIK_SELECT_ROWS_FOR_DELETION'));
			//Fabrik.loader.stop('listform_' + this.options.listRef);
			return false;
		}
		var delMsg = delCount === 1 ? Joomla.Text._('COM_FABRIK_CONFIRM_DELETE_1')
			: Joomla.Text._('COM_FABRIK_CONFIRM_DELETE').replace('%s', delCount);
		if (!window.confirm(delMsg)) {
			//Fabrik.loader.stop('listform_' + this.options.listRef);
			this.uncheckAll();
			return false;
		}

		return true;
	}

	submit(task) {
		this.getForm();
		var doAJAX = this.options.ajax,
			self = this,
			form = jQuery(this.form);
		if (task === 'list.doPlugin.noAJAX') {
			task = 'list.doPlugin';
			doAJAX = false;
		}
		if (task === 'list.delete' && !this.submitDeleteCheck()) {
			return false;
		}
		// We may want to set this as an option - if long page loads feedback that list
		// is doing something might be useful
		// //Fabrik.loader.start('listform_' + this.options.listRef);
		if (task === 'list.filter') {
			Fabrik['filter_listform_' + this.options.listRef].onSubmit();
			this.form.task.value = task;
			if (this.form['limitstart' + this.id]) {
				form.find('#limitstart' + this.id).val(0);
			}
		}
		else if (task === 'list.view') {
			Fabrik['filter_listform_' + this.options.listRef].onSubmit();
		}
		else {
			if (task !== '') {
				this.form.task.value = task;
			}
		}
		if (doAJAX) {
			//Fabrik.loader.start('listform_' + this.options.listRef);
			// For module & mambot
			// $$$ rob with modules only set view/option if ajax on
			form.find('input[name=option]').val('com_fabrik');
			form.find('input[name=view]').val('list');
			form.find('input[name=format]').val('raw');

			var data = this.form.toQueryString();

			//if (task === 'list.doPlugin') {
				data += '&setListRefFromRequest=1';
				data += '&listref=' + this.options.listRef;
				data += '&Itemid=' + this.options.Itemid;
			//}

			if (task === 'list.filter' && this.advancedSearch !== false) { // ?? advancedSearch is not defined
				var advSearchForm = document.querySelector('form.advancedSearch_' + this.options.listRef);
				if (advSearchForm !== 'null') {
					data += '&' + advSearchForm.toQueryString();
					data += '&replacefilters=1';
				}
			}
			// Pass the elements that are shown in the list - to ensure they are formatted
			for (var i = 0; i < this.options.fabrik_show_in_list.length; i++) {
				data += '&fabrik_show_in_list[]=' + this.options.fabrik_show_in_list[i];
			}

			// Add in tmpl for custom nav in admin
			data += '&tmpl=' + this.options.tmpl;
			if (!this.request) {
				this.request = new Request({
					'url'     : this.form.get('action'),
					'data'    : data,
					onComplete: function (json) {
						json = JSON.parse(json);
						self._updateRows(json);
						//Fabrik.loader.stop('listform_' + self.options.listRef);
						Fabrik['filter_listform_' + self.options.listRef].onUpdateData();
						Fabrik['filter_listform_' + self.options.listRef].updateFilterCSS(json);
						jQuery('#searchall_' + self.options.listRef).val(json.searchallvalue);
						Fabrik.fireEvent('fabrik.list.submit.ajax.complete', [self, json]);
						if (json.msg && json.showmsg) {
							window.alert(json.msg);
						}
					}
				});
			} else {
				this.request.options.data = data;
			}
			this.request.send();

			if (window.history && window.history.pushState) {
				history.pushState(data, 'fabrik.list.submit');
			}
			Fabrik.fireEvent('fabrik.list.submit', [task, this.form.toQueryString().toObject()]);
		} else {
			this.form.submit();
		}
		//Fabrik['filter_listform_' + this.options.listRef].onUpdateData();
		return false;
	}

	/**
	 *
	 * @param limitStart
	 * @returns {boolean}
	 */
	fabrikNav(limitStart) {
		this.options.limitStart = limitStart;
		this.form.querySelector('#limitstart' + this.id).value = limitStart;
		// cant do filter as that resets limitstart to 0
		Fabrik.fireEvent('fabrik.list.navigate', [this, limitStart]);
		if (!this.result) {
			this.result = true;
			return false;
		}
		this.submit('list.view');
		return false;
	}

	/**
	 * Get the primary keys for the visible rows
	 *
	 * @since   3.0.7
	 *
	 * @return  array
	 */
	getRowIds() {
		var keys = [];
//		var d = this.options.isGrouped ? $H(this.options.data) : this.options.data;
		var d = this.options.isGrouped
		if(d) {
			var arr = Object.keys(this.options.data).map((key) => [key, this.options.data[key]]); // change object to array
			d = new Map(arr); // create map from array
		} else {
			d = this.options.data;
		}
		d.forEach(function (group) {
			group.forEach(function (row) {
				keys.push(row.data.__pk_val);
			});
		});
		return keys;
	}

	/**
	 * Get the primary keys for all checked rows
	 *
	 * @since   3.7
	 *
	 * @return  array
	 */
	getCheckedRowIds() {
		var chxs = this.getForm().getElements('input[name^=ids]').filter(function (i) {
			return i.checked;
		});

		var ids = chxs.map(function (chx) {
			return chx.get('value');
		});

		return ids;
	}

	/**
	 * Get a single row's data
	 *
	 * @param   string  id  ID
	 *
	 * @since  3.0.8
	 *
	 * @return object
	 */
	getRow(id) {
		var found = {};
		Object.forEach(this.options.data, function (group) {
			for (var i = 0; i < group.length; i++) {
				var row = group[i];
				if (row && row.data.__pk_val == id) {
					found = row.data;
				}
			}
		});
		return found;
	}

	fabrikNavOrder(orderby, orderdir) {
		this.form.orderby.value = orderby;
		this.form.orderdir.value = orderdir;
		Fabrik.fireEvent('fabrik.list.order', [this, orderby, orderdir]);
		if (!this.result) {
			this.result = true;
			return false;
		}
		this.submit('list.order');
	}

	removeRows(rowids) {
		var i, self = this,
			end = function () {
				row.dispose();
				self.checkEmpty();
			};
		for (i = 0; i < rowids.length; i++) {
			var row = document.getElementById('list_' + self.id + '_row_' + rowids[i]);
//			var highlight = new Fx.Morph(row, {
//				duration: 1000
//			});
			highlight.start({
				'backgroundColor': this.options.hightLight
			}).chain(function () {
				this.start({
					'opacity': 0
				});
			}).chain(end);
		}
	}

	editRow() {
	}

	clearRows() {
		this.list.getElements('.fabrik_row').forEach(function (tr) {
			tr.dispose();
		});
	}

	updateRows(extraData) {
		var self = this,
			url = '',
			data = {
				'option'  : 'com_fabrik',
				'view'    : 'list',
				'task'    : 'list.view',
				'format'  : 'raw',
				'listid'  : this.id,
				'listref' : this.options.listRef
			};
		data['limit' + this.id] = this.options.limitLength;

		if (extraData) {
			Object.append(data, extraData);
		}

		if (this.options.groupedBy !== '')
		{
			data['group_by'] = this.options.groupedBy;
		}

		new Request({
			'url'        : url,
			'data'       : data,
			'evalScripts': false,
			onSuccess    : function (json) {
				json = json.stripScripts();
				json = JSON.parse(json);
				self._updateRows(json);
				// Fabrik.fireEvent('fabrik.list.update', [this, json]);
			},
			onError      : function (text, error) {
				fconsole(text, error);
			},
			onFailure    : function (xhr) {
				fconsole(xhr);
			}
		}).send();
	}

	/**
	 * Update headings after ajax data load
	 * @param {object} data
	 * @private
	 */
	_updateHeadings(data) {
		var headers = jQuery('#' + this.options.form).find('.fabrik___heading');

		jQuery.each(data.headings, function (key, data) {
			key = '.' + key;
			try {
				// $$$ rob 28/10/2011 just alter span to allow for maintaining filter toggle links
				headers.find(key + ' span').html(data);
			} catch (err) {
				fconsole(err);
			}
		});
	}

	/**
	 * Grouped data - show all tbodys, then hide empty tbodys (not going to work for none <table> tpls)
	 * @private
	 */
	_updateGroupByTables() {
		var tbodys = jQuery(this.list).find('tbody'), groupTbody;
		tbodys.css('display', '');
		tbodys.forEach(function (tkey, tbody) {
			if (!tbody.classList.contains('fabrik_groupdata')) {
				groupTbody = jQuery(tbody).next();
				if (jQuery(groupTbody).find('.fabrik_row').length === 0) {
					jQuery(tbody).hide();
					jQuery(groupTbody).hide();
				}
			}
		});
	}

	/**
	 * Update list items
	 * @param {object} data
	 * @private
	 */
	_updateRows(data) {
		var tbody,
			itemTemplate,
			i,
			groupHeading,
			columnCount,
			parent,
			items = [],
			item,
			rowTemplate,
			cell,
			cells,
			form = jQuery(this.form),
			self = this,
			tmpl = 'tr',
			fullRow;

	//	if (typeof(data) !== 'object') {  
		if (typeof(data) == 'string' || typeof(data) == 'boolean' || typeof(data) == 'undefined' || typeof(data) == 'function' || typeof(data) == 'number') { // only in case history.state is not an object
			return;
		}
		if (window.history && window.history.pushState) {
			history.pushState(data, 'fabrik.list.rows');
		}
		if (!(data.id == this.id && data.model === 'list')) {
			return;
		}

		this._updateHeadings(data);

		cell = jQuery(this.list).find('.fabrik_row').first();

		if (cell.length === 0) {
			cell = jQuery(this.options.itemTemplate);
		}
		if (cell.getAttribute('tagName') === 'TR') {
			parent = cell;
			columnCount = 1;
			tmpl = 'tr';
		} else {
			parent = cell.parent();
			columnCount = form.find('.fabrikDataContainer').data('cols');
			tmpl = 'div';
		}

		columnCount = columnCount === undefined ? 1 : columnCount;
		rowTemplate = this.setRowTemplate(parent);
		itemTemplate = cell.clone();

		this.clearRows();
//		this.options.data = this.options.isGrouped ? $H(data.data) : data.data;
		if(this.options.isGrouped) {
			var arr = Object.keys(data.data).map((key) => [key, data.data[key]]); // change object to array
			this.options.data = new Map(arr); // create map from array
		} else {
			this.options.data = data.data;
		}



		if (data.calculations) {
			this.updateCals(data.calculations);
		}
		form.find('.fabrikNav').html(data.htmlnav);
		// $$$ rob was $H(data.data) but that wasnt working ????
		// testing with $H back in again for grouped by data? Yeah works for
		// grouped data!!
		//var gdata = this.options.isGrouped || this.options.groupedBy !== '' ? $H(data.data) : data.data;
		var gdata;
		if(this.options.isGrouped || this.options.groupedBy !== '') {
			var arr = Object.keys(data.data).map((key) => [key, data.data[key]]); // change object to array
			gdata = new Map(arr); // create map from array
		} else {
			gdata = data.data;
		}

		var gcounter = 0;
		gdata.forEach(function (groupData, groupKey) {
			tbody = self.options.isGrouped ? self.list.getElements('.fabrik_groupdata')[gcounter] : self.tbody;
			tbody = jQuery(tbody);
			//tbody.empty();
			tbody.children().not('.groupDataMsg').remove();

			// Set the group by heading
			if (self.options.isGrouped) {
				groupHeading = tbody.prev();
				groupHeading.find('.groupTitle').html(groupData[0].groupHeading);
			}
			items = [];
			gcounter++;
			for (i = 0; i < groupData.length; i++) {
				//var row = $H(groupData[i]);
				var arr = Object.keys(groupData[i]).map((key) => [key, groupData[i][key]]); // change object to array
				var row = new Map(arr); // create map from array
				item = self.injectItemData(itemTemplate, row, tmpl);
				items.push(item);
			}

			items = Fabrik.Array.chunk(items, columnCount);
			for (i = 0; i < items.length; i++) {
				if (tmpl === 'div') {
					cells = items[i];
					fullRow = rowTemplate.clone().append(cells);
				}
				else {
					fullRow = items[i];
				}
				tbody.append(fullRow);
			}
		});

		this._updateGroupByTables();
		this._updateEmptyDataMsg(items.length === 0);
		this.watchAll(true);
		Fabrik.fireEvent('fabrik.list.updaterows');
		Fabrik.fireEvent('fabrik.list.update', [this, data]);
		this.stripe();
		this.mediaScan();
		//Fabrik.loader.stop('listform_' + this.options.listRef);
	}

	_updateEmptyDataMsg(empty) {
		var list = jQuery(this.list);
		var fabrikDataContainer = list.parent('.fabrikDataContainer');
		var emptyDataMessage = list.closest('.fabrikForm').find('.emptyDataMessage');
		if (empty) {
			/*
			 * if (fabrikDataContainer !== 'null') {
			 * fabrikDataContainer.setStyle('display', 'none'); }
			 */
			emptyDataMessage.css('display', '');
			/*
			 * $$$ hugh - when doing JSON updates, the emptyDataMessage can be in a td (with no class or id)
			 * which itself is hidden, and also have a child div with the .emptyDataMessage
			 * class which is also hidden.
			 */
			if (emptyDataMessage.parent().css('display') === 'none') {
				emptyDataMessage.parent().css('display', '');
			}
			emptyDataMessage.parent('.emptyDataMessage').css('display', '');
		} else {
			fabrikDataContainer.css('display', '');
			emptyDataMessage.css('display', 'none');
		}
	}

	/**
	 * Inject item data into the item data template
	 * @param {jQuery} template
	 * @param {object} row
	 * @param {string}  div or row template
	 * @return {jQuery}
	 */
	injectItemData(template, row, tmpl) {
		var r, cell, c, j;
		jQuery.each(row.data, function (key, val) {
			cell = template.find('.' + key);
			if (cell.getAttribute('tagName') !== 'A') {
				cell.html(val);
			} else {
				var href;
				try {
					// handle our view/edit links with data-rowid
					href = jQuery(val).getAttribute('href');
					var rowid = jQuery(val).data('rowid');
					// need to only do this for our links, not custom detail links
					jQuery.each(cell, function (thisKey, thisCell) {
						if (jQuery(thisCell).data('iscustom') === 0) {
							jQuery(thisCell).getAttribute('href', href);
							jQuery(thisCell).data('rowid', rowid);
						}
					});
				}
				catch (err) {
					// val wasn't an A tag, so just treat it as an href
					cell.getAttribute('href', val);
				}
			}
		});
		if (typeof(this.options.itemTemplate) === 'string') {
			c = template.find('.fabrik_row').addBack(template);
			c.getAttribute('id', row.id);
			if (tmpl !== 'div') {
				c.removeClass();
				var newClass = row['class'].split(/\s+/);
				for (j = 0; j < newClass.length; j++) {
					c.addClass(newClass[j]);
				}
			}
			else {
				c.removeClass('oddRow0');
				c.removeClass('oddRow1');
				var newClass = row['class'].split(/\s+/);
				for (j = 0; j < newClass.length; j++) {
					if (!c.classList.contains(newClass[j])) {
						c.addClass(newClass[j]);
					}
				}
			}
			r = template.clone();
		} else {
			r = template.find('.fabrik_row').addBack(template);
		}
		return r;
	}

	/**
	 * Once a row is added - we need to rescan lightboxes etc to re-attach
	 */
	mediaScan() {
		if (typeof(Slimbox) !== 'undefined') {
			Slimbox.scanPage();
		}
		if (typeof(Lightbox) !== 'undefined') {
			Lightbox.init();
		}
		if (typeof(Mediabox) !== 'undefined') {
			Mediabox.scanPage();
		}
	}

	addRow(obj) {
		var r = new Element('tr', {
			'class': 'oddRow1'
		});
		for (var i in obj) {
			if (this.options.headings.indexOf(i) !== -1) {
				var td = new Element('td', {}).appendText(obj[i]);
				r.appendChild(td);
			}
		}
		r.inject(this.tbody);
	}

	addRows(aData) {
		var i, j;
		for (i = 0; i < aData.length; i++) {
			for (j = 0; j < aData[i].length; j++) {
				this.addRow(aData[i][j]);
			}
		}
		this.stripe();
	}

	stripe() {
		var i;
		var trs = this.list.getElements('.fabrik_row');
		for (i = 0; i < trs.length; i++) {
			if (!trs[i].classList.contains('fabrik___header')) { // ignore heading
				var row = 'oddRow' + (i % 2);
				trs[i].addClass(row);
			}
		}
	}

	/**
	 * Check if the list contains no data and if so add a row with 'no records' text
	 */
	checkEmpty() {
		var trs = this.list.getElements('tr');
		if (trs.length === 2) {
			this.addRow({
				'label': Joomla.Text._('COM_FABRIK_NO_RECORDS')
			});
		}
	}

	/**
	 * Watch the check all checkbox
	 */
	watchCheckAll() {
		var form = jQuery(this.form),
			checkAll = form.find('input[name=checkAll]'), c, i,
			self = this, list = jQuery(this.list), p, chkBoxes;
		// IE wont fire an event on change until the checkbox is blurred!
		checkAll.on('click', function (e) {
			p = list.closest('.fabrikList').length > 0 ? list.closest('.fabrikList') : list;
			chkBoxes = p.find('input[name^=ids]');
			c = !e.target.checked ? '' : 'checked';
			for (i = 0; i < chkBoxes.length; i++) {
				chkBoxes[i].checked = c;
				self.toggleJoinKeysChx(chkBoxes[i]);
			}
		});
		form.find('input[name^=ids]').each(function (x, i) {
			jQuery(i).on('change', function () {
				self.toggleJoinKeysChx(i);
			});
		});
	}

	toggleJoinKeysChx(i) {
		i.parentElement.querySelectorAll('input[class=fabrik_joinedkey]').forEach(function (c) {
			c.checked = i.checked;
		});
	}

	watchNav(e) {
		var form = jQuery(this.form),
			limitBox = form.find('select[name*=limit]'),
			addRecord = form.find('.addRecord'),
			self = this, loadMethod, href;

		limitBox.on('change', function () {
			Fabrik.fireEvent('fabrik.list.limit', [self]);
			if (self.result === false) {
				self.result = true;
				return false;
			}
			self.doFilter();
		});
		if (this.options.ajax_links) {
			if (addRecord.length > 0) {
				addRecord.off();
				href = addRecord.getAttribute('href');
				loadMethod = (this.options.links.add === '' ||
				href.includes(Fabrik.liveSite)) ? 'xhr' : 'iframe';
				var url = href;
				url += url.includes('?') ? '&' : '?';
				url += 'tmpl=component&ajax=1';
				url += '&format=partial';
				addRecord.on('click', function (e) {
					e.preventDefault();

					var winOpts = {
						'id'        : 'add.' + self.id,
						'title'     : self.options.popup_add_label,
						'loadMethod': loadMethod,
						'contentURL': url,
						'width'     : self.options.popup_width,
						'height'    : self.options.popup_height
					};
					if (self.options.popup_offset_x !== null) {
						winOpts.offset_x = self.options.popup_offset_x;
					}
					if (self.options.popup_offset_y !== null) {
						winOpts.offset_y = self.options.popup_offset_y;
					}
					Fabrik.getWindow(winOpts);
				});
			}
		}
		jQuery('#fabrik__swaptable').on('change', function () {
			window.location = 'index.php?option=com_fabrik&task=list.view&cid=' + this.value;
		});
		// All nav links should submit the form, if we dont then filters are not taken into account when
		// building the list cache id
		// Can result in 2nd pages of cached data being shown, but without filters applied
		var as = form.find('.pagination .pagenav');
		if (as.length === 0) {
			as = form.find('.pagination a');
		}
		jQuery(as).on('click', function (e) {
			e.preventDefault();
			if (this.tagName === 'A') {
				var o = this.href.toObject();
				self.fabrikNav(o['limitstart' + self.id]);
			}
		});

		this.watchCheckAll();
	}

	/**
	 * currently only called from element raw view when using inline edit plugin
	 * might need to use for ajax nav as well?
	 */
	updateCals(json) {
		var types = ['sums', 'avgs', 'count', 'medians'];
		this.form.getElements('.fabrik_calculations').forEach(function (c) {
			types.forEach(function (type) {
				//$H(json[type]).forEach(function (val, key) {
				var arr = Object.keys(json[type]).map((key) => [key, json[type][key]]); // change object to array
				var c = new Map(arr); // create map from array
				c.forEach(function (val, key) {
					var target = c.querySelector('.' + key);
					if (target !== 'null') {
						target.set('html', val);
					}
				});
			});
		});
	}
}
