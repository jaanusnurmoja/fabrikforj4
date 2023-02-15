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

class Pkg_Fabrik_combinedInstallerScript
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

		if ($type == 'uninstall') {
			/* Check if any of the other fabrik packages are installed, and if so advise that they must be uninstalled first */
			$db = Factory::getContainer()->get('DatabaseDriver');
			$query = $db->getQuery(true);
			$query->select("count(*)")->from("#__extensions")->where("type='package'")->where("element like('pkg_fabrik_%')")->where("element != 'pkg_fabrik_core'");
			$db->setQuery($query);
			if ($db->loadResult() != 0) {
				throw new RuntimeException('Fabrik core cannot be uninstalled when other Fabrik packages are still installed.');
				return false;
			}
		}
		
		return true;
	}

	public function postFlight($type, $parent) {
		if ($type !== 'uninstall') {
			$db = Factory::getContainer()->get('DatabaseDriver');
			$query = $db->getQuery(true);
			/* Run through all the installed plugins and enable them */
			foreach($parent->manifest->files->file as $file) {
				list($prefix, $fabrik, $type, $element) = array_pad(explode("_", $file), 4, '');
				switch ($prefix) {
					case 'plg':
						if ($type == 'system') {
							$query->clear()->update("#__extensions")->set("enabled=1")
									->where("type='plugin'")->where("folder='system'")->where("element='$fabrik'");
						} else {
							$query->clear()->update("#__extensions")->set("enabled=1")
									->where("type='plugin'")->where("folder='fabrik_$type'")->where("element='$element'");
						}
						break;
					case 'com':
						$query->clear()->update("#__extensions")->set("enabled=1")
								->where("type='component'")->where("name='com_fabrik'");
						break;
					case 'lib':
						$query->clear()->update("#__extensions")->set("enabled=1")
								->where("type='library'")->where("element='$fabrik/$type'");
						break;
					case 'mod':
						if ($type != 'admin') {
							$query->clear()->update("#__extensions")->set("enabled=1")
									->where("name='mod_fabrik_$type'");
						} else {
							$query->clear()->update("#__extensions")->set("enabled=1")
									->where("type='module'")->where("type='mod_fabrik_$element'");
						}
						break;
					default:
						continue 2;
				}
				$db->setQuery($query);
				$db->execute();
			}
			Factory::getApplication()->enqueueMessage("All Core plugins have been enabled");
		}
	}
}