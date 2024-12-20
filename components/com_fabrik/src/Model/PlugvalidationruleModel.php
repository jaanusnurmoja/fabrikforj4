<?php
/**
 * Fabrik Validation Rule Model
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrikar\Component\Fabrik\Site\Model;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Site\Model\PluginModel;
use Fabrikar\Library\Fabrik\FabrikHtml;
use Fabrikar\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Filter\InputFilter;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\Registry\Registry;
use Joomla\Utilities\ArrayHelper;
use Fabrikar\Library\Fabrik\Php;

/**
 * Fabrik Validation Rule Model
 *
 * @package  Fabrik
 * @since    3.0
 */
class PlugvalidationruleModel extends PluginModel {
	/**
	 * Plugin name
	 *
	 * @var string
	 */
	protected $pluginName = null;

	/**
	 * Validation rule's element model
	 *
	 * @var PlgFabrik_Element
	 */
	public $elementModel = null;

	/**
	 * Error message
	 *
	 * @var string
	 */
	protected $errorMsg = null;

	/**
	 * Validate the elements data against the rule
	 *
	 * @param   string  $data           To check
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  bool  true if validation passes, false if fails
	 */
	public function validate($data, $repeatCounter) {
		return true;
	}

	/**
	 * Checks if the validation should replace the submitted element data
	 * if so then the replaced data is returned otherwise original data returned
	 *
	 * @param   string  $data           Original data
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  string	original or replaced data
	 */
	public function replace($data, $repeatCounter) {
		return $data;
	}

	/**
	 * Looks at the validation condition & evaluates it
	 * if evaluation is true then the validation rule is applied
	 *
	 * @param   string  $data  Elements data
	 * @param   int     $repeatCounter  Repeat group counter
	 *
	 * @return  bool	apply validation
	 */
	public function shouldValidate($data, $repeatCounter = 0) {
		if (!$this->shouldValidateIn()) {
			return false;
		}

		if (!$this->shouldValidateOn()) {
			return false;
		}

		if (!$this->shouldValidateHidden($data, $repeatCounter)) {
			return false;
		}

		$params = $this->getParams();
		$condition = trim($params->get($this->pluginName . '-validation_condition', ''));

		if ($condition == '') {
			return true;
		}

		$w = new FabrikWorker;
		$groupModel = $this->elementModel->getGroupModel();
		$inRepeat = $groupModel->canRepeat();

		if ($inRepeat) {
			// Replace repeat data array with current repeatCounter value to ensure placeholders work.
			// E.g. return {'table___field}' == '1';
			$f = InputFilter::getInstance();
			$post = $f->clean($_REQUEST, 'array');
			$groupElements = $groupModel->getMyElements();

			foreach ($groupElements as $element) {
				$name = $element->getFullName(true, false);
				$elementData = ArrayHelper::getValue($post, $name, array());
				// things like buttons don't submit data, so check for empty
				if (!empty($elementData)) {
					$post[$name] = ArrayHelper::getValue($elementData, $repeatCounter, '');
					$rawData = ArrayHelper::getValue($post, $name . '_raw', array());
					$post[$name . '_raw'] = ArrayHelper::getValue($rawData, $repeatCounter, '');
				} else {
					$post[$name] = '';
					$post[$name . '_raw'] = '';
				}
			}
		} else {
			$post = null;
		}

		// unused by us, but available for user's to use
		$formModel = $this->elementModel->getFormModel();
		$condition = trim($w->parseMessageForPlaceHolder($condition, $post));
		FabrikWorker::clearEval();
		//$res = @eval($condition);
		$res = Php::Eval(['code' => $condition, 'vars'=>['formModel'=>$formModel, 'data'=>$data]]);
		FabrikWorker::logEval($res, 'Caught exception on eval in validation condition : %s');

		if (is_null($res)) {
			return true;
		}

		return $res;
	}

	/**
	 * Checks in/on to see if this validation is applicable
	 *
	 * @return  bool	apply validation
	 */
	public function canValidate() {
		if (!$this->shouldValidateIn()) {
			return false;
		}

		if (!$this->shouldValidateOn()) {
			return false;
		}

		return true;
	}

	/**
	 * Should the validation be run - based on whether in admin/front end
	 *
	 * @return boolean
	 */
	protected function shouldValidateIn() {
		$params = $this->getParams();
		$in = $params->get('validate_in', 'both');

		$admin = $this->app->isClient('administrator');

		if ($in === 'both') {
			return true;
		}

		if ($admin && $in === 'back') {
			return true;
		}

		if (!$admin && $in === 'front') {
			return true;
		}

		return false;
	}

	/**
	 * Should the validation be run - based on whether new record or editing existing
	 *
	 * @return boolean
	 */
	protected function shouldValidateOn() {
		$params = $this->getParams();
		$on = $params->get('validation_on', 'both');
		$rowId = $this->elementModel->getFormModel()->getRowId();

		if ($on === 'both') {
			return true;
		}

		if ($rowId === '' && $on === 'new') {
			return true;
		}

		if ($rowId !== '' && $on === 'edit') {
			return true;
		}

		return false;
	}

	/*
	* Should the validation be run - based on whether the element was hidden by an FX
	*
	* @return boolean
	*/
	protected function shouldValidateHidden($data, $repeatCounter) {
		$params = $this->getParams();
		$validateHidden = $params->get('validate_hidden', '1') === '1';

		// if validate hidden is set, just return true, we don't care about the state
		if ($validateHidden) {
			return true;
		}

		$name = $this->elementModel->getHTMLId($repeatCounter);
		$hiddenElements = ArrayHelper::getValue($this->formModel->formData, 'hiddenElements', '[]');
		$hiddenElements = json_decode($hiddenElements);

		return !in_array($name, $hiddenElements);

	}

	/**
	 * Get the warning message
	 *
	 * @return  string
	 */
	public function getMessage() {
		if (isset($this->errorMsg)) {
			return $this->errorMsg;
		}

		$params = $this->getParams();
		$v = $params->get($this->pluginName . '-message', '');

		if ($v === '') {
			$v = 'COM_FABRIK_FAILED_VALIDATION';
		}

		$this->errorMsg = Text::_($v);

		return $this->errorMsg;
	}

	/**
	 * Set the error message
	 *
	 * @param   string  $msg  New error message
	 *
	 * @since   3.0.9
	 *
	 * @return  void
	 */
	public function setMessage($msg) {
		$this->errorMsg = $msg;
	}

	/**
	 * Now show only on validation icon next to the element name and put icons and text inside hover text
	 * gets the validation rule icon
	 *
	 * @param   int     $c     Repeat group counter
	 * @param   string  $tmpl  Template folder name
	 *
	 * @deprecated @since 3.0.5
	 *
	 * @return  string
	 */
	public function getIcon($c = 0, $tmpl = '') {
		$name = $this->elementModel->validator->getIcon($c);
		FabrikHtml::image($name, 'form', $tmpl, array('class' => $this->pluginName));
	}

	/**
	 * Get the base icon image as defined by the J Plugin options
	 *
	 * @since   3.1b2
	 *
	 * @return  string
	 */
	public function iconImage() {
		$plugin = PluginHelper::getPlugin('fabrik_validationrule', $this->pluginName); // F5: May not be needed here, is already in provider
		$elIcon = $this->params->get('icon', '');

		if (empty($elIcon)) {
			$params = new Registry($plugin->params);
			$elIcon = $params->get('icon', 'star');
		}

		return $elIcon;
	}

	/**
	 * Get hover text with icon
	 *
	 * @param   int     $c     Validation render order
	 * @param   string  $tmpl  Template folder name
	 *
	 * @return  string
	 */
	public function getHoverText($c = null, $tmpl = '') {
		$i = '';
		if ($this->params->get('show_icon', '1') === '1') {
			$name = $this->elementModel->validator->getIcon($c);
			$i = FabrikHtml::image($name, 'form', $tmpl, array('class' => $this->pluginName));
		}

		return $i . ' ' . $this->getLabel();
	}

	/**
	 * Gets the hover/alt text that appears over the validation rule icon in the form
	 *
	 * @return  string	label
	 */
	protected function getLabel() {
		$params = $this->getParams();
		$tipText = $params->get('tip_text', '');

		if ($tipText !== '') {
			return Text::_($tipText);
		}

		if ($this->allowEmpty()) {
			return Text::_('PLG_VALIDATIONRULE_' . StringHelper::strtoupper($this->pluginName) . '_ALLOWEMPTY_LABEL');
		} else {
			return Text::_('PLG_VALIDATIONRULE_' . StringHelper::strtoupper($this->pluginName) . '_LABEL');
		}
	}

	/**
	 * Does the validation allow empty value?
	 * Default is false, can be overridden on per-validation basis (such as isnumeric)
	 *
	 * @return  bool
	 */
	protected function allowEmpty() {
		return false;
	}

}
