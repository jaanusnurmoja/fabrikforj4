class FabrikModalRepeat {
    constructor(el, names, field, opts = {}) {
        this.names = names;
        this.field = field;
        this.content = false;
        this.setup = false;
        this.elid = el;
        this.win = {};
        this.el = {};
        this.field = {};
        this.options = { 
            j3: true, 
            ...opts 
        };

        // If the parent field is inserted via js then we delay the loading until the html is present
        if (!this.ready()) {
            this.timer = setInterval(() => this.testReady(), 500);
        } else {
            this.setUp();
        }
    }

    ready() {
        return document.getElementById(this.elid) !== null;
    }

    testReady() {
        if (!this.ready()) {
            return;
        }
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.setUp();
    }

    setUp() {
        this.button = document.getElementById(`${this.elid}_button`);
        this.mask = this.createMask();

        // Delegate event listener for modal triggers
        document.addEventListener('click', (e) => {
            const target = e.target.closest(`[data-modal="${this.elid}"]`);
            if (target) {
                e.preventDefault();
                const id = target.nextElementSibling.id;
                const container = target.closest('li') || target.closest('div.control-group');
                
                this.field[id] = target.nextElementSibling;
                this.origContainer = container;
                
                const tbl = container.querySelector('table');
                if (tbl) {
                    this.el[id] = tbl;
                }
                
                this.openWindow(id);
            }
        });
    }

    createMask() {
        const mask = document.createElement('div');
        mask.style.position = 'fixed';
        mask.style.top = '0';
        mask.style.left = '0';
        mask.style.width = '100%';
        mask.style.height = '100%';
        mask.style.backgroundColor = '#000';
        mask.style.opacity = '0.4';
        mask.style.zIndex = '9998';
        mask.style.display = 'none';
        document.body.appendChild(mask);
        return mask;
    }

    openWindow(target) {
        let makeWin = false;
        if (!this.win[target]) {
            makeWin = true;
            this.makeTarget(target);
        }
        
        this.el[target].style.display = 'block';
        this.el[target].parentNode.insertBefore(this.el[target], this.win[target].firstChild);

        if (!this.win[target] || makeWin) {
            this.makeWin(target);
        }
        
        this.win[target].style.display = 'block';
        this.positionWindow(this.win[target]);
        this.resizeWin(true, target);
        this.positionWindow(this.win[target]);
        this.mask.style.display = 'block';
    }

    positionWindow(win) {
        // Simple positioning - you might want to replace with a more sophisticated method
        win.style.position = 'fixed';
        win.style.top = '50%';
        win.style.left = '50%';
        win.style.transform = 'translate(-50%, -50%)';
    }

    makeTarget(target) {
        this.win[target] = document.createElement('div');
        this.win[target].dataset.modalContent = target;
        Object.assign(this.win[target].style, {
            padding: '5px',
            backgroundColor: '#fff',
            display: 'none',
            zIndex: '9999'
        });
        document.body.appendChild(this.win[target]);
    }

    makeWin(target) {
        const close = document.createElement('button');
        close.classList.add('btn', 'button', 'btn-primary');
        close.textContent = 'Close';
        close.addEventListener('click', (e) => {
            e.preventDefault();
            this.store(target);
            this.el[target].style.display = 'none';
            this.origContainer.appendChild(this.el[target]);
            this.close();
        });

        const controls = document.createElement('div');
        controls.classList.add('controls', 'form-actions');
        Object.assign(controls.style, {
            textAlign: 'right',
            marginBottom: '0'
        });
        controls.appendChild(close);

        this.win[target].appendChild(controls);
        this.content = this.el[target];
        this.build(target);
        this.watchButtons(this.win[target], target);
    }

    resizeWin(setup, target) {
        Object.keys(this.win).forEach(key => {
            const win = this.win[key];
            const el = this.el[key];
            
            const size = {
                x: el.offsetWidth,
                y: el.offsetHeight
            };
            
            win.style.width = `${size.x + 5}px`;
            
            // Only resize height if not using Bootstrap
            if (typeof Fabrik === 'undefined' || Fabrik.bootstrapped) return;
            
            const y = setup ? win.offsetHeight : size.y + 30;
            win.style.height = `${y}px`;
        });
    }

    close() {
        Object.values(this.win).forEach(win => {
            win.style.display = 'none';
        });
        this.mask.style.display = 'none';
    }

    _getRadioValues(target) {
        return this.getTrs(target).map(tr => {
            const sel = tr.querySelector('input[type="radio"]:checked');
            return sel ? sel.value : '';
        });
    }

    _setRadioValues(radiovals, target) {
        this.getTrs(target).forEach((tr, i) => {
            const radio = tr.querySelector(`input[type="radio"][value="${radiovals[i]}"]`);
            if (radio) radio.checked = true;
        });
    }

    addRow(target, source) {
        const radiovals = this._getRadioValues(target);
        const body = source.closest('table').querySelector('tbody');
        const clone = this.tmpl.cloneNode(true);
        
        body.appendChild(clone);
        this.stripe(target);
        this.fixUniqueAttributes(source, clone);
        this._setRadioValues(radiovals, target);
        this.resetChosen(clone);
        this.resizeWin(false, target);
    }

    fixUniqueAttributes(source, row) {
        const rowCount = source.closest('table').querySelectorAll('tr').length - 1;

        row.querySelectorAll('[name]').forEach(node => {
            node.name += `-${rowCount}`;
        });

        row.querySelectorAll('[id]').forEach(node => {
            node.id += `-${rowCount}`;
        });

        row.querySelectorAll('label[for]').forEach(node => {
            node.setAttribute('for', node.getAttribute('for') + `-${rowCount}`);
        });
    }

    watchButtons(win, target) {
        win.addEventListener('click', (e) => {
            const addButton = e.target.closest('a.add');
            if (addButton) {
                const tr = this.findTr(addButton);
                if (tr) {
                    this.addRow(target, tr);
                    win.style.position = 'fixed';
                    win.style.top = '50%';
                    win.style.left = '50%';
                    win.style.transform = 'translate(-50%, -50%)';
                }
                e.preventDefault();
            }

            const removeButton = e.target.closest('a.remove');
            if (removeButton) {
                const tr = this.findTr(removeButton);
                if (tr) {
                    tr.remove();
                }
                this.resizeWin(false, target);
                win.style.position = 'fixed';
                win.style.top = '50%';
                win.style.left = '50%';
                win.style.transform = 'translate(-50%, -50%)';
                e.preventDefault();
            }
        });
    }

    resetChosen(clone) {
        // Note: This method assumes jQuery and Chosen are available
        // If not using jQuery/Chosen, you might want to remove or modify this
        if (!this.options.j3) return;

        if (window.jQuery && typeof jQuery('select').chosen === 'function') {
            const selects = clone.querySelectorAll('select');
            selects.forEach(select => {
                select.classList.remove('chosen-done');
                select.style.display = 'block';
                select.id = `${select.id}_${Math.floor(Math.random() * 10000000)}`;
            });

            // Remove existing Chosen containers
            clone.querySelectorAll('.chosen-container').forEach(el => el.remove());

            // Reinitialize Chosen
            jQuery(clone).find('select').chosen({
                disable_search_threshold: 10,
                allow_single_deselect: true,
                width: '265px'
            });
        }
    }

    getTrs(target) {
        return Array.from(this.el[target].querySelector('tbody').querySelectorAll('tr'));
    }

    stripe(target) {
        const trs = this.getTrs(target);
        trs.forEach((tr, i) => {
            tr.classList.remove('row0', 'row1');
            tr.classList.add(`row${i % 2}`);
        });
    }


    build(target) {
        if (!this.win[target]) {
            this.makeWin(target);
        }

        let a = JSON.parse(this.field[target].value);
        if (a === null) {
            a = {};
        }
        
        const tbody = this.el[target].querySelector('tbody');
        const tr = tbody.querySelector('tr');
        const keys = Object.keys(a);
        
        const newrow = keys.length === 0 || a[keys[0]].length === 0;
        const rowcount = newrow ? 1 : a[keys[0]].length;

        // Create additional rows if needed
        for (let i = 1; i < rowcount; i++) {
            const clone = tr.cloneNode(true);
            this.fixUniqueAttributes(tr, clone);
            tbody.appendChild(clone);
            this.resetChosen(clone);
        }

        this.stripe(target);
        const trs = this.getTrs(target);

        // Populate rows with JSON values
        for (let i = 0; i < rowcount; i++) {
            keys.forEach(k => {
                const fields = trs[i].querySelectorAll(`[name*="${k}"]`);
                fields.forEach(f => {
                    if (f.type === 'radio') {
                        f.checked = f.value === a[k][i];
                    } else {
                        f.value = a[k][i];
                        // Manual chosen update if needed
                        if (f.tagName === 'SELECT' && window.jQuery) {
                            jQuery(f).trigger('chosen:updated');
                        }
                    }
                });
            });
        }

        this.tmpl = tr;
        if (newrow) {
            tr.remove();
        }
    }

    findTr(e) {
        const tr = e.closest('tr');
        return tr || false;
    }

    store(target) {
        const c = this.el[target];
        const json = {};

        this.names.forEach(n => {
            const fields = c.querySelectorAll(`[name*="${n}"]`);
            json[n] = [];

            fields.forEach(field => {
                if (field.type === 'radio') {
                    if (field.checked) {
                        json[n].push(field.value);
                    }
                } else {
                    json[n].push(field.value);
                }
            });
        });

        this.field[target].value = JSON.stringify(json);
        return true;
    }
}
