<?php
/**
 * Visualization View
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Model\BaseDatabaseModel;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Filesystem\File;
use Joomla\CMS\HTML\HTMLHelper;

jimport('joomla.application.component.view');

/**
 * Viz HTML view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0.6
 */
class FabrikViewVisualization extends FabrikView
{
	/**
	 * Display
	 *
	 * @param   string  $tmpl  Template
	 *
	 * @return  void
	 */
	public function display($tmpl = 'default')
	{
		$srcs = FabrikHelperHTML::framework();
		$input = $this->app->getInput();
		FabrikHelperHTML::script($srcs);
		$model = $this->getModel();
		$usersConfig = ComponentHelper::getParams('com_fabrik');
		$model->setId($input->get('id', $usersConfig->get('visualizationid', $input->getInt('visualizationid', 0))));
		$visualization = $model->getVisualization();
		$params = $model->getParams();
		$pluginManager = BaseDatabaseModel::getInstance('Pluginmanager', 'FabrikFEModel');
		$plugin = $pluginManager->getPlugIn($visualization->plugin, 'visualization');
		$plugin->setRow($visualization);

		if ($visualization->published == 0)
		{
			$this->app->enqueueMessage(Text::_('COM_FABRIK_SORRY_THIS_VISUALIZATION_IS_UNPUBLISHED'), 'error');
			return;
		}

		// Plugin is basically a model
		$pluginTask = $input->get('plugintask', 'render', 'request');

		// @FIXME cant set params directly like this, but I think plugin model setParams() is not right
		$plugin->params = $params;
		$tmpl = $plugin->getParams()->get('calendar_layout', $tmpl);
		$plugin->$pluginTask($this);
		$this->plugin = $plugin;
		$jTmplFolder = 'tmpl';
		$this->addTemplatePath($this->_basePath . '/plugins/' . $this->_name . '/' . $plugin->_name . '/' . $jTmplFolder . '/' . $tmpl);

		$root = $this->app->isClient('administrator') ? JPATH_ADMINISTRATOR : JPATH_SITE;
		$this->addTemplatePath($root . '/templates/' . $this->app->getTemplate() . '/html/com_fabrik/visualization/' . $plugin->_name . '/' . $tmpl);
		$ab_css_file = JPATH_SITE . '/plugins/fabrik_visualization/' . $plugin->_name . '/tmpl/' . $tmpl . '/template.css';

		if (File::exists($ab_css_file))
		{
			HTMLHelper::stylesheet('template.css', 'plugins/fabrik_visualization/' . $plugin->_name . '/tmpl/' . $tmpl . '/', true);
		}

		echo parent::display();
	}

	/**
	 * Just for plugin
	 *
	 * @return  void
	 */
	public function setId()
	{
	}
}
