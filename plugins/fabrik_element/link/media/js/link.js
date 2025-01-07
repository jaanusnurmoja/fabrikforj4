/**
 * Link Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElementList } from '@fbelementlist'; 

export class FbLink extends FbElementList {
    constructor(element, options) {
        super(element, options); // Call parent class constructor
        this.setPlugin('fabrikLink');
        this.subElements = this._getSubElements();
    }

    /**
     * Updates the sub-elements with the given value.
     * @param {Object|string} val - The value to update the elements with.
     */
    update(val) {
        this.getElement();
        const subs = this.element.querySelectorAll('.fabrikinput');
        if (typeof val === 'object') {
            subs[0].value = val.label || '';
            subs[1].value = val.link || '';
        } else {
            subs.forEach(sub => {
                sub.value = val || '';
            });
        }
    }

    /**
     * Gets the value of the sub-elements.
     * @returns {Array|string} The values of the sub-elements.
     */
    getValue() {
        if (!this.options.editable) {
            return this.options.value;
        }

        const subElements = this._getSubElements();
        const values = [];
        subElements.forEach(sub => {
            values.push(sub.value || '');
        });

        return values;
    }

    /**
     * Retrieves the sub-elements of the main element.
     * @returns {NodeList} A list of sub-elements.
     */
    _getSubElements() {
        return this.element.querySelectorAll('.fabrikinput');
    }
}

window.FbLink = FbLink;