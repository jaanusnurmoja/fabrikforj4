/**
 * Admin Plugin Manager
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license: GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

export class PluginManager {
    constructor(plugins, id, type) {
    	if (plugins.length == 0) return;
        this.pluginTotal = 0;
        this.topTotal = -1;

        if (typeof plugins === 'string') {
            plugins = [plugins];
        }
        this.id = id;
        this.plugins = plugins;
        this.type = type;

        Object.entries(this.plugins).forEach(([pluginSource, plugin]) => this.addPlugin(plugin.plugin, pluginSource, this.type));

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

	getSelect(event) {
		if (!(select = event.detail.row.querySelector('select.elementtype'))) return;
		this.setUpSelect(select);
		clearInterval(this.getSelectPeriodical);
	}

	setUpSelect(select) {
		select.addEventListener('change', (event) => {
			/* Let's locate the associated pluginOpts div */
			const controlGroup = event.target.closest('.control-group');
			let sibling = controlGroup.nextElementSibling;
			while (sibling) {
				if (sibling.classList.contains('pluginOpts')) {
					this.addPlugin(event.target.value, sibling.id, this.type);
					break;
				}
				sibling = sibling.nextElementSibling;
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

		/* Build the subFormPrefix, start by geting the subform group */
		const subFormGroup = document.querySelector(`.subform-repeatable-group[data-group="${pluginSource}"]`);
		/* Get the name from the first input field (don't care which one) */
		const inputName = subFormGroup.querySelector("input").name;
		/* Now lop off everything after the pluginSource */
		const subFormPrefix = inputName.match(new RegExp(`.*\\[${pluginSource}\\]`))[0];
		/* Get the plugin options container */
	    let pluginsContainer;
	    if (subFormGroup) {
	    	pluginsContainer = subFormGroup.querySelector('.pluginOpts');
	    }

	    if (!subFormPrefix) {
	        if (pluginsContainer) {
	            pluginsContainer.innerHTML = '';
	        }
	        return;
	    }

	    // Prepare the data for the AJAX request
	    const requestData = new URLSearchParams({
	        option: 'com_fabrik',
	        view: 'plugin',
	        format: 'raw',
	        type: type,
	        plugin: plugin,
	        c: subFormPrefix,
	        subformprefix: subFormPrefix,
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

            this.watchDescriptions(subFormGroup);

            // Update the plugin count and trigger Bootstrap updates
//            this.updateBootStrap();

            // Trigger any re-initialization for tooltips or show-on fields
//            FabrikAdmin.reTip();
        })
        .catch(error => {
            console.error('Fabrik pluginmanager addPlugin AJAX failed:', error);
        });
	}

	deletePlugin(event) {
	    const pluginContainer = event.target.closest('fieldset.pluginContainer');
	    if (!pluginContainer) {
	        return;
	    }

	    if (Fabrik.debug) {
	        console.log('Fabrik pluginmanager: Deleting', this.type, 'entry', pluginContainer.id, 'and renaming later entries');
	    }

	    /**
	     * Adjust the indices for entries after the one being deleted.
	     * Updates `id`, `name`, and `<label for>` attributes for all matching tags.
	     */
	    const idMatch = pluginContainer.id.match(/_(\d+)$/);
	    if (idMatch) {
	        const deletedIndex = parseInt(idMatch[1], 10);

	        const allElements = document.querySelectorAll('#plugins input, #plugins select, #plugins textarea, #plugins label, #plugins fieldset');
	        allElements.forEach(element => {
	            const nameMatch = element.name ? element.name.match(/\[(\d+)\]/) : null;
	            const idMatch = element.id ? element.id.match(/-(\d+)/) : null;
	            const forMatch = element.tagName.toLowerCase() === 'label' && element.htmlFor ? element.htmlFor.match(/-(\d+)/) : null;

	            let index = null;

	            if (nameMatch) {
	                index = parseInt(nameMatch[1], 10);
	            } else if (idMatch) {
	                index = parseInt(idMatch[1], 10);
	            } else if (forMatch) {
	                index = parseInt(forMatch[1], 10);
	            }

	            if (index !== null && index > deletedIndex) {
	                index--;

	                if (element.name) {
	                    element.name = element.name.replace(/(\[)(\d+)(\])/, `[$1${index}$3]`);
	                }
	                if (element.id) {
	                    element.id = element.id.replace(/(-)(\d+)/, `-$1${index}`);
	                }
	                if (element.tagName.toLowerCase() === 'label' && element.htmlFor) {
	                    element.htmlFor = element.htmlFor.replace(/(-)(\d+)/, `-$1${index}`);
	                }
	            }
	        });

	        // Adjust indices for fieldset IDs
	        const fieldsets = document.querySelectorAll('#plugins fieldset.pluginContainer');
	        fieldsets.forEach(fieldset => {
	            const fieldsetMatch = fieldset.id.match(/formAction_(\d+)$/);
	            if (fieldsetMatch) {
	                let index = parseInt(fieldsetMatch[1], 10);
	                if (index > deletedIndex) {
	                    index--;
	                    fieldset.id = fieldset.id.replace(/(formAction_)(\d+)$/, `$1${index}`);
	                }
	            }
	        });
	    }

	    // Remove the plugin container
	    event.preventDefault();
	    const actionContainer = event.target.closest('.actionContainer');
	    if (actionContainer) {
	        actionContainer.remove();
	    }
	}
}
