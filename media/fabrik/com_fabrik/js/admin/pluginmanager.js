/**
 * Admin Plugin Manager
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license: GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

export class PluginManager {
    constructor(plugins, id, type) {
    	if (plugins.length == 0) return;

        if (typeof plugins === 'string') {
            plugins = [plugins];
        }
        this.id = id;
        this.plugins = plugins;
        this.type = type;

        Object.entries(this.plugins).forEach(([pluginSource, plugin]) => this.addPlugin(plugin.plugin, pluginSource, this.type));

        this.watchPluginSelect();
//        this.watchDescriptions();
//        this.watchValidationSelect();
	}

	handleAdd(event) {
		/* Check if our select list is in the dom yet or not */
		const select = event.detail.row.querySelector('select.elementtype');
		if (select == undefined) {
			this.getSelectPeriodical = this.getSelect.periodical(500, this);
		} else {
			this.setUpSelect(select);
		}
	}

	watchPluginSelect() {
	    const pluginSelect = this.type == 'list' 
	    	? document.getElementById('jform_plugin') 
	    	: document.querySelector('select.elementtype');
	    if (pluginSelect === undefined || pluginSelect === null) {
	        // Use setInterval instead of periodical
	        this.getPluginSelectPeriodical = setInterval(() => {
			    const pluginSelect = this.type == 'list' 
			    	? document.getElementById('jform_plugin') 
			    	: document.querySelector('select.elementtype');
	            if (pluginSelect !== undefined && pluginSelect !== null) {
	                clearInterval(this.getPluginSelectPeriodical); // Stop the interval
	                this.setUpSelect(pluginSelect); // Call the setup function
	            }
	        }, 500);
	    } else {
	        this.setUpSelect(pluginSelect);
	    }
	}

	getPluginSelect(event) {
	    const pluginSelect = this.type == 'list' 
	    	? document.getElementById('jform_plugin') 
	    	: document.querySelector('select.elementtype');
		if (pluginSelect == undefined || pluginSelect === null) { console.log("Waiting");
			return;
		}
		this.setUpSelect(pluginSelect);
		clearInterval(this.getPluginSelectPeriodical);
	}

	watchValidationSelect() {
		let select = document.querySelector('select.elementtype');
		if (select == undefined) {
			this.getValidationSelectPeriodical = this.getValidationSelect.periodical(500, this);
		} else {
			this.setUpSelect(select);
		}
	}

	getValidationSelect(event) {
		this.setUpSelect(select);
		clearInterval(this.getSelectPeriodical);
	}

	setUpSelect(select) {
		select.addEventListener('change', (event) => {
			if (this.type == 'element') {
				this.addPlugin(event.target.value, 'plugins0', this.type)
			} else {
				/* Let's locate the associated pluginOpts div */
				const controlGroup = event.target.closest('.control-group');
				let sibling = controlGroup.nextElementSibling;
				while (sibling) {
					if (sibling.classList.contains('pluginOpts')) {
						if (!event.target.value) {
							pluginsContainer.innerHTML = '';
						} else {
							this.addPlugin(event.target.value, sibling.id, this.type);
						}
						break;
					}
					sibling = sibling.nextElementSibling;
				}
			}
		});
	}
	
	watchDescriptions(pluginArea) {
		const target = pluginArea.querySelector('input[name*="plugin_description"]');
		target.addEventListener('keyup', (event) => {
	        let header = pluginArea.querySelector('h2 > button');
	        const container = target.closest('div.accordion-item');
	        const plugin = pluginArea.querySelector('select[name*="plugins"]').value;
	        const desc = target.value;
	        header.textContent = `${plugin}: ${desc}`;
	    });
	}


	// Bootstrap specific
	updateBootStrap() {
	    // Add 'btn' class to all labels within radio button groups
	    document.querySelectorAll('.radio.btn-group label').forEach(label => {
	        label.classList.add('btn');
	    });

	    // Add specific classes to input's associated labels based on their value
	    document.querySelectorAll('.btn-group input[checked=checked]').forEach(input => {
	        const value = input.value;
	        const label = document.querySelector(`label[for=${input.id}]`);
	        if (label) {
	            if (value === '') {
	                label.classList.add('active', 'btn-primary');
	            } else if (value === '0') {
	                label.classList.add('active', 'btn-danger');
	            } else {
	                label.classList.add('active', 'btn-success');
	            }
	        }
	    });

	    // Initialize tooltips for elements with 'hasTip' class
	    document.querySelectorAll('.hasTip').forEach(el => {
	        const title = el.getAttribute('title');
	        if (title) {
	            const [tipTitle, tipText] = title.split('::', 2);
	            el.setAttribute('data-tip-title', tipTitle || '');
	            el.setAttribute('data-tip-text', tipText || '');
	        }
	    });

	    // Use the native HTML title attribute as fallback for tooltips
	    // Assuming some tooltip initialization logic here, like a library or custom code.
	    const hasTipElements = document.querySelectorAll('.hasTip');
	    hasTipElements.forEach(el => {
	        const tipTitle = el.getAttribute('data-tip-title');
	        const tipText = el.getAttribute('data-tip-text');
	        if (tipTitle || tipText) {
	            // Tooltip initialization code can go here
	            console.log(`Tooltip for ${el}: ${tipTitle} - ${tipText}`);
	        }
	    });

	    // Dispatch custom Joomla updated event
	    const adminForm = document.getElementById('adminForm');
	    if (adminForm) {
	        adminForm.dispatchEvent(new CustomEvent('joomla:updated', { bubbles: true, cancelable: false }));
	    }
	}

	addPlugin(plugin, pluginSource, type) {

		if (type != 'element') {
			if (pluginSource.includes('pluginOpts')) {
				var pluginsContainer = document.getElementById(pluginSource);
				var subFormGroup = pluginsContainer.closest(`.subform-repeatable-group`);
				pluginSource = 'plugins0';
			} else {
				var subFormGroup = document.querySelector(`.subform-repeatable-group[data-group="${pluginSource}"]`);
		    	var pluginsContainer = subFormGroup.querySelector('.pluginOpts');
			}
			/* Build the subFormPrefix, start by geting the subform group */
			/* Get the name from the first input field (don't care which one) */
			const inputName = subFormGroup.querySelector("input").name;
			/* Now lop off everything after the pluginSource */
			var subFormPrefix = inputName.match(new RegExp(`.*\\[${pluginSource}\\]`));
			/* Get the plugin options container */

		    if (!subFormPrefix) {
		        if (pluginsContainer) {
		            pluginsContainer.innerHTML = '';
		        }
		        return;
		    }
		} else {
			var subFormPrefix = 'plugins0';
			var pluginsContainer = document.getElementById('plugin-container');
		}
	    // Prepare the data for the AJAX request
	    const requestData = new URLSearchParams({
	        option: 'com_fabrik',
	        view: 'plugin',
	        format: 'raw',
	        type: type,
	        plugin: plugin,
	        subformid: pluginSource ?? '',
	        subformprefix: subFormPrefix ?? '',
	        id: this.id
	    });

	    // Perform the AJAX request
	    fetch(`index.php?${requestData.toString()}`, {
	        method: 'GET'
	    })
        .then(response => response.text())
        .then(html => {
            if (pluginsContainer) {
                pluginsContainer.innerHTML = html;
            }


			/* Make sure the scripts get into the browser */
			const scripts = pluginsContainer.querySelectorAll('script');
			scripts.forEach(script => {
			    const newScript = document.createElement('script');
			    if (script.src) {
			        // Handle external scripts
			        newScript.src = script.src;
			    } else {
			        // Handle inline scripts
			        newScript.textContent = script.textContent;
			    }
			    document.body.appendChild(newScript);
			});

			if (type != 'element') {
	            // Update the plugin title
	            let button = pluginsContainer.closest(".accordion-item").querySelector('.accordion-button')
	            let heading = plugin;
	            let description;
	            const descriptionInput = subFormGroup.querySelector('[name$="[plugin_description]"]');
	            if (descriptionInput) {
	                description = descriptionInput.value;
	            } else {
	            	const legend = pluginsContainer.querySelector('legend');
	            	if (legend) {
	            		description = legend.textContent;
	            	}
	            }
	            if (description) {
	            	heading += `: ${description}`;
	            }

	            heading += `&nbsp;&nbsp;`;
	            if (button) {
	                button.innerHTML = heading;
	            }

	            if (this.type != 'validationrule') {
	            	this.watchDescriptions(subFormGroup);
	            }
	        }

            // Update the plugin count and trigger Bootstrap updates
//            this.updateBootStrap();

            // Trigger any re-initialization for tooltips or show-on fields
//            FabrikAdmin.reTip();
        })
        .catch(error => {
            console.error('Fabrik pluginmanager addPlugin AJAX failed:', error);
        });
	}

}
