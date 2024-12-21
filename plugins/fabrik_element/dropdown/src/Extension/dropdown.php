<?php

/**
 * Plugin element to render dropdown
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.dropdown
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Element\Dropdown
// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\Layout\LayoutInterface;
use Joomla\CMS\Date\Date;
use Joomla\CMS\Profiler\Profiler;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\Event\SubscriberInterface;
use Joomla\Utilities\ArrayHelper;
use Joomla\String\StringHelper;
use Fabrik\Library\Fabrik\FabrikPhp;
use Fabrik\Library\Fabrik\FabrikWorker;
use Fabrik\Library\Fabrik\FabrikArray;
use Fabrik\Library\Fabrik\FabrikHtml;
use Fabrik\Library\Fabrik\FabrikString;
use Fabrik\Component\Fabrik\Site\Model\PluginelementModel;
use Joomla\CMS\Uri\Uri;

class Dropdown extends PluginelementModel implements SubscriberInterface // PluginelementModel extends PluginModel extends CMSPlugin
{
    public static function getSubscribedEvents(): array
    {
        /* Insert any treiggered events that the plugin might respond to format is 'trigger event name' => 'local function name' */
        $pluginMethods = [];

        return array_merge(parent::getSubscribedEvents(), $pluginMethods);
    }

    /**
     *  Insert plugin logic here : copy code from F4 plugin and modify as needed
     *
     **/
}
