<?php
/**
 * Email list plug-in Controller
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.email
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\MVC\Model\BaseDatabaseModel;
use Joomla\CMS\MVC\Controller\BaseController;
use Joomla\CMS\Factory;

jimport('joomla.application.component.controller');

/**
 * Email list plug-in Controller
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.email
 * @since       3.0
 */
class FabrikControllerListemail extends BaseController
{
	/**
	 * Path of uploaded file
	 *
	 * @var string
	 */
	public $filepath = null;

	/**
	 * default display mode
	 *
	 * @param   bool   $cachable   Cacheable
	 * @param   array  $urlparams  Params
	 *
	 * @return null
	 */
	public function display($cachable = false, $urlparams = array())
	{
		echo "display";
	}

	/**
	 * set up the popup window containing the form to create the
	 * email message
	 *
	 * @return string html
	 */
	public function popupwin()
	{
		$app = Factory::getApplication();
		$input = $app->input;
		$document = Factory::getDocument();
		$viewName = 'popupwin';
		$viewType = $document->getType();

		// Set the default view name from the Request
		$view = $this->getView($viewName, $viewType);

		$listModel = $this->getModel('List', 'FabrikFEModel');
		// if SEF'ed, router will have changed 'id' to 'listid'
		// look for 'listid' first, if SEF'ed also an 'id' param may be added by other plugins
		$listModel->setId($input->getInt('listid', $input->getInt('id')));
		$formModel = $listModel->getFormModel();

		// Push a model into the view
		$pluginManager = BaseDatabaseModel::getInstance('Pluginmanager', 'FabrikFEModel');
		$model = $pluginManager->getPlugIn('email', 'list');

		$model->formModel = $formModel;
		$model->listModel = $listModel;
		$listParams = $listModel->getParams();
		$model->setParams($listParams, $input->getInt('renderOrder'));
		$view->setModel($model, true);
		$view->setModel($listModel);
		$view->setModel($formModel);

		// Display the view
		// one more F4 hack $view->error = $this->getError();

		return $view->display();
	}

	/**
	 * Send the emails
	 *
	 * @return  void
	 */
	public function doemail()
	{
		$app = Factory::getApplication();
		$input = $app->input;
		$pluginManager = BaseDatabaseModel::getInstance('Pluginmanager', 'FabrikFEModel');
		$model = $pluginManager->getPlugIn('email', 'list');
		$listModel = $this->getModel('List', 'FabrikFEModel');
		$listModel->setId($input->getInt('id'));
		$listParams = $listModel->getParams();
		$model->setParams($listParams, $input->getInt('renderOrder'));
		$model->listModel = $listModel;
		/*
		 * $$$ hugh - for some reason have to do this here, if we don't, it'll
		 * blow up when it runs later on from within the list model itself.
		 */
		$formModel = $listModel->getFormModel();
		$model->doEmail();
	}
}
