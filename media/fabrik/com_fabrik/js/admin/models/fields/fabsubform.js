/**
 * Admin subGroup Editor
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */


class FbSubForm {

	type = null;

	/* Add our event handlers for new rows and removed rows */
    constructor(type) {
    	this.type = 'accordion-' + type;
    	document.addEventListener('subform-row-add', (event) => this.handleAdd(event));
    	document.addEventListener('subform-row-remove', (event) => this.handleRemove(event));
    	this.setupAccordianHeaders();
	}

	setupAccordianHeaders() {
		const accordions = document.getElementById(this.type).querySelectorAll("div.accordion-item");
		accordions.forEach((accordion) => {
			let s, bigred;
			let header = accordion.querySelector('h2>button');
			switch (this.type) {
				case 'accordion-js_actions':
					bigred = Joomla.JText._('COM_FABRIK_JS_SELECT_EVENT');
					let action = accordion.querySelector('select[name*="[action]"]');
					let code = accordion.querySelector('textarea[name*="[code]"]');
					let event = accordion.querySelector('select[name*="[js_e_event]"]');
					let trigger = accordion.querySelector('select[name*="[js_e_trigger]"]');
					let name = document.querySelector('#jform_name');
					let value = accordion.querySelector('input[name*="[js_e_value]"]');
					let condition = accordion.querySelector('select[name*="[js_e_condition]"]');

					if (action.value === '') {
						break;
					}

					s = `on ${action.options[action.selectedIndex].text} : `;
					let t = '';

					if (code && code.value.trim() !== '') {
						let first = code.value.split('\n')[0].trim();
						let comment = first.match(/^\/\*(.*)\*\//);
						if (comment) {
							t = comment[1].trim();
						} else {
							t = Joomla.JText._('COM_FABRIK_JS_INLINE_JS_CODE');
						}

						if (/\/\//.test(code.value.replace(/(['"]).*?[^\\]\1/g, ''))) {
							t += ' &nbsp; <span style="color:red;font-weight:bold;">';
							t += Joomla.JText._('COM_FABRIK_JS_INLINE_COMMENT_WARNING').replace(/ /g, '&nbsp;');
							t += '</span>';
						}
					} else if (event && event.value && trigger && trigger.value && name && name.value) {
						t = `${Joomla.JText._('COM_FABRIK_JS_WHEN_ELEMENT')} "${name.value}" `;

						if (/hidden|shown/.test(condition.options[condition.selectedIndex].text)) {
							t += `${Joomla.JText._('COM_FABRIK_JS_IS')} ${condition.options[condition.selectedIndex].text}, `;
						} else {
							t += `${condition.options[condition.selectedIndex].text} "${value.value.trim()}", `;
						}

						let trigOptGroup = trigger.options[trigger.selectedIndex].parentElement.label.toLowerCase();
						let trigType = trigOptGroup.substring(0, trigOptGroup.length - 1);
						t += `${event.options[event.selectedIndex].text} ${trigType} "${trigger.options[trigger.selectedIndex].text}"`;
					} else {
						s += `<span style="color:red;">${Joomla.JText._('COM_FABRIK_JS_NO_ACTION')}</span>`;
					}

					if (t !== '') {
						s += `<span style="font-weight:normal">${t}</span>`;
					}
					break;
				case 'accordion-plugins':
					bigred = Joomla.JText._('COM_FABRIK_PLUGIN_SELECT_EVENT');
					s = accordion.querySelector('input[name*="[plugin_description]"]').value;
					break;
				case 'accordion-subform_prefilters':
					const operator = accordion.querySelector('select[name*="[filter-join]"]').value;
					const element = accordion.querySelector('select[name*="[filter-fields]"]').value.split('.', 2)[1];
					const cond = accordion.querySelector('select[name*="[filter-conditions]"]').value;
					const val = '`' + accordion.querySelector('textarea[name*="[filter-value]"]').value + '`';
					s = operator + ' : ' + element + ' : ' + cond + ' : ' + val;
					break;
				case 'accordion-subform_joins':
					const join = accordion.querySelector('select[name*="[join_type]"]').value;
					const from = accordion.querySelector('select[name*="[join_from_table]"]').value;
					const to = accordion.querySelector('select[name*="[table_join]"]').value;
					const fromCol = accordion.querySelector('select[name*="[table_key]"]');
					const toCol = accordion.querySelector('select[name*="[table_join_key]"]').value;
					s = join + ' : ' + from + '(' +  fromCol + ') : ' + to + '(' + toCol + ')';
			}
			if (!s) {
				s = '<span style="color:red;">' + bigred + '</span>';
			}

			// Set the header's HTML
			header.innerHTML = s + '&nbsp;&nbsp;';
		});
	}

	/* To handle a remove, we get all the inputs, and remove them from the FabrikAdmin.model.fields object */
	handleRemove(event) {
		if (typeof FabrikAdmin === "undefined" || FabrikAdmin?.model?.fields === undefined) return;
		this.remGroup = event.detail.row;
		this.remInputs = this.remGroup.querySelectorAll('input, select');
        this.remInputs.forEach((input) => { 
            for (const [type, plugins] of Object.entries(FabrikAdmin.model.fields)) {
				/* Purge the plugin */
				if (typeof (FabrikAdmin.model.fields[type][input.id]) !== 'undefined') {
					delete FabrikAdmin.model.fields[type][input.id];
				}
			}
		});
        this.remInputs = null, this.remGroup = null;
	}

	/* An add is much more complex, first we need to wait for the new row to be added to the dom */
	handleAdd(event) {
		this.addGroup = event.detail.row;
		this.addInputs = this.addGroup.querySelectorAll('input, select');
		if (this.addInputs.length == 0) {
			this.addInputsPeriodical = this.getAddInputs.periodical(500, this);
		} else {
			this.addSetUp();
		}
	}

	/* The new row has now been added to the dom */
	addSetUp() { 
		/* Let's first collapse any accordions that are open */
		document.getElementById(this.type)
			.querySelectorAll('.accordion-button')
			.forEach((accordionButton) => {
	   			const target = accordionButton.getAttribute('aria-controls');
	   			document.getElementById(target).classList.remove('show');
			}
		)

		/* Let's globally fix the id's */
		let innerHtml = this.addGroup.innerHTML;
		innerHtml = innerHtml.replace(
		    new RegExp(this.addGroup.getAttribute('data-base-name') + 'X', 'g'), 
		    this.addGroup.getAttribute('data-group')
		);
		this.addGroup.innerHTML = innerHtml;
		/* Loop through the inputs and process those we need to keep track of, 
		 * there will be a template for the field in the FabrikAdmin.model.fields object
		 */
		if (typeof FabrikAdmin !== 'undefined' && FabrikAdmin?.model?.fields) {
	        this.addInputs.forEach((input) => { 
	        	/* We need to locate the field template in the FabrikAdmin.model.fields object to determine if it is a table or element */
	            for (const [type, plugins] of Object.entries(FabrikAdmin.model.fields)) {
					/* Figure out the template element name and determine if we have a plugin set up for it */
					let newPlugin = false;
					const newElementID = input.id;
					const elementTemplateName = newElementID.replace(this.addGroup.dataset.group, this.addGroup.dataset.baseName + 'X');
					if (typeof (FabrikAdmin.model.fields[type][elementTemplateName]) !== 'undefined') {
						/* OK, we found the template in table or element */
						/* Build the new plugin and instantiate it */
						const sourceid 			= newElementID.match(/__datasources(\d+)__/)[1];
						const o 				= {...FabrikAdmin.model.fields[type][elementTemplateName].options};
						o.isTemplate			= false;
						o.templateName 			= elementTemplateName;
						o.conn 					= o.conn.replace('__datasourcesX__', `__datasources${sourceid}__`);
						if (type == 'element') {
							o.table 				= o.table.replace('__datasourcesX__', `__datasources${sourceid}__`);
						}
						const newClass			= type == "element" ? 'elementElement' : 'fabriktablesElement';
						var p					= new window[newClass](newElementID, o);
						p.el 					= document.id(newElementID);
						newPlugin = true;
					}
					if (newPlugin !== false) {
						/* The field was found so insert the instantiated plugin into the FabrikAdmin.model.fields object */
						FabrikAdmin.model.fields[type][newElementID] = p;
					}
				}
			});
    	}

    	this.handleAccordion();

    	this.handlePlugins();

        this.addInputs = null, this.addGroup = null;
	}

	/* Set up the new plugin if we are on the plugin page */
	async handlePlugins() { 
		const baseName = this.addGroup.getAttribute('data-base-name');
		const groupName = this.addGroup.getAttribute('data-group');
		if (baseName !== 'plugins') return;
		const pluginOptsId = "pluginOpts-" + Math.random().toString(36).substring(2, 8);
		const pluginOpts = this.addGroup.querySelector(".pluginOpts");
		pluginOpts.id = pluginOptsId;
        const pluginSelect = this.addGroup.querySelectorAll('select.elementtype');
		const p = await import('@fbpluginmanager');
		const { PluginManager } = p;
		const pm = new PluginManager([], null, this.type);
        pluginSelect.forEach(select => {
            select.addEventListener('change', e => {
            	if (!e.target.value) {
            		pluginOpts.innerHTML = "";
            		return;
            	}
                pm.addPlugin(e.target.value, groupName, this.type);
            });
        });
	}

	/* Function to get all the inputs for the new row, runs via the periodical */
	getAddInputs() {
		if (!(this.addInputs = this.addGroup.querySelectorAll('input, select'))) {
			return;
		}
		this.addSetUp();
		clearInterval(this.addInputsPeriodical);
	}

	handleAccordion() {
    	/* Handle an accordian, we need to initialize any ace editors */
    	if (this.addGroup.classList.contains('accordion-item')) {
 			// Check for ace containers and initialize them.	
			const aceContainers = this.addGroup.querySelectorAll('[id*="aceContainer"]');
			aceContainers.forEach((aceContainer) => {
				/* First thing we need to do is set a unique aceId for the container */
				/* Get the current aceID */
				const oldAceID = aceContainer.id.match(/([a-zA-Z]+_\w{6})-aceContainer/);
				const elementID = aceContainer.querySelector('textarea').id;
				/* Replace the old aceId with the new one */
				const newAceId = elementID + '_' + Math.random().toString(36).substring(2, 8);
				aceContainer.innerHTML = aceContainer.innerHTML.replace(new RegExp(oldAceID, 'g'), newAceId);
				/* we now have to initialize it */
				/* We need the ID of the -ac container */
				const aceDivId = aceContainer.querySelector('[id*="ace"]').id;
				/* Make sure it is fully ready in the dom before we continue */
			    const intervalId= setInterval(() => {
				    const aceDiv = document.getElementById(aceDivId);
				    if (aceDiv) { // If the div is found";
					    clearInterval(intervalId); // Stop checking
					    const aceParams = JSON.parse(aceDiv.parentNode.querySelector('.aceParams').textContent);
						initAceEditor(aceParams);
					}
				}, 50); // Check every 50 milliseconds
			})
			this.setupAccordianHeaders();
    		/* open the new accordion */
    		const accordionButton = this.addGroup.querySelector('button.accordion-button');
   			const target = accordionButton.getAttribute('aria-controls');
   			document.getElementById(target).classList.add('show');
		}			
	}

}
