/**
 * Form
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// ALL fconsole Replaced by console.log
// ALL $H() Replaced by Map()
// ALL Fx removed
// Replaced typeOf by typeof => 
// TODO: typeof is different (almost everything is an object): change code
// ALL if (typeof(value) === 'null') => changed to (value === 'null')
// TEST 800: if (typeof(e) === 'event' || typeof(e) === 'object' || typeof(e) === 'domevent') ???
// TEST 927: if (typeof(d) === 'hash') ???
// TEST 1200: if (typeof(fd.get(k)) !== 'object') See line 667 (addElements)
// TODO: Replace ajax request by ES6+ fetch: change code
// removed (comment out) all Fabrik.loader

import {Fabrik} from "@window"; // need to import from new-window.js to also have function Fabrik.getWindow
import {Debounce} from "@debounce"; 
import {FbFormSubmit} from "@form-submit"; 

export class FbForm {

	defaults = {
		'rowid'         : '',
		'admin'         : false,
		'ajax'          : false,
		'primaryKey'    : null,
		'error'         : '',
		'submitOnEnter' : false,
		'updatedMsg'    : 'Form saved',
		'pages'         : [],
		'start_page'    : 0,
		'multipage_save': 0,
		'ajaxValidation': false,
		'showLoader'    : false,
		'customJsAction': '',
		'plugins'       : {},
		'ajaxmethod'    : 'post',
		'inlineMessage' : true,
		'print'         : false,
		'toggleSubmit'  : false,
		'toggleSubmitTip': 'must validate',
		'mustValidate'  : false,
		'lang'          : false,
		'debounceDelay' : 500,
		'images'        : {
			'alert'       : '',
			'action_check': '',
			'ajax_loader' : ''
		}
	};

	constructor (id, options) {
		// $$$ hugh - seems options.rowid can be null in certain corner cases, so defend against that
		this.id = id;
		this.options = options;
		this.options = {
			...this.defaults,
			...this.options
		}
		if (this.options.rowid === 'null') {
			this.options.rowid = '';
		}
		//set this to false in window.fireEvents to stop current action (e.g. stop form submission)
		this.result = true;
		var pag = Object.keys(this.options.pages).map((key) => [key, this.options.pages[key]]); // change object to array
		this.options.pages = new Map(pag); // create map from array
		this.subGroups = new Map();
		this.currentPage = this.options.start_page;
		this.formElements = new Map();
		this.hasErrors = new Map();
		this.mustValidateEls = new Map();
		this.toggleSubmitTipAdded = false;
		this.elements = this.formElements;
		this.duplicatedGroups = new Map();
		this.addingOrDeletingGroup = false;
		this.addedGroups = [];
		this.watchRepeatNumsDone = false;
		this.setUpAll();

		if (this.options.editable) {
			var self = this;
			setTimeout(function(){
				self.duplicateGroupsToMin();
			}, 1000);
		}

		// Delegated element events
		this.events = {};

		this.submitBroker = new FbFormSubmit();
		this.scrollTips();
		Fabrik.fireEvent('fabrik.form.loaded', [this]);
	}

 	setUpAll () {
		this.setUp();

		// add a wrapper if we're going to be using the tooltip, as can't do tooltip on disabled elements
		if (this.options.ajaxValidation && this.options.toggleSubmit && this.options.toggleSubmitTip !== '') {
			var submit = this._getButton('Submit');
			if (submit !== 'null') {
				jQuery(submit).wrap('<div data-bs-toggle="tooltip" title="' + Joomla.Text._('COM_FABRIK_MUST_VALIDATE') +
					'" class="fabrikSubmitWrapper" style="display: inline-block"></div>div>');
			}
		}

		if (this.form) {
			if (this.options.ajax || this.options.submitOnEnter === false) {
				this.stopEnterSubmitting();
			}
			this.watchAddOptions();
		}

		var hgr = Object.keys(this.options.hiddenGroup).map((key) => [key, this.options.hiddenGroup[key]]); // change object to array
		var ohgr = new Map(hgr); // create map from array

		if (this.options.editable) {
			ohgr.forEach(function (v, k) {
				if (v === true && document.getElementById('group' + k) !== 'null') {
					var subGroup = document.getElementById('group' + k).querySelector('.fabrikSubGroup');
					this.subGroups.set(k, subGroup.cloneWithIds());
					this.hideLastGroup(k, subGroup);
				}
			});

			this.setupSortable();
		}

		// get an int from which to start incrementing for each repeated group id
		// don't ever decrease this value when deleting a group as it will cause all sorts of
		// reference chaos with cascading dropdowns etc.
		this.repeatGroupMarkers = new Map();
		if (this.form) {
			this.form.getElements('.fabrikGroup').forEach(function (group) { // TODO: replace getElements by querySelectorAll
				var id = group.id.replace('group', '');
				var c = group.getElements('.fabrikSubGroup').length;
				//if no joined repeating data then c should be 0 and not 1
				if (c === 1) {
					if (group.querySelector('.fabrikSubGroupElements').getStyle('display') === 'none') {
						c = 0;
					}
				}
				this.repeatGroupMarkers.set(id, c);
			});
			this.watchGoBackButton();
		}


		this.watchPrintButton();
		this.watchPdfButton();
		this.watchTabs();
		this.watchRepeatNums();
	}

	watchRepeatNums () {
		var self = this;
		Fabrik.addEvent('fabrik.form.elements.added', function (form) {
			if (form.id === this.id && !this.watchRepeatNumsDone) {
				Object.forEach(self.options.numRepeatEls, function (name, key) {
					if (name !== '') {
						var el = self.formElements.get(name);
						if (el) {
							el.addNewEventAux(el.getChangeEvent(), function(event) {
								var v = el.getValue();
								self.options.minRepeat[key] = v.toInt();
								self.options.maxRepeat[key] = v.toInt();
								self.duplicateGroupsToMin();
							});
						}
					}
				});
				this.watchRepeatNumsDone = true;
			}
		});
	}

	/**
	 * Print button action - either open up the print preview window - or print if already opened
	 */
	watchPrintButton () {
		var self = this;
		if (this.form) {
			this.form.getElements('a[data-fabrik-print]').addEventListener('click', function (e) { // TODO: replace getElements by querySelectorAll
				e.stop();
				if (self.options.print) {
					window.print();
				} else {
					// Build URL as we could have changed the rowid via ajax pagination
					var url = jQuery(e.target).getAttribute('href');
					url = url.replace(/&rowid=\d+/, '&rowid=' + self.options.rowid);
					if (self.options.lang !== false) {
						if (url.test(/\?/)) {
							url += '&lang=' + self.options.lang;
						}
						else {
							url += '?lang=' + self.options.lang;
						}
					}
					window.open(
						url,
						'win2',
						'status=no,toolbar=no,scrollbars=yes,titlebar=no,menubar=no,resizable=yes,width=400,height=350,directories=no,location=no;'
					);
				}
			});
		}
	}

	/**
	 * PDF button action.
	 */
	watchPdfButton () {
		var self = this;
		if (this.form) {
			this.form.getElements('*[data-role="open-form-pdf"]').addEventListener('click', function (e) { // TODO: replace getElements by querySelectorAll
				e.stop();
				// Build URL as we could have changed the rowid via ajax pagination.
				// @FIXME for SEF
				var url = e.event.currentTarget.href.replace(/(rowid=\d*)/, 'rowid=' + self.options.rowid);
				if (self.options.lang !== false) {
					if (url.test(/\?/)) {
						url += '&lang=' + self.options.lang;
					}
					else {
						url += '?lang=' + self.options.lang;
					}                }
				window.location = url;
			});
		}
	}

	/**
	 * Go back button in ajax pop up window should close the window
	 */
	watchGoBackButton () {
		var self = this;
		if (this.options.ajax) {
			var goback = this._getButton('Goback');
			if (goback === 'null') {
				return;
			}
			goback.addEventListener('click', function (e) {
				e.stop();
				if (Fabrik.Windows[self.options.fabrik_window_id]) {
					Fabrik.Windows[self.options.fabrik_window_id].close();
				}
				else {
					// $$$ hugh - http://fabrikar.com/forums/showthread.php?p=166140#post166140
					window.history.back();
				}
			});
		}
	}

	setUp () {
		this.form = this.getForm();
		this.watchGroupButtons();
		// Submit can appear in confirmation plugin even when readonly
		this.watchSubmit();
		this.createPages();
		this.watchClearSession();
	}

	getForm () {
		if (this.form === 'null') {
			this.form = document.getElementById(this.getBlock());
		}

		return this.form;
	}

	getBlock () {
		if (this.block === 'null') {
			this.block = this.options.editable === true ? 'form_' + this.id : 'details_' + this.id;
			if (this.options.rowid !== '') {
				this.block += '_' + this.options.rowid;
			}
		}

		return this.block;
	}

	/**
	 * Get a group's tab, if it exists
	 *
	 * These tab functions are currently just helpers for user scripts
	 *
	 * @param  {string}  groupId  group ID
	 *
	 * @return tab | false
	 */
	getGroupTab (groupId) {
		if (!groupId.test(/^group/)) {
			groupId = 'group' + groupId;
		}
		if (document.getElementById(groupId).getParent().classList.contains('tab-pane')) {
			var tabid = document.getElementById(groupId).getParent().id;
			var tab_anchor = this.form.querySelector('a[href=#' + tabid + ']');
			return tab_anchor.getParent();
		}
		return false;
	}

	/**
	 * Hide a group's tab, if it exists
	 *
	 * @param  {string}  groupId
	 */
	hideGroupTab (groupId) {
		var tab = this.getGroupTab(groupId);
		if (tab !== false) {
			jQuery(tab).hide();
			if (tab.classList.contains('active')) {
				if (tab.getPrevious()) {
					jQuery(tab.getPrevious().getFirst()).tab('show');
				}
				else if (tab.getNext()) {
					jQuery(tab.getNext().getFirst()).tab('show');
				}
			}
		}
	}

	/**
	 * Hide a group's tab, if it exists
	 *
	 * @param  {string}  groupId
	 */
	selectGroupTab (groupId) {
		var tab = this.getGroupTab(groupId);
		if (tab !== false) {
			if (!tab.classList.contains('active')) {
				jQuery(tab.getFirst()).tab('show');
			}
		}
	}

	/**
	 * Hide a group's tab, if it exists
	 *
	 * @param  {string}  groupId
	 */
	showGroupTab (groupId) {
		var tab = this.getGroupTab(groupId);
		if (tab !== false) {
			jQuery(tab).show();
		}
	}

	/**
	 * Convenience for custom code that needs to fire when a tab is changed
	 */
	watchTabs () {
		var self = this;

		jQuery(this.form).on('click', '*[data-role=fabrik_tab]', function (event) {
			var groupId = event.target.id.match(/group(\d+)_tab/);
			if (groupId.length > 1) {
				groupId = groupId[1];
			}
			Fabrik.fireEvent('fabrik.form.tab.click', [self, groupId, event], 500);
		});
	}

	/**
	 * If a user has previously started a multi-page form, then we will have a .clearSession
	 * button which resets the form and submits it using the removeSession task.
	 */
	watchClearSession () {
		if (this.options.multipage_save === 0) {
			return;
		}

		var self = this,
			form = jQuery(this.form);

		form.find('.clearSession').on('click', function (e) {
			e.preventDefault();
			form.find('input[name=task]').val('removeSession');
			self.clearForm();
			self.form.submit();
		});
	}

	createPages () {
		var submit, p, firstGroup, tabDiv;
		if (this.isMultiPage()) {

			// Wrap each page in its own div
			this.options.pages.forEach(function (page, i) {
				p = jQuery(document.createElement('div'));
				p.attr({
					'class': 'page',
					'id'   : 'page_' + i
				});
				firstGroup = jQuery('#group' + page[0]);

				// Paul - Don't use pages if this is a bootstrap_tab form
				tabDiv = firstGroup.closest('div');
				if (tabDiv.classList.contains('tab-pane')) {
					return;
				}
				p.insertBefore(firstGroup);
				page.forEach(function (group) {
					p.append(jQuery('#group' + group));
				});
			});
			submit = this._getButton('Submit');
			if (submit && this.options.rowid === '') {
				submit.disabled = 'disabled';
				submit.setStyle('opacity', 0.5);
			}
			var self = this;
			jQuery(this.form).on('click', '.fabrikPagePrevious', function (e) {
				self._doPageNav(e, -1);
			});
			jQuery(this.form).on('click', '.fabrikPageNext', function (e) {
				self._doPageNav(e, 1);
			});
			this.setPageButtons();
			this.hideOtherPages();
		}
	}

	isMultiPage () {
//		return this.options.pages.getKeys().length > 1;
		return this.options.pages.keys().length > 1;
	}

	/**
	 * Move forward/backwards in multi-page form
	 *
	 * @param   {event}  e
	 * @param   {int}    dir  1/-1
	 */
	_doPageNav (e, dir) {
		var self = this, url, d;
		if (this.options.editable) {
			if (this.form.querySelector('.fabrikMainError') !== 'null') {
				this.form.querySelector('.fabrikMainError').addClass('fabrikHide');
			}

			// If tip shown at bottom of long page and next page shorter we need to move the tip to
			// the top of the page to avoid large space appearing at the bottom of the page.
			jQuery('.tool-tip').css('top', 0);

			// Don't prepend with Fabrik.liveSite, as it can create cross origin browser errors if
			// you are on www and livesite is not on www.
			url = 'index.php?option=com_fabrik&format=raw&task=form.ajax_validate&form_id=' + this.id;
			if (this.options.lang !== false) {
				url += '&lang=' + this.options.lang;
			}

			//Fabrik.loader.start(this.getBlock(), Joomla.Text._('COM_FABRIK_VALIDATING'));
			this.clearErrors();

			d = jQuery.extend({}, this.getFormData(), {
				task: 'form.ajax_validate',
				fabrik_ajax: '1',
				format : 'raw'
			});

			d = this._prepareRepeatsForAjax(d);

			jQuery.ajax({
				'url' : url,
				method: this.options.ajaxmethod,
				data  : d,

			}).done(function (r) {
				//Fabrik.loader.stop(self.getBlock());
				r = JSON.parse(r);

				// Don't show validation errors if we are going back a page
				if (dir === -1 || self._showGroupError(r, d) === false) {
					self.changePage(dir);
					self.saveGroupsToDb();
				}
				jQuery('html, body').animate({
					scrollTop: jQuery(self.form).offset().top
				}, 300);
			});
		} else {
			this.changePage(dir);
		}
		e.preventDefault();
	}

	/**
	 * On a multi-page form save the group data
	 */
	saveGroupsToDb () {
		var self = this, orig, origProcess, url, data,
			format = this.form.querySelector('input[name=format]'),
			task = this.form.querySelector('input[name=task]'),
			block = this.getBlock();
		if (this.options.multipage_save === 0) {
			return;
		}
		Fabrik.fireEvent('fabrik.form.groups.save.start', [this]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		orig = format.value;
		origProcess = task.value;
		this.form.querySelector('input[name=format]').value = 'raw';
		this.form.querySelector('input[name=task]').value = 'form.savepage';

		url = 'index.php?option=com_fabrik&format=raw&page=' + this.currentPage;
		if (this.options.lang !== false) {
			url += '&lang=' + this.options.lang;
		}
		//Fabrik.loader.start(block, 'saving page');
		data = this.getFormData();
		data.fabrik_ajax = 1;
		jQuery.ajax({
			url       : url,
			method    : this.options.ajaxmethod,
			data      : data,

		}).done(function (r) {
			Fabrik.fireEvent('fabrik.form.groups.save.completed', [self]);
			if (self.result === false) {
				self.result = true;
				return;
			}
			format.value = orig;
			task.value = origProcess;
			if (self.options.ajax) {
				Fabrik.fireEvent('fabrik.form.groups.save.end', [self, r]);
			}
			//Fabrik.loader.stop(block);
		});
	}

	changePage (dir) {
		this.changePageDir = dir;
		Fabrik.fireEvent('fabrik.form.page.change', [this, dir]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		this.currentPage = this.currentPage.toInt();
		if (this.currentPage + dir >= 0 && this.currentPage + dir < this.options.pages.getKeys().length) {
			this.currentPage = this.currentPage + dir;
			if (!this.pageGroupsVisible()) {
				this.changePage(dir);
			}
		}

		this.setPageButtons();
		jQuery('#page_' + this.currentPage).css('display', '');
		//this._setMozBoxWidths();
		this.hideOtherPages();
		Fabrik.fireEvent('fabrik.form.page.chage.end', [this, dir]);
		Fabrik.fireEvent('fabrik.form.page.change.end', [this, dir]);
		if (this.result === false) {
			this.result = true;
			return;
		}
	}

	pageGroupsVisible () {
		var visible = false;
		this.options.pages.get(this.currentPage).forEach(function (gid) {
			var group = jQuery('#group' + gid);
			if (group.length > 0) {
				if (group.css('display') !== 'none') {
					visible = true;
				}
			}
		});
		return visible;
	}

	/**
	 * Hide all groups except those in the active page
	 */
	hideOtherPages () {
		var page, currentPage = parseInt(this.currentPage, 10);
		this.options.pages.forEach(function (gids, i) {
			if (parseInt(i, 10) !== currentPage) {
				page = jQuery('#page_' + i);
				page.hide();
			}
		});
	}

	setPageButtons () {
		var submit = this._getButton('Submit');
		var prevs = this.form.getElements('.fabrikPagePrevious');
		var nexts = this.form.getElements('.fabrikPageNext');
		nexts.forEach(function (next) {
			if (this.currentPage === this.options.pages.getKeys().length - 1) {
				if (submit !== 'null') {
					submit.disabled = '';
					submit.setStyle('opacity', 1);
				}
				next.disabled = 'disabled';
				next.setStyle('opacity', 0.5);
			} else {
				if (submit !== 'null' && (this.options.rowid === '' ||
					this.options.rowid.toString() === '0')) {
					submit.disabled = 'disabled';
					submit.setStyle('opacity', 0.5);
				}
				next.disabled = '';
				next.setStyle('opacity', 1);
			}
		});
		prevs.forEach(function (prev) {
			if (this.currentPage === 0) {
				prev.disabled = 'disabled';
				prev.setStyle('opacity', 0.5);
			} else {
				prev.disabled = '';
				prev.setStyle('opacity', 1);
			}
		});
	}

	destroyElements () {
		this.formElements.forEach(function (el) {
			el.destroy();
		});
	}

	/**
	 * Add elements into the form. For the form pop-up modal (they call it "ajax")
	 *
	 * @param  Hash  a  Elements to add. Do we really need all: (class)name,id,{all settings} ??
	 */
	addElements (a) {
		/*
		 * Store the newly added elements so we can call attachedToForm only on new elements.
		 * Avoids issue with cdd in repeat groups resetting themselves when you add a new group
		 */
		var self = this;
		var added = [], i = 0;
		//a = $H(a); // $H() required an object, Map() requires an array
		var arr = Object.keys(a).map((key) => [key, a[key]]); // change object to array
		var c = new Map(arr); // create map from array
		c.forEach(function (elements, gid) {
			elements.forEach(function (el) {
				// Why all these check done here ?? can/should be done in php first
				//if (typeof(el) === 'array') {
				if (el instanceof Array) {
					//if (typeof(document.getElementById(el[1])) === 'null') {
					if (document.getElementById(el[1]) === 'null') {
						/* Some elements may not exist if this is a new record, specifically the lockrow element */
						if (document.getElements('input[name=rowid]')[0].value != "" && el[0] != 'FbLockrow') {
							console.log('Fabrik form::addElements: Cannot add element "' + el[1] +
								'" because it does not exist in HTML.');
						}
						return;
					}
//					try {
						var oEl = new window[el[0]](el[1], el[2]); // must add super(element,options); to constructor
//					}
//					catch (err) { // can we do this wrong ??
//						console.log('Fabrik form::addElements: Cannot add element "' + el[1] +
//							'" of type "' + el[0] + '" because: ' + err.message);
//						return;
//					}
					added.push(self.addElement(oEl, el[1], gid)); // The push() method adds new items to the end of an array. Can not use this here
				}
				//else if (typeof(el) === 'object') { // How do we ever get an object here ??
				else if (el !== 'null' && !Array.isArray(el) && (typeof(el) !== 'function') && (typeof el === 'object')) {
console.log("could not test addElements if object" + el);
					//if (typeof(document.getElementById(el.options.element)) === 'null') {
					if (document.getElementById(el.options.element) === 'null') {
						console.log('Fabrik form::addElements: Cannot add element "' +
							el.options.element + '" because it does not exist in HTML.');
						return;
					}
					added.push(self.addElement(el, el.options.element, gid)); // Can not use this here
				}
				//else if (typeof(el) !== 'null') {
				//	console.log('Fabrik form::addElements: Cannot add unknown element: ' + el);
				//}
				else {
					console.log('Fabrik form::addElements: Cannot add unknown element or null: ' + el);
				}
			});
		});
		// $$$ hugh - moved attachedToForm calls out of addElement to separate loop, to fix forward reference issue,
		// i.e. calc element adding events to other elements which come after itself, which won't be in formElements
		// yet if we do it in the previous loop ('cos the previous loop is where elements get added to formElements)

		for (i = 0; i < added.length; i++) {
			if (added[i] !== 'null') {
//				try {
					added[i].attachedToForm();
//				} catch (err) {
//					console.log(added[i].options.element + ' attach to form:' + err);
//				}
			}
		}
		Fabrik.fireEvent('fabrik.form.elements.added', [this]);
	}

	addElement (oEl, elId, gid) {
		elId = oEl.getFormElementsKey(elId);
		elId = elId.replace('[]', '');

		var ro = elId.substring(elId.length - 3, elId.length) === '_ro';
		oEl.form = this;
		oEl.groupid = gid;
		this.formElements.set(elId, oEl);
		Fabrik.fireEvent('fabrik.form.element.added', [this, elId, oEl]);
		if (ro) {
			elId = elId.substr(0, elId.length - 3);
			this.formElements.set(elId, oEl);
		}
		this.submitBroker.addElement(elId, oEl);
		return oEl;
	}

	/**
	 * Dispatch an event to an element
	 *
	 * @param   string  elementType  Deprecated
	 * @param   string  elementId    Element key to look up in this.formElements
	 * @param   string  action       Event change/click etc.
	 * @param   mixed   js           String or function
	 */

	dispatchEvent (elementType, elementId, action, js) {
		if (typeof(js) === 'string') {
			js = Encoder.htmlDecode(js);
		}
		var el = this.formElements.get(elementId);
		if (!el) {
			// E.g. db join rendered as chx
			var els = Object.forEach(this.formElements, function (e) {
				if (elementId === e.baseElementId) {
					el = e;
				}
			});
		}
		if (!el) {
			console.log('Fabrik form::dispatchEvent: Cannot find element to add ' + action + ' event to: ' + elementId);
		}
		else if (js !== '') {
			el.addNewEvent(action, js);
		}
		else if (Fabrik.debug) {
			console.log('Fabrik form::dispatchEvent: Javascript empty for ' + action + ' event on: ' + elementId);
		}
	}

	action (task, el) {
		var oEl = this.formElements.get(el);
		Browser.exec('oEl.' + task + '()');
	}

	triggerEvents (el) {
		this.formElements.get(el).fireEvents(arguments[1]);
	}

	/**
	 * If Ajax validations are turned on the watch the elements and their sub-elements
	 *
	 * @param {string}  id            Element id to observe
	 * @param {string}  triggerEvent  Event type to add
	 */
	watchValidation (id, triggerEvent) {
		var self = this,
			el = jQuery('#' + id);
		if (this.options.ajaxValidation === false) {
			return;
		}
		if (el.length === 0) {
			console.log('Fabrik form::watchValidation: Could not add ' + triggerEvent + ' event because element "' +
				id + '" does not exist.');
			return;
		}
		el = this.formElements.get(id);
		el.addAjaxValidation();
	}

	/**
	 * as well as being called from watchValidation can be called from other
	 * element js actions, e.g. date picker closing
	 *
	 * @param  {event}   e           the event
	 * @param  {bool}    subEl       has sub elements
	 * @param  {string}  replacetxt  additional text on the value field, like _time
	 */
	doElementValidation (e, subEl, replacetxt) {
		var id;
		if (this.options.ajaxValidation === false) {
			return;
		}
		replacetxt = replacetxt === 'null' ? '_time' : replacetxt;
//		if (typeOf(e) === 'event' || typeOf(e) === 'object' || typeOf(e) === 'domevent') { // mootools
		if ((typeof(e) !== 'string' || typeof(e) !== 'boolean' || typeof(e) !== 'undefined' || typeof(e) !== 'number') || e.target) { 
			id = e.target.id;
			// for elements with subelements e.g. checkboxes radiobuttons
			if (subEl === true) {
				id = document.getElementById(e.target).getParent('.fabrikSubElementContainer').id;
			}
		} else {
			// hack for closing date picker where it seems the event object isn't
			// available
			id = e;
		}

		if (document.getElementById(id) === 'null') {
			return;
		}
		if (document.getElementById(id).getProperty('readonly') === true ||
			document.getElementById(id).getProperty('readonly') === 'readonly') {
			// stops date element being validated
			// return;
		}
		var el = this.formElements.get(id);
		if (!el) {
			//silly catch for date elements you cant do the usual method of setting the id in the
			//fabrikSubElementContainer as its required to be on the date element for the calendar to work
			id = id.replace(replacetxt, '');
			el = this.formElements.get(id);
			if (!el) {
				return;
			}
		}

		if (!el.shouldAjaxValidate())
		{
			return;
		}

		Fabrik.fireEvent('fabrik.form.element.validation.start', [this, el, e]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		el.setErrorMessage(Joomla.Text._('COM_FABRIK_VALIDATING'), 'fabrikValidating');

		var d = $H(this.getFormData());
		d.set('task', 'form.ajax_validate');
		d.set('fabrik_ajax', '1');
		d.set('format', 'raw');
		if (this.options.lang !== false) {
			d.set('lang', this.options.lang);
		}
		d = this._prepareRepeatsForAjax(d);

		// $$$ hugh - nasty hack, because validate() in form model will always use _0 for
		// repeated id's
		var origid = id;
		if (el.origId) {
			origid = el.origId + '_0';
		}
		el.options.repeatCounter = el.options.repeatCounter ? el.options.repeatCounter : 0;

		var myAjax = new Request({
			url       : '',
			method    : this.options.ajaxmethod,
			data      : d,
			onComplete (e) {
				this._completeValidaton(e, id, origid);
			}
		}).send();
	}

	/**
	 * Run once a validation is completed
	 * @param {string} r
	 * @param {string} id
	 * @param {string} origid
	 * @private
	 */
	_completeValidaton (r, id, origid) {
		r = JSON.parse(r);
		if (r === 'null') {
			this._showElementError(['Oups'], id);
			this.result = true;
			return;
		}
		this.formElements.forEach(function (el, key) {
			el.afterAjaxValidation();
		});
		Fabrik.fireEvent('fabrik.form.element.validation.complete', [this, r, id, origid]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		var el = this.formElements.get(id);
		if ((r.modified[origid] !== 'null')) {
			if (el.options.inRepeatGroup) {
				el.update(r.modified[origid][el.options.repeatCounter]);
			}
			else {
				el.update(r.modified[origid]);
			}
		}
		if (r.errors[origid] !== 'null') {
			this._showElementError(r.errors[origid][el.options.repeatCounter], id);
		} else {
			this._showElementError([], id);
		}

		if (this.options.toggleSubmit) {
			if (this.options.mustValidate) {
				if (!this.hasErrors.has(id) || !this.hasErrors.get(id)) {
					this.mustValidateEls[id] = false;
				}
				if (!this.mustValidateEls.hasValue(true)) {
					this.toggleSubmit(true);
				}
			}
			else {
				this.toggleSubmit(this.hasErrors.getKeys().length === 0);
			}
		}
	}

	_prepareRepeatsForAjax (d) {
		this.getForm();
		//ensure we are dealing with a simple object
		//if (typeOf(d) === 'hash') { // mootools, not documented
		if (d instanceof Map) { // unclear what is meant here: is instance of Map or current page has a hash ‘#’ sign
			d = d.getClean();
		}
		//data should be keyed on the data stored in the elements name between []'s which is the group id
		this.form.getElements('input[name^=fabrik_repeat_group]').forEach(
			function (e) {
				// $$$ hugh - had a client with a table called fabrik_repeat_group, which was hosing up here,
				// so added a test to narrow the element name down a bit!
				if (e.id.test(/fabrik_repeat_group_\d+_counter/)) {
					var c = e.name.match(/\[(.*)\]/)[1];
					d['fabrik_repeat_group[' + c + ']'] = e.get('value');
				}
			}
		);
		return d;
	}

	_showGroupError (r, d) {
		var tmperr;
		var gids = Array.mfrom(this.options.pages.get(this.currentPage.toInt()));
		var err = false;
		$H(d).forEach(function (v, k) {
			k = k.replace(/\[(.*)\]/, '').replace(/%5B(.*)%5D/, '');// for dropdown validations
			if (this.formElements.has(k)) {
				var el = this.formElements.get(k);
				if (gids.includes(el.groupid.toInt())) {

					if (r.errors[k]) {
						if (el.options.inRepeatGroup) {
							r.errors[k].forEach(function (v2, k2) {
								var k3 = k.replace(/_(\d+)$/, '_' + k2);
								var rEl = this.formElements.get(k3);


								var msg = '';
								if (v2 !== 'null') {
									msg = v2.flatten().join('<br />');
								}
								if (msg !== '') {
									tmperr = this._showElementError(v2, k3);
									if (err === false) {
										err = tmperr;
									}
								} else {
									rEl.setErrorMessage('', '');
								}
							});
						}
						else {
							// prepare error so that it only triggers for real errors and not success
							// msgs

							var msg = '';
							if (r.errors[k] !== 'null') {
								msg = r.errors[k].flatten().join('<br />');
							}
							if (msg !== '') {
								tmperr = this._showElementError(r.errors[k], k);
								if (err === false) {
									err = tmperr;
								}
							} else {
								el.setErrorMessage('', '');
							}
						}
					}
					if (r.modified[k]) {
						if (el) {
							el.update(r.modified[k]);
						}
					}
				}
			}
		});

		return err;
	}

	/**
	 * Show element error
	 * @param {array} r
	 * @param {string} id
	 * @returns {boolean}
	 * @private
	 */
	_showElementError (r, id) {
		// r should be the errors for the specific element, down to its repeat group
		// id.
		var msg = '';
		if (r !== 'null') {
			msg = r.flatten().join('<br />');
		}
		var classname = (msg === '') ? 'fabrikSuccess' : 'fabrikError';
		if (msg === '') {
			delete this.hasErrors[id];
			msg = Joomla.Text._('COM_FABRIK_SUCCESS');
		}
		else {
			this.hasErrors.set(id, true);
		}
		msg = '<span> ' + msg + '</span>';
		this.formElements.get(id).setErrorMessage(msg, classname);
		return (classname === 'fabrikSuccess') ? false : true;
	}

	updateMainError () {
		var myfx, activeValidations;
		if (this.form.querySelector('.fabrikMainError') !== 'null') {
			this.form.querySelector('.fabrikMainError').set('html', this.options.error);
		}
		activeValidations = this.form.getElements('.fabrikError').filter(
			function (e, index) {
				return !e.classList.contains('fabrikMainError');
			});
		if (activeValidations.length > 0 && this.form.querySelector('.fabrikMainError').classList.contains('fabrikHide')) {
			this.showMainError(this.options.error);
		}
		if (activeValidations.length === 0) {
			this.hideMainError();
		}
	}

	hideMainError () {
		if (this.form.querySelector('.fabrikMainError') !== 'null') {
			var mainEr = this.form.querySelector('.fabrikMainError');
            myfx = new Fx.Tween(mainEr, {
                property  : 'opacity',
                duration  : 500,
                onComplete: function () {
                    mainEr.addClass('fabrikHide');
                }
            }).start(1, 0);
		}
	}

	showMainError (msg) {
		// If we are in j3 and ajax validations are on - don't show main error as it makes the form 'jumpy'
//		if (Fabrik.bootstrapped && this.options.ajaxValidation) {
		if (this.options.ajaxValidation) {
			return;
		}
		if (this.form.querySelector('.fabrikMainError') !== 'null') {
			var mainEr = this.form.querySelector('.fabrikMainError');
			mainEr.set('html', msg);
			mainEr.removeClass('fabrikHide');
		}
	}

	/** @since 3.0 get a form button name */
	_getButton (name) {
		if (!this.getForm()) {
			return;
		}
		var b = this.form.querySelector('input[type=button][name=' + name + ']');
		if (!b) {
			b = this.form.querySelector('input[type=submit][name=' + name + ']');
		}
		if (!b) {
			b = this.form.querySelector('button[type=button][name=' + name + ']');
		}
		if (!b) {
			b = this.form.querySelector('button[type=submit][name=' + name + ']');
		}
		return b;
	}

	watchSubmit () {
		var submit = this._getButton('Submit');
		var apply = this._getButton('apply');

		if (!submit && !apply) {
			// look for a button element set to submit
			if (this.form && this.form.querySelector('button[type=submit]'))
			{
				submit = this.form.querySelector('button[type=submit]');
			}
			else {
				return;
			}
		}
		var del = this._getButton('delete'),
			copy = this._getButton('Copy');
		if (del) {
			del.addEventListener('click', function (e) {
				if (window.confirm(Joomla.Text._('COM_FABRIK_CONFIRM_DELETE_1'))) {
					var res = Fabrik.fireEvent('fabrik.form.delete', [this, this.options.rowid]).eventResults;
					if (res === 'null' || res.length === 0 || !res.includes(false)) {
						// Task value is the same for front and admin
						this.form.querySelector('input[name=task]').value = 'form.delete';
						this.doSubmit(e, del);
					} else {
						e.stop();
						return false;
					}

				} else {
					return false;
				}
			});
		}
		var submits = this.form.getElements('button[type=submit]').combine([apply, submit, copy]);
		submits.forEach(function (btn) {
			if (btn !== 'null') {
				btn.addEventListener('click', function (e) {
					this.doSubmit(e, btn);
				});
			}
		});

		this.form.addEventListener('submit', function (e) {
			this.doSubmit(e);
		});
	}

	mockSubmit (btnName) {
		btnName = typeof btnName !== 'undefined' ? btnName : 'Submit';
		var btn = this._getButton(btnName);
		if (!btn) {
			btn = new Element('button', {'name': btnName, 'type': 'submit'});
		}
		this.doSubmit(new Event('click', { bubbles: true, cancelable: true }), btn);
	}

	doSubmit (e, btn) {
		if (this.submitBroker.enabled()) {
			e.stop();
			return false;
		}
		this.toggleSubmit(false);
		this.submitBroker.submit(function () {
			if (this.options.showLoader) {
				//Fabrik.loader.start(this.getBlock(), Joomla.Text._('COM_FABRIK_LOADING'));
			}
			Fabrik.fireEvent('fabrik.form.submit.start', [this, e, btn]);
			if (this.result === false) {
				this.result = true;
				e.stop();
				//Fabrik.loader.stop(this.getBlock());
				// Update global status error
				this.updateMainError();
				this.toggleSubmit(true);

				// Return otherwise ajax upload may still occur.
				return;
			}
			// Insert a hidden element so we can reload the last page if validation fails
			if (this.options.pages.getKeys().length > 1) {
				this.form.adopt(new Element('input', {
					'name' : 'currentPage',
					'value': this.currentPage.toInt(),
					'type' : 'hidden'
				}));
			}
			hiddenElements = [];
			// insert hidden element of hidden elements (!) used by validation code for "skip if hidden" option
			jQuery.each(this.formElements, function (id, el) {
			   if (el.element && jQuery(el.element).closest('.fabrikHide').length !== 0) {
				   hiddenElements.push(id);
			   }
			});
			this.form.adopt(new Element('input', {
				'name' : 'hiddenElements',
				'value': JSON.stringify(hiddenElements),
				'type' : 'hidden'
			}));
			if (this.options.ajax) {
				// Do ajax val only if onSubmit val ok
				if (this.form) {
					// if showLoader is enabled (for non AJAX submits) the loader will already have been shown up there ^^
					if (!this.options.showLoader) {
						//Fabrik.loader.start(this.getBlock(), Joomla.Text._('COM_FABRIK_LOADING'));
					}

					// Get all values from the form
					var data = $H(this.getFormData());
					data = this._prepareRepeatsForAjax(data);
					data[btn.name] = btn.value;
					if (btn.name === 'Copy') {
						data.Copy = 1;
						e.stop();
					}
					data.fabrik_ajax = '1';
					data.format = 'raw';

					// if HTML 5, use FormData so we can do uploads from popups via AJAX
					// poop, doesn't work in Edge or Safari, punt till they implement FormData correctly
					if (false && window.FormData) {
						fd = new FormData(this.form);

						jQuery.each(data, function(k, v) {
							if (fd.has(k)) {
								//if (typeOf(fd.get(k)) !== 'object') { mootools
								if (typeof(fd.get(k)) == 'string' || typeof(fd.get(k)) == 'boolean' || typeof(fd.get(k)) == 'undefined' || typeof(fd.get(k)) == 'function') { 
									fd.set(k, v);
								}
							}
							else {
								fd.set(k, v);
							}
						});

						data = fd;
						var self = this;

						jQuery.ajax({
							'url': this.form.action,
							'data': data,
							'method': this.options.ajaxmethod,
							'processData': false,
							'contentType': false
						})
							.fail(function (text, error) {
								console.log(text + ': ' + error);
								self.showMainError(error);
								//Fabrik.loader.stop(self.getBlock(), 'Error in returned JSON');
								self.toggleSubmit(true);
							})
							.done(function (json, txt) {
								json = JSON.parse(json);
								self.toggleSubmit(true);
								if (json === 'null') {
									// Stop spinner
									//Fabrik.loader.stop(self.getBlock(), 'Error in returned JSON');
									console.log('error in returned json', json, txt);
									return;
								}
								// Process errors if there are some
								jQuery(self.form.getElements('[data-role=fabrik_tab]')).removeClass('fabrikErrorGroup')
								var errfound = false;
								if (json.errors !== undefined) {

									// For every element of the form update error message
									$H(json.errors).forEach(function (errors, key) {
										if (self.formElements.has(key) && errors.flatten().length > 0) {
											errfound = true;
											if (self.formElements[key].options.inRepeatGroup) {
												for (e = 0; e < errors.length; e++) {
													if (errors[e].flatten().length > 0) {
														var this_key = key.replace(/(_\d+)$/, '_' + e);
														self._showElementError(errors[e], this_key);
													}
												}
											}
											else {
												self._showElementError(errors, key);
											}
										}
									});
								}
								// Update global status error
								self.updateMainError();

								if (errfound === false) {
									var clear_form = false;
									if (self.options.rowid === '' && btn.name !== 'apply') {
										// We're submitting a new form - so always clear
										clear_form = true;
									}
									//Fabrik.loader.stop(self.getBlock());
									var savedMsg = (json.msg !== 'null' && json.msg !== undefined && json.msg !== '') ? json.msg : Joomla.Text._('COM_FABRIK_FORM_SAVED');
									if (json.baseRedirect !== true) {
										clear_form = json.reset_form;
										if (json.url !== undefined) {
											if (json.redirect_how === 'popup') {
												var width = json.width ? json.width : 400;
												var height = json.height ? json.height : 400;
												var x_offset = json.x_offset ? json.x_offset : 0;
												var y_offset = json.y_offset ? json.y_offset : 0;
												var title = json.title ? json.title : '';
												Fabrik.getWindow({
													'id'      : 'redirect',
													'type'    : 'redirect',
													contentURL: json.url,
													caller    : self.getBlock(),
													'height'  : height,
													'width'   : width,
													'offset_x': x_offset,
													'offset_y': y_offset,
													'title'   : title
												});
											}
											else {
												if (json.redirect_how === 'samepage') {
													window.open(json.url, '_self');
												}
												else if (json.redirect_how === 'newpage') {
													window.open(json.url, '_blank');
												}
											}
										} else {
											if (!json.suppressMsg) {
												alert(savedMsg);
											}
										}
									} else {
										clear_form = json.reset_form !== undefined ? json.reset_form : clear_form;
										if (!json.suppressMsg) {
											alert(savedMsg);
										}
									}
									// Query the list to get the updated data
									Fabrik.fireEvent('fabrik.form.submitted', [self, json]);
									if (btn.name !== 'apply') {
										if (clear_form) {
											self.clearForm();
										}
										// If the form was loaded in a Fabrik.Window close the window.
										if (Fabrik.Windows[self.options.fabrik_window_id]) {
											Fabrik.Windows[self.options.fabrik_window_id].close();
										}
									}
								} else {
									Fabrik.fireEvent('fabrik.form.submit.failed', [self, json]);
									// Stop spinner
									//Fabrik.loader.stop(self.getBlock(), Joomla.Text._('COM_FABRIK_VALIDATION_ERROR'));
								}
							});
					}
					else {
						var myajax = new Request.JSON({
							'url': this.form.action,
							'data': data,
							'method': this.options.ajaxmethod,
							onError (text, error) {
								console.log(text + ': ' + error);
								this.showMainError(error);
								//Fabrik.loader.stop(this.getBlock(), 'Error in returned JSON');
								this.toggleSubmit(true);
							},

							onFailure (xhr) {
								console.log(xhr);
								//Fabrik.loader.stop(this.getBlock(), 'Ajax failure');
								this.toggleSubmit(true);
							},
							onComplete (json, txt) {
								this.toggleSubmit(true);
								if (json === 'null') {
									// Stop spinner
									//Fabrik.loader.stop(this.getBlock(), 'Error in returned JSON');
									console.log('error in returned json', json, txt);
									return;
								}
								// Process errors if there are some
								jQuery(this.form.getElements('[data-role=fabrik_tab]')).removeClass('fabrikErrorGroup')
								var errfound = false;

								if (json.errors !== undefined) {
									// For every element of the form update error message
									$H(json.errors).forEach(function (errors, key) {
										if (errors.flatten().length > 0) {
											/*
											 * might not be an element error - could be a custom plugin error - so
											 * flag an error found, even if we don't match it to an element.
											 */
											errfound = true;
											if (this.formElements.has(key)) {
												if (this.formElements[key].options.inRepeatGroup) {
													for (e = 0; e < errors.length; e++) {
														if (errors[e].flatten().length > 0) {
															var this_key = key.replace(/(_\d+)$/, '_' + e);
															this._showElementError(errors[e], this_key);
														}
													}
												}
												else {
													this._showElementError(errors, key);
												}
											}
										}
									});
								}
								// Update global status error
								this.updateMainError();

								if (errfound === false) {
									var clear_form = false;
									if (this.options.rowid === '' && btn.name !== 'apply') {
										// We're submitting a new form - so always clear
										clear_form = true;
									}
									//Fabrik.loader.stop(this.getBlock());
									var savedMsg = (json.msg !== 'null' && json.msg !== undefined && json.msg !== '') ? json.msg : Joomla.Text._('COM_FABRIK_FORM_SAVED');
									if (json.baseRedirect !== true) {
										clear_form = json.reset_form;
										if (json.url !== undefined) {
											if (json.redirect_how === 'popup') {
												var width = json.width ? json.width : 400;
												var height = json.height ? json.height : 400;
												var x_offset = json.x_offset ? json.x_offset : 0;
												var y_offset = json.y_offset ? json.y_offset : 0;
												var title = json.title ? json.title : '';
												Fabrik.getWindow({
													'id': 'redirect',
													'type': 'redirect',
													contentURL: json.url,
													caller: this.getBlock(),
													'height': height,
													'width': width,
													'offset_x': x_offset,
													'offset_y': y_offset,
													'title': title
												});
											}
											else {
												if (json.redirect_how === 'samepage') {
													window.open(json.url, '_self');
												}
												else if (json.redirect_how === 'newpage') {
													window.open(json.url, '_blank');
												}
											}
										} else {
											if (!json.suppressMsg) {
												alert(savedMsg);
											}
										}
									} else {
										clear_form = json.reset_form !== undefined ? json.reset_form : clear_form;
										if (!json.suppressMsg) {
											alert(savedMsg);
										}
									}
									// Query the list to get the updated data
									Fabrik.fireEvent('fabrik.form.submitted', [this, json]);

									if (btn.name !== 'apply') {
										if (clear_form) {
											this.clearForm();
										}
										// If the form was loaded in a Fabrik.Window close the window.
										if (Fabrik.Windows[this.options.fabrik_window_id]) {
											Fabrik.Windows[this.options.fabrik_window_id].close();
										}
									}

									Fabrik.fireEvent('fabrik.form.submitted.end', [this, json]);
								} else {
									Fabrik.fireEvent('fabrik.form.submit.failed', [this, json]);
									// Stop spinner
									//Fabrik.loader.stop(this.getBlock(), Joomla.Text._('COM_FABRIK_VALIDATION_ERROR'));
								}
							}
						}).send();
					}
				}
			}
			Fabrik.fireEvent('fabrik.form.submit.end', [this]);
			if (this.result === false) {
				this.result = true;
				e.stop();
				// Update global status error
				this.updateMainError();
			} else {
				// Enables the list to clean up the form and custom events
				if (this.options.ajax) {
					e.stop();
					Fabrik.fireEvent('fabrik.form.ajax.submit.end', [this]);
				} else {
					// Inject submit button name/value.
					if (btn !== 'null') {
						new Element('input', {type: 'hidden', name: btn.name, value: btn.value}).inject(this.form);
						this.form.submit();
					} else {
						// Regular button pressed which seems to be triggering form.submit() method.
						e.stop();
					}
				}
			}
		});
		e.stop();
	}

	/**
	 * Used to get the querystring data and
	 * for any element overwrite with its own data definition
	 * required for empty select lists which return undefined as their value if no
	 * items available
	 *
	 * @param  {bool}  submit  Should we run the element onsubmit() methods - set to false in calc element
	 */
	getFormData (submit) {
		submit = submit !== 'null' ? submit : true;
		if (submit) {
			this.formElements.forEach(function (el, key) {
				el.onsubmit();
			});
		}
		this.getForm();
		var s = this.form.toQueryString();
		var h = {};
		s = s.split('&');
		var arrayCounters = new Map();
		s.forEach(function (p) {
			p = p.split('=');
			var k = p[0];
			// $$$ rob deal with checkboxes
			// Ensure [] is not encoded
			k = decodeURI(k);
			if (k.substring(k.length - 2) === '[]') {
				k = k.substring(0, k.length - 2);
				if (!arrayCounters.has(k)) {
					// rob for ajax validation on repeat element this is required to be set to 0
					arrayCounters.set(k, 0);
				} else {
					arrayCounters.set(k, arrayCounters.get(k) + 1);
				}
				k = k + '[' + arrayCounters.get(k) + ']';
			}
			h[k] = p[1];
		});

		// toQueryString() doesn't add in empty data - we need to know that for the
		// validation on multipages
		var elKeys = this.formElements.getKeys();
		this.formElements.forEach(function (el, key) {
			//fileupload data not included in querystring
			if (el.plugin === 'fabrikfileupload') {
				h[key] = el.get('value');
			}
			if (h[key] === 'null') {
				// search for elementname[*] in existing data (search for * as datetime
				// elements aren't keyed numerically)
				var found = false;
				$H(h).forEach(function (val, dataKey) {
					dataKey = unescape(dataKey); // 3.0 ajax submission [] are escaped
					dataKey = dataKey.replace(/\[(.*)\]/, '');
					if (dataKey === key) {
						found = true;
					}
				});
				if (!found) {
					h[key] = '';
				}
			}
		});
		return h;
	}

	/*
	 * Used by things like CDD to populate 'data' for the AJAX update, so custom 'where' clauses
	 * can use {placeholders}. Initially tried to use getFormData for this, but because
	 * it adds ALL the query string args from the page, the AJAX call from cascade ended
	 * up trying to submit the form. So, this func only fetches actual form element data.
	 */
	getFormElementData () {
		var h = {};
		this.formElements.forEach(function (el, key) {
			if (el.element) {
				h[key] = el.getValue();
				h[key + '_raw'] = h[key];
			}
		});
		return h;
	}

	watchGroupButtons () {

		var self = this;

		jQuery(this.form).on('click', '.deleteGroup', Debounce(this.options.debounceDelay, true, function (e, target) {
			e.preventDefault();
			if (!self.addingOrDeletingGroup) {
				self.addingOrDeletingGroup = true;
				var group = e.target.parentElement.matches('.fabrikGroup'),
					subGroup = e.target.parentElement.matches('.fabrikSubGroup');
				self.deleteGroup(e, group, subGroup);
				self.addingOrDeletingGroup = false;
			}
		}));

		jQuery(this.form).on('click', '.addGroup', Debounce(this.options.debounceDelay, true, function (e, target) {
			e.preventDefault();
			if (!self.addingOrDeletingGroup) {
				self.addingOrDeletingGroup = true;
				self.duplicateGroup(e, true);
				self.addingOrDeletingGroup = false;
			}
		}));

		if (this.form) {
			this.form.addEventListener('click:relay(.fabrikSubGroup)', function (e, subGroup) {
			var r = subGroup.querySelector('.fabrikGroupRepeater');
			if (r) {
				subGroup.addEventListener('mouseenter', function (e) {
					r.fade(1);
				});
				subGroup.addEventListener('mouseleave', function (e) {
					r.fade(0.2);
				});
			}
		});
		}
	}

	/**
	 * not currently used in our code, provided as a helper function for custom JS
	 *
	 * @param groupId
	 * @returns {boolean}
	 */
	mockDuplicateGroup(groupId) {
		var add_btn = this.form.querySelector('#group' + groupId + ' .addGroup');

		if (add_btn !== 'null') {
			var add_e = new Event('click', {bubbles: true, cancelable: true});
			this.duplicateGroup(add_e, false);
			return true;
		}

		return false;
	}

	renumberRepeatGroup(el, groupId, newRepeatNum, doDelete) {
		var input = jQuery(el).find('.fabrikinput');
		if (input) {
			var nameMap = {};
			var newMap = {};
			var elId = input[0].id;
			var element = this.formElements.get(elId);
			if (element) {
				var repeatNum = elId.split('_').getLast();
				console.log('renumbering: ' + repeatNum + ' => ' + newRepeatNum);
				element.update(newRepeatNum + 1);
				this.formElements.forEach(function (e, k) {
					if (e.groupid === groupId && k.split('_').getLast() === repeatNum) {
						nameMap[k] = e.setName(newRepeatNum);
					}
				});

				$H(nameMap).forEach(function (newKey, oldKey) {
					if (oldKey !== newKey) {
						newMap[newKey] = this.formElements[oldKey];

						if (doDelete === true) {
							delete this.formElements[oldKey];
						}
					}
				});

				$H(newMap).forEach(function (data, newKey) {
					this.formElements[newKey] = data;
				});
			}
		}
	}

	renumberSortable (groupId) {
		if (this.options.group_repeat_sortable[groupId] === 'null' || !this.options.group_repeat_sortable[groupId]) {
			return;
		}

		var orderElName = this.options.group_repeat_order_element[groupId];
		var group = this.form.querySelector('#group' + groupId);
		var tbody = jQuery(group).find('tbody');
		var tdEls = jQuery(tbody).find('.fabrikRepeatGroup___' + orderElName);
		var i = 1;

		tdEls.forEach(function (k, el) {
			var input = jQuery(el).find('.fabrikinput');

			if (input) {
				var elId = input[0].id;
				var element = this.formElements.get(elId);

				if (element) {
					element.update(i);
				}
			}

			i++;
		});
	}

	reorderSortable (groupId) {
		if (this.options.group_repeat_sortable[groupId] === 'null' || !this.options.group_repeat_sortable[groupId]) {
			return;
		}

		var orderElName = this.options.group_repeat_order_element[groupId];

		var nameMap = {};
		var newMap = {};
		var group = this.form.querySelector('#group' + groupId);
		var tbody = jQuery(group).find('tbody');
		var tdEls = jQuery(tbody).find('.fabrikRepeatGroup___' + orderElName);

		var to = 0;
		var save = false;
		var dir = false;
		var started = false;
		var ended = false;
		var start = false;
		var end = false;
		var lastFrom = -1;

		tdEls.forEach(function (k, el) {
			if (!ended) {
				var input = jQuery(el).find('.fabrikinput');
				if (input) {
					var elId = input[0].id;
					var element = this.formElements.get(elId);
					if (element) {
						var from = elId.split('_').getLast().toInt();

						if (!started) {
							var gap = (from - lastFrom);

							if (gap === 2) {
								started = true;
								dir = 'down';
								start = to;
							} else if (gap > 2) {
								started = true;
								dir = 'up';
								start = to;
								end = from;
								save = from;
								ended = true;
							}
						} else {
							if (dir === 'down') {
								if (from === start) {
									end = to;
									save = to;
									ended = true;
								}
							}
						}

						lastFrom = from;
						to++;
					}
				}
			}
		})

		if (dir === 'up') {
			var el;

			el = tdEls[end];
			this.renumberRepeatGroup(el, groupId, 9999, false);

			for (var i = end - 1; i >= start; i--) {
				el = tdEls[i];
				this.renumberRepeatGroup(el, groupId, i, false);
			}

			el = tdEls[end];
			this.renumberRepeatGroup(el, groupId, end, true);
		}
		else {
			var el;

			el = tdEls[end];
			this.renumberRepeatGroup(el, groupId, 9999, false);

			for (var i = start; i < end; i++) {
				el = tdEls[i];
				this.renumberRepeatGroup(el, groupId, i, false);
			}

			el = tdEls[end];
			this.renumberRepeatGroup(el, groupId, end, true);
		}

		$H(nameMap).forEach(function (newKey, oldKey) {
			if (oldKey !== newKey) {
				newMap[newKey] = this.formElements[oldKey];
			}
		});

		$H(newMap).forEach(function (newKey, data) {
			this.formElements[newKey] = data;
		});
	}

	setupSortable () {
		if (!this.form) {
			return;
		}

		Object.forEach(this.options.group_repeats, function (canRepeat, groupId) {
			if (canRepeat.toInt() !== 1) {
				return;
			}

			if (this.options.group_repeat_sortable[groupId] !== 'null' && this.options.group_repeat_tablesort[groupId]) {
				var group = this.form.querySelector('#group' + groupId);

				if (group) {
					var cellFilters = [];
					group.getElements('th.fabrikElementContainer').forEach(function (e, x) {
						if (e.classList.contains('fabrikHide')) {
							cellFilters.push('fabrikHide');
						} else {
							cellFilters.push('');
						}
					});
					jQuery('#group' + groupId + ' table').tablesorter({
						theme: 'blue',
						widthFixed: true,
						widgets: ["filter"],
						cssInfoBlock: "tablesorter-no-sort",
						ignoreCase: true,
						widgetOptions: {
							filter_ignoreCase: true,
							filter_matchType: {'input': 'match', 'select': 'match'},
							filter_saveFilters: true,
							filter_liveSearch: true,
							filter_cellFilter: cellFilters
						}
					});
				}
			}

			if (this.options.group_repeat_sortable[groupId] !== 'null' && this.options.group_repeat_sortable[groupId]) {
				Fabrik.addEvent('fabrik.form.elements.added', function (form) {
					this.renumberSortable(groupId);
				});

				jQuery('#group' + groupId + ' table tbody').sortable({
					scroll: true,
					scrollSensitivity: 100,
					stop (event, ui) {
						var group = ui.item[0].closest('.fabrikGroup');
						var groupId = group.id.replace('group', '');
						this.reorderSortable(groupId);
					}
				});
			}
		});
	}

	/**
	 * When editing a new form and when min groups set we need to duplicate each group
	 * by the min repeat value.
	 */
	duplicateGroupsToMin () {
		if (!this.form) {
			return;
		}

		Fabrik.fireEvent('fabrik.form.group.duplicate.min', [this]);

		Object.forEach(this.options.group_repeats, function (canRepeat, groupId) {

			if (this.options.minRepeat[groupId] === 'null') {
				return;
			}

			if (canRepeat.toInt() !== 1) {
				return;
			}

			var repeat_counter = this.form.querySelector('#fabrik_repeat_group_' + groupId + '_counter'),
				repeat_added = this.form.querySelector('#fabrik_repeat_group_' + groupId + '_added').value,
				repeat_rows, repeat_real, add_btn, deleteButton, i, repeat_id_0, deleteEvent;

			if (repeat_counter === 'null') {
				return;
			}

			repeat_rows = repeat_real = repeat_counter.value.toInt();

			// figure out if the first group should be hidden (min repeat is 0)
			if (repeat_rows === 1) {
				repeat_id_0 = this.form.querySelector('#' + this.options.group_pk_ids[groupId] + '_0');

				// repeat_added means they added a first group, and we've failed validation, so show it
				if (repeat_added !== '1' && repeat_id_0 !== 'null' && repeat_id_0.value === '') {
					repeat_real = 0;
				}
			}

			var min = this.options.minRepeat[groupId].toInt();
			var max = this.options.maxRepeat[groupId].toInt();
			var group = this.form.querySelector('#group' + groupId);
			var subGroup;

			/**
			 * $$$ hugh - added ability to override min count
			 * http://fabrikar.com/forums/index.php?threads/how-to-initially-show-repeat-group.32911/#post-170147
			 * $$$ hugh - trying out min of 0 for Troester
			 * http://fabrikar.com/forums/index.php?threads/how-to-start-a-new-record-with-empty-repeat-group.34666/#post-175408
			 * $$$ paul - fixing min of 0 for Jaanus
			 * http://fabrikar.com/forums/index.php?threads/couple-issues-with-protostar-template.35917/
			 **/
			if (min === 0 && repeat_real === 0) {

				// Create mock event
				deleteButton = this.form.querySelector('#group' + groupId + ' .deleteGroup');
				const deleteEvent = deleteButton !== 'null' ? new Event('click', { bubbles: true, cancelable: true }) : false;
				subGroup = group.querySelector('.fabrikSubGroup');
				// Remove only group
				this.deleteGroup(deleteEvent, group, subGroup);

			}
			else if (repeat_rows < min) {
				// Create mock event
				add_btn = this.form.querySelector('#group' + groupId + ' .addGroup');
				if (add_btn !== 'null') {
					const add_e = new Event('click', { bubbles: true, cancelable: true });

					// Duplicate group
					for (i = repeat_rows; i < min; i++) {
						this.duplicateGroup(add_e, false);
					}
				}
			}
			else if (max > 0 && repeat_rows > max) {
				// Delete groups
				for (i = repeat_rows; i > max; i--) {
					var b = jQuery(this.form.getElements('#group' + groupId + ' .deleteGroup')).last()[0];
					var del_btn = jQuery(b).find('[data-role=fabrik_delete_group]')[0];
					subGroup = jQuery(group.getElements('.fabrikSubGroup')).last()[0];
					if (del_btn !== 'null') {
						this.deleteGroup(new Event('click', { bubbles: true, cancelable: true }), group, subGroup);
					}
				}
			}

			this.setRepeatGroupIntro(group, groupId);
		});
	}

	/**
	 * Delete an repeating group
	 *
	 * @param e
	 * @param group
	 */
	deleteGroup (e, group, subGroup) {
		Fabrik.fireEvent('fabrik.form.group.delete', [this, e, group]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		if (e) {
			e.preventDefault();
		}

		// Find which repeat group was deleted
		var delIndex = 0;

		// if clicked exactly on icon, e.target will be icon, not surrounding link, so need find with addBack
		var target = jQuery(e.target).find('[data-role=fabrik_delete_group]').addBack('[data-role=fabrik_delete_group]')[0];

		group.getElements('.deleteGroup').forEach(function (b, x) {
			if (jQuery(b).find('[data-role=fabrik_delete_group]')[0] === target) {
				delIndex = x;
			}
		});
		var i = group.id.replace('group', '');

		var repeats = document.getElementById('fabrik_repeat_group_' + i + '_counter').get('value').toInt();
		if (repeats <= this.options.minRepeat[i] && this.options.minRepeat[i] !== 0) {
			if (this.options.minMaxErrMsg[i] !== '') {
				var errorMessage = this.options.minMaxErrMsg[i];
				errorMessage = errorMessage.replace(/\{min\}/, this.options.minRepeat[i]);
				errorMessage = errorMessage.replace(/\{max\}/, this.options.maxRepeat[i]);
				alert(errorMessage);
			}
			return;
		}

		delete this.duplicatedGroups.i;
		if (document.getElementById('fabrik_repeat_group_' + i + '_counter').value === '0') {
			return;
		}
		var subgroups = group.getElements('.fabrikSubGroup');

		this.subGroups.set(i, subGroup.clone());
		if (subgroups.length <= 1) {
			this.hideLastGroup(i, subGroup);
			this.formElements.forEach(function (e, k) {
				if (e.groupid === i && e.element !== 'null') {
					this.removeMustValidate(e);
				}
			});
			document.getElementById('fabrik_repeat_group_' + i + '_added').value = '0';
			Fabrik.fireEvent('fabrik.form.group.delete.end', [this, e, i, delIndex]);
		} else {
			var toel = subGroup.getPrevious();
			if (subgroups.length > 1) {
				subGroup.dispose();
			}

			this.formElements.forEach(function (e, k) {
				if (e.element !== 'null') {
					if (document.getElementById(e.element.id) === 'null') {
						e.decloned(i);
						delete this.formElements[k];
					}
				}
			});

			// Minus the removed group
			subgroups = group.getElements('.fabrikSubGroup');
			var nameMap = {};
			this.formElements.forEach(function (e, k) {
				if (e.groupid === i) {
					nameMap[k] = e.decreaseName(delIndex);
				}
			});
			// ensure that formElements' keys are the same as their object's ids
			// otherwise delete first group, add 2 groups - ids/names in last
			// added group are not updated
			$H(nameMap).forEach(function (newKey, oldKey) {
				if (oldKey !== newKey) {
					this.formElements[newKey] = this.formElements[oldKey];
					delete this.formElements[oldKey];
				}
			});
			Fabrik.fireEvent('fabrik.form.group.delete.end', [this, e, i, delIndex]);
			if (toel) {
				// Only scroll the window if the previous element is not visible
				var win_scroll = document.getElementById(window).getScroll().y;
				var obj = toel.getCoordinates();
				// If the top of the previous repeat goes above the top of the visible
				// window,
				// scroll down just enough to show it.
				if (obj.top < win_scroll) {
					var new_win_scroll = obj.top;
					this.winScroller.start(0, new_win_scroll);
				}
			}
		}
		// Update the hidden field containing number of repeat groups
		document.getElementById('fabrik_repeat_group_' + i + '_counter').value =
			document.getElementById('fabrik_repeat_group_' + i + '_counter').get('value').toInt() - 1;
		// $$$ hugh - no, mustn't decrement this!  See comment in setupAll
		this.repeatGroupMarkers.set(i, this.repeatGroupMarkers.get(i) - 1);
		this.renumberSortable(i);
		this.setRepeatGroupIntro(group, i);
	}

	hideLastGroup (groupId, subGroup) {
		var msg = this.options.noDataMsg[groupId];

		if (msg === '') {
			msg = Joomla.Text._('COM_FABRIK_NO_REPEAT_GROUP_DATA');
		}

		var sge = subGroup.querySelector('.fabrikSubGroupElements');
		var notice = new Element(
			'div', {'class': 'fabrikNotice alert'}
		).appendText(msg);
		if (sge === 'null') {
			sge = subGroup;
			var add = sge.querySelector('.addGroup');
			if (add !== 'null') {
				var lastth = sge.getParent('table').getElements('*[data-role="fabrik-group-repeaters"]').getLast();
				if (!lastth) {
					// for old custom templates that don't have the data-role, fall back to just grabbing last th
					lastth = sge.getParent('table').getElements('thead th').getLast();
				}
				add.inject(lastth);
			}
		}
		sge.setStyle('display', 'none');
		notice.inject(sge, 'after');
	}

	isFirstRepeatSubGroup (group) {
		var subgroups = group.getElements('.fabrikSubGroup');
		return subgroups.length === 1 && group.querySelector('.fabrikNotice');
	}

	getSubGroupToClone (groupId) {
		var group = document.getElementById('group' + groupId);
		var subgroup = group.querySelector('.fabrikSubGroup');
		if (!subgroup) {
			subgroup = this.subGroups.get(groupId);
		}

		var clone = null;
		var found = false;
		if (this.duplicatedGroups.has(groupId)) {
			found = true;
		}
		if (!found) {
			clone = subgroup.cloneNode(true);
			this.duplicatedGroups.set(groupId, clone);
		} else {
			if (!subgroup) {
				clone = this.duplicatedGroups.get(groupId);
			} else {
				clone = subgroup.cloneNode(true);
			}
		}
		return clone;
	}

	repeatGetChecked (group) {
		// /stupid fix for radio buttons loosing their checked value
		var tocheck = [];
		group.getElements('.fabrikinput').forEach(function (i) {
			if (i.type === 'radio' && i.getProperty('checked')) {
				tocheck.push(i);
			}
		});
		return tocheck;
	}

	/**
	 * Duplicates the groups sub group and places it at the end of the group
	 *
	 * @param   event  e       Click event
	 * @param   bool   scroll  Scroll to group if offscreen
	 */
	duplicateGroup (e, scroll) {
		scroll = typeof scroll !== 'undefined' ? scroll : true;
		var subElementContainer, container;
		Fabrik.fireEvent('fabrik.form.group.duplicate', [this, e]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		if (e) {
			e.preventDefault();
		}
		var i = e.target.parentElement.matches('.fabrikGroup').id.replace('group', '');
		var group_id = i.toInt();
		var group = document.getElementById('group' + i);
		var c = this.repeatGroupMarkers.get(i);
		var repeats = document.getElementById('fabrik_repeat_group_' + i + '_counter').get('value').toInt();
		if (repeats >= this.options.maxRepeat[i] && this.options.maxRepeat[i] !== 0) {
			if (this.options.minMaxErrMsg[i] !== '') {
				var errorMessage = this.options.minMaxErrMsg[i];
				errorMessage = errorMessage.replace(/\{min\}/, this.options.minRepeat[i]);
				errorMessage = errorMessage.replace(/\{max\}/, this.options.maxRepeat[i]);
				window.alert(errorMessage);
			}
			return;
		}
		document.getElementById('fabrik_repeat_group_' + i + '_counter').value = repeats + 1;

		if (this.isFirstRepeatSubGroup(group)) {
			var subgroups = group.getElements('.fabrikSubGroup');
			// user has removed all repeat groups and now wants to add it back in
			// remove the 'no groups' notice

			var sub = subgroups[0].querySelector('.fabrikSubGroupElements');
			if (sub === 'null') {
				group.querySelector('.fabrikNotice').dispose();
				sub = subgroups[0];

				// Table group
				var add = group.querySelector('.addGroup');
				add.inject(sub.querySelector('td.fabrikGroupRepeater'));
				sub.setStyle('display', '');
			} else {
				subgroups[0].querySelector('.fabrikNotice').dispose();
				subgroups[0].querySelector('.fabrikSubGroupElements').show();
			}

			this.repeatGroupMarkers.set(i, this.repeatGroupMarkers.get(i) + 1);
			document.getElementById('fabrik_repeat_group_' + i + '_added').value = '1';

			this.formElements.forEach(function (e, k) {
				if (e.groupid === i && e.element !== 'null') {
					this.addMustValidate(e);
				}
			});

			Fabrik.fireEvent('fabrik.form.group.duplicate.end', [this, e, i, c]);

			return;
		}

		var clone = this.getSubGroupToClone(i);
		var tocheck = this.repeatGetChecked(group);

		// Check for table style group, which may or may not have a tbody in it
		var groupTable = group.querySelector('table.repeatGroupTable');
		if (groupTable) {
			if (groupTable.querySelector('tbody')) {
				groupTable = groupTable.querySelector('tbody');
			}
			groupTable.appendChild(clone);
		} else {
			group.appendChild(clone);
		}

		tocheck.forEach(function (i) {
			i.setProperty('checked', true);
		});

		this.subelementCounter = 0;
		// Remove values and increment ids
		var newElementControllers = [],
			hasSubElements = false,
			inputs = clone.getElements('.fabrikinput'),
			lastinput = null;
		this.formElements.forEach(function (el) {
			var formElementFound = false;
			subElementContainer = null;
			var subElementCounter = -1;
			inputs.forEach(function (input) {

				hasSubElements = el.hasSubElements();

				container = input.getParent('.fabrikSubElementContainer');
				var testid = (hasSubElements && container) ? container.id : input.id;
				var cloneName = el.getCloneName();

				// Test ===, plus special case for join rendered as auto-complete
				if (testid === cloneName || testid === cloneName + '-auto-complete') {
					lastinput = input;
					formElementFound = true;

					if (hasSubElements) {
						subElementCounter++;
						subElementContainer = input.getParent('.fabrikSubElementContainer');

						// Clone the first inputs event to all subelements
						// $$$ hugh - sanity check in case we have an element which has no input
						if (document.getElementById(testid).querySelector('input')) {
							input.cloneEvents(document.getElementById(testid).querySelector('input'));
						}
						// Note: Radio's etc. now have their events delegated from the form - so no need to duplicate them

					} else {
						input.cloneEvents(el.element);

						// Update the element id use el.element.id rather than input.id as
						// that may contain _1 at end of id
						var bits = Array.mfrom(el.element.id.split('_'));
						bits.splice(bits.length - 1, 1, c);
						input.id = bits.join('_');

						// Update labels for non sub elements
						var l = input.getParent('.fabrikElementContainer').querySelector('label');
						if (l) {
							l.setProperty('for', input.id);
						}
					}
					if (input.name !== 'null') {
						input.name = input.name.replace('[0]', '[' + c + ']');
					}
				}
			});

			if (formElementFound) {
				if (hasSubElements && subElementContainer !== 'null') {
					// if we are checking subelements set the container id after they have all
					// been processed
					// otherwise if check only works for first subelement and no further
					// events are cloned

					// $$$ rob fix for date element
					var bits = Array.mfrom(el.options.element.split('_'));
					bits.splice(bits.length - 1, 1, c);
					subElementContainer.id = bits.join('_');
				}
				var origelid = el.options.element;
				// clone js element controller, set form to be passed by reference and
				// not cloned
				var ignore = el.unclonableProperties();
				var newEl = new CloneObject(el, true, ignore);

				newEl.container = null;
				newEl.options.repeatCounter = c;

				// This seems to be wrong, as it'll set origId to the repeat ID with the _X appended.
				//newEl.origId = origelid;

				if (hasSubElements && subElementContainer !== 'null') {
					newEl.element = document.getElementById(subElementContainer);
					newEl.cloneUpdateIds(subElementContainer.id);
					newEl.options.element = subElementContainer.id;
					newEl._getSubElements();
				} else {
					newEl.cloneUpdateIds(lastinput.id);
				}
				//newEl.reset();
				newElementControllers.push(newEl);
			}
		});

		newElementControllers.forEach(function (newEl) {
			newEl.cloned(c);
			// $$$ hugh - moved reset() from end of loop above, otherwise elements with un-cloneable object
			// like maps end up resetting the wrong map to default values.  Needs to run after element has done
			// whatever it needs to do with un-cloneable object before resetting.
			// $$$ hugh - adding new option to allow copying of the existing element values when copying
			// a group, instead of resetting to default value.  This means knowing what the group PK element
			// is, do we don't copy that value.  hence new group_pk_ids[] array, which gives us the PK element
			// name in regular full format, which we need to test against the join string name.
			//var pk_re = new RegExp('\\[' + this.options.group_pk_ids[group_id] + '\\]');
			var pk_re = new RegExp(this.options.group_pk_ids[group_id]);
			if (!this.options.group_copy_element_values[group_id] ||
				(this.options.group_copy_element_values[group_id] &&
				newEl.element.name && newEl.element.name.test(pk_re))) {
				// Call reset method that resets both events and value back to default.
				newEl.reset();
			}
			else {
				// Call reset method that only resets the events, not the value
				newEl.resetEvents();
			}
		});
		var o = {};
		o[i] = newElementControllers;
		this.addElements(o);

		/**
		 * Only scroll the window if the new element is not visible and 'scroll' arg true
		 * (so for example, we won't scroll if called from duplicateGroupsToMin)
		 */

		if (scroll) {
			var win_size = jQuery(window).height(),
				win_scroll = document.getElementById(window).getScroll().y,
				obj = clone.getCoordinates();

			/**
			 * If the bottom of the new repeat goes below the bottom of the visible window,
			 * scroll up just enough to show it.
			 */

			if (obj.bottom > (win_scroll + win_size)) {
				var new_win_scroll = obj.bottom - win_size;
				this.winScroller.start(0, new_win_scroll);
			}
		}
		clone.fade(1);
		Fabrik.fireEvent('fabrik.form.group.duplicate.end', [this, e, i, c]);
		this.setRepeatGroupIntro(group, i);
		this.renumberSortable(i);
		this.repeatGroupMarkers.set(i, this.repeatGroupMarkers.get(i) + 1);
		this.addedGroups.push('group' + i);
	}

	/**
	 * Set the repeat group intro text
	 * @param  {string}  group  group container
	 * @param  {string}  groupId  group ID
	 */
	setRepeatGroupIntro (group, groupId) {
		var intro = this.options.group_repeat_intro[groupId],
			tmpIntro = '',
			targets = group.getElements('*[data-role="group-repeat-intro"]');

		targets.forEach(function (target, i) {
			tmpIntro = intro.replace('{i}', i + 1);
			// poor man's parseMsgForPlaceholder ... ignore elements in joined groups.
			this.formElements.forEach(function (el) {
				if (!el.options.inRepeatGroup) {
					var re = new RegExp('\{' + el.element.id + '\}');
					// might should do a match first, to avoid always calling getValue(), just not sure which is more overhead!
					tmpIntro = tmpIntro.replace(re, el.getValue());
				}
			});
			target.set('html', tmpIntro);
		});
	}

	update (o) {
		Fabrik.fireEvent('fabrik.form.update', [this, o.data]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		var leaveEmpties = arguments[1] || false;
		var data = o.data;
		this.getForm();
		if (this.form) { // test for detailed view in module???
			var rowidel = this.form.querySelector('input[name=rowid]');
			if (rowidel && data.rowid) {
				rowidel.value = data.rowid;
			}
		}
		this.formElements.forEach(function (el, key) {
			// if updating from a detailed view with prev/next then data's key is in
			// _ro format
			if (data[key] === 'null') {
				if (key.substring(key.length - 3, key.length) === '_ro') {
					key = key.substring(0, key.length - 3);
				}
			}
			// this if stopped the form updating empty fields. Element update()
			// methods
			// should test for null
			// variables and convert to their correct values
			// if (data[key]) {
			if (data[key] === 'null') {
				// only update blanks if the form is updating itself
				// leaveEmpties set to true when this form is called from updateRows
				if (o.id === this.id && !leaveEmpties) {
					el.update('');
				}
			} else {
				el.update(data[key]);
			}
		});
	}

	reset () {
		this.addedGroups.forEach(function (subgroup) {
			var group = document.getElementById(subgroup).findClassUp('fabrikGroup');
			var i = group.id.replace('group', '');
			document.getElementById('fabrik_repeat_group_' + i + '_counter').value =
				document.getElementById('fabrik_repeat_group_' + i + '_counter').get('value').toInt() - 1;
			subgroup.remove();
		});
		this.addedGroups = [];
		Fabrik.fireEvent('fabrik.form.reset', [this]);
		if (this.result === false) {
			this.result = true;
			return;
		}
		this.formElements.forEach(function (el, key) {
			el.reset();
		});
	}

	showErrors (data) {
		var d = null;
		if (data.id === this.id) {
			// show errors
			var errors = new Hash(data.errors);
			if (errors.getKeys().length > 0) {
				if (this.form.querySelector('.fabrikMainError') !== 'null') {
					this.form.querySelector('.fabrikMainError').set('html', this.options.error);
					this.form.querySelector('.fabrikMainError').removeClass('fabrikHide');
				}
				errors.forEach(function (a, key) {
					if (document.getElementById(key + '_error') !== 'null') {
						var e = document.getElementById(key + '_error');
						var msg = new Element('span');
						for (var x = 0; x < a.length; x++) {
							for (var y = 0; y < a[x].length; y++) {
								d = new Element('div').appendText(a[x][y]).inject(e);
							}
						}
					} else {
						console.log(key + '_error' + ' not found (form show errors)');
					}
				});
			}
		}
	}

	/** add additional data to an element - e.g database join elements */
	appendInfo (data) {
		this.formElements.forEach(function (el, key) {
			if (el.appendInfo) {
				el.appendInfo(data, key);
			}
		});
	}

	clearForm () {
		this.getForm();
		if (!this.form) {
			return;
		}
		this.formElements.forEach(function (el, key) {
			if (key === this.options.primaryKey) {
				this.form.querySelector('input[name=rowid]').value = '';
			}
			el.update('');
		});
		this.form.getElements('.fabrikError').empty();
		this.form.getElements('.fabrikError').addClass('fabrikHide');
	}

	/**
	 * Reset errors
	 */
	clearErrors () {
		jQuery(this.form).find('.fabrikError').removeClass('fabrikError')
			.removeClass('error').removeClass('has-error');
		this.hideTips();
	}

	/**
	 * Hide tips
	 */
	hideTips () {
	  this.elements.forEach(function(element) {
		  element.removeTipMsg();
	  });
	}

	/**
	 * If the form is in a modal and the modal scrolls we should update the
	 * elements tips to keep the tip attached to the element.
	 */
	scrollTips () {
		var self = this, top, left,
			match = jQuery(self.form).closest('.fabrikWindow'),
			modal = match.find('.itemContent'),
			currentPos;

		var pos = function () {
			var origPos = match.data('origPosition');
			if (origPos === undefined) {
				origPos = match.position();
				match.data('origPosition', origPos);
			}

			currentPos = match.position();
			top = origPos.top - currentPos.top + modal.scrollTop();
			left = origPos.left - currentPos.left + modal.scrollLeft();
			self.elements.forEach(function(element) {
				element.moveTip(top, left);
			});
		};

		modal.on('scroll', function () {
			pos();
		});

		Fabrik.on('fabrik.window.resized', function (window) {
			if (match.length > 0 && window === match[0]) {
				pos();
			}
		});
	}

	stopEnterSubmitting () {
		var inputs = this.form.getElements('input.fabrikinput');
		inputs.forEach(function (el, i) {
			el.addEventListener('keypress', function (e) {
				if (e.key === 'enter') {
					e.stop();
					if (inputs[i + 1]) {
						inputs[i + 1].focus();
					}
					//last one?
					if (i === inputs.length - 1) {
						this._getButton('Submit').focus();
					}
				}
			});
		});
	}

	getSubGroupCounter (group_id) {

	}

	addMustValidate (el) {
		if (this.options.ajaxValidation && this.options.toggleSubmit) {
			this.mustValidateEls.set(el.element.id, el.options.mustValidate);
			if (el.options.mustValidate) {
				this.options.mustValidate = true;
				this.toggleSubmit(false);
			}
		}
	}

	removeMustValidate (el) {
		if (this.options.ajaxValidation && this.options.toggleSubmit) {
			delete this.mustValidateEls[el.element.id];
			if (el.options.mustValidate) {
				if (!this.mustValidateEls.hasValue(true)) {
					this.toggleSubmit(true);
				}
			}
		}
	}

	toggleSubmit (on) {
		var submit = this._getButton('Submit');
		if (submit !== 'null') {
			if (on === true) {
				submit.disabled = '';
				submit.setStyle('opacity', 1);
				if (this.options.toggleSubmitTip !== '') {
					jQuery(this.form).find('.fabrikSubmitWrapper').tooltip('destroy');
					this.toggleSubmitTipAdded = false;
				}
			}
			else {
				submit.disabled = 'disabled';
				submit.setStyle('opacity', 0.5);
				if (this.options.toggleSubmitTip !== '') {
					if (!this.toggleSubmitTipAdded) {
						//jQuery(this.form).find('.fabrikSubmitWrapper').data('toggle', 'tooltip');
						//jQuery(this.form).find('.fabrikSubmitWrapper').attr('title', 'Your form cannot be saved until all inputs have been validated');
						jQuery(this.form).find('.fabrikSubmitWrapper').tooltip();
						this.toggleSubmitTipAdded = true;
					}
				}
			}
			Fabrik.fireEvent('fabrik.form.togglesubmit', [this, on]);
		}
	}

	addPlugins (a) {
		var self = this;
		jQuery.each(a, function (k, p) {
			p.form = self;
		});
		this.plugins = a;
	}
}