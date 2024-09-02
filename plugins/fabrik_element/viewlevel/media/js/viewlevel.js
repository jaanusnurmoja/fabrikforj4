/**
 * ViewLevel Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

FbViewlevel = new Class({

    Extends: FbElement,

    initialize: function (element, options) {
        this.setPlugin('fabrikviewlevel');
        this.parent(element, options);
    }
});

return window.FbViewlevel;
});