<?php
/**
 * Fabrik Admin Home Model
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       1.6
 */

namespace Fabrik\Component\Fabrik\Administrator\Model;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Administrator\Model\FabAdminModel;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Table\Table;

/**
 * Fabrik Admin Home Model
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */
class HomeModel extends FabAdminModel {
	/**
	 * The prefix to use with controller messages.
	 *
	 * @var  string
	 */
	protected $text_prefix = 'COM_FABRIK_HOME';

	/**
	 * Returns a reference to the a Table object, always creating it.
	 *
	 * @param   string $type   The table type to instantiate
	 * @param   string $prefix A prefix for the table class name. Optional.
	 * @param   array  $config Configuration array for model. Optional.
	 *
	 * @return  Table    A database object
	 */
	public function getTable($type = 'Cron', $prefix = '', $config = array()) {
		$config['dbo'] = FabrikWorker::getDbo(true);
		if (!$table = $this->_createTable($type, $prefix, $config)) {
			throw new \Exception(Text::sprintf('JLIB_APPLICATION_ERROR_TABLE_NAME_NOT_SUPPORTED', $type), 0);
		}
		return $table;
	}

	/**
	 * Method to get the record form.
	 *
	 * @param   array $data     Data for the form.
	 * @param   bool  $loadData True if the form is to load its own data (default case), false if not.
	 *
	 * @return  mixed    A Form object on success, false on failure
	 */
	public function getForm($data = array(), $loadData = true) {
		return false;
	}

	/**
	 * Empty all fabrik db tables of their data
	 *
	 * @return  void or JError
	 */
	public function reset() {
		$user = Factory::getUser();
		$is_suadmin = $user->authorise('core.admin');
		if (!$is_suadmin) {
			return \Joomla\CMS\Factory::getApplication()->enqueueMessage(Text::_('COM_FABRIK_HOME_RESET_NOAUTH'), 'error');
		}
		$db = FabrikWorker::getDbo(true);
		$prefix = '#__fabrik_';
		$tables = array('cron', 'elements', 'formgroup', 'forms', 'form_sessions', 'groups', 'joins', 'jsactions', 'lists', 'validations');

		foreach ($tables as $table) {
			$db->setQuery('TRUNCATE TABLE ' . $prefix . $table);
			$db->execute();
		}
	}

	/**
	 * Drop all the lists db tables
	 *
	 * @return  void
	 */
	public function dropData() {
		$connModel = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Connection', 'Site');
		$connModel->setId($item->connection_id);
		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select("connection_id, db_table_name")->from('#__fabrik_lists');
		$db->setQuery($query);
		$rows = $db->loadObjectList();

		foreach ($rows as $row) {
			$connModel->setId($row->connection_id);
			$c = $connModel->getConnection($row->connection_id);
			$fabrikDb = $connModel->getDb();
			$fabrikDb->dropTable($row->db_table_name);
		}
	}
}
