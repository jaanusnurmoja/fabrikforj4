/*
 * Fabrik 5
 * 
 *
 */ 
document.addEventListener("DOMContentLoaded", () => {

	const livesite = Joomla.getOptions('system.paths').baseFull;
	var rows= -1;
	const pre = '#jform_params__subform_joins__subform_joins'+ rows + '__';
	const join = document.querySelector(pre + 'table_join');
	const from = document.querySelector(pre + 'join_from_table');
	const join_key = document.querySelector(pre + 'table_join_key');
	const from_key = document.querySelector(pre + 'table_key');

	function getColumns(table,key) {
		if(table) { 
			table.addEventListener('change', async function w() { 
				let url = livesite + 'index.php?option=com_fabrik&format=raw&task=ajax.columns&table=' + table.value;
				if(key) { 
					if (!table.value) {
						key.length = 0;
					} else {
						let response = await fetch(url);
						if (response.ok) {
							let txt = await response.text();
							txt = txt.split(']');
							let cols = JSON.parse(txt[0] + ']');
							key.length=0;
							for (let k = 0; k < cols.length; k++) {
								key.add(new Option(cols[k],cols[k]),undefined);
							}
						}
					}
				}
			});
		}
	};

	getColumns(join,join_key);
	getColumns(from,from_key);

	document.addEventListener('subform-row-add', () => {
		rows++;
		const vals = [];
		const pre = '#jform_params__subform_joins__subform_joins'+ rows + '__';
		const join = document.querySelector(pre + 'table_join');
		const from = document.querySelector(pre + 'join_from_table');
		const join_key = document.querySelector(pre + 'table_join_key');
		const from_key = document.querySelector(pre + 'table_key');

		// Add select option to "From"
		for(let i=0; i<rows; i++) {
			const opt = document.querySelector('#jform_params__subform_joins__subform_joins'+ i + '__' + 'table_join');
			if(opt) {
				vals[i] = opt.value; 
			}
		}
		if(from) { 
			for (let k = 0; k < vals.length; k++) {
				if(vals[k]) {
					from.add(new Option(vals[k],vals[k]),undefined);
				}
			}
		}
		getColumns(join,join_key);
		getColumns(from,from_key);


	});

//document.querySelector('#jform_params_test_join').value = "table_join = " + table_join; // for test only


});
