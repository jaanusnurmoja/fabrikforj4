import { PluginManager } from '@fbpluginmanager';
import { Fabrik } from '@fbfabrik';

export class FabrikAdminElement extends PluginManager {
    constructor(plugins, options, id) {
        options = {
            id: 0,
            parentid: 0,
            jsevents: [],
            jsTotal: 0,
            deleteButton: 'removeButton',
            ...options
        };
        super(plugins, options, id); // Call the parent class's constructor
        this.options = options;
        this.plugins = plugins;
        this.id = id;
        this.jsCounter = -1;
        this.jsAjaxed = 0;
        if (document.readyState === 'loading') {
            // If the DOM is still loading, attach the DOMContentLoaded event listener
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            // If the DOM is already loaded, call init() directly
            this.init();
        }
    }

    init() {
        this.setParentViz();
        this.options.jsevents.forEach(opt => this.addJavascript(opt));

        const addJavascriptBtn = document.getElementById('addJavascript');
        if (addJavascriptBtn) {
            addJavascriptBtn.addEventListener('click', (e) => {
                e.preventDefault();
//                this.jsAccordion.display(-1);
                this.addJavascript();
            });
        }

		this.watchLabel();
		this.watchGroup();
        this.options.jsevents.forEach(opt => {
            this.addJavascript(opt);
        });
/*
        this.jsPeriodical = setInterval(() => {
            this.iniJsAccordion();
        }, 250);
*/
        const pluginSelect = document.getElementById('jform_plugin');
        if (pluginSelect) {
            pluginSelect.addEventListener('change', (e) => {
                this.changePlugin(e.target.value);
            });
        }

        const nameOrigInput = document.querySelector('input[name="name_orig"]');
        if (nameOrigInput && nameOrigInput.value === '') {
            this.changePlugin('field');
        }

        const javascriptActions = document.getElementById('javascriptActions');
        if (javascriptActions) {
            javascriptActions.addEventListener('click', (e) => {
                const target = e.target.closest('a[data-button="removeButton"]');
                if (target) {
                    e.preventDefault();
                    this.deleteJS(target);
                }
            });

            javascriptActions.addEventListener('change', (e) => {
                const target = e.target.closest('select[id^="jform_action-"], select[id^="jform_js_e_event-"], select[id^="jform_js_e_trigger-"], select[id^="jform_js_e_condition-"], input[id^="jform_js_e_value-"]');
                if (target) {
                    this.setAccordionHeader(target.closest('.actionContainer'));
                }
            });
        }

        const pluginArea = document.getElementById('plugins');
        if (pluginArea) {
            pluginArea.addEventListener('click', (e) => {
                const target = e.target.closest('h3.title');
                if (target) {
                    const titles = pluginArea.querySelectorAll('h3.title');
                    titles.forEach((title) => {
                        if (title !== target) {
                            title.classList.remove('pane-toggler-down');
                        }
                    });
                    target.classList.toggle('pane-toggler-down');
                }
            });
        }
    }

	watchLabel() {
	    const labelInput = document.getElementById('jform_label');
	    const nameInput = document.getElementById('jform_name');
	    if (labelInput && nameInput) {
	        this.autoChangeDbName = nameInput.value === '';

	        labelInput.addEventListener('keyup', () => {
	            if (this.autoChangeDbName) {
	                let label = labelInput.value.trim().toLowerCase().replace(/\W+/g, '_');
	                nameInput.value = label;
	            }
	        });

	        nameInput.addEventListener('keyup', () => {
	            this.autoChangeDbName = false;
	        });
	    }
	}

    watchGroup() {
        const groupSelect = document.getElementById("jform_group_id");
        if (!groupSelect) {
            console.warn("Group select element not found.");
            return;
        }

        const cookieName = 'fabrik_element_group';
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith(cookieName))?.split('=')[1];

        if (!groupSelect.value && cookieValue) {
            groupSelect.value = decodeURIComponent(cookieValue);
        }

        groupSelect.addEventListener('change', () => {
            const value = groupSelect.value;
            document.cookie = `${cookieName}=${encodeURIComponent(value)}; path=/; max-age=86400`;
        });
    }

    iniJsAccordion() {
        if (this.jsAjaxed === this.options.jsevents.length) {
            if (this.options.jsevents.length === 1) {
                this.jsAccordion.display(0);
            } else {
                this.jsAccordion.display(-1);
            }
            clearInterval(this.jsPeriodical);
        }
    }

    setParentViz() {
        const elementFormTable = document.getElementById('elementFormTable');
        const unlinkCheckbox = document.getElementById('unlink');
        const swapToParentBtn = document.getElementById('swapToParent');

        if (this.options.parentid !== 0 && elementFormTable && unlinkCheckbox) {
            unlinkCheckbox.addEventListener('click', () => {
                elementFormTable.style.opacity = unlinkCheckbox.checked ? 1 : 0;
            });
        }

        if (swapToParentBtn) {
            swapToParentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const form = document.forms.adminForm;
                form.task.value = 'element.parentredirect';
                form.redirectto.value = e.target.className.replace('element_', '');
                form.submit();
            });
        }
    }

    async changePlugin(pluginType) {
		let id = document.querySelector('#jform_id').value;
		let url = 'index.php?option=com_fabrik&id='+ this.options.id + '&format=raw&task=ajax.getPluginHTML&plugin=' + pluginType;
		let response = await fetch(url);
		if (response.ok) {
			let res = await response.text();
			const container = document.querySelector('#plugin-container');
			container.innerHTML = res;
			/* Make sure the scripts get into the browser */
			const scripts = container.querySelectorAll('script');
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
		}
    }

    deleteJS(target) {
        const actionContainer = target.closest('.actionContainer');
        if (actionContainer) {
            actionContainer.remove();
            this.jsAjaxed--;
        }
    }

    addJavascript(opt = {}) {
        const jsId = opt.id || 0;
        const div = document.createElement('div');
        div.className = 'actionContainer panel accordion-group';

        const toggler = document.createElement('div');
        toggler.className = 'title pane-toggler accordion-heading';

        const a = document.createElement('a');
        a.className = 'accordion-toggle';
        a.href = '#';

        const span = document.createElement('span');
        span.className = 'pluginTitle';
        span.textContent = Joomla.JText._('COM_FABRIK_LOADING');
        a.appendChild(span);

        toggler.appendChild(a);

        const body = document.createElement('div');
        body.className = 'accordion-body';

        div.appendChild(toggler);
        div.appendChild(body);

        document.getElementById('javascriptActions').appendChild(div);

        const c = this.jsCounter;
		const formData = new URLSearchParams({
		    option: 'com_fabrik',
		    view: 'plugin',
		    task: 'top',
		    format: 'raw',
		    type: 'elementjavascript',
		    plugin: null,
		    plugin_published: true,
		    c: c,
		    id: jsId,
		    elementid: this.id
		});

		fetch('index.php', {
		    method: 'POST',
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		    body: formData.toString()
		})
		    .then(response => {
		        if (!response.ok) {
		            throw new Error(`HTTP error! Status: ${response.status}`);
		        }
		        return response.text();
		    })
		    .then(html => {
		        body.innerHTML = html;
				/* Make sure the scripts get into the browser */
				const scripts = body.querySelectorAll('script');
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

		        const textarea = body.querySelector('textarea[id^="jform_code-"]');
		        if (textarea) {
		            textarea.addEventListener('change', (e) => {
		                this.setAccordionHeader(e.target.closest('.actionContainer'));
		            });
		        }

		        this.setAccordionHeader(div);
		        this.jsAjaxed++;

		        // Perform additional updates like Bootstrap or FabrikAdmin
		    })
		    .catch(err => console.error('Request failed', err));

        this.jsCounter++;
		this.updateBootStrap();
//		FabrikAdmin.reTip();
    }

	setAccordionHeader(container) {
	    if (!container) return;

	    const header = container.querySelector('span.pluginTitle');
	    const action = container.querySelector('select[id^="jform_action-"]');

	    if (!action || action.value === '') {
	        header.innerHTML = `<span style="color:red;">${Joomla.JText._('COM_FABRIK_JS_SELECT_EVENT')}</span>`;
	        return;
	    }

	    let headerText = `on ${action.options[action.selectedIndex].text} : `;
	    const code = container.querySelector('textarea[id^="jform_code-"]');
	    const event = container.querySelector('select[id^="jform_js_e_event-"]');
	    const trigger = container.querySelector('select[id^="jform_js_e_trigger-"]');
	    const name = document.getElementById('jform_name');
	    const value = container.querySelector('input[id^="jform_js_e_value-"]');
	    const condition = container.querySelector('select[id^="jform_js_e_condition-"]');

	    let details = '';

	    if (code && code.value.trim() !== '') {
	        const firstLine = code.value.split('\n')[0].trim();
	        const commentMatch = firstLine.match(/^\/\*(.*)\*\//);
	        details = commentMatch ? commentMatch[1] : Joomla.JText._('COM_FABRIK_JS_INLINE_JS_CODE');

	        if (/\/\//.test(code.value.replace(/(['"]).*?[^\\]\1/g, ''))) {
	            details += ` &nbsp; <span style="color:red;font-weight:bold;">`;
	            details += Joomla.JText._('COM_FABRIK_JS_INLINE_COMMENT_WARNING').replace(/ /g, '&nbsp;');
	            details += '</span>';
	        }
	    } else if (event && trigger && name && condition && value) {
	        details = `${Joomla.JText._('COM_FABRIK_JS_WHEN_ELEMENT')} "${name.value}" `;

	        if (/hidden|shown/.test(condition.options[condition.selectedIndex].text)) {
	            details += `${Joomla.JText._('COM_FABRIK_JS_IS')} `;
	            details += `${condition.options[condition.selectedIndex].text}, `;
	        } else {
	            details += `${condition.options[condition.selectedIndex].text} "${value.value.trim()}", `;
	        }

	        const triggerGroupLabel = trigger.options[trigger.selectedIndex].parentElement.label.toLowerCase();
	        details += `${event.options[event.selectedIndex].text} ${triggerGroupLabel.slice(0, -1)}`;
	        details += ` "${trigger.options[trigger.selectedIndex].text}"`;
	    } else {
	        headerText += `<span style="color:red;">${Joomla.JText._('COM_FABRIK_JS_NO_ACTION')}</span>`;
	    }

	    if (details) {
	        headerText += `<span style="font-weight:normal">${details}</span>`;
	    }
	    header.innerHTML = headerText;
	}
}
