/**
 * Access Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbelement"; 

export class FbPlgElementAccess extends FbElement{
	constructor (element, options) {
		super(element, options);
		this.setPlugin('FbPlgElementAccess');
	}
}

window.FbPlgElementAccess = FbPlgElementAccess;
