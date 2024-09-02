/**
 * InternalID Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

window.FbInternalId = new Class({
    Extends   : FbElement,
    initialize: function (element, options) {
        this.setPlugin('fbInternalId');
        this.parent(element, options);
    }
});

