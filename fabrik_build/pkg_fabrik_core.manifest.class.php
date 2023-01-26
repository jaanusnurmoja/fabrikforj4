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

class Pkg_FabrikInstallerScript
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
		$jversion = new Version();

		if (version_compare($jversion->getShortVersion(), '4.2', '<')) {
			throw new RuntimeException('Fabrik can not be installed on versions of Joomla older than 4.2');
			return false;
		}
		if (version_compare($jversion->getShortVersion(), '5.0', '>')) {
			throw new RuntimeException('Fabrik can not yet be installed on Joomla 5');
			return false;
		}

		if (version_compare(phpversion(), '8.1', '<')) {
			throw new RuntimeException('Fabrik can not yet be installed on versions of PHP less than 8.1, your version is '.phpversion());
			return false;
		}

		return true;
	}
}