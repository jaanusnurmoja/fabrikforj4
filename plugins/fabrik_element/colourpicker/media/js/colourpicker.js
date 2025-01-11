/**
 * Colour Picker Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

export class SliderField {
    constructor(field, slider) {
        this.field = document.getElementById(field);
        this.slider = slider;

        this.handleChange = this.update.bind(this);
        this.field.addEventListener('change', this.handleChange);
    }

    destroy() {
        this.field.removeEventListener('change', this.handleChange);
    }

    update(val) {
        if (!this.options?.editable) {
            this.element.innerHTML = val;
            return;
        }
        this.slider.set(parseInt(this.field.value, 10));
    }
}

import { FbElement } from '@fbelement';

export class FbPlgElementColourpicker extends FbElement {
    constructor(element, options) {
	    // Merge the provided options with defaults
	    options = {
	        red: 0,
	        green: 0,
	        blue: 0,
	        value: [0, 0, 0, 1],
	        showPicker: true,
	        swatchSizeWidth: '10px',
	        swatchSizeHeight: '10px',
	        swatchWidth: '160px',
	        ...options,
	    };

	    // Ensure the value array is properly initialized
	    if (!options.value || typeof options.value[0] === 'undefined') {
	        options.value = [0, 0, 0, 1];
	    }

	    // Call the parent constructor with the updated options
	    super(element, options);
        this.setPlugin('colourpicker');
        this.element = document.getElementById(element);

        this.ini();
    }

    ini() {
        this.options.callback = (v, caller) => {
            v = this.update(v);
            if (caller !== this.grad && this.grad) {
                this.grad.update(v);
            }
        };

        this.widget = this.element.closest('.fabrikSubElementContainer').querySelector('.colourpicker-widget');
        this.setOutputs();

        // Set draggable widget (uses native drag-and-drop or a library)
        const handle = this.widget.querySelector('.draggable');
        handle.addEventListener('mousedown', (event) => {
            event.preventDefault();
            // Custom drag logic or library drag functionality goes here
        });

        if (this.options.showPicker) {
            this.createSliders(this.options.element);
        }

        // Create swatch
        this.swatch = new ColourPickerSwatch(this.options.element, this.options, this);
        const swatchContainer = this.widget.querySelector(`#${this.options.element}-swatch`);
        swatchContainer.innerHTML = '';
        swatchContainer.appendChild(this.swatch.element);

        // Hide widget initially
        this.widget.style.display = 'none';

        if (this.options.showPicker) {
            this.grad = new ColourPickerGradient(this.options.element, this.options, this);
            const pickerContainer = this.widget.querySelector(`#${this.options.element}-picker`);
            pickerContainer.innerHTML = '';
            pickerContainer.appendChild(this.grad.square);
        }

        this.update(this.options.value);

        const closeButton = this.widget.querySelector('.modal-header a');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.widget.style.display = 'none';
            });
        }
    }

    cloned(c) {
        super.cloned(c);

        // Recreate the tabs
        const widget = this.element
            .closest('.fabrikSubElementContainer')
            .querySelector('.colourpicker-widget');

        const panes = widget.querySelectorAll('.tab-pane');
        const tabs = widget.querySelectorAll('a[data-bs-toggle=tab]');

        tabs.forEach((tab) => {
            const href = tab.getAttribute('href').split('-');
            const name = href[0].split('_');
            name[name.length - 1] = c;
            tab.setAttribute('href', `${name.join('_')}-${href[1]}`);
        });

        panes.forEach((pane) => {
            const id = pane.getAttribute('id').split('-');
            const name = id[0].split('_');
            name[name.length - 1] = c;
            pane.setAttribute('id', `${name.join('_')}-${id[1]}`);
        });

        tabs.forEach((tab) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tab.tab('show');
            });
        });

        // Reinitialize the widget
        this.ini();
    }

    setOutputs() {
        this.outputs = {
            backgrounds: [...this.getContainer().querySelectorAll('.colourpicker_bgoutput')],
            foregrounds: [...this.getContainer().querySelectorAll('.colourpicker_output')],
        };

        this.outputs.backgrounds.forEach((output) =>
            output.addEventListener('click', (e) => this.toggleWidget(e))
        );
        this.outputs.foregrounds.forEach((output) =>
            output.addEventListener('click', (e) => this.toggleWidget(e))
        );
    }

    createSliders(element) {
        this.sliderRefs = [];

        // Create table structure
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        this.createColourSlideHTML(element, 'red', 'Red:', this.options.red, tbody);
        this.createColourSlideHTML(element, 'green', 'Green:', this.options.green, tbody);
        this.createColourSlideHTML(element, 'blue', 'Blue:', this.options.blue, tbody);
        table.appendChild(tbody);
        const slidersContainer = this.widget.querySelector('.sliders');
        slidersContainer.innerHTML = '';
        slidersContainer.appendChild(table);
    }

    createColourSlideHTML(element, colour, label, value, tbody) {
        const sliderField = document.createElement('input');
        sliderField.type = 'text';
        sliderField.id = `${element}${colour}Field`;
        sliderField.className = `form-control ${colour}SliderField`;
        sliderField.size = 3;
        sliderField.value = value;

        sliderField.addEventListener('change', (e) => this.updateFromField(e, colour));

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${label}</td>
            <td></td>
        `;
        row.children[1].appendChild(sliderField);
        tbody.appendChild(row);

        this[`${colour}Field`] = sliderField;
    }

    updateAll(red, green, blue) {
        red = parseInt(red) || 0;
        green = parseInt(green) || 0;
        blue = parseInt(blue) || 0;

        if (this.options.showPicker) {
            this.redField.value = red;
            this.greenField.value = green;
            this.blueField.value = blue;
        }

        Object.assign(this.options, { red, green, blue });
        this.updateOutputs();
    }

    updateOutputs() {
        const { red, green, blue } = this.options;
        const color = `rgba(${red}, ${green}, ${blue}, 1)`;

        this.outputs.backgrounds.forEach((output) => {
            output.style.backgroundColor = color;
        });
        this.outputs.foregrounds.forEach((output) => {
            output.style.backgroundColor = color;
        });

        this.element.value = `${red},${green},${blue}`;
    }

    update(val) {
        if (!this.options.editable) {
            this.element.innerHTML = val;
            return;
        }

        if (!val) {
            val = [0, 0, 0];
        } else if (typeof val === 'string') {
            val = val.split(',');
        }

        this.updateAll(val[0], val[1], val[2]);
        return val;
    }

    updateFromField(e, col) {
        let val = Math.min(255, parseInt(e.target.value, 10) || 0);
        e.target.value = val;

        if (!isNaN(val)) {
            this.options[col] = val;
            this.options.callback(`${this.options.red},${this.options.green},${this.options.blue}`);
        }
    }

    toggleWidget(e) {
        e.preventDefault();
        this.widget.style.display = this.widget.style.display === 'none' ? 'block' : 'none';
    }
}

window.FbPlgElementColourpicker = FbPlgElementColourpicker;

export class ColourPickerSwatch {
    constructor(element, options = {}) {
        this.element = document.getElementById(element);

        // Merge default options with user-provided ones
        this.options = {
            callback: () => {},
            outputs: {},
            swatch: [],
            swatchSizeWidth: '10px',
            swatchSizeHeight: '10px',
            swatchWidth: '160px',
            ...options,
        };

        this.callback = this.options.callback;
        this.outputs = this.options.outputs;
        this.redField = null;

        this.widget = document.createElement('div');
        this.colourNameOutput = document.createElement('span');
        this.colourNameOutput.style.padding = '3px';
        this.widget.appendChild(this.colourNameOutput);

        this.createColourSwatch(element);
    }

    createColourSwatch(element) {
        const swatchDiv = document.createElement('div');
        swatchDiv.style.float = 'left';
        swatchDiv.style.marginLeft = '5px';
        swatchDiv.className = 'swatchBackground';

        this.options.swatch.forEach((line, i) => {
            const swatchLine = document.createElement('div');
            swatchLine.style.width = this.options.swatchWidth;

            Object.entries(line).forEach(([colname, colour], j) => {
                const swatchId = `${element}swatch-${i}-${j}`;
                const swatchElement = document.createElement('div');
                swatchElement.id = swatchId;
                swatchElement.style.float = 'left';
                swatchElement.style.width = this.options.swatchSizeWidth;
                swatchElement.style.cursor = 'crosshair';
                swatchElement.style.height = this.options.swatchSizeHeight;
                swatchElement.style.backgroundColor = `rgb(${colour})`;
                swatchElement.className = colname;

                swatchElement.addEventListener('click', (e) => this.updateFromSwatch(e));
                swatchElement.addEventListener('mouseenter', (e) => this.showColourName(e));
                swatchElement.addEventListener('mouseleave', () => this.clearColourName());

                swatchLine.appendChild(swatchElement);
            });

            swatchDiv.appendChild(swatchLine);
        });

        this.widget.appendChild(swatchDiv);
    }

    updateFromSwatch(e) {
        e.preventDefault();
        const color = window.getComputedStyle(e.target).backgroundColor;
        const [red, green, blue] = this.extractRgbValues(color);

        this.options.colour = { red, green, blue };
        this.showColourName(e);
        this.callback(this.options.colour, this);
    }

    showColourName(e) {
        this.colourNameOutput.textContent = e.target.className;
    }

    clearColourName() {
        this.colourNameOutput.textContent = '';
    }

    extractRgbValues(color) {
        const match = color.match(/\d+/g);
        if (!match) return [0, 0, 0];
        return match.slice(0, 3).map((v) => parseInt(v, 10));
    }
}

//import * as chroma from 'chroma-js';

export class ColourPickerGradient {
    constructor(id, options) {
        this.options = {
            size: 125,
            ...options,
        };

        this.brightness = 0;
        this.saturation = 0;
        this.callback = this.options.callback;
        this.container = document.getElementById(id);

        if (!this.container) {
            return;
        }

        this.offset = 0;
        this.margin = 10;
        this.borderColour = 'rgba(155, 155, 155, 0.6)';
        this.hueWidth = 40;
        this.colour = chroma(this.options.value);

        this.square = document.createElement('canvas');
        this.square.width = this.options.size + 65;
        this.square.height = this.options.size;
        this.container.appendChild(this.square);

        this.square.addEventListener('click', (e) => this.doIt(e));

        this.down = false;
        this.square.addEventListener('mousedown', () => (this.down = true));
        this.square.addEventListener('mouseup', () => (this.down = false));
        document.addEventListener('mousemove', (e) => {
            if (this.down) {
                this.doIt(e);
            }
        });

        this.drawCircle();
        this.drawHue();
        this.arrow = this.drawArrow();
        this.positionCircle(this.options.size, 0);

        this.update(this.options.value);
    }

    doIt(e) {
        const squareBound = { x: 0, y: 0, w: this.options.size, h: this.options.size };
        const containerPosition = this.square.getBoundingClientRect();
        const x = e.pageX - containerPosition.left;
        const y = e.pageY - containerPosition.top;

        if (x < squareBound.w && y < squareBound.h) {
            this.setColourFromSquareSelection(x, y);
        } else if (x > this.options.size + this.margin && x <= this.options.size + this.hueWidth) {
            this.setHueFromSelection(x, y);
        }
    }

    update(c) {
        this.colour = chroma(c);
        const hsl = this.colour.hsl();
        this.brightness = hsl[2];
        this.saturation = hsl[1];

        this.render();
        this.positionCircleFromColour();
    }

    positionCircleFromColour() {
        const x = Math.floor(this.options.size * this.saturation);
        const y = Math.floor(this.options.size * (1 - this.brightness));
        this.positionCircle(x, y);
    }

    drawCircle() {
        this.circle = document.createElement('canvas');
        this.circle.width = 10;
        this.circle.height = 10;
        const ctx = this.circle.getContext('2d');

        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(5, 5, 4.5, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(5, 5, 3.5, 0, Math.PI * 2, true);
        ctx.strokeStyle = '#FFF';
        ctx.stroke();
    }

    setHueFromSelection(x, y) {
        const hue = 360 - (Math.min(1, y / this.options.size) * 360);
        this.colour = this.colour.set('hsl.h', hue);
        this.render();
        this.positionCircle();

        const updatedColour = this.colour.set('hsl.s', this.saturation).set('hsl.l', this.brightness);
        this.callback(updatedColour.hex(), this);
    }

    setColourFromSquareSelection(x, y) {
        const ctx = this.square.getContext('2d');
        const p = ctx.getImageData(x, y, 1, 1).data;
        this.colour = chroma([p[0], p[1], p[2]]);

        const hsl = this.colour.hsl();
        this.brightness = hsl[2];
        this.saturation = hsl[1];
        this.callback(this.colour.hex(), this);
    }

    positionCircle(x, y) {
        const ctx = this.square.getContext('2d');
        ctx.clearRect(0, 0, this.square.width, this.square.height);
        this.render();
        ctx.drawImage(this.circle, x - 5, y - 5);
    }

    drawHue() {
        const ctx = this.square.getContext('2d');
        const left = this.options.size + this.margin;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.options.size);

        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(5 / 6, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(4 / 6, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(3 / 6, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(2 / 6, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(1 / 6, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(left, 0, this.hueWidth - 10, this.options.size);

        ctx.strokeStyle = this.borderColour;
        ctx.strokeRect(left + 0.5, 0.5, this.hueWidth - 11, this.options.size - 1);
    }

    render() {
        const ctx = this.square.getContext('2d');
        ctx.clearRect(0, 0, this.square.width, this.square.height);

        const size = this.options.size;

        ctx.fillStyle = this.colour.hex();
        ctx.fillRect(0, 0, size, size);

        const gradient = ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const gradient2 = ctx.createLinearGradient(0, 0, 0, size);
        gradient2.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient2.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = this.borderColour;
        ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
        this.drawHue();
    }

    drawArrow() {
        const arrow = document.createElement('canvas');
        const ctx = arrow.getContext('2d');
        const size = 16;
        arrow.width = size;
        arrow.height = size;

        ctx.beginPath();
        ctx.moveTo(0, size / 2);
        ctx.lineTo(size / 2, size / 4);
        ctx.lineTo(size / 2, (3 * size) / 4);
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();

        return arrow;
    }
}
