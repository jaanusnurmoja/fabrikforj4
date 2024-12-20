<?php
/**
 * Fabrik Admin Import Model
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       1.6
 */

namespace Fabrikar\Component\Fabrik\Administrator\Model;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Administrator\Model\FabAdminModel;
use Fabrikar\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Table\Table;

/**
 * Fabrik Admin Import Model
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */
class ImportModel extends FabAdminModel {
	/**
	 * The prefix to use with controller messages.
	 *
	 * @var  string
	 */
	protected $text_prefix = 'COM_FABRIK_IMPORT';

	/**
	 * Tables to import
	 *
	 * @var Tables
	 */
	protected $tables = array();

	/**
	 * Returns a reference to the a Table object, always creating it.
	 *
	 * @param   string $type   The table type to instantiate
	 * @param   string $prefix A prefix for the table class name. Optional.
	 * @param   array  $config Configuration array for model. Optional.
	 *
	 * @return  Table    A database object
	 */
	public function getTable($type = 'List', $prefix = '', $config = array()) {
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
		// Get the form.
		$form = $this->loadForm('com_fabrik.import', 'import', array('control' => 'jform', 'load_data' => $loadData));

		if (empty($form)) {
			return false;
		}

		$form->model = $this;

		return $form;
	}

	/**
	 * Method to get the data that should be injected in the form.
	 *
	 * @return  mixed    The data for the form.
	 */
	protected function loadFormData() {
		// Check the session for previously entered form data.
		$data = $this->app->getUserState('com_fabrik.edit.import.data', array());

		if (empty($data)) {
			$data = $this->getItem();
		}

		return $data;
	}
}
