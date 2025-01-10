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

        // Apply CSS for a sliding effect
        if (!addOptionDiv.style.transition) {
            addOptionDiv.style.transition = 'max-height 0.5s ease, padding 0.5s ease';
            addOptionDiv.style.overflow = 'hidden';
            addOptionDiv.style.maxHeight = '0px'; // Initially hidden
            addOptionDiv.style.padding = '0'; // Remove padding when hidden
        }

        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (addOptionDiv.style.maxHeight === '0px') {
                addOptionDiv.style.maxHeight = `${addOptionDiv.scrollHeight}px`;
                addOptionDiv.style.padding = ''; // Restore padding when visible
            } else {
                addOptionDiv.style.maxHeight = '0px';
                addOptionDiv.style.padding = '0';
            }
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
            return Array.from(this.element.selectedOptions).map(opt => opt.value);
        }

        return this.element.value;
    }

    reset() {
        this.update(this.options.defaultVal);
    }

    update(val) {
        if (typeof val === 'string' && val === '') {
            val = [];
        } else if (typeof val === 'string') {
            try {
                val = JSON.parse(val);
            } catch {
                val = [val];
            }
        }

       if (!val) val = [];

	    this.getElement();
	    if (!this.element) {
	        return;
	    }

	    if (!this.options.editable) {
	        // Handle non-editable case
	        this.element.innerHTML = '';
	        const dataMap = new Map(Object.entries(this.options.data));
	        val.forEach((v) => {
	            if (dataMap.has(v)) {
	                this.element.innerHTML += `${dataMap.get(v)}<br />`;
	            }
	        });
	        return;
	    }

	    // Update options for editable dropdown
	    const options = Array.from(this.element.options);
	    if (typeof val === 'number') {
	        val = val.toString(); // Convert number to string for comparison
	    }
	    options.forEach((opt) => {
	        opt.selected = val.includes(opt.value);
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