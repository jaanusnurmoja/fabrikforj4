/**
 * IP Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbelement"; 

export class FbIp extends FbElement {
    constructor(element, options) {
        super(element, options); // Calls the constructor of the parent class
        this.setPlugin('FbIp');
    }

    setPlugin(pluginName) {
        // Example method to demonstrate functionality
        this.pluginName = pluginName;
        console.log(`Plugin set to: ${pluginName}`);
    }
}

window.FbIp = FbIp;