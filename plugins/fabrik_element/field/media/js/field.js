/**
 * Field Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { Fabrik } from "@fbplgelementfabrik";
import { FbElement } from "@fbplgelementelement"; 

function geolocateLoad() {
    if (document.body) {
        const event = new Event('google.geolocate.loaded', { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
    } else {
        console.log('no body');
    }
}

export class FbField extends FbElement {

	defaults = {
		use_input_mask         : false,
		input_mask_definitions : '',
		input_mask_autoclear   : false,
		geocomplete            : false,
		mapKey                 : false,
		language               : ''
	};

	constructor(element, options) {
		super(element, options);
		this.options = { ...this.defaults, ...this.options };
		this.setPlugin('fabrikfield');

		if (this.options.use_input_mask) {
			if (this.options.input_mask_definitions !== '') {
				const definitions = JSON.parse(this.options.input_mask_definitions);
				Object.entries(definitions).forEach(([key, value]) => {
					if (!window.maskDefinitions) window.maskDefinitions = {};
					window.maskDefinitions[key] = value;
				});
			}
			const elementNode = document.getElementById(element);
			if (elementNode) {
				elementNode.addEventListener('input', () => {
					if (this.options.input_mask_autoclear) {
						elementNode.value = elementNode.value.replace(/[^\d]/g, '');
					}
				});
			}
		}

		if (this.options.geocomplete) {
			this.gcMade = false;
			this.loadFn = () => {
				if (!this.gcMade) {
					const inputElement = document.getElementById(this.element.id);
					if (inputElement) {
						inputElement.addEventListener('geocode:result', (event) => {
							Fabrik.fireEvent('fabrik.element.field.geocode', [this, event.detail]);
						});
					}
					this.gcMade = true;
				}
			};
			window.addEventListener('google.geolocate.loaded', this.loadFn);
			Fabrik.loadGoogleMap(this.options.mapKey, 'geolocateLoad', this.options.language);
		}

		if (this.options.editable && this.options.scanQR) {
			this.qrBtn = document.getElementById(element + '_qr_upload');
			if (this.qrBtn) {
				this.qrBtn.addEventListener('change', (e) => {
					const node = e.target;
					const reader = new FileReader();
					reader.onload = () => {
						node.value = "";
						qrcode.callback = (res) => {
							if (res instanceof Error) {
								alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
							} else {
								this.update(res);
							}
						};
						qrcode.decode(reader.result);
					};
					reader.readAsDataURL(node.files[0]);
				});
			}
		}
	}

	select() {
		const element = document.querySelector(`#${this.element}`);
		if (element) {
			element.select();
		}
	}

	focus() {
		const element = document.querySelector(`#${this.element}`);
		if (element) {
			element.focus();
		}
		super.attachedToForm();
	}

	cloned(c) {
		const element = document.getElementById(this.element.id);
		if (this.options.use_input_mask && element) {
			if (this.options.input_mask_definitions !== '') {
				const definitions = JSON.parse(this.options.input_mask_definitions);
				Object.entries(definitions).forEach(([key, value]) => {
					if (!window.maskDefinitions) window.maskDefinitions = {};
					window.maskDefinitions[key] = value;
				});
			}
		}

		if (this.options.geocomplete && element) {
			element.addEventListener('geocode:result', (event) => {
				Fabrik.fireEvent('fabrik.element.field.geocode', [this, event.detail]);
			});
		}
		super.cloned(c);
	}
}
window.FbField = FbField;
