document.addEventListener("DOMContentLoaded", () => {

	// Element form fields

	const livesite = Joomla.getOptions('system.paths').baseFull;
	
	// Set up the event listener on the plugin choice
	const plugin = document.querySelector('#jform_plugin');

	// Select an element plugin and get the plugin form HTML
	plugin.addEventListener('change', async () => {
		let plugin = document.querySelector('#jform_plugin');
		let id = document.querySelector('#jform_id').value;
		let url = livesite + 'index.php?option=com_fabrik&id='+ id + '&format=raw&task=ajax.getPluginHTML&plugin=' + plugin.value;
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
	});

	// If this is a new plugin then fire the change event to preload the field plugin options
	if (document.querySelector('input[name=name_orig]').value === '') {
		const e = new Event('change');
		plugin.dispatchEvent(e);
	}

});