/**
 * List
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// F5: Removed csv code to separate csv-list.js file
// F5: Temporary leave jQuery code. Change to vanilla JS later. Some functions are already changed.
// F5: Not all functions may be used or can be solved in php/css

// TEST: Replaced $H() by Map()
// ALL if (typeof(value) === 'null') => changed to (value === 'null')
// TEST: if (typeof(data) !== 'object')
// removed (comment out) all Fabrik.loader

import { Fabrik } from "@fabrik";

export class FbList {

	actionManager = null;

	defaults = {
		admin: false,
		filterMethod: 'onchange',
		ajax: false,
		ajax_links: false,
		links: { edit: '', detail: '', add: '' },
		form: '',
		hightLight: '#ccffff',
		primaryKey: '',
		headings: [],
		labels: {},
		Itemid: 0,
		formid: 0,
		canEdit: true,
		canView: true,
		page: 'index.php',
		actionMethod: 'floating',
		formels: [],
		data: [],
		itemTemplate: '',
		floatPos: 'left',
		advancedFilters: null,
		popup_width: 300,
		popup_height: 300,
		popup_offset_x: null,
		popup_offset_y: null,
		groupByOpts: {},
		isGrouped: false,
		listRef: '',
		fabrik_show_in_list: [],
		singleOrdering: false,
		tmpl: '',
		groupedBy: '',
		toggleCols: false
	};

	constructor(id, options) {
		this.id = id;
		this.options = { ...this.defaults, ...options };
		this.getForm();
		this.result = true; // Used with plugins to determine if list actions should be performed
		this.plugins = [];
		this.list = document.querySelector(`#list_${this.options.listRef}`);
		this.rowTemplate = false;

		if (this.options.toggleCols) {
			this.toggleCols = new FbListToggle(this.form);
		}
		if (this.options.doGroupby) {
			this.groupToggle = new FbGroupedToggler(this.form, this.options.groupByOpts);
		}
		if (this.list) {
			if (this.list.tagName === 'TABLE') {
				this.tbody = this.list.querySelector('tbody');
			}
			if (!this.tbody) {
				this.tbody = this.list.querySelector('.fabrik_groupdata');
			}
		}
		this.watchAll(false);
		Fabrik.addEvent('fabrik.form.submitted', () => {
			this.updateRows();
		});

		if (!this.options.resetFilters && window.history && history.pushState && history.state && this.options.ajax) {
			this._updateRows(history.state);
		}
		this.mediaScan();
		Fabrik.fireEvent('fabrik.list.loaded', [this]);
	}

	setRowTemplate(parent) {
		if (!this.rowTemplate) {
			this.rowTemplate = parent.cloneNode(true);
			this.rowTemplate.innerHTML = '';
		}
		return this.rowTemplate;
	}

	/**
	 * Used for db join select states.
	 */
	rowClicks() {
		this.list.addEventListener('click', (e) => {
			if (e.target.classList.contains('fabrik_row')) {
				const rowId = e.target.id.split('_').pop();
				const json = {
					errors: {},
					data: { rowid: rowId },
					rowid: rowId,
					listid: this.id
				};
				Fabrik.fireEvent('fabrik.list.row.selected', json);
			}
		});
	}

	watchAll(ajaxUpdate = false) {
		this.watchNav();
		this.storeCurrentValue();
		if (!ajaxUpdate) {
			this.watchRows();
			this.watchFilters();
		}
		this.watchOrder();
		this.watchEmpty();
		if (!ajaxUpdate) {
			this.watchGroupByMenu();
			this.watchButtons();
		}
	}

	/**
	 * Watch the group by buttons when list rendering as ajax
	 */
	watchGroupByMenu() {
		if (this.options.ajax) {
			this.form.addEventListener('click', (e) => {
				const target = e.target;
				if (target.hasAttribute('data-groupBy')) {
					e.preventDefault();
					this.options.groupedBy = target.getAttribute('data-groupBy');
					this.updateRows();
				}
			});
		}
	}

	watchButtons() {
	    this.exportWindowOpts = {
	        modalId: 'exportcsv',
	        type: 'modal',
	        id: 'exportcsv',
	        title: 'Export CSV',
	        loadMethod: 'html',
	        minimizable: false,
	        width: parseInt(this.options.csvOpts.popupwidth, 10) > 0 ? this.options.csvOpts.popupwidth : 360,
	        height: parseInt(this.options.csvOpts.optswidth, 10) > 0 ? this.options.csvOpts.optswidth : 240,
	        content: '',
	        modal: true,
	        bootstrap: true,
	        visible: true,
	        onContentLoaded: function () {
	            setTimeout(() => {
	                this.fitToContent();
	            }, 1000);
	        }
	    };

	    if (this.options.view === 'csv') {
	        // For CSV links, e.g., index.php?option=com_fabrik&view=csv&listid=10
	        this.openCSVWindow();
	    } else {
	        const exportButtons = this.form.querySelectorAll('.csvExportButton');
	        exportButtons.forEach((button) => {
	            if (!button.classList.contains('custom')) {
	                button.addEventListener('click', (e) => {
	                    e.preventDefault();
	                    this.openCSVWindow();
	                });
	            }
	        });
	    }
	}

	/* csv part 1 */ 

	makeSafeForCSS(name) {
	    return name.replace(/[^a-z0-9]/gi, (s) => {
	        const c = s.charCodeAt(0);
	        if (c === 32) return '-'; // Replace space with hyphen
	        if (c >= 65 && c <= 90) return s.toLowerCase(); // Convert uppercase to lowercase
	        return `000${c.toString(16)}`.slice(-4); // Convert other characters to hexadecimal
	    });
	}

	addPlugins(plugins) {
	    plugins.forEach((plugin) => {
	        plugin.list = this;
	    });
	    this.plugins = plugins;
	}

	firePlugin(method, ...args) {
	    this.plugins.forEach((plugin) => {
	        Fabrik.fireEvent(method, [this, args]);
	    });
	    return this.result !== false;
	}

	/**
	 * Watch the empty data button
	 */
	watchEmpty() {
	    const emptyButton = this.form.querySelector('.doempty');
	    if (emptyButton) {
	        emptyButton.addEventListener('click', (e) => {
	            e.preventDefault();
	            if (window.confirm(Joomla.Text._('COM_FABRIK_CONFIRM_DROP'))) {
	                this.submit('list.doempty');
	            }
	        });
	    }
	}

	/**
	 * Watch order buttons
	 */
	watchOrder() {
	    const orderButtons = this.form.querySelectorAll('.fabrikorder, .fabrikorder-asc, .fabrikorder-desc');
	    orderButtons.forEach((button) => {
	        button.addEventListener('click', (e) => {
	            e.preventDefault();
	            let elementId = false;
	            let orderDir = '';
	            let newOrderClass = '';
	            let icon = null;
	            let otherIcon = null;

	            const buttonClass = button.className;
	            const td = button.closest('.fabrik_ordercell');

	            switch (buttonClass) {
	                case 'fabrikorder-asc':
	                    newOrderClass = 'fabrikorder-desc';
	                    orderDir = 'desc';
	                    break;
	                case 'fabrikorder-desc':
	                    newOrderClass = 'fabrikorder';
	                    orderDir = '-';
	                    break;
	                case 'fabrikorder':
	                    newOrderClass = 'fabrikorder-asc';
	                    orderDir = 'asc';
	                    break;
	            }

	            // Determine elementId from class names
	            td.className.split(' ').forEach((c) => {
	                if (c.includes('_order')) {
	                    elementId = c.replace('_order', '').trim();
	                }
	            });

	            if (!elementId) {
	                console.error('Unable to find element id, cannot order');
	                return;
	            }

	            button.className = newOrderClass;
	            this.fabrikNavOrder(elementId, orderDir);
	        });
	    });
	}

	/**
	 * Get DOM nodes with class fabrik_filter
	 */
	getFilters() {
	    return Array.from(this.form.querySelectorAll('.fabrik_filter'));
	}

	/**
	 * Store filter current values when the list is set to update on filter change
	 * rather than filter form submission
	 */
	storeCurrentValue() {
	    if (this.options.filterMethod !== 'submitform') {
	        this.getFilters().forEach((filter) => {
	            filter.dataset.initialvalue = filter.value;
	        });
	    }
	}

	/**
	 * Watch filters for changes that may trigger the list to be re-rendered
	 */
	watchFilters() {
	    const submitButton = this.form.querySelector('.fabrik_filter_submit');

	    this.getFilters().forEach((filter) => {
	        const eventType = (filter.tagName === 'SELECT' || filter.type === 'checkbox') ? 'change' : 'blur';

	        if (this.options.filterMethod !== 'submitform') {
	            filter.addEventListener(eventType, (e) => {
	                e.preventDefault();
	                if (filter.type === 'checkbox' || filter.dataset.initialvalue !== filter.value) {
	                    this.doFilter();
	                }
	            });
	        }
	    });

	    if (submitButton) {
	        submitButton.addEventListener('click', (e) => {
	            e.preventDefault();
	            this.doFilter();
	        });
	    }

	    this.getFilters().forEach((filter) => {
	        filter.addEventListener('keydown', (e) => {
	            if (e.key === 'Enter') {
	                e.preventDefault();
	                this.doFilter();
	            }
	        });
	    });
	}

	/**
	 * Perform list filter
	 */
	doFilter() {
	    const res = Fabrik.fireEvent('list.filter', [this]).eventResults;
	    if (res === null || res.length === 0 || !res.includes(false)) {
	        this.submit('list.filter');
	    }
	}

	/**
	 * Highlight active row, deselect others
	 */
	setActive(activeTr) {
	    this.list.querySelectorAll('.fabrik_row').forEach((tr) => {
	        tr.classList.remove('activeRow');
	    });
	    activeTr.classList.add('activeRow');
	}

	/**
	 * Get the active list row for a given mouse event.
	 * If none found, return the current active row
	 */
	getActiveRow(e) {
	    const row = e.target.closest('.fabrik_row');
	    return row || Fabrik.activeRow;
	}

	/**
	 * Watch rows for clicks and interactions.
	 */
	watchRows() {
		if (!this.list) {
			return;
		}
		this.rowClicks();
	}

	getForm() {
		if (!this.form) {
			this.form = document.querySelector('#' + this.options.form);
		}
		return this.form;
	}

	/**
	 * Un-check all the row's checkboxes
	 */
	uncheckAll() {
	    const checkboxes = this.form.querySelectorAll('input[name^="ids"]');
	    checkboxes.forEach((checkbox) => {
	        checkbox.checked = false;
	    });
	}

	/**
	 * Check if there are some selected records to delete and ask the user if they really want to delete
	 * those records.
	 * Returns false to stop the list's form from being submitted.
	 *
	 * @returns {boolean}
	 */
	submitDeleteCheck() {
	    let ok = false;
	    let delCount = 0;

	    const checkboxes = this.form.querySelectorAll('input[name^="ids"]');
	    checkboxes.forEach((checkbox) => {
	        if (checkbox.checked) {
	            delCount++;
	            ok = true;
	        }
	    });

	    if (!ok) {
	        window.alert(Joomla.Text._('COM_FABRIK_SELECT_ROWS_FOR_DELETION'));
	        return false;
	    }

	    const delMsg = delCount === 1
	        ? Joomla.Text._('COM_FABRIK_CONFIRM_DELETE_1')
	        : Joomla.Text._('COM_FABRIK_CONFIRM_DELETE').replace('%s', delCount);

	    if (!window.confirm(delMsg)) {
	        this.uncheckAll();
	        return false;
	    }

	    return true;
	}

	submit(task) {
	    this.getForm();
	    let doAJAX = this.options.ajax;

	    if (task === 'list.doPlugin.noAJAX') {
	        task = 'list.doPlugin';
	        doAJAX = false;
	    }

	    if (task === 'list.delete' && !this.submitDeleteCheck()) {
	        return false;
	    }

	    if (task === 'list.filter') {
	        Fabrik[`filter_listform_${this.options.listRef}`].onSubmit();
	        this.form.task.value = task;
	        const limitStart = this.form.querySelector(`#limitstart${this.id}`);
	        if (limitStart) {
	            limitStart.value = 0;
	        }
	    } else if (task === 'list.view') {
	        Fabrik[`filter_listform_${this.options.listRef}`].onSubmit();
	    } else {
	        if (task !== '') {
	            this.form.task.value = task;
	        }
	    }

	    if (doAJAX) {
	        // Set form data
	        this.form.querySelector('input[name="option"]').value = 'com_fabrik';
	        this.form.querySelector('input[name="view"]').value = 'list';
	        this.form.querySelector('input[name="format"]').value = 'raw';

	        let data = new URLSearchParams(new FormData(this.form)).toString();

	        data += `&setListRefFromRequest=1&listref=${this.options.listRef}&Itemid=${this.options.Itemid}`;

	        if (task === 'list.filter' && this.advancedSearch !== false) {
	            const advSearchForm = document.querySelector(`form.advancedSearch_${this.options.listRef}`);
	            if (advSearchForm) {
	                data += `&${new URLSearchParams(new FormData(advSearchForm)).toString()}&replacefilters=1`;
	            }
	        }

	        this.options.fabrik_show_in_list.forEach((item) => {
	            data += `&fabrik_show_in_list[]=${item}`;
	        });

	        data += `&tmpl=${this.options.tmpl}`;

	        if (!this.request) {
	            this.request = new XMLHttpRequest();
	            this.request.addEventListener('load', () => {
	                const response = JSON.parse(this.request.responseText);
	                this._updateRows(response);
	                Fabrik[`filter_listform_${this.options.listRef}`].onUpdateData();
	                Fabrik[`filter_listform_${this.options.listRef}`].updateFilterCSS(response);

	                const searchAll = document.querySelector(`#searchall_${this.options.listRef}`);
	                if (searchAll) {
	                    searchAll.value = response.searchallvalue;
	                }

	                Fabrik.fireEvent('fabrik.list.submit.ajax.complete', [this, response]);

	                if (response.msg && response.showmsg) {
	                    window.alert(response.msg);
	                }
	            });
	        }

	        this.request.open('POST', this.form.action);
	        this.request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	        this.request.send(data);

	        if (window.history && window.history.pushState) {
	            history.pushState(data, 'fabrik.list.submit');
	        }

	        Fabrik.fireEvent('fabrik.list.submit', [task, Object.fromEntries(new URLSearchParams(data))]);
	    } else {
	        this.form.submit();
	    }

	    return false;
	}

	/**
	 *
	 * @param {number} limitStart
	 * @returns {boolean}
	 */
	fabrikNav(limitStart) {
	    this.options.limitStart = limitStart;
	    const limitStartInput = this.form.querySelector(`#limitstart${this.id}`);
	    if (limitStartInput) {
	        limitStartInput.value = limitStart;
	    }
	    // Can't do filter as that resets limitStart to 0
	    Fabrik.fireEvent('fabrik.list.navigate', [this, limitStart]);
	    if (!this.result) {
	        this.result = true;
	        return false;
	    }
	    this.submit('list.view');
	    return false;
	}

	/**
	 * Get the primary keys for the visible rows
	 *
	 * @since 3.0.7
	 * @returns {Array} Array of primary keys
	 */
	getRowIds() {
	    const keys = [];
	    let data = this.options.isGrouped ? new Map(Object.entries(this.options.data)) : this.options.data;

	    data.forEach((group) => {
	        group.forEach((row) => {
	            keys.push(row.data.__pk_val);
	        });
	    });

	    return keys;
	}

	/**
	 * Get the primary keys for all checked rows
	 *
	 * @since 3.7
	 * @returns {Array} Array of checked primary keys
	 */
	getCheckedRowIds() {
	    const checkboxes = Array.from(this.form.querySelectorAll('input[name^="ids"]'));
	    return checkboxes
	        .filter((checkbox) => checkbox.checked)
	        .map((checkbox) => checkbox.value);
	}

	/**
	 * Get a single row's data
	 *
	 * @param {string} id - Row ID
	 * @since 3.0.8
	 * @returns {Object} Row data
	 */
	getRow(id) {
	    let found = {};
	    Object.values(this.options.data).forEach((group) => {
	        for (const row of group) {
	            if (row && row.data.__pk_val == id) {
	                found = row.data;
	                break;
	            }
	        }
	    });
	    return found;
	}

	/**
	 * Handle navigation ordering
	 *
	 * @param {string} orderby - Column to order by
	 * @param {string} orderdir - Order direction
	 */
	fabrikNavOrder(orderby, orderdir) {
	    this.form.querySelector('input[name="orderby"]').value = orderby;
	    this.form.querySelector('input[name="orderdir"]').value = orderdir;

	    Fabrik.fireEvent('fabrik.list.order', [this, orderby, orderdir]);

	    if (!this.result) {
	        this.result = true;
	        return false;
	    }
	    this.submit('list.order');
	}

	/**
	 * Remove rows by ID
	 *
	 * @param {Array} rowids - Array of row IDs to remove
	 */
	removeRows(rowids) {
	    rowids.forEach((rowid) => {
	        const row = document.getElementById(`list_${this.id}_row_${rowid}`);
	        if (row) {
	            row.style.transition = 'background-color 1s, opacity 1s';
	            row.style.backgroundColor = this.options.hightLight;

	            setTimeout(() => {
	                row.style.opacity = 0;
	                setTimeout(() => {
	                    row.remove();
	                    this.checkEmpty();
	                }, 1000);
	            }, 1000);
	        }
	    });
	}

	editRow() {
	}

	/**
	 * Clear all rows
	 */
	clearRows() {
	    const rows = Array.from(this.list.querySelectorAll('.fabrik_row'));
	    rows.forEach((row) => row.remove());
	}

	/**
	 * Update rows in the list.
	 */
	updateRows(extraData) {
		const url = '';
		const data = {
			option: 'com_fabrik',
			view: 'list',
			task: 'list.view',
			format: 'raw',
			listid: this.id,
			listref: this.options.listRef
		};
		data[`limit${this.id}`] = this.options.limitLength;

		if (extraData) {
			Object.assign(data, extraData);
		}

		if (this.options.groupedBy !== '') {
			data['group_by'] = this.options.groupedBy;
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(response => response.text())
			.then(json => {
				const scriptlessJson = json.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
				const parsedData = JSON.parse(scriptlessJson);
				this._updateRows(parsedData);
				// Fabrik.fireEvent('fabrik.list.update', [this, parsedData]);
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	/**
	 * Update headings after ajax data load
	 * @param {object} data
	 * @private
	 */
	_updateHeadings(data) {
	    const headers = document.querySelectorAll(`#${this.options.form} .fabrik___heading`);

	    Object.entries(data.headings).forEach(([key, value]) => {
	        const headerElement = headers.querySelector(`.${key} span`);
	        try {
	            // $$$ rob 28/10/2011 just alter span to allow for maintaining filter toggle links
	            if (headerElement) {
	                headerElement.innerHTML = value;
	            }
	        } catch (err) {
	            console.error(err);
	        }
	    });
	}

	/**
	 * Grouped data - show all tbodys, then hide empty tbodys (not going to work for non-<table> templates)
	 * @private
	 */
	_updateGroupByTables() {
	    const tbodys = this.list.querySelectorAll('tbody');
	    tbodys.forEach((tbody) => {
	        tbody.style.display = '';
	        if (!tbody.classList.contains('fabrik_groupdata')) {
	            const groupTbody = tbody.nextElementSibling;
	            if (groupTbody && groupTbody.querySelectorAll('.fabrik_row').length === 0) {
	                tbody.style.display = 'none';
	                groupTbody.style.display = 'none';
	            }
	        }
	    });
	}

	/**
	 * Update list items
	 * @param {object} data
	 * @private
	 */
	_updateRows(data) {
	    if (typeof data !== 'object') {
	        return;
	    }

	    if (window.history && window.history.pushState) {
	        window.history.pushState(data, 'fabrik.list.rows');
	    }

	    if (!(data.id === this.id && data.model === 'list')) {
	        return;
	    }

	    this._updateHeadings(data);

	    let cell = this.list.querySelector('.fabrik_row');

	    if (!cell) {
	        cell = this.options.itemTemplate;
	    }

	    let parent;
	    let columnCount = 1;
	    let tmpl = 'tr';

	    if (cell.tagName === 'TR') {
	        parent = cell;
	    } else {
	        parent = cell.parentElement;
	        columnCount = parseInt(document.querySelector('.fabrikDataContainer').dataset.cols, 10) || 1;
	        tmpl = 'div';
	    }

	    const rowTemplate = this.setRowTemplate(parent);
	    const itemTemplate = cell.cloneNode(true);

	    this.clearRows();

	    if (this.options.isGrouped) {
	        this.options.data = new Map(Object.entries(data.data));
	    } else {
	        this.options.data = data.data;
	    }

	    if (data.calculations) {
	        this.updateCals(data.calculations);
	    }

	    document.querySelector('.fabrikNav').innerHTML = data.htmlnav;

	    let gdata;
	    if (this.options.isGrouped || this.options.groupedBy !== '') {
	        gdata = new Map(Object.entries(data.data));
	    } else {
	        gdata = data.data;
	    }

	    let gcounter = 0;
	    gdata.forEach((groupData) => {
	        const tbody = this.options.isGrouped ? this.list.querySelectorAll('.fabrik_groupdata')[gcounter] : this.tbody;
	        tbody.querySelectorAll(':scope > :not(.groupDataMsg)').forEach((child) => {
	            child.remove();
	        });

	        if (this.options.isGrouped) {
	            const groupHeading = tbody.previousElementSibling;
	            if (groupHeading) {
	                const groupTitle = groupHeading.querySelector('.groupTitle');
	                if (groupTitle) {
	                    groupTitle.innerHTML = groupData[0].groupHeading;
	                }
	            }
	        }

	        const items = [];
	        groupData.forEach((row) => {
	            const rowMap = new Map(Object.entries(row));
	            const item = this.injectItemData(itemTemplate, rowMap, tmpl);
	            items.push(item);
	        });

	        const chunks = Fabrik.Array.chunk(items, columnCount);
	        chunks.forEach((chunk) => {
	            const fullRow = tmpl === 'div' ? rowTemplate.cloneNode(true).append(...chunk) : chunk;
	            tbody.appendChild(fullRow);
	        });

	        gcounter++;
	    });

	    this._updateGroupByTables();
	    this._updateEmptyDataMsg(items.length === 0);
	    this.watchAll(true);
	    Fabrik.fireEvent('fabrik.list.updaterows');
	    Fabrik.fireEvent('fabrik.list.update', [this, data]);
	    this.stripe();
	    this.mediaScan();
	}

	_updateEmptyDataMsg(empty) {
	    const fabrikDataContainer = this.list.closest('.fabrikDataContainer');
	    const emptyDataMessage = this.list.closest('.fabrikForm').querySelector('.emptyDataMessage');

	    if (empty) {
	        emptyDataMessage.style.display = '';

	        const parent = emptyDataMessage.parentElement;
	        if (parent.style.display === 'none') {
	            parent.style.display = '';
	        }
	    } else {
	        if (fabrikDataContainer) {
	            fabrikDataContainer.style.display = '';
	        }
	        emptyDataMessage.style.display = 'none';
	    }
	}

	/**
	 * Inject item data into the item data template
	 * @param {HTMLElement} template
	 * @param {Map} row
	 * @param {string} tmpl - div or row template
	 * @return {HTMLElement}
	 */
    injectItemData(template, row, tmpl) {
        let r, cell, c;

        // Iterate through row data and update template
        Object.entries(row.data).forEach(([key, val]) => {
            cell = template.querySelector(`.${key}`);
            if (cell && cell.tagName !== 'A') {
                cell.innerHTML = val;
            } else if (cell) {
                try {
                    // Handle view/edit links with data-rowid
                    const href = val.getAttribute('href');
                    const rowid = val.dataset.rowid;

                    cell.querySelectorAll('*').forEach((thisCell) => {
                        if (thisCell.dataset.iscustom === "0") {
                            thisCell.setAttribute('href', href);
                            thisCell.dataset.rowid = rowid;
                        }
                    });
                } catch (err) {
                    // If `val` wasn't an anchor, treat it as an href
                    cell.setAttribute('href', val);
                }
            }
        });

        if (typeof this.options.itemTemplate === 'string') {
            c = template.querySelectorAll('.fabrik_row');
            c.forEach((item) => {
                item.setAttribute('id', row.id);

                if (tmpl !== 'div') {
                    item.className = '';
                    const newClasses = row['class'].split(/\s+/);
                    newClasses.forEach((newClass) => {
                        item.classList.add(newClass);
                    });
                } else {
                    item.classList.remove('oddRow0', 'oddRow1');
                    const newClasses = row['class'].split(/\s+/);
                    newClasses.forEach((newClass) => {
                        if (!item.classList.contains(newClass)) {
                            item.classList.add(newClass);
                        }
                    });
                }
            });

            r = template.cloneNode(true);
        } else {
            r = template.querySelector('.fabrik_row') || template.cloneNode(true);
        }

        return r;
    }

	/**
	 * Scan the list for media elements and reinitialize if needed.
	 */
	mediaScan() {
		if (typeof Slimbox !== 'undefined') {
			Slimbox.scanPage();
		}
		if (typeof Lightbox !== 'undefined') {
			Lightbox.init();
		}
		if (typeof Mediabox !== 'undefined') {
			Mediabox.scanPage();
		}
	}

	addRow(obj) {
	    const row = document.createElement('tr');
	    row.className = 'oddRow1';

	    for (const key in obj) {
	        if (this.options.headings.includes(key)) {
	            const cell = document.createElement('td');
	            cell.textContent = obj[key];
	            row.appendChild(cell);
	        }
	    }

	    this.tbody.appendChild(row);
	}

	addRows(dataArray) {
	    dataArray.forEach(group => {
	        group.forEach(data => {
	            this.addRow(data);
	        });
	    });
	    this.stripe();
	}

	stripe() {
	    const rows = this.list.querySelectorAll('.fabrik_row');
	    rows.forEach((row, index) => {
	        if (!row.classList.contains('fabrik___header')) { // Ignore header rows
	            row.className = row.className.replace(/oddRow[0-9]/g, ''); // Remove any existing oddRow class
	            row.classList.add(`oddRow${index % 2}`);
	        }
	    });
	}

	checkEmpty() {
	    const rows = this.list.querySelectorAll('tr');
	    if (rows.length === 2) { // Only header row and an empty row
	        this.addRow({
	            label: Joomla.Text._('COM_FABRIK_NO_RECORDS')
	        });
	    }
	}

	watchCheckAll() {
	    const form = this.form;
	    const checkAll = form.querySelector('input[name="checkAll"]');
	    const checkboxes = form.querySelectorAll('input[name^="ids"]');

	    checkAll.addEventListener('click', (e) => {
	        const checked = e.target.checked;
	        checkboxes.forEach(checkbox => {
	            checkbox.checked = checked;
	            this.toggleJoinKeysChx(checkbox);
	        });
	    });

	    checkboxes.forEach(checkbox => {
	        checkbox.addEventListener('change', () => {
	            this.toggleJoinKeysChx(checkbox);
	        });
	    });
	}

	toggleJoinKeysChx(checkbox) {
	    const relatedKeys = checkbox.parentElement.querySelectorAll('input.fabrik_joinedkey');
	    relatedKeys.forEach(keyCheckbox => {
	        keyCheckbox.checked = checkbox.checked;
	    });
	}

	watchNav() {
	    const limitBox = this.form.querySelector('select[name*="limit"]');
	    const addRecord = this.form.querySelector('.addRecord');
	    const self = this;

	    if (limitBox) {
	        limitBox.addEventListener('change', () => {
	            Fabrik.fireEvent('fabrik.list.limit', [self]);
	            if (!self.result) {
	                self.result = true;
	                return false;
	            }
	            self.doFilter();
	        });
	    }

	    if (this.options.ajax_links && addRecord) {
	        const href = addRecord.getAttribute('href');
	        const loadMethod = this.options.links.add === '' || href.includes(Fabrik.liveSite) ? 'xhr' : 'iframe';
	        let url = `${href}${href.includes('?') ? '&' : '?'}tmpl=component&ajax=1&format=partial`;

	        addRecord.addEventListener('click', (e) => {
	            e.preventDefault();
	            Fabrik.getWindow({
	                id: `add.${self.id}`,
	                title: self.options.popup_add_label,
	                loadMethod: loadMethod,
	                contentURL: url,
	                width: self.options.popup_width,
	                height: self.options.popup_height,
	                offset_x: self.options.popup_offset_x,
	                offset_y: self.options.popup_offset_y
	            });
	        });
	    }

	    const swapTable = document.querySelector('#fabrik__swaptable');
	    if (swapTable) {
	        swapTable.addEventListener('change', (e) => {
	            window.location = `index.php?option=com_fabrik&task=list.view&cid=${e.target.value}`;
	        });
	    }

	    const navLinks = this.form.querySelectorAll('.pagination .pagenav, .pagination a');
	    navLinks.forEach(link => {
	        link.addEventListener('click', (e) => {
	            e.preventDefault();
	            if (e.target.tagName === 'A') {
	                const params = new URLSearchParams(new URL(e.target.href).search);
	                self.fabrikNav(params.get(`limitstart${self.id}`));
	            }
	        });
	    });

	    this.watchCheckAll();
	}

	updateCals(json) {
	    const types = ['sums', 'avgs', 'count', 'medians'];
	    const calculations = this.form.querySelectorAll('.fabrik_calculations');

	    calculations.forEach(calculation => {
	        types.forEach(type => {
	            const data = json[type];
	            for (const key in data) {
	                const target = calculation.querySelector(`.${key}`);
	                if (target) {
	                    target.innerHTML = data[key];
	                }
	            }
	        });
	    });
	}
}
