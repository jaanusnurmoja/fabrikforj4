/**
 * Fabrik Dropdown Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from '@fbelement';

export class FbDropdown extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('fabrikdropdown');

        if (this.options.allowadd === true && this.options.editable !== false) {
            this.watchAddToggle();
            this.watchAdd();
        }
    }

    watchAddToggle() {
        const container = this.getContainer();
        let addOptionDiv = container.querySelector('div.addoption');

        const toggleButton = container.querySelector('.toggle-addoption');

        if (this.mySlider) {
            // Remove old slider HTML in repeating group
            const clone = addOptionDiv.cloneNode(true);
            const fabrikElement = container.querySelector('.fabrikElement');
            addOptionDiv.parentNode.remove();
            fabrikElement.appendChild(clone);
            addOptionDiv = container.querySelector('div.addoption');

            const additionsInput = addOptionDiv.querySelector('input[name*=_additions]');
            additionsInput.id = `${this.element.id}_additions`;
            additionsInput.name = `${this.element.id}_additions`;
        }

        addOptionDiv.style.display = 'none'; // Start hidden
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            addOptionDiv.style.display = addOptionDiv.style.display === 'none' ? 'block' : 'none';
        });
    }

    addClick(e) {
        const container = this.getContainer();
        const labelInput = container.querySelector('input[name=addPicklistLabel]');
        const valueInput = container.querySelector('input[name=addPicklistValue]');
        const label = labelInput.value;
        const value = valueInput ? valueInput.value : label;

        if (value === '' || label === '') {
            alert('Please enter a value and a label.');
            return;
        }

        const option = document.createElement('option');
        option.selected = true;
        option.value = value;
        option.textContent = label;
        this.element.appendChild(option);

        e.preventDefault();

        if (valueInput) {
            valueInput.value = '';
        }
        labelInput.value = '';

        this.addNewOption(value, label);

        // Dispatch a change event
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        this.element.dispatchEvent(changeEvent);

        const addOptionDiv = container.querySelector('div.addoption');
        if (addOptionDiv.style.display !== 'none') {
            addOptionDiv.style.display = 'none';
        }
    }

    watchAdd() {
        if (this.options.allowadd === true && this.options.editable !== false) {
            const container = this.getContainer();
            const addButton = container.querySelector('input[type=button]');
            addButton.removeEventListener('click', this.addClickEvent); // Remove old listener
            this.addClickEvent = this.addClick.bind(this);
            addButton.addEventListener('click', this.addClickEvent);
        }
    }

    getValue() {
        if (!this.options.editable) {
            return this.options.multiple ? this.options.value : this.options.value[0];
        }

        if (!this.element.value) {
            return '';
        }

        if (this.options.multiple) {
            return Array.from(this.element.options)
                .filter(option => option.selected)
                .map(option => option.value);
        }

        return this.element.value;
    }

    reset() {
        this.update(this.options.defaultVal);
    }

    update(val) {
        if (typeof val === 'string' && val === '') {
            val = [];
        }

        if (typeof val === 'string' && val.startsWith('[')) {
            val = JSON.parse(val);
        }

        if (!val) {
            val = [];
        }

        if (!this.options.editable) {
            this.element.innerHTML = '';
            val.forEach(v => {
                this.element.innerHTML += `${this.options.data[v]}<br />`;
            });
            return;
        }

        Array.from(this.element.options).forEach(option => {
            option.selected = val.includes(option.value);
        });
    }

    cloned(c) {
        if (this.options.allowadd === true && this.options.editable !== false) {
            this.watchAddToggle();
            this.watchAdd();
        }
        super.cloned(c);
    }
}

window.FbDropdown = FbDropdown;