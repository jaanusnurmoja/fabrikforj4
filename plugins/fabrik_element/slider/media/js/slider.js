/**
 * Slider Element
 *
 * @copyright: Copyright (C) 2005-2013, fabrikar.com - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbelement"; 

export class FbSlider extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('slider');
        this.makeSlider();
    }

    makeSlider() {
        let isNull = false;
        if (this.options.value === null || this.options.value === '') {
            this.options.value = '';
            isNull = true;
        }
        this.options.value = this.options.value === '' ? '' : parseInt(this.options.value, 10);
        const v = this.options.value;

        if (this.options.editable === true) {
            if (!this.element) {
                console.warn('No element found for slider');
                return;
            }
            this.output = this.element.querySelector('.fabrikinput');
            this.output2 = this.element.querySelector('.slider_output');

            this.output.value = this.options.value;
            this.output2.textContent = this.options.value;

            this.mySlide = new Slider(
                this.element.querySelector('.fabrikslider-line'),
                this.element.querySelector('.knob'),
                {
                    onChange: pos => {
                        this.output.value = pos;
                        this.options.value = pos;
                        this.output2.textContent = pos;
                        this.output.dispatchEvent(new Event('blur'));
                        this.callChange();
                    },
                    onComplete: pos => {
                        this.output.dispatchEvent(new Event('change'));
                        this.element.dispatchEvent(new Event('change'));
                    },
                    steps: this.options.steps
                }
            ).set(v);

            if (isNull) {
                this.output.value = '';
                this.output2.textContent = '';
                this.options.value = '';
            }
            this.watchClear();
        }
    }

    watchClear() {
        this.element.addEventListener('click', event => {
            const target = event.target.closest('.clearslider');
            if (target) {
                event.preventDefault();
                this.mySlide.set(0);
                this.output.value = '';
                this.output.dispatchEvent(new Event('change'));
                this.output2.textContent = '';
            }
        });
    }

    getValue() {
        return this.options.value;
    }

    callChange() {
        if (typeof this.changejs === 'function') {
            setTimeout(this.changejs, 0);
        } else {
            eval(this.changejs);
        }
    }

    addNewEvent(action, js) {
        if (action === 'load') {
            this.loadEvents.push(js);
            this.runLoadEvent(js);
            return;
        }
        if (action === 'change') {
            this.changejs = js;
        }
    }

    cloned(c) {
        delete this.mySlide;
        this.makeSlider();
        super.cloned(c);
    }
}

window.FbSlider = FbSlider;