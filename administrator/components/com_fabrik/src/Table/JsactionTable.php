<?php
/**
 * JS Action Fabrik table
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Component\Fabrik\Administrator\Table;

// No direct access
defined('_JEXEC') or die('Restricted access');
use Fabrik\Component\Fabrik\Administrator\Table\FabTable;

/**
 * JS Action Fabrik table
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0
 */
class JsactionTable extends FabTable
{
	/**
	 * Construct
	 *
	 * @param   JDatabaseDriver  &$db  database object
	 */
	public function __construct(&$db)
	{
		parent::__construct('#__fabrik_jsactions', 'id', $db);
	}
}
