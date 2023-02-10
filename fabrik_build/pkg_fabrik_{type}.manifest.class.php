<?php
/**
 * Fabrik: Package Installer Manifest Class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @author      Henk
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Version;
use Joomla\CMS\Factory;

class Pkg_Fabrik_{type}InstallerScript
{
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
	public function preflight($type, $parent)
	{
		/* Do not allow an installation if the core package is not installed */
		if ($type != 'uninstall') {
			$db = Factory::getContainer()->get('DatabaseDriver');
			$query = $db->getQuery(true);
			$query->select("count(*)")->from("#__extensions")->where("type='package'")->where("element='pkg_fabrik_core'");
			if ($db->setQuery($query)->loadResult() == 0) {
				Factory::getApplication()->enqueueMessage('Fabrik Core package must be installed before {Type} package.', 'error');
				return false;
			}
		}

		return true;
	}

	public function postFlight($type, $parent) {
		/* Warn the user that no plugins or modules have been enabled */
		if ($type == 'install') {
			Factory::getApplication()->enqueueMessage('Installed Plugins and Modules must be enabled mannualy.', 'warning');
		}
		return true;
	}
}