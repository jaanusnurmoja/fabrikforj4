/**
 * Calc Element - List
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { Fabrik } from '@fbfabrik';

export class FbCalcList {
    constructor(id, options) {
        this.options = options;
        this.options.element = id;
        this.col = document.querySelectorAll(`.${id}`);
        this.list = Fabrik.blocks[this.options.listRef];

        if (this.options.doListUpdate) {
            Fabrik.addEvent('fabrik.list.updaterows', this.update.bind(this));
        }
    }

    update() {
        const data = {
            option: 'com_fabrik',
            format: 'raw',
            task: 'plugin.pluginAjax',
            plugin: 'calc',
            g: 'element',
            listid: this.options.listid,
            formid: this.options.formid,
            method: 'ajax_listUpdate',
            element_id: this.options.elid,
            rows: this.list.getRowIds(),
            elementname: this.options.elid,
        };

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((json) => {
                for (const [id, html] of Object.entries(json)) {
                    if (typeof html === 'string') {
                        const cell = this.list.list.querySelector(`#${id} .${this.options.element}`);
                        if (cell && html !== false) {
                            cell.innerHTML = html;
                        }
                    }
                }
            })
            .catch((error) => {
                console.error('Fabrik:list-calc:update error:', error);
            });
    }
}

window.FbCalcList = FbCalcList;
