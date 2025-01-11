/**
 * IP Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbplgelementelement"; 

export class FbSequence extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('FbSequence');
    }
}

window.FbSequence = FbSequence;