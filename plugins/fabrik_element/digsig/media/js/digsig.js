/* Slider Element
 *
 * @copyright: Copyright (C) 2005-2025 Fabrikar. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbelement"; 

export class FbDigsig extends FbElement {
    constructor(element, options) {
        super(element, options); // Calls the parent class constructor
        this.setPlugin('digsig');

        // Ensure the element is valid
        if (this.options.editable === true) {
            if (!this.element) {
                console.warn('No element found for digsig');
                return;
            }

            // Initialize signature pad
            this.initSignaturePad();
        } else {
            this.displaySignatureOnly();
        }
    }

    /**
     * Initializes the signature pad for editing.
     */
    initSignaturePad() {
        const canvas = document.querySelector(`#${this.element.id}_oc_pad`);
        const output = document.querySelector(`#${this.options.sig_id}`);

        if (!canvas || !output) {
            console.warn('Canvas or output element not found for digsig');
            return;
        }

        // Configure the signature pad options
        const options = {
            defaultAction: 'drawIt',
            lineTop: '100',
            output,
            canvas,
            drawOnly: true,
        };

        // Placeholder for signature pad logic
        console.log('Initialize signature pad with options:', options);

        // Optionally regenerate a saved signature value (logic placeholder)
        if (this.options.value) {
            this.regenerateSignature(this.options.value, canvas, output);
        }
    }

    /**
     * Displays a signature in read-only mode.
     */
    displaySignatureOnly() {
        const output = document.querySelector(`#${this.options.sig_id}`);

        if (!output) {
            console.warn('Output element not found for read-only signature');
            return;
        }

        console.log('Display signature in read-only mode');

        // Optionally regenerate a saved signature value (logic placeholder)
        if (this.options.value) {
            this.regenerateSignature(this.options.value, null, output);
        }
    }

    /**
     * Regenerates a signature based on the saved value.
     * @param {string} value - The signature value to regenerate.
     * @param {HTMLCanvasElement|null} canvas - The canvas element (if applicable).
     * @param {HTMLElement} output - The output element for the signature.
     */
    regenerateSignature(value, canvas, output) {
        console.log('Regenerating signature with value:', value);

        // Add your signature regeneration logic here
        if (canvas) {
            // Example: draw on the canvas based on value
        }

        if (output) {
            output.textContent = value; // Example: display the value
        }
    }

    /**
     * Gets the current signature value.
     * @returns {string} The current signature value.
     */
    getValue() {
        return this.options.value;
    }

    /**
     * Adds a new event to the element.
     * @param {string} action - The event action ('load' or 'change').
     * @param {function} js - The event handler function.
     */
    addNewEvent(action, js) {
        if (action === 'load') {
            if (!this.loadEvents) {
                this.loadEvents = [];
            }
            this.loadEvents.push(js);
            this.runLoadEvent(js);
            return;
        }
        if (action === 'change') {
            this.changejs = js;
        }
    }

    /**
     * Runs a load event.
     * @param {function} js - The event handler function.
     */
    runLoadEvent(js) {
        if (typeof js === 'function') {
            js();
        }
    }
}

window.FbDigsig = FbDigsig;