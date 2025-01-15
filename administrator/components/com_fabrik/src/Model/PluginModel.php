<?php
/**
 * Fabrik Admin Plugin Model
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       1.6
 */

namespace Fabrik\Component\Fabrik\Administrator\Model;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Administrator\Table\FabTable;
use Fabrik\Library\Fabrik\FabrikArray;
use Fabrik\Library\Fabrik\FabrikHtml;
use Joomla\CMS\Factory;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Model\BaseDatabaseModel;
use Joomla\CMS\Plugin\PluginHelper;

/**
 * Fabrik Admin Plugin Model
 * Used for loading via ajax form plugins
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0.6
 */
class PluginModel extends BaseDatabaseModel {
	/**
	 * Render the plugins fields
	 *
	 * @return string
	 */
	public function render() {
		$app = Factory::getApplication();
		$input = $app->input;

		/** @var ModelPluginmanager $pluginManager */
		$pluginManager = $app->bootComponent('com_fabrik')->getMVCFactory()->createModel('Pluginmanager', 'Site');
		$plugin = $pluginManager->getPlugIn($this->getState('plugin'), $this->getState('type'));
		$feModel = $this->getPluginModel();
		$plugin->getJForm()->model = $feModel;

		$this->data = $this->getData();

		$input->set('view', $this->getState('type'));

		$mode = 'nav-tabs';
		$str = $plugin->onRenderAdminSettings($this->data, $this->getState('c'), $mode, $this->getState('subformprefix'));
		$input->set('view', 'plugin');

		return $str;
	}

	public function getForm($xmlPath)
    {
        // Check if the XML file exists
        if (!file_exists($xmlPath)) {
            throw new \Exception('Form XML file not found: ' . $xmlPath);
        }

        // Create a JForm object
        $form = new Form('jform');
        $form->loadFile($xmlPath);
		
        return $form;
    }

	/**
	 * Get the plugins data to bind to the form
	 *
	 * @return  array
	 */
	public function getData() {
		$type = $this->getState('type');
		$data = ['id' => $this->getState('id')];

		switch ($type) {
			case 'validationrule':
			case 'element':
				$item = parent::getTable('Element', '');
				$item->load($this->getState('id'));
				break;
			case 'elementjavascript':
				$item = parent::getTable('Jsaction', '', []);
				$item->load($this->getState('id'));
				$data = $item->getProperties();
				break;
			case 'form':
				$item = parent::getTable('Form', '');
				$item->load($this->getState('id'));
				break;
			case 'plugin':
				$feModel = $this->getPluginModel();
				$item = $feModel->getTable();
				break;
			case 'list':
				$item = parent::getTable('List');
				$item->load($this->getState('id'));
		}

		$pluginManager = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Pluginmanager', 'Site');
		$plugin = $pluginManager->getPlugIn($this->getState('plugin'), $this->getState('type'));
		$form = $plugin->getPluginForm(0);

		if ($item->params) {
            $data = $data + (array)json_decode($item->params);
        }
        $data['plugin'] = $this->getState('plugin');

		if ($type == 'validationrule') {
	        if (!empty($data['validationrules'])) {
				$validationrule = $data['validationrules']->{$this->getState('subformid')};
				$data['plugin_published'] = $validationrule->plugin_published;
				$data['validate_in'] = $validationrule->validate_in;
				$data['validation_on'] = $validationrule->validation_on;
				$data['validate_hidden'] = $validationrule->validate_hidden;
				$data['must_validate'] = $validationrule->must_validate;
				$data['show_icon'] = $validationrule->show_icon;
				$data['params'] = $validationrule->params;
				unset($data['validationrules']);
			}
		}else {	
			$data['params'] = (array) FabrikArray::getValue($data, 'params', array());
	        if (!empty($data['plugins'])) {
	        	$plugin = $data['plugins']->{$this->getState('subformid')};
				$data['params']['plugin_state'] = $this->getState('plugin');
				$data['plugin_locations']       = $plugin->plugin_locations ?? 'both';
				$data['plugin_events']          = $plugin->plugin_events ?? 'both';
				$data['plugin_description']     = $plugin->plugin_description ?? '';
				$data['params']['plugin_description'] = $plugin->plugin_description ?? '';
				$data['params'] = [...$data['params'], ...(array)$plugin->params]; 
			}
		}
		
		return $data;
	}

	/**
	 * Get the plugin model
	 *
	 * @return  object
	 */
	protected function getPluginModel() {
		$feModel = null;
		$type = $this->getState('type');

		if ($type === 'elementjavascript') {
			return null;
		}

		if ($type !== 'validationrule') {
			// Set the parent model e.g. form/list
			$feModel = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel($type, 'Site');
			if ($type !== 'element') {
				$feModel->setId($this->getState('id'));
			}
		}

		return $feModel;
	}

}

