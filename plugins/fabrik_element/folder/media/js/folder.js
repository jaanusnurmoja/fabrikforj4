/**
 * Folder Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

window.FbFolder = new Class({
    Extends   : FbElement,
    initialize: function (element, options) {
        this.setPlugin('fabrikfolder');
        this.parent(element, options);
    }
});
