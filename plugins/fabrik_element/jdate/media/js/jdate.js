/**
 * Date Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

//(jQuery, FbElement)

// ALL .each Replaced by .forEach. Not tested all of them yet. 
// ALL typeOf(value) === 'null' changed to value === 'null'
// TEST: 268 if (typeof(e) === 'event') {

import { Fabrik } from "@fabrik";
import { FbElement } from "@element"; 

window.FbJDateTime = class JDate extends FbElement{

	/**
	 * master date/time stored in this.cal (the js widget)
	 * upon save we get a db formatted version of this date and put it into the date field
	 * this dramitcally' simplifies storing dates (no longer have to take account of formatting rules and/or
	 * translations on the server side, as the widget has already handled it for us
	 */
	defaults = {
		'dateTimeFormat': '',
		'locale'        : 'en-GB',
		'allowedDates'  : [],
		'allowedClasses': [],
		'calendarSetup' : {
			'eventName'   : 'click',
			'ifFormat'    : '%Y/%m/%d',
			'daFormat'    : '%Y/%m/%d',
			'singleClick' : true,
			'align'       : 'Tl',
			'range'       : [1900, 2999],
			'showsTime'   : false,
			'timeFormat'  : '24',
			'electric'    : true,
			'step'        : 2,
			'cache'       : false,
			'showOthers'  : false,
			'advanced'    : false
		}
	};

	constructor (element, options) {
		super(element, options);
		this.options = options;
		this.options = { // options merges with defaults
			...this.defaults,
			...this.options
		};
		this.setPlugin('fabrikdate');
		//Locale.use(this.options.locale);
		this.hour = '0';
		this.minute = '00';
		this.buttonBg = '#ffffff';
		this.buttonBgSelected = '#88dd33';
		this.startElement = element;
		this.setUpDone = false;
		this.setUp();
	}

	setUp () {
		// Was also test on && !options.hidden but that stopped hidden elements from being saved correctly
		// @see http://fabrikar.com/forums/showthread.php?t=27992
		var self = this;
		if (this.options.editable) {
			this.watchButtons();
			if (this.options.typing === false) {
				this.disableTyping();
			} else {
				this.getDateField().addEventListener('blur', function (e) {
					var date_str = self.getDateField().value;
					if (date_str !== '') {
						var d;
						//this is the calendar native parseDate call, but it doesnt take into account seconds
						// $$$ hugh - yup, but if we don't use parseDate() with the iFormat, a simple Date.parse()
						// hoses up anything but standard 'db' format.  So we HAVE to use parseDate() here.
						if (self.options.advanced) {
							d = Date.parseExact(date_str, Date.normalizeFormat(self.options.calendarSetup.ifFormat));
						}
						else {
							d = Date.parseDate(date_str, self.options.calendarSetup.ifFormat);
						}
						//this.setTimeFromField(d);
						self.update(d);

						// need to fire this to cook off anything observing this element
						// F5: replace by this by self here ??
						Fabrik.fireEvent('fabrik.date.select', this);
						this.element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
					}
					else {
						self.options.value = '';
					}
				});
			}
			//this.makeCalendar();
			this.getDateField().onchange = function () {
				if (jQuery(event.target).data('action') === 'clear') {
					self.update('');
				}
				else {
					//this.calSelect();
				}
			};

			Fabrik.addEvent('fabrik.form.submit.failed', function (form, json) {
				// Fired when form failed after AJAX submit
				this.afterAjaxValidation();
			});

			Fabrik.addEvent('fabrik.form.page.change.end', function(form, dir) {
				// Fired when multipage form changes page
				this.afterAjaxValidation();
			});
		}

	}

	/**
	 * Once the element is attached to the form
	 */
	attachedToForm () {
		// this.parent();
		// F5: Guess they try to call attachedToForm() from FbElement
		super.attachedToForm();
	}

	/**
	 * Image to open calendar can be <img> (J2.5) or <i> (J3)
	 *
	 * @return  dom node
	 */

	getCalendarImg () {
		var i = this.element.querySelector('.calendarbutton');
		return i;
	}

	/**
	 * Get the associated JoomlaCalendar
	 *
	 * @return  JoomlaCalendar
	 */
	getJCal () {
		this.cal = JoomlaCalendar.getCalObject(this.getDateField())._joomlaCalendar;

		return this.cal;
	}

	/**
	 * Called from FbFormSubmit
	 *
	 * @params   function  cb  Callback function to run when the element is in an acceptable state for the form processing to continue
	 *
	 * @return  void
	 */
	onsubmit (cb) {
		//convert the date back into mysql format before submitting - saves all sorts of shenanigans
		//processing dates on the server.
		var v = this.getValue();
		if (v !== '') {
			// $$$ hugh - pretty sure we don't need to call update(), as getValue() is already returning
			// in MySQL format.  If we call update(), it fires a 'change' event, which puts us in an
			// infinite loop in some situations, like on a calc element update.
			// So just setting the date field to v should be enough.
			//this.update(v);
			if (this.options.editable) {
				this.getDateField().value = v;
			}
		}
		this.parent(cb);
	}

	/**
	 * As ajax validations call onsubmit to get the correct date, we need to
	 * reset the date back to the display date when the validation is complete
	 */
	afterAjaxValidation () {
		// Don't fire change events though - as we're simply resetting the date back to the correct format
		this.update(this.getValue(), []);
	}

	/**
	 * Show either the calender or time picker, when input field activated
	 *
	 * @param   DOM Node  f  Field
	 * @param   Event     e  focus/click event
	 */
	_disabledShowCalTime (f, e) {
		if (e === 'null') {
			return;
		}

		if (this.getJCal()) {
			this.cal.show();
		}
	 }

	disableTyping () {
		if (this.element === 'null') {
			console.log(element + ': not date element container - is this a custom template with a missing $element->containerClass div/li surrounding the element?');
			return;
		}
		// yes we really can set the none existant 'readonly' property of the
		// subelement container
		// and get it when checking the validations - cool or what?
		//this.element.setProperty('readonly', 'readonly');
		this.getDateField().setProperty('readonly', 'readonly');

		/*
		this.element.getElements('.fabrikinput').forEach(function (f) {
			f.addEvent('focus', function (e) {
				this._disabledShowCalTime(f, e);
			});
			f.addEvent('click', function (e) {
				this._disabledShowCalTime(f, e);
			});
		});
		 */
	}

	/**
	 * Returns the date and time in mySQL formatted string
	 */
	getValue () {
		var v;
		if (!this.options.editable) {
			return this.options.value;
		}
		this.querySelector();
		if (this.getJCal()) {
			var dateFieldValue = this.getDateField().value;
			if (dateFieldValue === '') {
				return '';
			}
			// User can press back button in which case date may already be in correct
			// format and calendar date incorrect
			var re = new RegExp('\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}');
			if (dateFieldValue.match(re) !== null) {
				return dateFieldValue;
			}

			v = this.cal.date;
		} else {
			if (this.options.value === '' || this.options.value === null ||
				this.options.value === '0000-00-00 00:00:00') {
				return '';
			}
			v = new Date.parse(this.options.value);
		}
		return v.format('db');
	}

	watchButtons () {
		var instance = JoomlaCalendar.getCalObject(this.getDateField())._joomlaCalendar;
		if (!instance) {
			JoomlaCalendar.init(JoomlaCalendar.getCalObject(this.getDateField()));
		}
	}

	addNewEventAux (action, js) {
		if (action === 'change') {
			Fabrik.addEvent('fabrik.date.select', function (w) {
				if (w.baseElementId === this.baseElementId) {
					var e = 'fabrik.date.select';
					typeof(js) === 'function' ? js.delay(0, this, this) : eval(js);
				}
			});
		}
		else {
			this.element.getElements('input').forEach(function (i) {
				i.addEventListener(action, function (e) {
//					if (typeof(e) === 'event') {
					if (e.target) {
						e.stop();
					}
					typeof(js) === 'function' ? js.delay(0, this, this) : eval(js);
				});
			});
		}
	}

	/**
	 * takes a date object or string
	 *
	 * @param   mixed  val     Date, string or date object
	 * @param   array  events  Events to fire defaults to ['change']
	 */
	update (val, events) {
		events = events ? events : ['change'];
		this.querySelector();

		if (val === 'invalid date') {
			console.log(this.element.id + ': date not updated as not valid');

			return;
		}

		var date;

		if (typeof(val) === 'string') {
			if (val === '') {
				// Yes, but we still need to clear the fields! (e.g. from reset())
				this._getSubElements().forEach(function (subEl) {
					subEl.value = '';
				});

				if (this.cal) {
					/*
					 * Can't set this.cal.date to a blank string as it expects a date object
					 * So, defaulting to todays date, not sure we can do anything else?
					 */
					this.cal.date = new Date();
				}

				if (!this.options.editable) {
					if (this.element !== 'null') {
						this.element.set('html', val);
					}
				}

				return;
			}
			else {
				/*
				 * Even though always standard format, need to use 'advanced' handling to work round a bug in
				 * the JoomlaFarsi implementation of the calendar JS which applies TZ offsets in parseDate()
				 */
				if (this.options.advanced) {
					date = Date.parseExact(val, Date.normalizeFormat('%Y-%m-%d %H:%M:%S'));
				}
				else {
					/*
					 * need to use parseDate() with a format string instead of just parse(), otherwise if advanced
					 * formats is enabled, parse() will overridden and use the "culture" specific parsing, and if
					 * language is en-GB, that will switch day and month round.
					 */
					date = Date.parseDate(val, '%Y-%m-%d %H:%M');
				}
			}
		} else {
			date = val;
		}

		var f = this.options.calendarSetup.ifFormat;

		if (events.length > 0) {
			this.fireEvents(events);
		}

		if (val === 'null' || val === false) {
			return;
		}

		if (!this.options.editable) {
			if (this.element !== 'null') {
				this.element.set('html', date.format(f));
			}

			return;
		}

		if (this.options.hidden) {
			//if hidden but form set to show time format dont split up the time as we don't
			// have a time field to put it into
			date = date.format(f);
			this.getDateField().value = date;

			return;
		} else {
			// have to reset the time element as update is called (via reset) in
			// duplicate group code
			// before cloned() method called
			this.hour = date.get('hours');
			this.minute = date.get('minutes');
			this.second = date.get('seconds');;
		}
		//this.cal.date = date;
		this.getDateField().value = date.format(this.options.calendarSetup.ifFormat);
	}

	/**
	 * get the date field input
	 */
	getDateField () {
		return this.element.querySelector('.fabrikinput');
	}

	/**
	 * Run when a button is pressed on the calendar
	 * - may not be a date though (could be 'next month' button)
	 */
	calSelect () {

		// Test the date is selectable...
		//if (calendar.dateClicked && this.dateSelect(calendar.date) !== true) {
			this.update(this.getJCal().date.format('db'));
			this.getDateField().fireEvent('change');
			Fabrik.fireEvent('fabrik.date.select', this);
		//}
	}

	cloned (c) {
		this.setUpDone = false;
		this.hour = 0;
		delete this.cal;
		var button = this.element.querySelector('button');
		if (button) {
			button.id = this.element.id + '_cal_cal_img';
		}
		var datefield = this.element.querySelector('input');
		datefield.id = this.element.id + '_cal';
		this.options.calendarSetup.inputField = datefield.id;
		this.options.calendarSetup.button = datefield.id + '_img';

		//this.makeCalendar();
		JoomlaCalendar.init(JoomlaCalendar.getCalObject(datefield));
		this.cal = this.getJCal();
		this.cal.hide();
		this.setUp();
		this.parent(c);
	}
}

/// you can add custom events with:
    /*
     * Fabrik.addEvent('fabrik.date.select', function () {
     console.log('trigger custom date event');
     })
     */
