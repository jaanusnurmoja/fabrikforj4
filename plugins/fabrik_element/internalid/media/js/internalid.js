/**
 * InternalID Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// (jQuery, FbElement)
import { FbElement } from "fabrik/element.js"; 

window.FbInternalId = class InternalId extends FbElement{
	constructor (element, options) {
		super(element, options);
		this.setPlugin('fbInternalId');
	}
}

