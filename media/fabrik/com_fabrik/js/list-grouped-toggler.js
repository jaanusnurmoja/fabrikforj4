/**
 * Toggle grouped data by click on the grouped headings icon
 */

class FbGroupedToggler {

	defaults = {
		collapseOthers: false,
		startCollapsed: false
	};
	
	state = [];
	
	constructor (container, options) {
		var rows, h, img ;
		if (container === 'null') {
			return;
		}
		this.container = container;
		this.options = options;// Required
		this.options = { // options merges with defaults
			...this.defaults,
			...this.options
		};
		this.toggleState = 'shown'; // Not used ??
		if (this.options.startCollapsed && this.options.isGrouped) {
			this.collapse();
		}
		var nodeList = this.container.querySelectorAll('.fabrik_groupheading a.toggle');
		for (let i = 0; i < nodeList.length; i++) { 
			if(this.state[i] === undefined) this.state[i] = true; // Starts expanded if group-by is set
			nodeList[i].addEventListener('click', (event) => {
				event.preventDefault();
				if (this.options.collapseOthers) {
					this.collapse();
					this.state[i] = false;
				}
				img = nodeList[i].querySelector('*[data-role="toggle"]'); // this is the arrow only
				h = nodeList[i].closest('tbody'); 
				if (h.nextElementSibling && h.nextElementSibling.classList.contains('fabrik_groupdata')) {
					// For div tmpl
					rows = h.nextElementSibling;
				} else {
					rows = h.parentElement.nextElementSibling;
				}
				var row = rows.querySelectorAll('.fabrik_row');
				var coll = h.querySelectorAll('.fabrik_groupdata');
				//var extra = rows.querySelector(h).querySelector('.groupExtra').style.display = '';
				// There maybe more rows to hide, but I was unable to find groupExtra
				if(this.state[i] === true) {
					for (let i = 0; i < row.length; i++) { row[i].style.display = 'none'; } // Collapse
					//rows.style.display = 'none';
				}
				if(this.state[i] === false) {
					for (let i = 0; i < row.length; i++) { row[i].style.display = ''; } // Expand
					// also clear fabrik_groupdata in case of collapse all
					rows.style.display = '';
				}
				this.setIcon(img, this.state[i]);
				if(this.state[i] === true) {
					this.state[i] = false;
				} else {
					this.state[i] = true;
				}
			});
		}
	}

	setIcon (img, state) {
		var expandIcon = img.dataset.expandIcon,
			collapsedIcon = img.dataset.collapseIcon;
		if (state) {
			img.classList.remove(expandIcon);
			img.classList.add(collapsedIcon);
			img.classList.remove('icon-arrow-down');// Set by layout
		} else {
			img.classList.add(expandIcon);
			img.classList.remove(collapsedIcon);
			img.classList.remove('icon-arrow-down');
		}
	}

	collapse () {
		var r = this.container.querySelectorAll('.fabrik_groupdata');
		for (let i = 0; i < r.length; i++) { r[i].style.display = 'none'; }
		// There maybe more rows to hide, but I was unable to find groupExtra
		var selector = '*[data-role="toggle"]';
		var b = this.container.querySelectorAll('.fabrik_groupheading a ' + selector); // When do we get that ??
		if (b.length === 0) {
			b = this.container.getElements('.fabrik_groupheading ' + selector);
		}
		for (let i = 0; i < b.length; i++) { 
			this.setIcon(b[i], true);
		}
	}

	// Not used here. maybe called from BaseView or any other ??
	expand () {
console.log('group-by expand');
		var r = this.container.querySelectorAll('.fabrik_groupdata');
		for (let i = 0; i < r.length; i++) { r[i].style.display = ''; }
		// There maybe more rows to hide, but I was unable to find groupExtra
		var selector = '*[data-role="toggle"]';
		var b = this.container.querySelectorAll('.fabrik_groupheading a ' + selector); // When do we get that ??
		if (b.length === 0) {
			b = this.container.getElements('.fabrik_groupheading ' + selector);
		}
		for (let i = 0; i < b.length; i++) { 
			this.setIcon(b[i], false);
		}
	}

	// Not used here. maybe called from BaseView or any other ??
	toggle () {
console.log('group-by toggle');
		this.toggleState === 'shown' ? this.collapse() : this.expand();
		this.toggleState = this.toggleState === 'shown' ? 'hidden' : 'shown';
	}
}
