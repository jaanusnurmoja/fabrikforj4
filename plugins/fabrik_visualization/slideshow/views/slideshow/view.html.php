<?php
/**
 * Slideshow vizualization: view
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.visualization.slideshow
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Model\BaseDatabaseModel;
use Joomla\CMS\MVC\View\HtmlView;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;

jimport('joomla.application.component.view');

/**
 * Fabrik Slideshow Viz HTML View
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.visualization.timeline
 * @since       3.0
 */

class FabrikViewSlideshow extends HtmlView
{
	/**
	 * Execute and display a template script.
	 *
	 * @param   string  $tpl  The name of the template file to parse; automatically searches through the template paths.
	 *
	 * @return  mixed  A string if successful, otherwise a JError object.
	 */

	public function display($tpl = 'default')
	{
		$app = Factory::getApplication();
		$input = $app->input;
		$srcs = FabrikHelperHTML::framework();
		$model = $this->getModel();
		$usersConfig = ComponentHelper::getParams('com_fabrik');
		$model->setId($input->getInt('id', $usersConfig->get('visualizationid', $input->getInt('visualizationid', 0))));
		$this->row = $model->getVisualization();

		if (!$model->canView())
		{
			echo Text::_('JERROR_ALERTNOAUTHOR');

			return false;
		}

		$this->js = $this->get('JS');
		$viewName = $this->getName();
		$params = $model->getParams();
		$this->params = $params;
		$pluginManager = BaseDatabaseModel::getInstance('Pluginmanager', 'FabrikFEModel');
		$plugin = $pluginManager->getPlugIn('slideshow', 'visualization');
		$this->showFilters = $model->showFilters();
		$this->filters = $this->get('Filters');
		$this->filterFormURL = $this->get('FilterFormURL');
		$this->params = $model->getParams();
		$this->containerId = $this->get('ContainerId');
		$this->slideData = $model->getImageJSData();

		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
		$wa->useScript("com_fabrik.site.listfilter");
		$wa->addInlineScript($this->js, ["position" => "after"], [], ["plg.fabrik_visualization.slideshow"]);
		
		if ($this->get('RequiredFiltersFound'))
		{
			$wa->usePreset("com_fabrik.lib.slick");
			$wa->useScript("plg.fabrik_visualization.slideshow");
		}

		$wa->useScript("com_fabrik.lib.slimbox");
		$wa->useStyle("com_fabrik.lib.slimbox");

		$tpl = 'bootstrap';
		$tpl = $params->get('slideshow_viz_layout', $tpl);
		$tmplpath = $model->pathBase . 'slideshow/views/slideshow/tmpl/' . $tpl;
		$this->_setPath('template', $tmplpath);
		$wa->useStyle("plg.fabrik_visualization.slideshow." . $tpl . ".template");
		$wa->useStyle("plg.fabrik_visualization.slideshow." . $tpl . ".custom");

		echo parent::display();
	}
}
