<?php
/**
 * Element controller class.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       1.6
 */

namespace Fabrikar\Component\Fabrik\Administrator\Controller;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Administrator\Controller\FabFormController;
use Fabrikar\Library\Fabrik\FabrikArray;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Session\Session;

/**
 * Element controller class.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */
class ElementController extends FabFormController {
	/**
	 * The prefix to use with controller messages.
	 *
	 * @var	string
	 */
	protected $text_prefix = 'COM_FABRIK_ELEMENT';

	/**
	 * Set a URL for browser redirection.
	 *
	 * @param   string  $url   URL to redirect to.
	 * @param   string  $msg   Message to display on redirect. Optional, defaults to value set internally by controller, if any.
	 * @param   string  $type  Message type. Optional, defaults to 'message'.
	 *
	 * @return	JController	This object to support chaining.
	 */
	public function setRedirect($url, $msg = null, $type = null) {
		$app = Factory::getApplication();
		$confirmUpdate = $app->getUserState('com_fabrik.confirmUpdate');

		// @TODO override the redirect url if confirm update is needed and task appropriate
		if ($confirmUpdate == true) {
			// Odd nes where redirect url was blank - caused blank pages when editing an element
			$testUrl = $app->getUserState('com_fabrik.redirect', '');

			if ($testUrl !== '') {
				$url = $testUrl;
			}
		}

		$this->redirect = $url;

		if ($msg !== null) {
			// Controller may have set this directly
			$this->message = $msg;
		}
		// Ensure the type is not overwritten by a previous call to setMessage.
		$this->messageType = ($type === null || empty($this->messageType)) ? 'message' : $type;

		return $this;
	}

	/**
	 * Gets the URL arguments to append to a list redirect.
	 *
	 * @param   int     $recordId  record id
	 * @param   string  $urlVar    url var
	 *
	 * @return  string  The arguments to append to the redirect URL.
	 *
	 * @since   11.1
	 */
	protected function getRedirectToItemAppend($recordId = null, $urlVar = 'id') {
		$app = Factory::getApplication();
		$input = $app->input;
		$append = parent::getRedirectToItemAppend($recordId, $urlVar);
		$gid = $input->getInt('filter_groupId', 0);

		if ($gid !== 0) {
			$append .= '&filter_groupId=' . $gid;
		}

		return $append;
	}

	/**
	 * ask if the user really wants to update element field name/type
	 *
	 * @return  null
	 */
	public function updateStructure() {
		// Check for request forgeries
		Session::checkToken() or die('Invalid Token'); // To use getUserState
		$app = Factory::getApplication();
		$input = $app->input;
//print_r("input = ");print_r($input);exit;
		$plugin = $input->getWord('origplugin');
		$pluginManager = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Pluginmanager', 'Site');
		// pluginManager should be admin call model by $pluginManager = getModel(('Pluginmanager', 'Administrator');
//		$model = $pluginManager->getPlugIn('field', 'element'); // Must not be 'field', but must be the name of the plugin to update
//		If the plugin does not need to be loaded we can get the plugin model here directly
		$model = $pluginManager->getPlugIn($plugin, 'element'); // Gets the element plugin model (extends PluginelementModel extends PluginModel extends CMSPlugin)
//		$model = 'Fabrikar\\Plugin\\Fabrik_element\\' . $plugin . '\\Extension\\' . $plugin;
		$id = $input->getInt('id');
		$model->setId($id); // the record id of the element to change in PluginelementModel extends PluginModel extends CMSPlugin
		$db = $model->getListModel()->getDb(); // in PluginelementModel extends PluginModel extends CMSPlugin
		$oldName = str_replace('`', '', $app->getUserState('com_fabrik.oldname'));
		$newName = $app->getUserState('com_fabrik.newname');
		$model->updateJoinedPks($oldName, $newName); // in PluginelementModel extends PluginModel extends CMSPlugin
//print_r("app->getUserState('com_fabrik.q') = ");print_r($app->getUserState('com_fabrik.q'));exit;// ALTER TABLE `hallo` CHANGE `datum` `datums` DATETIME
		$db->setQuery($app->getUserState('com_fabrik.q')); // See: https://docs.joomla.org/How_to_use_user_state_variables

		if (!$db->execute()) {
			\Joomla\CMS\Factory::getApplication()->enqueueMessage($db->stderr(true), 'warning');
			$msg = '';
		} else {
			$msg = Text::_('COM_FABRIK_STRUCTURE_UPDATED');
		}

		if ($input->get('origtask') == 'save') {
			$this->setRedirect('index.php?option=com_fabrik&view=elements', $msg);
		} else {
			$this->setRedirect('index.php?option=com_fabrik&task=element.edit&id=' . $id, $msg);
		}
	}

	/**
	 * User decided to cancel update
	 *
	 * @return  null
	 */
	public function cancelUpdateStructure() {
		Session::checkToken() or die('Invalid Token');
		$pluginManager = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Pluginmanager', 'Site');
		$app = Factory::getApplication();
		$input = $app->input;
		$plugin = $input->getWord('origplugin');
		$model = $pluginManager->getPlugIn($plugin, 'element'); // Must not be 'field', but must be the name of the plugin to update
		$model->setId($input->getInt('id'));
		$element = $model->getElement();
		$element->name = $input->getWord('oldname');
		$element->plugin = $plugin;
		$element->store();

		if ($input->get('origtask') == 'save') {
			$this->setRedirect('index.php?option=com_fabrik&view=elements');
		} else {
			$this->setRedirect('index.php?option=com_fabrik&task=element.edit&id=' . $element->id);
		}
	}

	/**
	 * Method to save a record.
	 *
	 * @param   string  $key     The name of the primary key of the URL variable.
	 * @param   string  $urlVar  The name of the URL variable if different from the primary key (sometimes required to avoid router collisions).
	 *
	 * @return  boolean  True if successful, false otherwise.
	 */
	public function save($key = null, $urlVar = null) {
		$ok = parent::save();
		$app = Factory::getApplication();

		if (!is_null($app->getUserState('com_fabrik.redirect'))) {
			$this->setRedirect($app->getUserState('com_fabrik.redirect'));
			$app->setUserState('com_fabrik.redirect', null);
		}

		return $ok;
	}

	/**
	 * When you go from a child to parent element, check in child before redirect
	 *
	 * @deprecated - don't think its used?
	 *
	 * @return  void
	 */
	public function parentredirect() {
		$app = Factory::getApplication();
		$input = $app->input;
		$jForm = $input->get('jform', array(), 'array');
		$id = (int) FabrikArray::getValue($jForm, 'id', 0);
		$pluginManager = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Pluginmanager', 'Site');
		$className = $input->post->get('plugin', 'field'); // Must not be 'field', but must be the name of the plugin
		$elementModel = $pluginManager->getPlugIn($className, 'element');
		$elementModel->setId($id);
		$row = $elementModel->getElement();
		$row->checkin();
		$to = $input->getInt('redirectto');
		$this->setRedirect('index.php?option=com_fabrik&task=element.edit&id=' . $to);
	}
}
