/**
 * Admin Plugin Manager
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license: GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

export class PluginManager {
    constructor(plugins, id, type) {
        this.pluginTotal = 0;
        this.topTotal = -1;

        if (typeof plugins === 'string') {
            plugins = [plugins];
        }
        this.id = id;
        this.plugins = plugins;
        this.type = type;

        this.plugins.forEach(plugin => this.addTop(plugin));

//        this.watchAdds();

		const pluginArea = document.getElementById('plugins');
		if (pluginArea !== null) {
		    pluginArea.addEventListener('click', (event) => {
		        const target = event.target.closest('h3.title');
		        if (target) {
		            const allTitles = pluginArea.querySelectorAll('h3.title');
		            allTitles.forEach((title) => {
		                if (title !== target) {
		                    title.classList.remove('pane-toggler-down');
		                }
		            });
		            target.classList.toggle('pane-toggler-down');
		        }
		    });

		    this.watchDescriptions(pluginArea);
		}
	}

	watchAdds() {
    	document.addEventListener('subform-row-add', (event) => this.handleAdd(event), false);
    	document.addEventListener('subform-row-remove', (event) => this.handleRemove(event), true);
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
					this.addPlugin(event.target.value, sibling.id);
					break;
				}
				sibling = sibling.nextElementSibling;
			}
		});
	}
	
	watchDescriptions(pluginArea) {
	    pluginArea.addEventListener('keyup', (event) => {
	        const target = event.target.closest('input[name*="plugin_description"]');
	        if (target) {
	            const container = target.closest('.actionContainer');
	            const title = container.querySelector('.pluginTitle');
	            const plugin = container.querySelector('select[name*="plugin"]').value;
	            const desc = target.value;
	            title.textContent = `${plugin}: ${desc}`;
	        }
	    });
	}

    /**
     * Has the form finished loading and are there any outstanding ajax requests
     *
     * @return bool
     */
    canSaveForm() {
        if (document.readyState !== 'complete') {
            return false;
        }
        return Fabrik.requestQueue.empty();
    }


    watchPluginSelect() {
        const pluginSelect = document.querySelectorAll('select.elementtype');
        pluginSelect.forEach(select => {
            select.addEventListener('change', e => {
                this.updatePlugin(e.target.value);
            });
        });
    }

	addTop(plugin, optsId = null) {
	    let published, show_icon, validate_in, validation_on, must_validate, validate_hidden;

	    if (typeof plugin === 'string') {
	        published = 1;
	        show_icon = false;
	        must_validate = false;
	        validate_hidden = true;
	        plugin = plugin || '';
	        validate_in = '';
	        validation_on = '';
	    } else {
	        // Validation plugins
	        published = plugin ? plugin.published : 1;
	        show_icon = plugin ? plugin.show_icon : 1;
	        must_validate = plugin ? plugin.must_validate : 0;
	        validate_hidden = plugin ? plugin.validate_hidden : 1;
	        validate_in = plugin ? plugin.validate_in : 'both';
	        validation_on = plugin ? plugin.validation_on : 'both';
	        plugin = plugin ? plugin.plugin : '';
	    }

	    const pluginsContainer = document.getElementById(optsId);

	    // Ajax request to load the first part of the plugin form
	    const data = {
	        option: 'com_fabrik',
	        view: 'plugin',
	        task: 'top',
	        format: 'raw',
	        type: this.type,
	        plugin: plugin,
	        plugin_published: published,
	        show_icon: show_icon,
	        must_validate: must_validate,
	        validate_hidden: validate_hidden,
	        validate_in: validate_in,
	        validation_on: validation_on,
	        c: this.topTotal,
	        id: this.id
	    };

	    fetch('index.php', {
	        method: 'POST',
	        headers: {
	            'Content-Type': 'application/json'
	        },
	        body: JSON.stringify(data)
	    })
	        .then(response => response.text())
	        .then((res) => {
	            if (plugin !== '') {
	                // Sent temp variable as `c` to addPlugin, so they are aligned properly
	                this.addPlugin(plugin, optsId);
	            } else {
//	                toggler.querySelector('span.pluginTitle').textContent = Joomla.JText._('COM_FABRIK_PLEASE_SELECT');
	            }
//	            this.updateBootStrap();
//	            FabrikAdmin.reTip();
	        })
	        .catch((err) => {
	            console.error('Fabrik pluginmanager addTop ajax failed:', err);
	        });

	    this.topTotal++;
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

	    // Initialize Bootstrap tooltips if jQuery is available
	    if (typeof jQuery !== 'undefined') {
	        jQuery('*[rel=tooltip]').tooltip();
	    }

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

	addPlugin(plugin, optsId) {

	    const pluginsContainer = document.getElementById(optsId);

	    if (!plugin) {
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
	        type: this.type,
	        plugin,
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
            const descriptionInput = pluginsContainer.querySelector('legend');
            if (descriptionInput) {
                const description = descriptionInput.textContent;
                heading += `: ${description}`;
            }

            if (button) {
                button.textContent = heading;
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
