/**
 * @package Joomla!
 * @subpackage JavaScript
 * @since 1.5
 */

import { Fabrik } from "@fbplgelementfabrik"; 

export class FbLockrowList {
    constructor(id, options) {
        this.options = this.getOptions();
        Object.assign(this.options, options);
        this.id = id;

        // Preload spinner image
        this.spinner = new Image();
        this.spinner.src = `${this.options.livesite}/media/fabrik/com_fabrik/images/admin/ajax-loader.gif`;
        this.spinner.alt = 'loading';
        this.spinner.className = 'ajax-loader';

        Fabrik.addEvent('fabrik.list.updaterows', () => {
            this.makeEvents();
        });

        this.makeEvents();
    }

    getOptions() {
        return {
            livesite: '',
            locked_img: '',
            unlocked_img: '',
            userid: ''
        };
    }

    makeEvents() {
        this.col = document.querySelectorAll(`.${this.id}`);
        this.col.forEach(tr => {
            const row = this.findClassUp(tr, 'fabrik_row');
            if (row) {
                const rowid = row.id.replace(`list_${this.options.listRef}_row_`, '');
                const allLocked = tr.querySelectorAll('.fabrikElement_lockrow_locked');
                const allUnlocked = tr.querySelectorAll('.fabrikElement_lockrow_unlocked');

                allLocked.forEach(locked => {
                    if (this.options.can_unlocks[rowid]) {
                        const span = locked.querySelector('span');
                        span.addEventListener('mouseover', e => {
                            e.target.classList.replace(this.options.lockIcon, this.options.keyIcon);
                        });
                        span.addEventListener('mouseout', e => {
                            e.target.classList.replace(this.options.keyIcon, this.options.lockIcon);
                        });
                        span.addEventListener('click', () => {
                            this.doAjaxUnlock(locked);
                        });
                    }
                });

                allUnlocked.forEach(unlocked => {
                    if (this.options.can_locks[rowid]) {
                        const span = unlocked.querySelector('span');
                        span.addEventListener('mouseover', e => {
                            e.target.classList.replace(this.options.unlockIcon, this.options.keyIcon);
                        });
                        span.addEventListener('mouseout', e => {
                            e.target.classList.replace(this.options.keyIcon, this.options.unlockIcon);
                        });
                        span.addEventListener('click', () => {
                            this.doAjaxLock(unlocked);
                        });
                    }
                });
            }
        });
    }

    doAjaxUnlock(locked) {
        const row = this.findClassUp(locked, 'fabrik_row');
        const rowid = row.id.replace(`list_${this.options.listRef}_row_`, '');

        const data = {
            option: 'com_fabrik',
            format: 'raw',
            task: 'plugin.pluginAjax',
            plugin: 'lockrow',
            g: 'element',
            method: 'ajax_unlock',
            formid: this.options.formid,
            element_id: this.options.elid,
            row_id: rowid,
            elementname: this.options.elid,
            userid: this.options.userid
        };

        fetch('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(r => {
                if (r.status === 'unlocked') {
                    this.options.row_locks[rowid] = false;
                    const span = locked.querySelector('span');
                    span.classList.replace(this.options.keyIcon, this.options.unlockIcon);
                    span.replaceWith(span.cloneNode(true)); // Clear previous events
                    if (this.options.can_locks[rowid]) {
                        this.addUnlockEvents(span, locked);
                    }
                }
            });
    }

    doAjaxLock(unlocked) {
        const row = this.findClassUp(unlocked, 'fabrik_row');
        const rowid = row.id.replace(`list_${this.options.listRef}_row_`, '');

        const data = {
            option: 'com_fabrik',
            format: 'raw',
            task: 'plugin.pluginAjax',
            plugin: 'lockrow',
            g: 'element',
            method: 'ajax_lock',
            formid: this.options.formid,
            element_id: this.options.elid,
            row_id: rowid,
            elementname: this.options.elid,
            userid: this.options.userid
        };

        fetch('', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(r => {
                if (r.status === 'locked') {
                    this.options.row_locks[rowid] = true;
                    const span = unlocked.querySelector('span');
                    span.classList.replace(this.options.keyIcon, this.options.lockIcon);
                    span.replaceWith(span.cloneNode(true)); // Clear previous events
                    if (this.options.can_unlocks[rowid]) {
                        this.addLockEvents(span, unlocked);
                    }
                }
            });
    }

    addUnlockEvents(span, locked) {
        span.addEventListener('mouseover', e => {
            e.target.classList.replace(this.options.unlockIcon, this.options.keyIcon);
        });
        span.addEventListener('mouseout', e => {
            e.target.classList.replace(this.options.keyIcon, this.options.unlockIcon);
        });
        span.addEventListener('click', () => {
            this.doAjaxLock(locked);
        });
    }

    addLockEvents(span, unlocked) {
        span.addEventListener('mouseover', e => {
            e.target.classList.replace(this.options.lockIcon, this.options.keyIcon);
        });
        span.addEventListener('mouseout', e => {
            e.target.classList.replace(this.options.keyIcon, this.options.lockIcon);
        });
        span.addEventListener('click', () => {
            this.doAjaxUnlock(unlocked);
        });
    }

    findClassUp(el, className) {
        while (el && !el.classList.contains(className)) {
            el = el.parentElement;
        }
        return el;
    }
}

