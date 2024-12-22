<?php

/**
 * @package     Joomla.Administrator
 * @subpackage  com_categories
 *
 * @copyright   (C) 2005 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Fabrik\Component\Fabrik\Administrator\Controller;

use Fabrik\Library\Fabrik\FabrikHtml;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Factory;
use Joomla\CMS\MVC\Controller\BaseController;

//use Fabrik\Component\Fabrik\Administrator\Field\TablesField;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * The controller for ajax requests
 *
 * @since
 */
class AjaxController extends BaseController {
	/**
	 * Fetch database tables
	 *
	 * @return  void
	 */
	public function tables() {

		$app = Factory::getApplication();
		$input = $app->getInput();
		$cid = $input->get('cid', true);
		$db = FabrikWorker::getDbo(false, $cid);
		$db->setQuery("SHOW TABLES");
		$rows = (array) $db->loadColumn();
		array_unshift($rows, '');
		echo json_encode($rows);
	}

	/**
	 * Fetch columns from table
	 *
	 * @return  void
	 */
	public function columns() {
		$app = Factory::getApplication();
		$input = $app->getInput();
		$table = $input->get('table', true);

		$db = FabrikWorker::getDbo();
		$query = $db->getQuery(true);
		$db->setQuery("DESCRIBE " . $table); // Returns: Field Type Null Key Default Extra
		$columns = $db->loadColumn(0);

		// Some add a html message to json, remove it here as well in JS code.
		$json = json_encode($columns);
		$json = explode(']', $json);
		if ($json) {
			echo $json[0] . ']';
		}

	}

	/**
	 * Load in a given plugin's HTML settings
	 *
	 * @return  void
	 */
	public function getPluginHTML() {
		$app = Factory::getApplication();
		$input = $app->getInput();
		$plugin = $input->get('plugin');
		$model = $this->getModel('element', 'Administrator');
		$model->setState('element.id', $input->getInt('id'));
		$model->getForm();
//		echo "plugin = ".$plugin.", id = ".$input->getInt('id'); // for test only
		echo $model->getPluginHTML($plugin);
        FabrikHtml::LoadAjaxAssets();
	}

}
