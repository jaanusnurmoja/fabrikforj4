/**
 * Radio Button Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElementList } from "@fbelementlist"; 

export class FbRadiobutton extends FbElementList {
    constructor(element, options) {
        super(element, options);
        this.options = Object.assign({
            btnGroup: true
        }, options);

        this.type = 'radio'; // sub element type
        this.setPlugin('fabrikradiobutton');
        this.btnGroup();
    }

    btnGroup() {
        if (!this.options.btnGroup) return;

        this.btnGroupRelay();

        const container = this.getContainer();
        if (!container) return;

        container.querySelectorAll('.radio.btn-group label').forEach(label => {
            label.classList.add('btn');
        });

        container.querySelectorAll('.btn-group input[checked]').forEach(input => {
            let label = input.closest('label');

            if (!label) {
                label = input.nextElementSibling;
            }

            const value = input.value;

            if (value === '') {
                label.classList.add('active', 'btn-primary');
            } else if (value === '0') {
                label.classList.add('active', 'btn-danger');
            } else {
                label.classList.add('active', 'btn-success');
            }
        });
    }

    btnGroupRelay() {
        const container = this.getContainer();
        if (!container) return;

        container.querySelectorAll('.radio.btn-group label').forEach(label => {
            label.classList.add('btn');
        });

        container.addEventListener('click', event => {
            const label = event.target.closest('.btn-group label');
            if (!label) return;

            let input = document.getElementById(label.htmlFor);
            if (!input) {
                input = label.querySelector('input');
            }

            this.setButtonGroupCSS(input);
        });
    }

    setButtonGroupCSS(input) {
        const label = input.id ? document.querySelector(`label[for="${input.id}"]`) : input.closest('label.btn');
        const value = input.value;
        const fabChecked = parseInt(input.getAttribute('fabchecked'), 10);

        if (!input.checked || fabChecked === 1) {
            if (label) {
                label.closest('.btn-group').querySelectorAll('label').forEach(label => {
                    label.classList.remove('active', 'btn-success', 'btn-danger', 'btn-primary');
                });

                if (value === '') {
                    label.classList.add('active', 'btn-primary');
                } else if (parseInt(value) === 0) {
                    label.classList.add('active', 'btn-danger');
                } else {
                    label.classList.add('active', 'btn-success');
                }
            }

            input.checked = true;

            if (!fabChecked) {
                input.setAttribute('fabchecked', 1);
            }
        } else {
            if (label) {
                label.classList.remove('active', 'btn-primary', 'btn-danger', 'btn-success');
            }
        }
    }

    watchAddToggle() {
        const container = this.getContainer();
        let addOptionDiv = container.querySelector('div.addoption');
        const toggleAddOption = container.querySelector('.toggle-addoption');

        if (this.mySlider) {
            const clone = addOptionDiv.cloneNode(true);
            const fabrikElement = container.querySelector('.fabrikElement');
            addOptionDiv.parentNode.remove();
            fabrikElement.appendChild(clone);
            addOptionDiv = container.querySelector('div.addoption');
            addOptionDiv.style.margin = 0;
        }

        this.mySlider = new Fx.Slide(addOptionDiv, {
            duration: 500
        });

        this.mySlider.hide();
        toggleAddOption.addEventListener('click', event => {
            event.preventDefault();
            this.mySlider.toggle();
        });
    }

    getValue() {
        if (!this.options.editable) {
            return this.options.value;
        }

        let value = '';
        this._getSubElements().forEach(sub => {
            if (sub.checked) {
                value = sub.value;
                return value;
            }
        });

        return value;
    }

    setValue(value) {
        if (!this.options.editable) return;

        this._getSubElements().forEach(sub => {
            sub.checked = sub.value === value;
        });
    }

    update(value) {
        if (Array.isArray(value)) {
            value = value.shift();
        }

        this.setValue(value);

        if (!this.options.editable) {
            this.element.innerHTML = value === '' ? '' : this.options.data[value];
        } else if (this.options.btnGroup) {
            this._getSubElements().forEach(el => {
                if (el.value === value) {
                    this.setButtonGroupCSS(el);
                }
            });
        }
    }

    cloned(container) {
        if (this.options.allowadd && this.options.editable !== false) {
            this.watchAddToggle();
            this.watchAdd();
        }

        this._getSubElements().forEach((sub, i) => {
            sub.id = `${this.options.element}_input_${i}`;
            const label = sub.closest('label');
            if (label) {
                label.htmlFor = sub.id;
            }
        });

        super.cloned(container);
        this.btnGroup();
    }

    getChangeEvent() {
        return this.options.changeEvent;
    }

    eventDelegate() {
        return `input[type=${this.type}][name^=${this.options.fullName}], [class*=fb_el_${this.options.fullName}] .fabrikElement label`;
    }

    setName(repeatCount) {
        const element = this.getElement();
        if (!element) return false;

        this._getSubElements().forEach(e => {
            e.name = this._setName(e.name, repeatCount);
            e.id = this._setId(e.id, repeatCount, '_input_\d+');
            const label = e.closest('label');
            if (label) {
                label.htmlFor = e.id;
            }
        });

        if (element.id) {
            element.id = this._setId(element.id, repeatCount);
        }

        this.options.repeatCounter = repeatCount;
        return element.id;
    }
}

window.FbRadiobutton = FbRadiobutton;