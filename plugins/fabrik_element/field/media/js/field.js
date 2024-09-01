/**
 * Field Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// (jQuery, FbElement, Mask) and qrcode ??

// ALL .each Replaced by .forEach. Not tested all of them yet. 
// ALL typeOf(value) === 'null' changed to value === 'null'

//import { Fabrik } from "fabrik/fabrik.js";
//import { FbElement } from "fabrik/element.js"; 

// Define variable outside of require js so that the form class can initialize it
function geolocateLoad() {
    if (document.body) {
        window.fireEvent('google.geolocate.loaded');
    } else {
        console.log('no body');
    }
}

// Wrap in require js to ensure we always load the same version of jQuery
// Multiple instances can be loaded an ajax pages are added and removed. However we always want
// to get the same version as plugins are only assigned to this jQuery instance

window.FbField = class Field extends FbElement{

	defaults = {
		use_input_mask         : false,
		input_mask_definitions : '',
		input_mask_autoclear   : false,
		geocomplete            : false,
		mapKey                 : false,
		language               : ''
	};

	constructor (element, options) {
		super(element, options);
		this.options = options;
		this.options = { // options merges with defaults
			...this.defaults,
			...this.options
		};
		var definitions;
		this.setPlugin('fabrikfield');
        /*
		 * $$$ hugh - testing new masking feature, uses this jQuery widget:
		 * http://digitalbush.com/projects/masked-input-plugin/
		 */
		if (this.options.use_input_mask) {
			if (this.options.input_mask_definitions !== '') {
				definitions = JSON.parse(this.options.input_mask_definitions);
				jQuery.extend(jQuery.mask.definitions, definitions);
			}
			jQuery('#' + element).mask(this.options.input_mask, {autoclear: this.options.input_mask_autoclear});
		}
		if (this.options.geocomplete) {
			this.gcMade = false;
			this.loadFn = function () {
				if (this.gcMade === false) {
					var self = this;
					jQuery('#' + this.element.id).geocomplete({}).bind(
						'geocode:result',
						function(event, result){
							Fabrik.fireEvent('fabrik.element.field.geocode', [self, result]);
						}
					);
					this.gcMade = true;
				}
			};
			window.addEventListener('google.geolocate.loaded', this.loadFn);
			Fabrik.loadGoogleMap(this.options.mapKey, 'geolocateLoad', this.options.language);
		}

		if (this.options.editable && this.options.scanQR) {
			this.qrBtn = document.getElementById(element + '_qr_upload');
			this.qrBtn.addEventListener('change', function (e) {
				var node = e.target;
				var reader = new FileReader();
				var self = this;
				reader.onload = function() {
					node.value = "";
					qrcode.callback = function(res) {
						if(res instanceof Error) {
							alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
						} else {
							self.update(res);
						}
					};
					qrcode.decode(reader.result);
				};
				reader.readAsDataURL(node.files[0]);
			});
		}
	}

	select () {
		var element = this.querySelector();
		if (element) {
			this.querySelector().select();
		}
	}

	focus () {
		var element = this.querySelector();
		if (element) {
			this.querySelector().focus();
		}
		super.attachedToForm();
	}

	cloned (c) {
		var element = this.querySelector();
		if (this.options.use_input_mask) {
			if (element) {
				if (this.options.input_mask_definitions !== '') {
					var definitions = JSON.parse(this.options.input_mask_definitions);
//					$H(definitions).forEach(function (v, k) {
					var arr = Object.keys(definitions).map((key) => [key, definitions[key]]); // change object to array
					var c = new Map(arr); // create map from array
					c.forEach(function (v, k) {
						jQuery.mask.definitions[k] = v;
					});
				}
				jQuery('#' + element.id).mask(this.options.input_mask, {autoclear: this.options.input_mask_autoclear});
			}
		}
		if (this.options.geocomplete) {
			if (element) {
				var self = this;
				jQuery('#' + this.element.id).geocomplete().bind(
					'geocode:result',
					function(event, result){
						Fabrik.fireEvent('fabrik.element.field.geocode', [self, result]);
					}
				);
			}
		}
		this.parent(c);
	}
}
