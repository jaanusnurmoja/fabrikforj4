<?php
/**
 * Connection Fabrik Table
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

/**
 * Connection Fabrik Table
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0
 */

class ConnectionTable extends Table
{
	/**
	 * @var int
	 */
	public $id;

	/**
	 * @var int
	 */
	public $default = 0;

	/**
	 * @var string
	 */
	public $password = '';
	/**
	 * Constructor
	 *
     * @param   string               $table       Name of the table to model.
     * @param   mixed                $key         Name of the primary key field in the table or array of field names that compose the primary key.
     * @param   DatabaseDriver       $db          DatabaseDriver object.
     * @param   DispatcherInterface  $dispatcher  Optional, Event dispatcher for this table
	 */
	public function __construct(&$db)
	{
		parent::__construct('#__fabrik_connections', 'id', $db);
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
		return parent::store($updateNulls);
	}

}