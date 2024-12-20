<?php
/**
 * Renders a list of connections
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrikar\Component\Fabrik\Administrator\Field;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Form\Field\ListField;

/**
 * Renders a list of connections
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.0
 */
class ListtablesField extends ListField {
	/**
	 * Element name
	 *
	 * @var        string
	 */
	protected $name = 'Listtables';

	/**
	 * Method to get the table in case we create a list menu item.
	 *
	 * @return  object  The table selection options.
	 */

	protected function getOptions() {
		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select('id AS value, label AS text')->from('#__fabrik_lists')->where('published <> -2')->order('label ASC');
		$db->setQuery($query);
		$rows = $db->loadObjectList();

		return $rows;
	}

}
