<?php
/**
 * Fabrik: Installer Manifest Class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @author      Henk
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Factory;
use Joomla\CMS\Installer\InstallerScript;
use Joomla\Database\DatabaseInterface;

class Com_FabrikInstallerScript extends InstallerScript {
	/**
	 * Run before installation or upgrade run
	 *
	 * @param   string $type   discover_install (Install unregistered extensions that have been discovered.)
	 *                         or install (standard install)
	 *                         or update (update)
	 * @param   object $parent installer object
	 *
	 * @return  void
	 */
	public function preflight($type, $parent) {
	}
	/**
	 * Run when the component is installed
	 *
	 * @param   object $parent installer object
	 *
	 * @return bool
	 */
	public function install($parent) {
	}

	/**
	 * Run when the component is updated
	 *
	 * @param   object $parent installer object
	 *
	 * @return  bool
	 */
	public function update($parent) {
	}

	/**
	 * Run when the component is uninstalled.
	 *
	 * @param   object $parent installer object
	 *
	 * @return  void
	 */
	public function uninstall($parent) {
	}

	/**
	 * Run after installation or upgrade run
	 *
	 * @param   string $type   discover_install (Install unregistered extensions that have been discovered.)
	 *                         or install (standard install)
	 *                         or update (update)
	 * @param   object $parent installer object
	 *
	 * @return  bool
	 */
	public function postflight($type, $parent) {

		$app = Factory::getApplication();

		if ($type !== 'update' && $type !== 'uninstall') {
			if (!$this->setConnection()) {
				$app->enqueueMessage("Didn't set connection. Aborting installation", 'error');
				return false;
			}
			$app->enqueueMessage("Default connection created");
		}

		return true;
	}

	/**
	 * Check if there is a connection already installed if not create one
	 * by copying over the site's default connection
	 *
	 * @return  bool
	 */
	protected function setConnection() {
		$db = Factory::getContainer()->get(DatabaseInterface::class);
		$query = $db->getQuery(true);

		/* Check if a connection already exists */
		$query->select("count(*)")->from("#__fabrik_connections");
		$count = $db->setQuery($query)->loadResult();
		if (!empty($count)) {
			// one or more connections exist
			return true;
		}

		// Lets build a default connection
		$app = Factory::getApplication();
		$row = new \stdClass;
		$row->host = $app->get('host');
		$row->user = $app->get('user');
		$row->password = $app->get('password');
		$row->database = $app->get('db');
		$row->description = 'site database';
		$row->params = '';
		$row->checked_out = 0;
		$row->published = 1;
		$row->default = 1;
		$res = $db->insertObject('#__fabrik_connections', $row, 'id');

		return $res;
	}
}
