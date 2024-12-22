<?php
/**
 * Any of these defines can be overwritten by copying this file to
 * plugins/system/fabrik/user_defines.php
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\MVC\Model\BaseDatabaseModel;
use Joomla\CMS\Version;
use Joomla\CMS\Factory;
use Joomla\CMS\Filesystem\File;
use Joomla\CMS\Filesystem\Folder;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Uri\Uri;

jimport('joomla.filesystem.folder');

// Could be that the sys plugin is installed but fabrik not
if (!Folder::exists(JPATH_SITE . '/components/com_fabrik/'))
{
	return;
}

define("COM_FABRIK_BASE", JPATH_SITE . DIRECTORY_SEPARATOR);
define("COM_FABRIK_FRONTEND", COM_FABRIK_BASE . 'components/com_fabrik');
define("COM_FABRIK_BACKEND", COM_FABRIK_BASE . 'administrator/components/com_fabrik');
define("COM_FABRIK_LIBRARY", COM_FABRIK_BASE . 'libraries/fabrik');
define("COM_FABRIK_LIVESITE", Uri::root());
define("COM_FABRIK_LIVESITE_ROOT", Uri::getInstance()->toString(array('scheme', 'host', 'port')));
define("FABRIKFILTER_TEXT", 0);
define("FABRIKFILTER_EVAL", 1);
define("FABRIKFILTER_QUERY", 2);
define("FABRIKFILTER_NOQUOTES", 3);

/** @var delimiter used to define separator in csv export */
define("COM_FABRIK_CSV_DELIMITER", ",");
define("COM_FABRIK_EXCEL_CSV_DELIMITER", ";");

/** @var string separator used in repeat elements/groups IS USED IN F3 */
define("GROUPSPLITTER", "//..*..//");

