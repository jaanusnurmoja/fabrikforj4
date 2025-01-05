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

		$data = $this->getData();
		$input->set('view', $this->getState('type'));

		$mode = 'nav-tabs';
		$str = $plugin->onRenderAdminSettings($data, $this->getState('c'), $mode, $this->getState('subformprefix'));
		if (in_array($app->input->get('format', 'html'), ['raw', 'partial'])) {
			FabrikHtml::LoadAjaxAssets();
		}
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

		if ($type === 'validationrule') {
			$item = parent::getTable('Element', '');
			$item->load($this->getState('id'));
		} elseif ($type === 'elementjavascript') {
			$item = parent::getTable('Jsaction', '', []);
			$item->load($this->getState('id'));
			$data = $item->getProperties();
		} else {
			$feModel = $this->getPluginModel();
			$item = $feModel->getTable();
		}
		$pluginManager = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Pluginmanager', 'Site');
		$plugin = $pluginManager->getPlugIn($this->getState('plugin'), $this->getState('type'));
		$form = $plugin->getPluginForm(0);

		$data = $data + (array) json_decode($item->params);
		$data['plugin'] = $this->getState('plugin');
		$data['params'] = (array) FabrikArray::getValue($data, 'params', array());
		$data['params']['plugins'] = $this->getState('plugin');

		$data['validationrule']['plugin'] = $this->getState('plugin');
		$data['validationrule']['plugin_published'] = $this->getState('plugin_published');
		$data['validationrule']['show_icon'] = $this->getState('show_icon');
		$data['validationrule']['must_validate'] = $this->getState('must_validate');
		$data['validationrule']['validate_hidden'] = $this->getState('validate_hidden');
		$data['validationrule']['validate_in'] = $this->getState('validate_in');
		$data['validationrule']['validation_on'] = $this->getState('validation_on');


		$subformPrefix = $this->getState('subformprefix', false);
		$isSubform = (bool)$subformPrefix;
		$subformID = end(explode("__", $subformPrefix));

		/* Set up to handle subforms or older versions */
		if ($isSubform) {
			$valueClass 	= 'Fabrik\\Library\\Fabrik\\FabrikSubform';
			$valueFn 		= 'getValues';
			$c 				= $subformID;
		} else {
			$valueClass 	= 'Fabrik\\Library\\Fabrik\\FabrikArray\\FabrikArray';
			$valueFn 		= 'getValue';
			$c 				= $this->getState('c') + 1;	// old repeat ID
		}

		if ($isSubform) {
			/* Because the plugin fields are loaded by ajax, they are not in the original form so we need to load them manually */
			$fieldsets = $form->getFieldsets();
			foreach ($fieldsets as $fieldset) {
				foreach ($form->getFieldset($fieldset->name) as $field) {
					$data[$subformID][$field->fieldname] = FabrikArray::getValue($data, $field->fieldname);
				}
			}
		}

		// Add plugin published state, locations, descriptions and events
		$state = (array) FabrikArray::getValue($data, 'plugin_state');
		$locations = (array) FabrikArray::getValue($data, 'plugin_locations');
		$events = (array) FabrikArray::getValue($data, 'plugin_events');
		$descriptions = (array) FabrikArray::getValue($data, 'plugin_description');

		$data['params']['plugin_state'] = FabrikArray::getValue($state, $c, 1);
		$data['plugin_locations'] = FabrikArray::getValue($locations, $c);
		$data['plugin_events'] = FabrikArray::getValue($events, $c);
		$data['plugin_description'] = FabrikArray::getValue($descriptions, $c);

		// For list plugins view
		$data['params']['plugin_description'] = FabrikArray::getValue($descriptions, $c);

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
			$feModel->setId($this->getState('id'));
		}

		return $feModel;
	}

	/**
	 * Render the initial plugin options, such as the plugin selector,
	 * and whether its rendered in front/back/both etc
	 *
	 * @return  string
	 */
	public function top() {
		$data = $this->getData();
		$c = $this->getState('c') + 1;
		$class = '';
		$str = array();
		$str[] = '<div class="pane-slider content pane-down accordion-inner">';
		$str[] = '<fieldset class="' . $class . 'pluginContainer" id="formAction_' . $c . '"><ul>';
		$formName = 'com_fabrik.' . $this->getState('type') . '-plugin';
		$topForm = new Form($formName, array('control' => 'jform'));
		$topForm->repeatCounter = $c;
		$xmlFile = JPATH_SITE . '/administrator/components/com_fabrik/forms/' . $this->getState('type') . '-plugin.xml';

		// Add the plugin specific fields to the form.
		$topForm->loadFile($xmlFile, false);
		$topForm->bind($data);

		// Filter the forms fieldsets for those starting with the correct $searchName prefix
		foreach ($topForm->getFieldsets() as $fieldset) {
			if ($fieldset->label != '') {
				$str[] = '<legend>' . $fieldset->label . '</legend>';
			}

			foreach ($topForm->getFieldset($fieldset->name) as $field) {
				$str[] = '<div class="control-group"><div class="control-label">' . $field->label;
//				$str[] = '</div><div class="controls">' . $field->input . '</div></div>';
				$str[] = '</div><div>' . $field->input . '</div></div>';
			}
		}

		$str[] = '</ul>';
		$str[] = '<div class="pluginOpts" style="clear:left"></div>';
		$str[] = '<div class="form-actions"><a href="#" class="btn btn-danger" data-button="removeButton">';
		$str[] = '<i class="icon-delete"></i> ' . Text::_('COM_FABRIK_DELETE') . '</a></div>';
		$str[] = '</fieldset>';
		$str[] = '</div>';

		PluginHelper::importPlugin("system", "fabrik");
		FabrikHtml::LoadAjaxAssets();

		return implode("\n", $str);
	}
}
