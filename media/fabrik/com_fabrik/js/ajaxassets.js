/* A function to determine if a script or style is already included */
function is_asset_already_included(src) { 
	const found_in_resources = window.parent.performance
		.getEntriesByType("resource")
		.some(entry => entry.name === src);

	/* The script src will not have the origin so we need to add it for the search */
	const baseURL = window.parent.location.origin;
	const found_in_script_tags = Array.from(window.parent.document.querySelectorAll('script[src]'))
	    .some(script => script.src === new URL(src, baseURL).href);

	const found_in_style_tags = Array.from(window.parent.document.querySelectorAll('link[rel="stylesheet"][href]'))
		.some(link => link.href === src);
		
	return found_in_resources || found_in_script_tags || found_in_style_tags;
}

/* A function to insert the scripts and styles sequentially */
async function insert_scripts_and_styles(passedInAssets) { 
	let deferredScripts = {};
	let deferredStyles = {};
	let assets = [];

	for (let assetType in passedInAssets) {
		let assetArray = passedInAssets[assetType];

		// Convert assetArray to an array if it is an object with numeric keys
		let assetList = Array.isArray(assetArray) ? assetArray : Object.values(assetArray);

		for (let asset of assetList) { 
			if (asset.uri.length > 0 && is_asset_already_included(asset.uri)) continue; // Skip already included assets

			if (assetType === "script") {
				if (asset.uri.length > 0) {
					assets.push(() => new Promise((resolve, reject) => { 
						let script = document.createElement("script");
						script.setAttribute('type', asset.type);
						script.setAttribute('src', asset.uri);
						script.setAttribute('async', false);
						script.setAttribute('type', asset.attributes.type ?? 'text/javascript');
						script.addEventListener("load", () => resolve({status: true}));
						script.addEventListener("error", () => reject({
							status: false,
							message: `Failed to load the script file ${asset.uri}`
						}));
						window.parent.document.head.appendChild(script);
//						console.log("Loaded: " + asset.name);
					}));
				} else {
					if (asset.inline) {
						deferredScripts[asset.name] = asset.content;
//						console.log("Deferred: " + asset.name);
					}
				}
			} else if (assetType === "style") {
				if (asset.uri.length > 0) {
					assets.push(() => new Promise((resolve) => {
						let style = document.createElement("link");
						style.rel = "stylesheet";
						style.href = asset.uri;
						style.onload = () => resolve({status: true});
						style.onerror = () => resolve({status: false, message: `Failed to load the stylesheet ${asset.uri}`});
						window.parent.document.head.appendChild(style);
					}));
				} else {
					let style = document.createElement("style");
					style.innerText = asset.content;
					style.setAttribute('async', true);
					deferredStyles[asset.name] = style;
				}
			}
		}
	}

	// Function to sequentially execute an array of functions returning promises
	const executeSequentially = async (funcs) => {
		for (let func of funcs) {
			await func();
		}
	};

	// Execute all asset promises sequentially
	await executeSequentially(assets);

	// Add deferred scripts and styles
	if (Object.keys(deferredScripts).length > 0) {
	    Object.entries(deferredScripts).forEach(([key, script]) => {
//	        console.log(`Executing script for property: ${key}`);
	        const inLineScript = new Function(script);
	        inLineScript();
	    });
	}

	if (Object.keys(deferredStyles).length > 0) {
	    Object.entries(deferredStyles).forEach(([key, style]) => {
//	        console.log(`Inserting style for property: ${key}`);
			window.parent.document.head.appendChild(style);
	    });
	}
}
