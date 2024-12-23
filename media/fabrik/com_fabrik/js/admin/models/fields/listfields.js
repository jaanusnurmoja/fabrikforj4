/**
 * Admin Listfields Dropdown Editor (ES6 Refactor)
 */

class ListFieldsElement {
    constructor(el, options = {}) {
        this.strEl = el;
        this.el = document.getElementById(el);
        this.options = {
            conn: null,
            highlightpk: false,
            showAll: 1,
            showRaw: 0,
            mode: 'dropdown',
            defaultOpts: [],
            addBrackets: false,
            value: null,
            table: null,
            ...options,
        };
        this.addWatched = false;

        if (!this.el) {
            console.error(`Element with id '${el}' not found.`);
            return;
        }

        if (this.options.defaultOpts.length > 0) {
            this.initializeDefaultOptions();
        } else {
            if (!document.getElementById(this.options.conn)) {
                this.cnnperiodical = setInterval(() => this.getCnn(), 500);
            } else {
                this.setUp();
            }
        }
    }

    initializeDefaultOptions() {
        let label, els;
        if (this.options.mode === 'gui') {
            this.select = this.el.closest('.parent-container').querySelector('select.elements');
            els = [this.select];
            if (!document.getElementById(this.options.conn)) {
                this.watchAdd();
            }
        } else {
            els = document.getElementsByName(this.el.name);
            this.el.innerHTML = '';
        }

        this.options.defaultOpts.forEach((opt) => {
            const o = { value: opt.value };
            if (opt.value == this.options.value) {
                o.selected = true;
            }
            els.forEach((el) => {
                label = opt.label || opt.text;
                const option = document.createElement('option');
                option.value = o.value;
                option.textContent = label;
                if (o.selected) {
                    option.selected = true;
                }
                el.appendChild(option);
            });
        });
    }

    cloned(newId, counter) {
        this.strEl = newId;
        this.el = document.getElementById(newId);
        this._cloneProp('conn', counter);
        this._cloneProp('table', counter);
        this.setUp();
    }

    _cloneProp(prop, counter) {
        const bits = this.options[prop].split('-');
        bits.splice(bits.length - 1, 1, counter);
        this.options[prop] = bits.join('-');
    }

    getCnn() {
        if (!document.getElementById(this.options.conn)) {
            return;
        }
        this.setUp();
        clearInterval(this.cnnperiodical);
    }

    setUp() {
        if (this.options.mode === 'gui') {
            this.select = this.el.closest('.parent-container').querySelector('select.elements');
        }

        const connEl = document.getElementById(this.options.conn);
        const tableEl = document.getElementById(this.options.table);

        if (connEl) {
            connEl.addEventListener('change', () => this.updateMe());
        }

        if (tableEl) {
            tableEl.addEventListener('change', () => this.updateMe());
        }

        const connValue = connEl ? connEl.value : '';
        if (connValue !== '' && connValue !== -1) {
            this.periodical = setInterval(() => this.updateMe(), 500);
        }

        this.watchAdd();
    }

    watchAdd() {
        if (this.addWatched) {
            return;
        }
        this.addWatched = true;
        const addButton = this.el.closest('.parent-container').querySelector('button');

        if (addButton) {
            addButton.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.addPlaceHolder();
            });
            addButton.addEventListener('click', (e) => e.preventDefault());
        }
    }

    updateMe() {
        const connEl = document.getElementById(this.options.conn);
        const tableEl = document.getElementById(this.options.table);
        if (!connEl || !tableEl) {
            clearInterval(this.periodical);
            return;
        }

        const cid = connEl.value;
        const tid = tableEl.value;
        if (!tid) {
            return;
        }

        clearInterval(this.periodical);

        const url = `index.php?option=com_fabrik&format=raw&task=plugin.pluginAjax&g=element&plugin=field&method=ajax_fields&showall=${this.options.showAll}&cid=${cid}&t=${tid}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((opts) => {
                let els;
                if (this.options.mode === 'gui') {
                    els = [this.select];
                } else {
                    els = document.getElementsByName(this.el.name);
                    this.el.innerHTML = '';
                }

                els.forEach((el) => {
                    el.innerHTML = '';
                });

                opts.forEach((opt) => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    if (opt.value === this.options.value) {
                        option.selected = true;
                    }
                    els.forEach((el) => {
                        el.appendChild(option);
                    });
                });

                const loader = document.getElementById(`${this.el.id}_loader`);
                if (loader) {
                    loader.style.display = 'none';
                }
            })
            .catch((error) => console.error('Error updating elements:', error));
    }

    addPlaceHolder() {
        const list = this.el.closest('.parent-container').querySelector('select');
        let value = list.value;
        if (this.options.addBrackets) {
            value = `{${value.replace(/\./, '___')}}`;
        }
        this.insertTextAtCaret(this.el, value);
    }

    insertTextAtCaret(el, text) {
        const startPos = el.selectionStart;
        const endPos = el.selectionEnd;
        const value = el.value;
        el.value = value.slice(0, startPos) + text + value.slice(endPos);
        el.setSelectionRange(startPos + text.length, startPos + text.length);
    }
}

