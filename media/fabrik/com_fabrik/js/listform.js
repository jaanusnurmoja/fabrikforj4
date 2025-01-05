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
	if (id === undefined || id === null || id.value === '0') {
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

	function watchJoins() {
	    // Watch changes in .join_from
	    document.querySelector('div[id^=table-sliders-data]').addEventListener('change', (e) => {
	        if (e.target.matches('.join_from')) {
	            const row = e.target.closest('tr');
	            const activeJoinCounter = row.id.replace('join', '');
	            this.updateJoinStatement(activeJoinCounter);

	            const table = e.target.value;
	            const conn = document.querySelector('input[name*=connection_id]').value;

	            const update = row.querySelector('td.table_key');
	            const url = `index.php?option=com_fabrik&format=raw&task=list.ajax_loadTableDropDown&table=${table}&conn=${conn}`;

	            fetch(url, { method: 'POST' })
	                .then(response => response.text())
	                .then(html => update.innerHTML = html)
	                .catch(console.error);
	        }
	    });

	    // Watch changes in .join_to
	    document.querySelector('div[id^=table-sliders-data]').addEventListener('change', (e) => {
	        if (e.target.matches('.join_to')) {
	            const row = e.target.closest('tr');
	            const activeJoinCounter = row.id.replace('join', '');
	            this.updateJoinStatement(activeJoinCounter);

	            const table = e.target.value;
	            const conn = document.querySelector('input[name*=connection_id]').value;
	            const url = `index.php?name=jform[params][table_join_key][]&option=com_fabrik&format=raw&task=list.ajax_loadTableDropDown&table=${table}&conn=${conn}`;

	            const update = row.querySelector('td.table_join_key');
	            fetch(url, { method: 'POST' })
	                .then(response => response.text())
	                .then(html => update.innerHTML = html)
	                .catch(console.error);
	        }
	    });

	    // Watch specific field lists
	    watchFieldList('join_type');
	    watchFieldList('table_join_key');
	    watchFieldList('table_key');
	}

	function updateJoinStatement(activeJoinCounter) {
	    const fields = Array.from(document.querySelectorAll(`#join${activeJoinCounter} .inputbox`));
	    if (fields.length < 5) return;

	    const type = fields[0].value;
	    const fromTable = fields[1].value;
	    const toTable = fields[2].value;
	    const fromKey = fields[3].value;
	    const toKey = fields[4].value;

	    const str = `${type} JOIN ${toTable} ON ${fromTable}.${fromKey} = ${toTable}.${toKey}`;
	    const desc = document.getElementById(`join-desc-${activeJoinCounter}`);

	    if (desc) {
	        desc.innerHTML = str;
	    }
	}

	function watchFieldList(name) {
	    const container = document.querySelector('div[id^="table-sliders-data"]');

	    if (container) {
	        container.addEventListener('change', (event) => {
	            const target = event.target;

	            // Check if the event originated from a <select> element with the desired name pattern
	            if (target.tagName === 'SELECT' && target.name.includes(name)) {
	                const row = target.closest('tr');
	                if (row) {
	                    const activeJoinCounter = row.id.replace('join', '');
	                    this.updateJoinStatement(activeJoinCounter);
	                }
	            }
	        });
	    }
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

	watchJoins();

});