/*
 * Fabrik 5
 * Remove form-select if class="form-select-sm" for a subform type field
 *
 */ 
document.addEventListener("DOMContentLoaded", () => {

	const livesite = Joomla.getOptions('system.paths').baseFull;

	// For subforms added items
	document.addEventListener('subform-row-add', () => {
		document.body.querySelectorAll('select').forEach(function(node) {
			if(node.classList.contains("form-select") && node.classList.contains("form-select-sm")) node.classList.remove("form-select");
		});
	});

	document.body.querySelectorAll('select').forEach(function(node) {
		if(node.classList.contains("form-select") && node.classList.contains("form-select-sm")) node.classList.remove("form-select");
	});

});
