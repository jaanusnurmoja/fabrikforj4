/**
 * List Filter
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
 
// F5: Temporary leave jQuery code. Change to vanilla JS later. Some functions are already changed.
// F5: Not all functions may be used or can be solved in php/css

import {Fabrik} from "@window"; // need to import from new-window.js to also have function Fabrik.getWindow
import {AdvancedSearch} from "@advanced-search"; // We could use dynamic import if AdvancedSearch is not enabled 

export class FbListFilter {

	defaults = {
		'container'     : '',
		'filters'       : [],
		'type'          : 'list',
		'id'            : '',
		'ref'           : '',
		'advancedSearch': {
			'controller': 'list'
		}
	};

	constructor (options) {
		var self = this;
		this.filters = {};
		this.options = options;
		this.options = { // options merges with defaults
			...this.defaults,
			...this.options
		};
		this.advancedSearch = false;
		this.container = jQuery('#' + this.options.container);

		this.filterContainer = this.container.find('.fabrikFilterContainer');
		this.filtersInHeadings = this.container.find('.listfilter');
		var b = this.container.find('.toggleFilters');
		b.on('click', function (e) {
			e.preventDefault();
			self.filterContainer.toggle();
			self.filtersInHeadings.toggle();
		});

		if (b.length > 0) {
			this.filterContainer.hide();
			this.filtersInHeadings.toggle();
		}

		if (this.container.length === 0) {
			return;
		}
		this.getList();
		var c = this.container.find('.clearFilters');
		c.off();
		c.on('click', function (e) {
			e.preventDefault();
			// Reset the filter fields that contain previously selected values
			self.container.find('.fabrik_filter').each(function (i, f) {
				self.clearAFilter(f);
			});
			self.clearPlugins();
			self.submitClearForm();
		});

		var advancedSearchButton = this.container.find('.advanced-search-link');
		if(advancedSearchButton) {
			// We could use dynamic import if AdvancedSearch is not enabled 
			advancedSearchButton.on('click', function (e) {
				e.preventDefault();
				var a = jQuery(e.target), windowopts;
				if (a.getAttribute('tagName') !== 'A') {
					a = a.closest('a');
				}
				var url = a.getAttribute('href');
				url += '&listref=' + self.options.ref;
				windowopts = {
					id             : 'advanced-search-win' + self.options.ref,
					modalId        : 'advanced-filter',
					title          : Joomla.Text._('COM_FABRIK_ADVANCED_SEARCH'),
					loadMethod     : 'xhr',
					evalScripts    : true,
					contentURL     : url,
					width          : 710,
					height         : 340,
					y              : self.options.popwiny,
					onContentLoaded: function () {
						var list = Fabrik.blocks['list_' + self.options.ref];
						if (list === undefined) {
							list = Fabrik.blocks[self.options.container];
							self.options.advancedSearch.parentView = self.options.container;
						}
						list.advancedSearch = new AdvancedSearch(self.options.advancedSearch);
						this.fitToContent(false);
					}
				};
				Fabrik.getWindow(windowopts);
			});
		}
		jQuery('.fabrik_filter.advancedSelect').on('change', {changeEvent: 'change'}, function (event) {
			this.fireEvent(event.data.changeEvent,
				new Event.Mock(document.getElementById(this.id), event.data.changeEvent));
		});

		this.watchClearOne();

	}


	getList () {
		this.list = Fabrik.blocks[this.options.type + '_' + this.options.ref];
		if (this.list === undefined) {
			this.list = Fabrik.blocks[this.options.container];
		}
		return this.list;
	}

	addFilter (plugin, f) {
		if (this.filters.hasOwnProperty(plugin) === false) {
			this.filters[plugin] = [];
		}
		this.filters[plugin].push(f);
	}

	onSubmit () {
		if (this.filters.date) {
			jQuery.each(this.filters.date, function (key, f) {
				f.onSubmit();
			});
		}
		if (this.filters.jdate) {
			jQuery.each(this.filters.jdate, function (key, f) {
				f.onSubmit();
			});
		}
		this.showFilterState();
	}

	onUpdateData () {
		if (this.filters.date) {
			jQuery.each(this.filters.date, function (key, f) {
				f.onUpdateData();
			});
		}
		if (this.filters.jdate) {
			jQuery.each(this.filters.jdate, function (key, f) {
				f.onUpdateData();
			});
		}
	}

	// $$$ hugh - added this primarily for CDD element, so it can get an array to
	// emulate submitted form data
	// for use with placeholders in filter queries. Mostly of use if you have
	// daisy chained CDD's.
	getFilterData () {
		var h = {};
		this.container.find('.fabrik_filter').each(function () {
			if (typeof jQuery(this).getAttribute('id') !== 'undefined' && jQuery(this).getAttribute('id').test(/value$/)) {
				var key = jQuery(this).getAttribute('id').match(/(\S+)value$/)[1];
				// $$$ rob added check that something is select - possibly causes js
				// error in ie
				if (jQuery(this).getAttribute('tagName') === 'SELECT' && this.selectedIndex !== -1) {
					h[key] = jQuery(this.options[this.selectedIndex]).text();
				} else {
					h[key] = jQuery(this).val();
				}
				h[key + '_raw'] = jQuery(this).val();
			}
		});
		return h;
	}

	// Ask all filters to update themselves
	update () {
		jQuery.each(this.filters, function (plugin, fs) {
			fs.forEach(function (f) {
				f.update();
			});
		});
	}

	// Clear a single filter @param f
	clearAFilter (f) {
		var sel;
//		if (((f.prop('name').contains('[value]') || f.prop('name').contains('fabrik_list_filter_all'))) || f.hasClass('autocomplete-trigger')) {
		if(f.getAttribute('name').includes('[value]') || f.getAttribute('name').includes('fabrik_list_filter_all') || f.classList.contains('autocomplete-trigger')) {
			if (f.getAttribute('tagName') === 'SELECT') {
				sel = f.getAttribute('multiple') ? -1 : 0;
				f.getAttribute('selectedIndex', sel);
			} else {
				if (f.getAttribute('type') === 'checkbox') {
					f.getAttribute('checked', false);
				} else {
					f.value = '';
				}
			}
			if (f.classList.contains('advancedSelect'))
			{
				f.trigger('liszt:updated');
			}
		}
	}

	// Trigger a "clear filter" for any list plugin
	clearPlugins () {
		var plugins = this.getList().plugins;
		if (plugins !== null) {
			plugins.forEach(function (p) {
				p.clearFilter();
			});
		}
	}

	// Submit the form as part of clearing filter(s)
	submitClearForm () {
		var injectForm = this.container.prop('tagName') === 'FORM' ? this.container :
			this.container.find('form');
		jQuery('<input />').attr({
			'name' : 'resetfilters',
			'value': 1,
			'type' : 'hidden'
		}).appendTo(injectForm);
		if (this.options.type === 'list') {
			this.list.submit('list.clearfilter');
		} else {
			this.container.find('form[name=filter]').submit();
		}
	}

	// Watch any dom node which have been set up to clear a single filter
	watchClearOne () {
		var self = this;
		this.container.find('*[data-filter-clear]').on('click', function (e) {
			e.stopPropagation();
			var currentTarget = e.event ? e.event.currentTarget : e.currentTarget,
				key = jQuery(currentTarget).data('filter-clear'),
				filters = jQuery('*[data-filter-name="' + key + '"]');

			filters.forEach(function (i, filter) {
				self.clearAFilter(jQuery(filter));
			});

			self.submitClearForm();
			self.showFilterState();
		});
	}

	// Used when filters are in a pop up window
	showFilterState () {
		var label = jQuery(Fabrik.jLayouts['modal-state-label']),
			self = this, show = false,
			container = this.container.find('*[data-modal-state-display]'),
			clone, v, v2;
		if (container.length === 0) {
			return;
		}
		container.empty();
		jQuery.each(this.options.filters, function (key, filter) {
			var input = self.container.find('*[data-filter-name="' + filter.name + '"]');
			if (input.getAttribute('tagName') === 'SELECT' && input[0].selectedIndex !== -1) {
				v = jQuery(input[0].options[input[0].selectedIndex]).text();
				v2 = input.val();
			} else {
				v = v2 = input.val();
			}
			if (typeof v !== 'undefined' && v !== null && v !== '' && v2 !== '') {
				show = true;
				clone = label.clone();
				clone.find('*[data-filter-clear]').data('filter-clear', filter.name);
				clone.find('*[data-modal-state-label]').text(filter.label);
				clone.find('*[data-modal-state-value]').text(v);
				container.append(clone);
			}
		});
		if (show) {
			this.container.find('*[data-modal-state-container]').show();
		} else {
			this.container.find('*[data-modal-state-container]').hide();
		}
		this.watchClearOne();
	}

	// Update CSS after an AJAX filter
	updateFilterCSS(data) {
		var c = this.container.find('.clearFilters');
		if (c) {
			if (data.hasFilters) {
				c.addClass('hasFilters');
			}
			else {
				c.removeClass('hasFilters');
			}
		}
	}

}