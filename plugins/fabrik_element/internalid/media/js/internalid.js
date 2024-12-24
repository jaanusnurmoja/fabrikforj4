/**
 * InternalID Element
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// (jQuery, FbElement)
import { FbElement } from "@element"; 

export class FbInternalId extends FbElement{
	constructor (element, options) {
		super(element, options);
		this.setPlugin('fbInternalId');
	}
}

window.FbInternalId = FbInternalId;