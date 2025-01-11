/**
 * Date Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { Fabrik } from "@fbplgelementfabrik";
import { FbElement } from "@fbplgelementelement"; 
const { DateTime } = luxon; // Updated for global Luxon usage

/**
 * FbJDateTime Class - Extended for date manipulation using Luxon.
 */
export class FbJdatetime extends FbElement {

	/**
	 * Default options for the date element.
	 */
	defaults = {
		'locale': 'en-GB',
		'allowedDates': [],
		'allowedClasses': [],
		'calendarSetup': {
			'eventName': 'click',
			'ifFormat': "yyyy/MM/dd",
			'singleClick': true,
			'align': 'Tl',
			'range': [1900, 2999],
			'showsTime': false,
			'timeFormat': '24',
			'advanced': false
		}
	};

	/**
	 * Constructor to initialize the date element.
	 * @param {HTMLElement} element - The HTML element.
	 * @param {Object} options - Configuration options.
	 */
	constructor(element, options) {
		super(element, options);
		this.options = { ...this.defaults, ...options };
		this.setPlugin('fabrikdate');
		this.hour = '0';
		this.minute = '00';
		this.buttonBg = '#ffffff';
		this.buttonBgSelected = '#88dd33';
		this.startElement = element;
		this.setUpDone = false;
		this.setUp();
	}

	/**
	 * Sets up the element, including event listeners and typing restrictions.
	 */
	setUp() {
		if (this.options.editable) {
			this.watchButtons();
			if (!this.options.typing) {
				this.disableTyping();
			} else {
				this.getDateField().addEventListener('blur', (e) => {
					const dateStr = this.getDateField().value;
					if (dateStr) {
						let d;
						if (this.options.advanced) {
							d = DateTime.fromFormat(dateStr, this.options.calendarSetup.ifFormat, { locale: this.options.locale });
						} else {
							d = DateTime.fromISO(dateStr);
						}
						this.update(d);
						Fabrik.fireEvent('fabrik.date.select', this);
						this.element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
					} else {
						this.options.value = '';
					}
				});
			}
		}
	}

	/**
	 * Adds event listeners to buttons associated with the calendar.
	 */
	watchButtons() {
		const instance = JoomlaCalendar.getCalObject(this.getDateField())._joomlaCalendar;
		if (!instance) {
			JoomlaCalendar.init(JoomlaCalendar.getCalObject(this.getDateField()));
		}
	}

	/**
	 * Retrieves the calendar icon element.
	 * @returns {HTMLElement} The calendar button/icon.
	 */
	getCalendarImg() {
		return this.element.querySelector('.calendarbutton');
	}

	/**
	 * Gets the value in MySQL format or the saved format.
	 * @returns {string} The formatted date string.
	 */
	getValue() {
		if (!this.options.editable) {
			return this.options.value;
		}
		if (this.getJCal()) {
			const dateFieldValue = this.getDateField().value;
			if (!dateFieldValue) {
				return '';
			}
			if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(dateFieldValue)) {
				return dateFieldValue;
			}
			return this.getJCal().date.toFormat('yyyy-MM-dd HH:mm:ss');
		} else {
			if (!this.options.value || this.options.value === '0000-00-00 00:00:00') {
				return '';
			}
			return DateTime.fromISO(this.options.value).toFormat('yyyy-MM-dd HH:mm:ss');
		}
	}

	/**
	 * Updates the date field with a new value.
	 * @param {string|DateTime} val - The new date value.
	 * @param {Array} [events=['change']] - Events to trigger after updating.
	 */
	update(val, events = ['change']) {
		if (val === 'invalid date') {
			console.log(`${this.element.id}: date not updated as not valid`);
			return;
		}

		let date;
		if (typeof val === 'string') {
			if (val === '') {
				this._getSubElements().forEach((subEl) => {
					subEl.value = '';
				});
				if (this.cal) {
					this.cal.date = DateTime.local();
				}
				if (!this.options.editable && this.element) {
					this.element.innerHTML = val;
				}
				return;
			}
			if (this.options.advanced) {
				date = DateTime.fromFormat(val, 'yyyy-MM-dd HH:mm:ss', { locale: this.options.locale });
			} else {
				date = DateTime.fromISO(val);
			}
		} else {
			date = val;
		}

		if (!this.options.editable) {
			if (this.element) {
				this.element.innerHTML = date.toFormat(this.options.calendarSetup.ifFormat);
			}
			return;
		}

		this.getDateField().value = date.toFormat(this.options.calendarSetup.ifFormat);
		this.fireEvents(events);
	}

	/**
	 * Gets the input field associated with the date.
	 * @returns {HTMLElement} The date input field.
	 */
	getDateField() {
		return this.element.querySelector('.fabrikinput');
	}

	/**
	 * Handles cloning of the element for repeatable fields.
	 * @param {Object} c - Cloning options.
	 */
	cloned(c) {
		this.setUpDone = false;
		this.hour = 0;
		delete this.cal;
		const button = this.element.querySelector('button');
		if (button) {
			button.id = `${this.element.id}_cal_cal_img`;
		}
		const dateField = this.element.querySelector('input');
		dateField.id = `${this.element.id}_cal`;
		this.options.calendarSetup.inputField = dateField.id;
		this.options.calendarSetup.button = `${dateField.id}_img`;
		this.cal = this.getJCal();
		this.cal.hide();
		this.setUp();
		super.cloned(c);
	}
}

/**
 * Global registration for legacy usage.
 */
window.FbJdatetime = FbJdatetime;
