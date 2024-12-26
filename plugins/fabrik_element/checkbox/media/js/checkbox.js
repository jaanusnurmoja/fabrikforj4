/**
 * Checkbox Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElementList } from '@fbelementlist';

export class FbCheckBox extends FbElementList {
    constructor(element, options) {
        super(element, options);
        this.type = 'checkbox'; // Sub element type
        this.setPlugin('fabrikcheckbox');
        this._getSubElements();
    }

    watchAddToggle() {
        const container = this.getContainer();
        let addOptionDiv = container.querySelector('div.addoption');
        const toggleButton = container.querySelector('.toggle-addoption');

        if (this.mySlider) {
            const clone = addOptionDiv.cloneNode(true);
            const fabrikElement = container.querySelector('.fabrikElement');
            addOptionDiv.parentNode.remove();
            fabrikElement.appendChild(clone);
            addOptionDiv = container.querySelector('div.addoption');
            addOptionDiv.style.margin = '0';
        }

        this.mySlider = {
            toggle: () => {
                if (addOptionDiv.style.display === 'none' || !addOptionDiv.style.display) {
                    addOptionDiv.style.display = 'block';
                } else {
                    addOptionDiv.style.display = 'none';
                }
            },
        };

        addOptionDiv.style.display = 'none';

        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.mySlider.toggle();
        });
    }

    getValue() {
        if (!this.options.editable) {
            return this.options.value;
        }

        const values = [];
        this._getSubElements().forEach((element) => {
            if (element.checked) {
                values.push(element.value);
            }
        });

        return values;
    }

    numChecked() {
        return this._getSubElements().filter((element) => element.checked).length;
    }

    update(val) {
        this.getElement();

        if (typeof val === 'string') {
            val = val === '' ? [] : JSON.parse(val);
        }

        if (!this.options.editable) {
            this.element.innerHTML = '';
            if (val === '') {
                return;
            }
            val.forEach((v) => {
                this.element.innerHTML += `${this.options.data[v]}<br />`;
            });
            return;
        }

        this._getSubElements().forEach((element) => {
            element.checked = val.includes(element.value);
        });
    }

    cloned(c) {
        if (this.options.allowadd === true && this.options.editable !== false) {
            this.watchAddToggle();
            this.watchAdd();
        }

        this._getSubElements().forEach((subElement, index) => {
            subElement.id = `${this.options.element}__${index}_input_${index}`;
            const label = subElement.closest('label');
            if (label) {
                label.htmlFor = subElement.id;
            }
        });

        super.cloned(c);
    }
}

window.FbCheckBox = FbCheckBox;
