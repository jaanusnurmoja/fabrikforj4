/**
 * Button Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license: GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@element"; 

export class FbButton extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('fabrikButton');
    }

    addNewEventAux(action, js) {
        const self = this;
        this.element.addEventListener(action, (e) => {
            // Unlike element addNewEventAux we need to stop the event otherwise the form is submitted
            if (e) {
                e.stopPropagation();
            }
            if (typeof js === 'function') {
                setTimeout(() => js.call(self, self), 0);
            } else {
                js = js.replace(/\bthis\b(?![^{]*})/g, 'self');
                eval(js);
            }
        });
    }
}

window.FbButton = FbButton;
