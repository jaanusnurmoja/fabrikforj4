<?php
/**
 * List Fabrik Table
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Component\Fabrik\Administrator\Table;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Table\Table;
use Joomla\CMS\Access\Rules;
use Joomla\CMS\Language\Text;
use Joomla\Registry\Registry;
use Fabrik\Component\Fabrik\Administrator\Table\FabTable;
use Joomla\Utilities\ArrayHelper;

/**
 * List Fabrik Table
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0
 */
class ListTable extends FabTable
{

	/**
	 * Constructor
	 *
	 * @param   JDatabaseDriver  &$db  database object
	 */
	public function __construct(&$db)
	{
		parent::__construct('#__fabrik_lists', 'id', $db);
	}

	/**
	 * Method to bind an associative array or object to the Table instance.This
	 * method only binds properties that are publicly accessible and optionally
	 * takes an array of properties to ignore when binding.
	 *
	 * @param   mixed  $src     An associative array or object to bind to the Table instance.
	 * @param   mixed  $ignore  An optional array or space separated list of properties to ignore while binding.
	 *
	 * @return  boolean  True on success.
	 */
	public function bind($src, $ignore = array())
	{
		// After upgrade we don't have subforms, so we need to create the subform arrays and copy existing values.

		// Create array form params
		$tmp = json_decode((string)$src['params'],true);
		
		if(array_key_exists('fabrik5', (array)$tmp)) { // strange: inversion with ! does not work here
		} else {

			// Create the list_search_elements array
			$resp = [];
			if(array_key_exists('list_search_elements', (array)$tmp)) {
				$resp = json_decode($tmp['list_search_elements'],true);
				$tmp['list_search_elements'] = $resp['search_elements'];
				$src['params'] = json_encode($tmp);
			}

			// Create the csv_elements array
			$resp = [];
			if(array_key_exists('csv_elements', (array)$tmp)) {
				$resp = json_decode($tmp['csv_elements'],true);
				$tmp['csv_elements'] = $resp['show_in_csv'];
				$src['params'] = json_encode($tmp);
			}

			// Create the subform_ordering array for the subform and copy (non param) values order_by & order_dir
			$rows = 0; $a = [];
			if(array_key_exists('order_by', (array)$src)) {
				$order_by = json_decode((string)$src['order_by'],true);
				$order_dir = json_decode((string)$src['order_dir'],true);
				$rows = count((array)$order_by);
				for($i=0; $i<$rows; $i++) {
					$a['subform_ordering'.$i]['order_by'] = $order_by[$i];
					$a['subform_ordering'.$i]['order_dir'] = $order_dir[$i];
				}
				$tmp['subform_ordering'] = $a;
				$src['params'] = json_encode($tmp);
			}

			// Create the group_by_ordering array for the subform.
			$a = [];
			if(array_key_exists('group_by_order', (array)$tmp)) {
				$a['group_by_order'] = $tmp['group_by_order'];
				$a['group_by_order_dir'] = $tmp['group_by_order_dir'];
				$tmp['subform_group_by_ordering'] = $a;
				$src['params'] = json_encode($tmp);
			}

			// Create the list_responsive_elements array for the subform.
			$resp = []; $rows = 0; $a = [];
			if(array_key_exists('list_responsive_elements', (array)$tmp)) {
				$resp = json_decode($tmp['list_responsive_elements'],true);
				$rows = count((array)$resp['responsive_elements']);
				for($i=0; $i<$rows; $i++) {
					foreach($resp as $key=>$val) {
						$a['subform_list_responsive_elements'.$i][$key] = $resp[$key][$i];
					}
				}
				$tmp['subform_list_responsive_elements'] = $a;
				$src['params'] = json_encode($tmp);
			}

			// Create the prefilter array for the subform.
			$rows = 0; $a = [];
			if(array_key_exists('filter-join', (array)$tmp)) {
				$rows = count((array)$tmp['filter-join']);
				for($i=0; $i<$rows; $i++) {
					$a['subform_prefilters'.$i]['filter-join'] = $tmp['filter-join'][$i];
					$a['subform_prefilters'.$i]['filter-fields'] = $tmp['filter-fields'][$i];
					$a['subform_prefilters'.$i]['filter-conditions'] = $tmp['filter-conditions'][$i];
					$a['subform_prefilters'.$i]['filter-value'] = $tmp['filter-value'][$i];
					$a['subform_prefilters'.$i]['filter-eval'] = $tmp['filter-eval'][$i];
					$a['subform_prefilters'.$i]['filter-access'] = $tmp['filter-access'][$i];
					$a['subform_prefilters'.$i]['filter-grouped'] = $tmp['filter-grouped'][$i];
				}
				$tmp['subform_prefilters'] = $a;
				$src['params'] = json_encode($tmp);
			}

			// Create the open_archive_elements array for the subform.
			// no data filled
			$resp = []; $rows = 0; $a = [];
			if(array_key_exists('open_archive_elements', (array)$tmp)) {
				$resp = json_decode($tmp['open_archive_elements'],true);
				$rows = count((array)$resp['dublin_core_element']);
				for($i=0; $i<$rows; $i++) {
					foreach($resp as $key=>$val) {
						$a['open_archive_elements'.$i][$key] = $resp[$key][$i];
					}
				}
				$tmp['open_archive_elements'] = $a;
				$src['params'] = json_encode($tmp);
			}

			// Create the joins array for the subform.
			$rows = 0; $a = [];
			if(array_key_exists('join_id', (array)$tmp)) {
				$rows = count((array)$tmp['join_id']);
				for($i=0; $i<$rows; $i++) {
					$a['subform_joins'.$i]['join_id'] = $tmp['join_id'][$i];
					$a['subform_joins'.$i]['join_type'] = $tmp['join_type'][$i];
					$a['subform_joins'.$i]['join_from_table'] = $tmp['join_from_table'][$i];
					$a['subform_joins'.$i]['table_join'] = $tmp['table_join'][$i];
					$a['subform_joins'.$i]['table_key'] = $tmp['table_key'][$i];
					$a['subform_joins'.$i]['table_join_key'] = $tmp['table_join_key'][$i];
					$a['subform_joins'.$i]['join_repeat'] = $tmp['join_repeat'][$i][$i];
				}
				$tmp['subform_joins'] = $a;
				$src['params'] = json_encode($tmp);
			}
		}
		// end upgrade
		
		// Bind the rules.
		if (isset($src['rules']) && is_array($src['rules']))
		{
			$rules = new Rules($src['rules']);
			$this->setRules($rules);
		}

		// Covert the params to a json object if its set as an array
		if (isset($src['params']) && is_array($src['params']))
		{
			$registry = new Registry;
			$registry->loadArray($src['params']);
			$src['params'] = (string) $registry;

		}

		return parent::bind($src, $ignore);
	}

	/**
	 * Method to store a row in the database from the Table instance properties.
	 * If a primary key value is set the row with that primary key value will be
	 * updated with the instance property values.  If no primary key value is set
	 * a new row will be inserted into the database with the properties from the
	 * Table instance.
	 *
	 * @param   boolean  $updateNulls  True to update fields even if they are null.
	 *
	 * @return  boolean  True on success.
	 *
	 * @link    http://docs.joomla.org/Table/store
	 * @since   11.1
	 */
	public function store($updateNulls = true)
	{
		//return parent::store($updateNulls);
		if (!parent::store($updateNulls)) 
		{
			throw new \RuntimeException('Fabrik error storing form data: ' . $this->getError());
		}
		return true;
	}

	/**
	 * Method to compute the default name of the asset.
	 * The default name is in the form table_name.id
	 * where id is the value of the primary key of the table.
	 *
	 * @return	string
	 */
	protected function _getAssetName()
	{
		$k = $this->_tbl_key;

		return 'com_fabrik.list.' . (int) $this->$k;
	}

	/**
	 * Method to return the title to use for the asset table.
	 *
	 * @return	string
	 */
	protected function _getAssetTitle()
	{
		return $this->label;
	}

	/**
	 * Method to load a row from the database by primary key and bind the fields
	 * to the Table instance properties.
	 *
	 * @param   mixed    $keys   An optional primary key value to load the row by, or an array of fields to match.  If not
	 * set the instance property value is used.
	 * @param   boolean  $reset  True to reset the default values before loading the new row.
	 *
	 * @return  boolean  True if successful. False if row not found or on error (internal error state set in that case).
	 */
	public function load($keys = null, $reset = true)
	{
		
		if (empty($keys))
		{
			// If empty, use the value of the current key
			$keyName = $this->_tbl_key;
			$keyValue = property_exists($this, $keyName) ? $this->$keyName : null;
			if (empty($keyValue)) {
				return true;
			}
			$keys = array($keyName => $keyValue);
		}
		elseif (!is_array($keys))
		{
			// Load by primary key.
			$keys = array($this->_tbl_key => $keys);
		}

		if ($reset)
		{
			$this->reset();
		}
		// Initialise the query.
		$query = $this->_db->getQuery(true);
		$query->select('c.description AS `connection`, ' . $this->_tbl . '.*');
		$query->from($this->_tbl);
		$query->join('LEFT', '#__fabrik_connections AS c ON c.id = ' . $this->_tbl . '.connection_id');
		$fields = array_keys($this->getProperties());

		foreach ($keys as $field => $value)
		{
			// Check that $field is in the table.
			if (!in_array($field, $fields))
			{
				$e = new \Exception(Text::sprintf('JLIB_DATABASE_ERROR_CLASS_IS_MISSING_FIELD', get_class($this), $field));
				$this->setError($e);

				return false;
			}
			// Add the search tuple to the query.
			$query->where($this->_tbl . '.' . $this->_db->quoteName($field) . ' = ' . $this->_db->quote($value));
		}

		$this->_db->setQuery($query);
		$row = $this->_db->loadAssoc();

		// Check that we have a result.
		if (empty($row))
		{
			return false;
		}

		// Bind the object with the row and return.
		return $this->bind($row);
	}

	/**
	 * Method to delete a row from the database table by primary key value.
	 *
	 * @param   mixed  $pk  An optional primary key value to delete.  If not set the instance property value is used.
	 *
	 * @return  boolean  True on success.
	 */
	public function delete($pk = null)
	{
		if (!parent::delete())
		{
			return false;
		}

		$pk = (array) $pk;
		$pk = ArrayHelper::toInteger($pk);

		if (empty($pk))
		{
			return;
		}

		// Initialise the query.
		$query = $this->_db->getQuery(true);

		$query->delete('#__fabrik_joins')->where('element_id = 0 AND list_id IN (' . implode(',', $pk) . ' )');
		$this->_db->setQuery($query);

		return $this->_db->execute();
	}
}
