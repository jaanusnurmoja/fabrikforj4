/**
 * Date Element Filter
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

//import { Fabrik } from './fabrik.js';

export class JDateFilter {

	options = {};
	
	constructor (opts) {
		var self = this;
		this.options = opts;
		this.cals = {};
//		console.log(this.options.ids.length);
		for (var i = 0; i < this.options.ids.length; i ++) {
			this.makeCalendar(this.options.ids[i], this.options.buttons[i]);
		}
	}

	getDateField (id) {
//console.log(document.id);
         return document.getElementById(id);
	}
/*
	makeCalendar (id, button) {
    	var self = this;
		this.cals[id] = null;
		
        this.getDateField(id).onchange = function (event){
console.log(event.target.id);
console.log(id);
			if (event.target.id == id) {
console.log("get here ?");
				self.getJCal(id);
			}
		};


		return this.cals[id];
	}
*/
	makeCalendar (id, button) {
    	var self = this;
		this.cals[id] = null;

        this.getDateField(id).onchange = function (event) {
            self.calSelect(id);
        };

		return this.cals[id];
	}


	/**
	 * run when calendar poped up - goes over each date and should return true if you dont want the date to be
	 * selectable
	 */
	dateSelect (date)
	{
		return false;
	}

	calSelect(id) {
console.log(event.target);
		if (event.target.id == id) {
           this.getJCal(event.target.calendar.inputField.id);
        }
	}

    /**
     * Get the associated JoomlaCalendar
     *
     * @return  JoomlaCalendar
     */
    getJCal (id) {
console.log("JoomlaCalendar");
        this.cals[id] = JoomlaCalendar.getCalObject(this.getDateField(id))._joomlaCalendar;

        return this.cals[id];
    }


	update (calendar, date) {
		if (date) {
			if (typeof(date) === 'string') {
				date = Date.parse(date);
			}
			calendar.params.inputField.value = date.format(this.options.calendarSetup.ifFormat);
		}
	}

	onSubmit () {
    	var self = this;
		jQuery.each(this.cals, function (id, c) {
			var cal = self.getJCal(id);
			if (cal) {
                if (cal.inputField.value !== '') {
                    cal.inputField.value = cal.date.format('db');
                }
            }
		});
	}

	onUpdateData () {
    	var self = this;
		jQuery.each(this.cals, function (id, c) {
            var cal = self.getJCal(id);
			if (cal.inputField.value !== '') {
				this.update(cal, cal.date);
			}
		});
	}
}