/**
 * Birthday Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@element"; 

export class FbBirthday extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('birthday');
        this.default_sepchar = '-';
    }

    /**
     * Get focus event
     * @returns {string}
     */
    getFocusEvent() {
        return 'click';
    }

    /**
     * Get the value of the sub-elements
     * @returns {Array|string}
     */
    getValue() {
        if (!this.options.editable) {
            return this.options.value;
        }

        this.getElement(); // Ensure the element is retrieved
        return this._getSubElements().map((f) => f.value);
    }

    /**
     * Update the sub-elements with the given value
     * @param {string|Array} val
     */
    update(val) {
        let sepChar = this.options.separator || this.default_sepchar;

        if (typeof val === 'string') {
            sepChar = val.includes(this.options.separator) ? this.options.separator : this.default_sepchar;
            val = val.split(sepChar);
        }

        this._getSubElements().forEach((f, index) => {
            f.value = val[index] || '';
        });
    }

    /**
     * Retrieve sub-elements of the main element
     * @returns {Array}
     */
    _getSubElements() {
        return Array.from(this.element.querySelectorAll('select, input'));
    }
}

window.FbBirthday = FbBirthday;
