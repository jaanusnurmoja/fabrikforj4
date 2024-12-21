document.addEventListener("DOMContentLoaded", () => {

	// List form fields
	
	// We can also choose to make this into separate JS file for db_table_name

	const livesite = Joomla.getOptions('system.paths').baseFull;

	// Automatically fill in the input value from the list label into 'database_name'
	function watchLabel(tblName,Label) {
		let tbl = document.querySelector(tblName);
		let lbl = document.querySelector(Label);
		let fill = tbl.value === '' ? true : false;
		lbl.addEventListener('keyup', () => {
			if (fill) {
				tbl.value = lbl.value.trim().toLowerCase().replace(/\W+/g, '_');
			}
		});
		tbl.addEventListener('keyup', () => {fill = false;});
	};

	var id = document.querySelector('#jform_id');
	var first = 0;
	// Do these only on a new list, not on edit
	if (id.value === '0') {
		watchLabel('#jform__database_name', '#jform_label');

		// Get a list of tables in the database selected in 'connection_id'
		var cnn = document.querySelector('#jform_connection_id');
		cnn.addEventListener('change', async function w() {
			let cid = cnn.value;
			let url = livesite + 'index.php?option=com_fabrik&format=raw&task=ajax.tables&cid=' + cid;
			let sel = document.querySelector('#jform_db_table_name');
			if (!cid) {
				sel.length = 0;
			} else {
				let response = await fetch(url);
				if (response.ok) {
					let tables = await response.json();
					let prefix = tables[1].substring(0, 6) + '_';
					sel.length=0;
					for (let i = 0; i < tables.length; i++) {
						sel.add(new Option(tables[i],tables[i]),undefined);
					}
					// Add table prefix
					let name = document.querySelector('#jform__database_name').value;
					if (first === 0) {
						document.querySelector('#jform__database_name').value = prefix + name;
					} else {
						document.querySelector('#jform__database_name').value = prefix + name.substring(6);
					}
				}
			}
			first++;
		});

	}

//document.querySelector('#jform__database_name').value = "prefix = " + prefix; // for test only

	// Do these only on edit, not on a new list
	if (id.value !== '0') {


	}

// Do these always. Could be for a 'common' listform.js

	// Is done in fabsubform too. Here also for all other elements. 
	document.body.querySelectorAll('select').forEach(function(node) {
		if(node.classList.contains("form-select") && node.classList.contains("form-select-sm")) node.classList.remove("form-select");
	});


});