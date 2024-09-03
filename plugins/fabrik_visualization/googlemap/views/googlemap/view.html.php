<?php
/**
 * Fabrik Google Map Viz HTML View
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.visualization.googlemap
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Factory;

jimport('joomla.application.component.view');

/**
 * Fabrik Google Map Viz HTML View
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.visualization.googlemap
 * @since       3.0
 */

class FabrikViewGooglemap extends HtmlView
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
		$app   = Factory::getApplication();
		$input = $app->input;
		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
		FabrikHelperHTML::framework();
		$wa->useScript("com_fabrik.lib.slimbox");
		$wa->useStyle("com_fabrik.lib.slimbox");
		$usersConfig = ComponentHelper::getParams('com_fabrik');
		$model       = $this->getModel();
		$model->setId($input->getInt('id', $usersConfig->get('visualizationid', $input->getInt('visualizationid', 0))));
		$this->row = $model->getVisualization();

		if (!$model->canView())
		{
			echo Text::_('JERROR_ALERTNOAUTHOR');

			return false;
		}

		$this->row->label     = Text::_($this->row->label);
		$js                   = $model->getJs();
		$this->txt            = $model->getText();
		$params               = $model->getParams();
		$this->params         = $params;
		$tpl                  = 'bootstrap';
		$tpl                  = $params->get('fb_gm_layout', $tpl);
		$tmplpath             = JPATH_ROOT . '/plugins/fabrik_visualization/googlemap/views/googlemap/tmpl/' . $tpl;
		$wa->useScript("com_fabrik.site.list-plugin");
		$wa->useScript("com_fabrik.site.listfilter");

		if ($params->get('fb_gm_center') == 'userslocation')
		{
			$wa->useScript("com_fabrik.lib.geo-location");
		}

		$model->getPluginJsClasses($srcs);

		global $ispda;

		if ($ispda == 1)
		{
			// Pdabot
			$template        = 'static';
			$this->staticmap = $model->getStaticMap();
		}
		else
		{
			/*if (FabrikHelperHTML::isDebug())
			{
				$srcs['GoogleMap'] = 'plugins/fabrik_visualization/googlemap/googlemap.js';
			}
			else
			{
				$srcs['GoogleMap'] = 'plugins/fabrik_visualization/googlemap/googlemap-min.js';
			}*/
			$wa->useScript("plg.fabrik_visualization.googlemap");

			if ((int) $this->params->get('fb_gm_clustering', '0') == 1)
			{
				$wa->useScript("plg.fabrik_visualization.googlemap.markerclusterer");
			}

			$template = null;
		}

		// Assign plugin js to viz so we can then run clearFilters()
		$aObjs = $model->getPluginJsObjects();

		if (!empty($aObjs))
		{
			$js .= $model->getJSRenderContext() . ".addPlugins([\n";
			$js .= "\t" . implode(",\n  ", $aObjs);
			$js .= "]);";
		}

		if ($model->showFilters())
		{
			$js .= $model->getFilterJs();
		}

		$srcs = [];
		$model->getCustomJsAction($srcs);
		foreach ($srcs as $srcKey => $src) {
			$wa->addAndUseScript($srcKey, $src);
		}

		$wa->addInlineScript($js, ["position" => "after"], [], ["plg.fabrik_visualization.googlemap"]);

		$wa->registerAndUserStyle("plg.fabrik_visualization.googlemap", 'plugins/fabrik_visualization/googlemap/views/googlemap/tmpl/' . $tpl . '/template.css');

		// Check and add a general fabrik custom css file overrides template css and generic table css
		$wa->useStyle("com_fabrik.site.fabrik.custom");

		// Check and add a specific viz template css file overrides template css generic table css and generic custom css
		$wa->registerAndUserStyle("plg.fabrik_visualization.googlemap", 'plugins/fabrik_visualization/googlemap/views/googlemap/tmpl/' . $tpl . '/custom.css');
		$this->filters         = $model->getFilters();
		$this->showFilters     = $model->showFilters();
		$this->filterFormURL   = $model->getFilterFormURL();
		$this->sidebarPosition = $params->get('fb_gm_use_overlays_sidebar');
		$this->showOverLays    = (bool) $params->get('fb_gm_use_overlays');

		if ($model->getShowSideBar())
		{
			$this->showSidebar   = 1;
			$this->overlayUrls   = $model->overlayData['urls'];
			$this->overlayLabels = $model->overlayData['labels'];
		}
		else
		{
			$this->showSidebar = 0;
		}

		$this->_setPath('template', $tmplpath);
		$this->containerId    = $model->getContainerId();
		$this->groupTemplates = $model->getGroupTemplates();
		echo parent::display($template);
	}
}
