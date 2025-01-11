/**
 * InternalID Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// (jQuery, FbElement)
import { FbElement } from "@fbelement"; 

export class FbPlgElementInternalid extends FbElement{
	constructor (element, options) {
		super(element, options);
		this.setPlugin('FbPlgElementInternalid');
	}
}

window.FbPlgElementInternalid = FbPlgElementInternalid;