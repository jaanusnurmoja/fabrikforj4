/**
 * List Toggle
 *
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */


class FbListToggle {

	constructor (form) {
		var menu = document.querySelector('#' + form.id + ' .togglecols .dropdown-menu');
		// Stop dropdown closing on click. Event Propagation
		// Working. Don't know why they wanted to select only 'a' and 'li', does not work if I add 'a' or 'li'
		menu.addEventListener("click", (e) => {
			e.stopPropagation();
		});

		// Set up toggle events for elements. Event Delegation
		menu.addEventListener('mouseup', (event) => {
			if(event.target.matches('a[data-bs-toggle-col]')) {
				var state = event.target.dataset.bsToggleState;
				var col = event.target.dataset.bsToggleCol;
				var btn = document.querySelector('[data-bs-toggle-col=' + col + ']');
				this.toggleColumn(col, state, btn);
			}
		});

		// Toggle events for groups (toggles all elements in group)
		menu.addEventListener('mouseup', (event) => {
			var groups = document.querySelector('a[data-bs-toggle-group]');
			if(event.target.matches('a[data-bs-toggle-group]')) {
				var state = event.target.dataset.bsToggleState;
				var group = event.target.dataset.bsToggleGroup;
				var links = document.querySelectorAll('a[data-bs-toggle-parent-group=' + group + ']');
				for (let i = 0; i < links.length; i++) { 
					var col = links[i].dataset.bsToggleCol;
					this.toggleColumn(col, state, groups);
				}
				state = state === 'open' ? 'close' : 'open';
				if (state === 'open') {
					var elem = groups.querySelector('*[data-isicon]');
					elem.classList.remove('icon-eye-close');
					elem.classList.add('icon-eye-open');
					elem.classList.remove('muted');
					groups.dataset.bsToggleState = 'open';
				}
				if (state === 'close') {
					var elem = groups.querySelector('*[data-isicon]');
					elem.classList.remove('icon-eye-open');
					elem.classList.add('icon-eye-close');
					elem.classList.add('muted');
					groups.dataset.bsToggleState = 'close';
				}

			}
		});
	}
	/**
	 * Toggle column
	 *
	 * @param col   Element name
	 * @param state Open/closed
	 * @param btn   Button/link which initiated the toggle
	 */
	toggleColumn (col, state, btn) {
		state = state === 'open' ? 'close' : 'open';

		if (state === 'open') {
			document.querySelector('.fabrik___heading .' + col).style.display = '';
			var filter = document.querySelector('.fabrikFilterContainer .' + col);
			if(filter){filter.style.display = '';}
			var nodeList = document.querySelectorAll('.fabrik_row  .' + col);
			for (let i = 0; i < nodeList.length; i++) { nodeList[i].style.display = ''; }
			var calc = document.querySelector('.fabrik_calculations  .' + col);
			if(calc){calc.style.display = '';}
			var elem = btn.querySelector('*[data-isicon]');
			elem.classList.remove('icon-eye-close');
			elem.classList.add('icon-eye-open');
			elem.classList.remove('muted');
			btn.dataset.bsToggleState = 'open';
		} 
		if (state === 'close') {
			document.querySelector('.fabrik___heading .' + col).style.display = 'none';
			var filter = document.querySelector('.fabrikFilterContainer .' + col);
			if(filter){filter.style.display = 'none';}
			var nodeList = document.querySelectorAll('.fabrik_row  .' + col);
			for (let i = 0; i < nodeList.length; i++) { nodeList[i].style.display = 'none'; }
			var calc = document.querySelector('.fabrik_calculations  .' + col);
			if(calc){calc.style.display = 'none';}
			var elem = btn.querySelector('*[data-isicon]');
			elem.classList.remove('icon-eye-open');
			elem.classList.add('icon-eye-close');
			elem.classList.add('muted');
			btn.dataset.bsToggleState = 'close';
		}


	}
}

