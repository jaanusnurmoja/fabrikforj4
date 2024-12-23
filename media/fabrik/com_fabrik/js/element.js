/**
 * Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { Fabrik } from '@fabrik';

// Replaced typeOf by typeof => 
// TODO: typeof is different (almost everything is an object): change code
// ALL if (typeof(value) === 'null') => changed to (value === 'null')
// TEST 188: if (typeof(this.subElements) === 'array' || typeof(this.subElements) === 'elements')
// removed (comment out) all Fabrik.loader
	
export class FbElement {

	defaults = {
		element    : null,
		defaultVal : '',
		value      : '',
		label      : '',
		editable   : false,
		isJoin     : false,
		joinId     : 0,
		changeEvent: 'change',
		hasAjaxValidation: false
	};

	/**
	 * Ini the element
	 *
	 * @return  bool  false if document.getElementById(this.options.element) not found
	 */

	constructor (element, options) {

		var self = this;
		this.strElement = element;
		this.options = options;
		this.options = { // options merges with defaults
			...this.defaults,
			...this.options
		};
		this.options.element = element;

		// Initialize Bootstrap tooltips
		var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
		var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
			return new bootstrap.Tooltip(tooltipTriggerEl)
		});

		this.setPlugin('');
		this.loadEvents = []; // need to store these for use if the form is reset
		this.events = new Map(); // was changeEvents
		//this.setOptions(options);
		// If this element is a 'chosen' select, we need to relay the change event
		if (this.options.advanced) {
			document.getElementById(this.options.element).addEventListener('change', (event) => {
				const changeEvent = new CustomEvent(this.getChangeEvent(), {
					detail: { originalEvent: event },
					bubbles: true,
					cancelable: true
				});
				event.target.dispatchEvent(changeEvent);
			});
		}

		// In ajax pop up form. Close the validation tip message when we focus in the element
		Fabrik.on('fabrik.form.element.added', function (form, elId, el) {
			if (el === self) {
				self.addNewEvent(self.getFocusEvent(), function () {
					self.removeTipMsg();
				});
			}
		});

		return this.setElement();
	}

	/**
	 * Called when form closed in ajax window
	 * Should remove any events added to Window or Fabrik
	 */
	destroy () {

	}

	setPlugin (plugin) {
		if (this.plugin === 'null' || this.plugin === '') {
			this.plugin = plugin;
		}
	}

	getPlugin () {
		return this.plugin;
	}

	setElement () {
		if (document.getElementById(this.options.element)) {
			this.element = document.getElementById(this.options.element);
			this.setorigId();
			return true;
		}
		return false;
	}

	get (v) {
		if (v === 'value') {
			return this.getValue();
		}
	}

	/**
	 * Sets the element key used in Fabrik.blocks.form_X.formElements
	 * Overwritten by any element which performs a n-n join (multi ajax fileuploads, dbjoins as checkboxes)
	 *
	 * @since   3.0.7
	 *
	 * @return  string
	 */
	getFormElementsKey (elId) {
		this.baseElementId = elId;
		return elId;
	}

	attachedToForm () {
		this.setElement();
		// if (Fabrik.bootstrapped) { // F5: don't check on bootstrap
		// this.alertImage = new Element('i.' + this.form.options.images.alert); // Illegal constructor, use document.createElement
		// this.successImage = new Element('i.icon-checkmark', {'styles': {'color': 'green'}});
		this.alertImage = document.createElement('i');
		this.alertImage.setAttribute('class', this.form.options.images.alert); // Need to test
		this.successImage = document.createElement('i');
		this.successImage.setAttribute('class', 'icon-checkmark');
		this.successImage.setAttribute('style', 'color: green');

		// if (jQuery(this.form.options.images.ajax_loader).data('isicon')) {
		if (this.form.options.images.ajax_loader) {
			this.loadingImage = document.createElement('span');
			this.loadingImage.innerHTML = this.form.options.images.ajax_loader;
		}
		// else {
		// asset is a mootools function: Preloads an image and returns the img element.
		// this.loadingImage = new Asset.image(this.form.options.images.ajax_loader);
		//}

		this.form.addMustValidate(this);
		//put ini code in here that can't be put in initialize()
		// generally any code that needs to refer to  this.form, which
		//is only set when the element is assigned to the form.
	}

	/**
	 * Allows you to fire an array of events to element /  sub elements, used in calendar
	 * to trigger js events when the calendar closes
	 * @param {array} evnts
	 */
	fireEvents (evnts) {
		if (this.hasSubElements()) {
			this._getSubElements().forEach(function (el) {
				Array.from(evnts).forEach(function (e) {
					el.dispatchEvent(new Event(e));
				});
			});
		} else {
			Array.from(evnts).forEach(function (e) {
				if (this.element) {
					this.element.dispatchEvent(new Event(e));
				}
			});
		}
	}

	getElement () {
		//use this in mocha forms whose elements (such as database joins) aren't loaded
		//when the class is ini'd
		if (this.element === 'null') {
			this.element = document.getElementById(this.options.element);
		}
		return this.element;
	}

	/**
	 * Used for elements like checkboxes or radio buttons
	 * @returns [DomNodes]
	 * @private
	 */
	_getSubElements () {
		var element = this.getElement();
		if (element === 'null') {
			return false;
		}
		this.subElements = element.querySelectorAll('.fabrikinput');
		return this.subElements;
	}

	hasSubElements () {
		this._getSubElements();
		// if (typeof(this.subElements) === 'array' || typeof(this.subElements) === 'elements') {
		if (Array.isArray(this.subElements) || this.subElements.length) {
			return this.subElements.length > 0 ? true : false;
		}
		return false;
	}

	unclonableProperties () {
		return ['form'];
	}

	/**
	 * Set names/ids/elements etc. when the elements group is cloned
	 *
	 * @param   int  id  element id
	 * @since   3.0.7
	 */
	cloneUpdateIds (id) {
		this.element = document.getElementById(id);
		this.options.element = id;
	}

	runLoadEvent (js, delay) {
		delay = delay ? delay : 0;
		//should use eval and not Browser.exec to maintain reference to 'this'
		if (typeof(js) === 'function') {
			setTimeout(js, delay);
		} else {
			if (delay === 0) {
				eval(js);
			} else {
				setTimeout(function () {
					console.log('delayed calling runLoadEvent for ' + delay);
					eval(js);
				}, delay);
			}
		}
	}

	/**
	 * called from list when ajax form closed
	 * fileupload needs to remove its onSubmit event
	 * otherwise 2nd form submission will use first forms event
	 */
	removeCustomEvents () {
	}

	/**
	 * Was renewChangeEvents() but don't see why change events should be treated
	 * differently to other events?
	 *
	 * @since 3.0.7
	 */
	renewEvents () {
		this.events.forEach(function (fns, type) {
			this.element.removeEventListener(type);
			fns.forEach(function (js) {
				this.addNewEventAux(type, js);
			});
		});
	}

	addNewEventAux (action, js) {
		this.element.addEventListener(action, function (e) {
			// Don't stop event - means fx's onchange events wouldn't fire.
			typeof(js) === 'function' ? js(e) : eval(js);
		});
	}

	/**
	 * Add a JS event to the element
	 * @param {string} action
	 * @param {string|function} js
	 */
	addNewEvent (action, js) {
		if (action === 'load') {
			this.loadEvents.push(js);
			this.runLoadEvent(js);
		} else {
			if (!this.element) {
				this.element = document.getElementById(this.strElement);
			}
			if (this.element) {
				if (!Object.keys(this.events).includes(action)) {
					this.events[action] = [];
				}
				this.events[action].push(js);
				this.addNewEventAux(action, js);
			}
		}
	}

	// Alias to addNewEvent.
	addEvent (action, js) {
		this.addNewEvent(action, js);
	}

	validate () {
	}

	/**
	 * Add AJAX validation trigger, called from form model setup or when cloned
	 */
	addAjaxValidationAux () {
		var self = this;
		// the hasAjaxValidation flag is only set during setup
		if (this.element && this.options.hasAjaxValidation) {
			if (this.element.classList.contains('fabrikSubElementContainer')) {
				// check for things like radio buttons & checkboxes
				this.element.querySelectorAll('.fabrikinput').forEach(function (input) {
					input.addEventListener(self.getChangeEvent(), function (e) {
						self.form.doElementValidation(e, true);
					});
				});
				return;
			}
			this.element.addEventListener(this.getChangeEvent(), function (e) {
				self.form.doElementValidation(e, false);
			});
		}
	}

	/**
	 * Add AJAX validation trigger, called from form model
	 */
	addAjaxValidation () {
		var self = this;
		if (!this.element) {
			this.element = document.getElementById(this.strElement);
		}
		if (this.element) {
			// set our hasAjaxValidation flag and do the actual event add
			this.options.hasAjaxValidation = true;
			this.addAjaxValidationAux();
		}
	}

	//store new options created by user in hidden field
	addNewOption (val, label) {
		var a;
		var added = document.getElementById(this.options.element + '_additions').value;
		var json = {'val': val, 'label': label};
		if (added !== '') {
			a = JSON.parse(added);
		} else {
			a = [];
		}
		a.push(json);
		var s = '[';
		for (var i = 0; i < a.length; i++) {
			s += JSON.stringify(a[i]) + ',';
		}
		s = s.substring(0, s.length - 1) + ']';
		document.getElementById(this.options.element + '_additions').value = s;
	}

	getLabel () {
		return this.options.label;
	}

	/**
	 * Set the label (uses textContent attribute, prolly won't work on IE < 9)
	 *
	 * @param {string} label
	 */
	setLabel (label) {
		this.options.label = label;
		var c = this.getLabelElement();
		if (c) {
			c[0].textContent = label;
		}
	}

	//below functions can override in plugin element classes

	update (val) {
		//have to call getElement() - otherwise inline editor doesn't work when editing 2nd row of data.
		if (this.getElement()) {
			if (this.options.editable) {
				this.element.value = val;
			} else {
				this.element.innerHTML = val;
			}
		}
	}

	/**
	 * $$$ hugh - testing something for join elements, where in some corner cases,
	 * like reverse Geocoding in the map element, we need to update elements that might be
	 * joins, and all we have is the label (like "Austria" for country).  So am overriding this
	 * new function in the join element, with code that finds the first occurrence of the label,
	 * and sets the value accordingly.  But all we need to do here is make it a wrapper for update().
	 */
	updateByLabel (label) {
		this.update(label);
	}

	// Alias to update()
	set (val) {
		this.update(val);
	}

	getValue () {
		if (this.element) {
			if (this.options.editable) {
				return this.element.value;
			} else {
				return this.options.value;
			}
		}
		return false;
	}

	reset () {
		if (this.options.editable === true) {
			this.update(this.options.defaultVal);
		}
		this.resetEvents();
	}

	resetEvents () {
		this.loadEvents.forEach(function (js) {
			this.runLoadEvent(js, 100);
		});
	}

	clear () {
		this.update('');
	}

	/**
	 * Called from FbFormSubmit
	 *
	 * @params   function  cb  Callback function to run when the element is in an
	 *                         acceptable state for the form processing to continue
	 *                         Should use cb(true) to allow for the form submission,
	 *                         cb(false) stops the form submission.
	 *
	 * @return  void
	 */
	onsubmit (cb) {
		if (cb) {
			cb(true);
		}
	}

	/**
	 * As ajax validations call onsubmit to get the correct date, we need to
	 * reset the date back to the display date when the validation is complete
	 */
	afterAjaxValidation () {

	}

	/**
	 * Called before an AJAX validation is triggered, in case an element wants to abort it,
	 * for example date element with time picker
	 */
	shouldAjaxValidate () {
		return true;
	}

	/**
	 * Run when the element is cloned in a repeat group
	 */
	cloned (c) {
		this.renewEvents();
		this.resetEvents();
		this.addAjaxValidationAux();
		var changeEvent = this.getChangeEvent();
		// Replace all this with choices.js
		if (this.element.classList.contains('chosen-done')) {
			this.element.classList.remove('chosen-done');
			this.element.classList.add('chosen-select');
			this.element.closest('.chosen-container').destroy();
			jQuery('#' + this.element.id).chosen();  
			jQuery(this.element).addClass('chosen-done'); 
		}
		// jQuery('#' + this.options.element).on('change', {changeEvent: changeEvent}, function (event) {
		this.element.addEventListener('change', function (event) {
			document.getElementById(this.id).dispatchEvent(new CustomEvent(event.data.changeEvent, {
				detail: { originalEvent: event },
				bubbles: true,
				cancelable: true
			}));
		});
	}

	/**
	 * Run when the element is de-cloned from the form as part of a deleted repeat group
	 */
	decloned (groupid) {
		this.form.removeMustValidate(this);
	}

	/**
	 * get the wrapper dom element that contains all of the elements dom objects
	 */
	getContainer () {
		var c = this.element.closest('.fabrikElementContainer');
		if (c === null) {
			c = false;
		}
		return this.element === 'null' ? false : c;
	}

	/**
	 * get the dom element which shows the error messages
	 */
	getErrorElement () {
		return this.getContainer().querySelector('.fabrikErrorMessage');
	}

	/**
	 * get the dom element which contains the label
	 */
	getLabelElement () {
		return this.getContainer().querySelector('.fabrikLabel');
	}

	/**
	 * Get all tips attached to the element
	 *
	 * @return {Array} An array of tip elements
	 */
	tips() {
	    const self = this;

	    // Filter through all elements that match the tip's container or its parent
	    const tips = Array.from(Fabrik.tips.elements || []).filter((tip) => {
	        const container = self.getContainer();
	        return tip === container || tip.parentNode === container;
	    });

	    return tips;
	}

	/**
	 * In 3.1 show error messages in tips - avoids jumpy pages with ajax validations
	 */
	addTipMsg (msg, klass) {
		// Append notice to tip
		klass = klass ? klass : 'error';
		var ul, a, d, li, html, t = this.tips();
		if (t.length === 0) {
			return;
		}
		t = t[0];

		if (t.getAttribute(klass) === null) {
			t.setAttribute(klass, msg);
			a = this._tipContent(t, false);

			d = document.createElement('div');
			d.innerHTML = a.innerHTML;
			li = document.createElement('li');
			li.classList.add(klass);
			li.innerHTML = msg;
			document.createElement('i').classList.add(this.form.options.images.alert).prependTo(li);

			// Only append the message once (was duplicating on multi-page forms)
			if (!d.innerHTML.includes(msg)) {
				d.querySelector('ul').appendChild(li);
			}
			html = decodeURIComponent(d.innerHTML);

			if (!t.dataset.fabrikTipOrig) {
				t.dataset.fabrikTipOrig = a.innerHTML;
			}

			this._recreateTip(t, html);
		}
		try {
			t.dataset.popover.show();
		} catch (e) {
			t.popover('show');
		}
	}

	/**
	 * Recreate the popover tip with html
	 * @param {Element} t
	 * @param {string} html
	 * @private
	 */
	_recreateTip (t, html) {
		try {
			t.dataset.content = html;
			t.dataset.popover.setContent();
			t.dataset.popover.options.content = html;
		} catch (e) {
			// Try Bootstrap 3
			t.setAttribute('data-bs-content', html);
			t.popover('show');
		}
	}

	/**
	 * Get tip content
	 * @param {HTMLElement} t
	 * @param {boolean} getOrig
	 * @returns {HTMLElement}
	 * @private
	 */
	_tipContent(t, getOrig) {
	    let contentElement;
	    try {
	        if (t.dataset.popover) {
	            t.dataset.popover.show();
	            contentElement = t.dataset.popover.tip.querySelector('.popover-content');
	        }
	    } catch (err) {
	        const contentHTML = getOrig ? t.dataset.fabrikTipOrig : t.dataset.content;
	        contentElement = document.createElement('div');
	        contentElement.innerHTML = contentHTML || '';
	    }
	    return contentElement;
	}

	/**
	 * In 3.1 show/hide error messages in tips - avoids jumpy pages with ajax validations
	 */
	removeTipMsg() {
	    const klass = 'error';
	    const t = this.tips();
	    if (t.length > 0) {
	        const tipElement = t[0];
	        if (tipElement.getAttribute(klass)) {
	            const contentElement = this._tipContent(tipElement, true);
	            this._recreateTip(tipElement, contentElement.innerHTML);
	            tipElement.removeAttribute(klass);

	            try {
	                if (tipElement.dataset.popover) {
	                    tipElement.dataset.popover.hide();
	                }
	            } catch (e) {
	                tipElement.popover('hide');
	            }
	        }
	    }
	}

	/**
	 * Move the tip using its position top and left properties.
	 * Used when inside a modal form that scrolls vertically or when the modal is moved,
	 * ensuring the tip stays attached to the triggering element.
	 * 
	 * @param {number} top - Vertical position offset.
	 * @param {number} left - Horizontal position offset.
	 */
	moveTip(top, left) {
	    const tips = this.tips();

	    if (tips.length > 0) {
	        const tipElement = tips[0];
	        const popover = tipElement.dataset.popover;

	        if (popover) {
	            const tip = popover.$tip || null;

	            if (tip) {
	                let origPos = tip.dataset.origPos;

	                if (!origPos) {
	                    origPos = {
	                        top: parseInt(tip.style.top, 10) + top,
	                        left: parseInt(tip.style.left, 10) + left
	                    };
	                    tip.dataset.origPos = JSON.stringify(origPos);
	                }

	                const origPosParsed = JSON.parse(origPos);
	                tip.style.top = `${origPosParsed.top - top}px`;
	                tip.style.left = `${origPosParsed.left - left}px`;
	            }
	        }
	    }
	}

	/**
	 * Set the failed validation message
	 * @param {string} msg - The error message to display.
	 * @param {string} classname - The CSS class to apply for the message.
	 */
	setErrorMessage(msg, classname) {
	    const classes = ['fabrikValidating', 'fabrikError', 'fabrikSuccess'];
	    const container = this.getContainer();

	    if (!container) {
	        console.log(`Notice: could not set error message for "${msg}" - no container class found`);
	        return;
	    }

	    // Remove and add appropriate class based on classname
	    classes.forEach((cls) => {
	        if (classname === cls) {
	            container.classList.add(cls);
	        } else {
	            container.classList.remove(cls);
	        }
	    });

	    // Clear existing error messages
	    const errorElements = this.getErrorElement();
	    errorElements.forEach((errorElement) => {
	        errorElement.innerHTML = ''; // Empties the content of the error element
	    });

	    // Handle specific cases for different classnames
	    switch (classname) {
			case 'fabrikError':
			    if (this.tips().length > 0) {
			        this.addTipMsg(msg);
			    } else {
			        // Create a link for the error message
			        const a = document.createElement('a');
			        a.href = '#';
			        a.className = 'text-danger';

			        // Extract text content from `msg` if it's an element
			        const rawMsg = typeof msg === 'string' ? msg : msg.textContent || msg.innerText;
			        a.textContent = rawMsg;

			        // Add a click handler to prevent default behavior
			        a.addEventListener('click', (e) => e.preventDefault());

			        // Add alert icon
			        const alertIcon = document.createElement('i');
			        alertIcon.className = this.form.options.images.alert;
			        a.prepend(alertIcon);

			        // Append the link to the first error element
			        if (errorElements[0]) {
			            errorElements[0].appendChild(a);
			        }

			        // Attach tips to the newly created link
			        Fabrik.tips.attach(a);
			    }

			    // Update container and element classes
			    container.classList.add('has-error');
			    container.classList.remove('has-success');
			    this.element.classList.add('is-invalid');
			    this.element.classList.remove('is-valid');
			    break;

	        case 'fabrikSuccess':
	            container.classList.add('has-success');
	            container.classList.remove('has-error');
	            this.element.classList.add('is-valid');
	            this.element.classList.remove('is-invalid');
	            this.removeTipMsg();
	            break;
	        case 'fabrikValidating':
	            container.classList.add('info');
	            container.classList.remove('success', 'error');

	            // Add a loading image or message (if required)
	            if (errorElements[0]) {
	                const validatingMessage = document.createElement('span');
	                validatingMessage.className = 'fabrikValidatingMessage';
	                validatingMessage.textContent = msg || 'Validating...';
	                errorElements[0].appendChild(validatingMessage);
	            }
	            break;
	    }
	    this.getErrorElement().forEach((errorElement) => {
	        errorElement.classList.remove('fabrikHide');
	    });

	    const parent = this.form;
	    if (classname === 'fabrikError' || classname === 'fabrikSuccess') {
	        parent.updateMainError();
	    }
	}

	/**
	 * Set the original ID of the element
	 */
	setorigId() {
	    if (this.options.inRepeatGroup) {
	        const e = this.options.element;
	        this.origId = e.substring(0, e.length - 1 - this.options.repeatCounter.toString().length);
	    }
	}

	/**
	 * Update repeat group numbering when decreasing
	 * @param {int} delIndex
	 * @returns {string|boolean}
	 */
	decreaseName(delIndex) {
	    const element = this.getElement();
	    if (!element) return false;

	    if (this.hasSubElements()) {
	        this._getSubElements().forEach((e) => {
	            e.name = this._decreaseName(e.name, delIndex);
	            e.id = this._decreaseId(e.id, delIndex);
	        });
	    } else if (this.element.name !== null) {
	        this.element.name = this._decreaseName(this.element.name, delIndex);
	    }

	    if (this.element.id !== null) {
	        this.element.id = this._decreaseId(this.element.id, delIndex);
	    }

	    if (this.options.repeatCounter > delIndex) {
	        this.options.repeatCounter--;
	    }

	    return this.element.id;
	}

	/**
	 * Helper function to decrease IDs
	 * @param {string} id
	 * @param {int} delIndex
	 * @param {string} [suffix]
	 * @returns {string}
	 */
	_decreaseId(id, delIndex, suffix = '') {
	    if (suffix && id.includes(suffix)) {
	        id = id.replace(suffix, '');
	    }
	    const bits = id.split('_');
	    const last = parseInt(bits.pop(), 10);
	    if (!isNaN(last) && last > delIndex) {
	        bits.push(last - 1);
	    } else {
	        bits.push(last);
	    }
	    this.options.element = bits.join('_') + suffix;
	    return this.options.element;
	}

	/**
	 * Helper function to decrease names
	 * @param {string} name
	 * @param {int} delIndex
	 * @param {string} [suffix]
	 * @returns {string}
	 */
	_decreaseName(name, delIndex, suffix = '') {
	    if (suffix && name.includes(suffix)) {
	        name = name.replace(suffix, '');
	    }
	    const parts = name.split('[');
	    const index = parseInt(parts[1].replace(']', ''), 10);
	    if (!isNaN(index) && index > delIndex) {
	        parts[1] = `${index - 1}]`;
	    }
	    this.options.element = parts.join('[') + suffix;
	    return this.options.element;
	}

	/**
	 * Update the container's repeat number.
	 * Modifies the CSS class of the container to reflect the new repeat number.
	 * 
	 * @param {int} oldRepeatCount - The previous repeat count.
	 * @param {int} newRepeatCount - The new repeat count.
	 */
	setContainerRepeatNum(oldRepeatCount, newRepeatCount) {
	    const container = this.getContainer();
	    if (container) {
	        // Remove the old repeat class
	        container.classList.remove(`fb_el_${this.origId}_${oldRepeatCount}`);

	        // Add the new repeat class
	        container.classList.add(`fb_el_${this.origId}_${newRepeatCount}`);
	    }
	}
	/**
	 * Set names/ids/elements when the elements group is cloned
	 * @param {int} repeatCount
	 * @returns {string|boolean}
	 */
	setName(repeatCount) {
	    const element = this.getElement();
	    if (!element) return false;

	    if (this.hasSubElements()) {
	        this._getSubElements().forEach((e) => {
	            e.name = this._setName(e.name, repeatCount);
	            e.id = this._setId(e.id, repeatCount);
	        });
	    } else if (this.element.name !== null) {
	        this.element.name = this._setName(this.element.name, repeatCount);
	    }

	    if (this.element.id !== null) {
	        this.element.id = this._setId(this.element.id, repeatCount);
	    }

	    // Update the container's repeat number
	    this.setContainerRepeatNum(this.options.repeatCounter, repeatCount);

	    // Update the internal repeat counter
	    this.options.repeatCounter = repeatCount;
	    return this.element.id;
	}

	/**
	 * Helper function to set IDs
	 * @param {string} id
	 * @param {int} repeatCount
	 * @param {string} [suffix]
	 * @returns {string}
	 */
	_setId(id, repeatCount, suffix = '') {
	    if (suffix && id.includes(suffix)) {
	        id = id.replace(suffix, '');
	    }
	    const bits = id.split('_');
	    bits[bits.length - 1] = repeatCount;
	    this.options.element = bits.join('_') + suffix;
	    return this.options.element;
	}

	/**
	 * Helper function to set names
	 * @param {string} name
	 * @param {int} repeatCount
	 * @param {string} [suffix]
	 * @returns {string}
	 */
	_setName(name, repeatCount, suffix = '') {
	    if (suffix && name.includes(suffix)) {
	        name = name.replace(suffix, '');
	    }
	    const parts = name.split('[');
	    parts[1] = `${repeatCount}]`;
	    return parts.join('[') + suffix;
	}

	/**
	 * Determine which duplicated instance of the repeat group the element belongs to.
	 * Returns false if not in a repeat group; otherwise, an integer.
	 * 
	 * @returns {number|boolean} - The repeat group number or false if not in a repeat group.
	 */
	getRepeatNum() {
	    if (this.options.inRepeatGroup === false) {
	        return false;
	    }
	    const idParts = this.element.id.split('_');
	    const lastPart = idParts[idParts.length - 1];
	    return isNaN(parseInt(lastPart, 10)) ? false : parseInt(lastPart, 10);
	}

	/**
	 * Get the blur event.
	 * For select elements, it returns 'change'; otherwise, 'blur'.
	 * 
	 * @returns {string} - The event name.
	 */
	getBlurEvent() {
	    return this.element.tagName === 'SELECT' ? 'change' : 'blur';
	}

	/**
	 * Get the focus event.
	 * For select elements, it returns 'click'; otherwise, 'focus'.
	 * 
	 * @returns {string} - The event name.
	 */
	getFocusEvent() {
	    return this.element.tagName === 'SELECT' ? 'click' : 'focus';
	}

	/**
	 * Get the change event type.
	 * 
	 * @returns {string} - The change event type.
	 */
	getChangeEvent() {
	    return this.options.changeEvent;
	}

	/**
	 * Select the element.
	 */
	select() {
	    if (this.element) {
	        this.element.select();
	    }
	}

	/**
	 * Focus on the element and remove any tip messages.
	 */
	focus() {
	    if (this.element) {
	        this.element.focus();
	        this.removeTipMsg();
	    }
	}

	/**
	 * Hide the element container.
	 */
	hide() {
	    const container = this.getContainer();
	    if (container) {
	        container.style.display = 'none';
	        container.classList.add('fabrikHide');
	    }
	}

	/**
	 * Show the element container.
	 */
	show() {
	    const container = this.getContainer();
	    if (container) {
	        container.style.display = '';
	        container.classList.remove('fabrikHide');
	    }
	}

	/**
	 * Toggle the visibility of the element container.
	 */
	toggle() {
	    const container = this.getContainer();
	    if (container) {
	        const isHidden = container.style.display === 'none';
	        container.style.display = isHidden ? '' : 'none';
	        container.classList.toggle('fabrikHide', isHidden);
	    }
	}

	/**
	 * Get the name used for cloned elements.
	 * WYSIWYG text editors may override this to return a specific name.
	 * 
	 * @returns {string} - The name of the cloned element.
	 */
	getCloneName() {
	    return this.options.element;
	}

	/**
	 * Redraw the element, typically used when elements are in a hidden tab.
	 * Ensures proper rendering after tab changes or other layout adjustments.
	 */
	doTab(event) {
	    setTimeout(() => {
	        this.redraw();
	    }, 500);
	}

	/**
	 * Get the parent tab element for this element, if it exists.
	 * 
	 * @param {HTMLElement} tabDiv - The tab container element.
	 * @returns {HTMLElement|false} - The tab element or false if not found.
	 */
	getTab(tabDiv) {
	    const anchor = document.querySelector(`a[href$="#${tabDiv.id}"]`);
	    return anchor ? anchor.closest('[data-role=fabrik_tab]') : false;
	}

	/**
	 * Get the tab container element for this element.
	 * 
	 * @returns {HTMLElement|false} - The tab container or false if not found.
	 */
	getTabDiv() {
	    const tabDiv = this.element.closest('.tab-pane');
	    return tabDiv || false;
	}

	/**
	 * Watch for tab changes to redraw elements when necessary.
	 */
	watchTab() {
	    const tabDiv = this.getTabDiv();
	    if (tabDiv) {
	        const anchor = document.querySelector(`a[href$="#${tabDiv.id}"]`);
	        if (anchor) {
	            anchor.addEventListener('click', (event) => {
	                this.doTab(event);
	            });
	        }
	    }
	}

	/**
	 * Determines whether to use raw data or HTML for updates.
	 * Typically used for CDD or DB join elements.
	 * 
	 * @returns {boolean} - True if raw data should be used; false otherwise.
	 */
	updateUsingRaw() {
	    return false;
	}
}