<?php
/**
 * View to grab plugin form fields.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrik\Component\Fabrik\Administrator\View\Plugin;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Library\Fabrik\FabrikHtml;
use Joomla\CMS\MVC\View\HtmlView;
use Joomla\CMS\Factory;

/**
 * View to grab plugin form fields.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0.6
 */

class RawView extends HtmlView
{
	/**
	 * Display the view
	 *
	 * @param   string  $tpl  template
	 *
	 * @return  void
	 */

	public function display($tpl = null)
	{
		$model = $this->getModel();
		$app = Factory::getApplication();
		$input = $app->getInput();
		$this->setStates();

		$this->data = $model->getData();

		/* Get our requested plugins template file */
		$xmlpath = JPATH_PLUGINS . '/fabrik_' . $model->getState('type') . '/' . $model->getState('plugin') . '/forms/fields.xml';
		$this->form = $model->getForm($xmlpath);
		header('Content-Type: text/html; charset=UTF-8');
		ob_start();
		parent::display($tpl);
		FabrikHtml::LoadAjaxAssets();
		$body = ob_get_clean();

		$subFormNamePrefix = $input->getString('subformprefix', '');
		if (empty($subFormNamePrefix)) {
			/* Something went wrong */
			return;
		}
		/* Now transform the name into the id prefix */
		$subFormIdPrefix =  str_replace('][', '__', $subFormNamePrefix);	// Step 1: Replace [] with __
		$subFormIdPrefix = str_replace('[]', '', $subFormIdPrefix);			// Step 2: Remove the [] after jform
		$subFormIdPrefix = str_replace(['[', ']'], '_', $subFormIdPrefix);	// Step 3: Replace `[` and `]` with `_`
		$subFormIdPrefix .= '_';											// Step 4: Ensure there are 2 underscores at the end

        // Create a new DOMDocument
        $doc = new \DOMDocument();

        // Suppress errors due to malformed HTML (common in web outputs)
        libxml_use_internal_errors(true);

        // Load the body into DOMDocument
        $doc->loadHTML(mb_convert_encoding($body, 'HTML-ENTITIES', 'UTF-8'));

        $errors = libxml_get_errors();

        // Create a DOMXPath instance
        $xpath = new \DOMXPath($doc);

        // Function to update an attribute
        function updateItems($element, $attr, $prefix) {
        	if ($element->nodeType !== XML_ELEMENT_NODE) {
        		return;
        	}
    		$attribute = $element->getAttribute($attr);
    		if (!empty($attribute)) {
    			if ($attr == 'name') {
    				$attribute = '[' . $attribute . ']';
    			}
    			$element->setAttribute($attr, $prefix . $attribute);
    		}
    	}

        // Now let's get all elelemnts that have id, name or for attributes
        $elements = $xpath->query('//*[@id or @name or @for]');
        /* Now loop through each element updating theses items with the subform prefix */
        $updates = ["id" => $subFormIdPrefix, "for" => $subFormIdPrefix, "name" => $subFormNamePrefix];
        foreach($elements as $element) {
        	foreach($updates as $attr => $prefix) {
        		updateItems($element, $attr, $prefix);
        	}
        }

        /* Now we also need to update any ace containers we might have */
        $aceContainers = $xpath->query("//div[contains(@id, 'aceContainer') and substring(@id, string-length(@id) - string-length('aceContainer') + 1) = 'aceContainer']");
    	/* Let's go through them */
    	foreach ($aceContainers as $aceContainer) {
    		/* The ids and such are already done, but we do need to update a couple of things */
    		/* First the element selector for the ac node */
    		$scriptNode = $aceContainer->parentNode->getElementsByTagName("script")->item(0);
    		$scriptText = $scriptNode->textContent;
    		$scriptText = str_replace("document.getElementById('", "document.getElementById('" . $subFormIdPrefix, $scriptText);
    		$scriptNode->textContent = $scriptText;
    		/* Now the aceParams */
    		$aceContainerID = $aceContainer->getAttribute('id');
    		$aceParamsNode = $xpath->query("//div[@id='$aceContainerID']//*[contains(@class, 'aceParams')]")->item(0);
     		$aceParams = json_decode($aceParamsNode->textContent);
    		$aceParams->editorId = $subFormIdPrefix . $aceParams->editorId;
    		$aceParams->fieldId = $subFormIdPrefix . $aceParams->fieldId;
    		$aceParamsNode->textContent = json_encode($aceParams);
     	}

        $html = $doc->saveHTML();
		// Remove the DOCTYPE declaration, HTML, and BODY tags
		$html = preg_replace('/<\!DOCTYPE.*?>/', '', $html);
		$html = preg_replace('/<html.*?>/', '', $html);
		$html = preg_replace('/<\/html>/', '', $html);
		$html = preg_replace('/<body.*?>/', '', $html);
		$html = preg_replace('/<\/body>/', '', $html);

		echo $html;
		return;
	}

	/**
	 * Set the model state from request
	 *
	 * @return  void
	 */

	protected function setStates()
	{
		$model = $this->getModel();
		$app = Factory::getApplication();
		$input = $app->input;
		$model->setState('type', $input->get('type'));
		$model->setState('plugin', $input->get('plugin'));
		$model->setState('c', $input->getInt('c'));
		$model->setState('id', $input->getInt('id', 0));
		$model->setState('plugin_published', $input->get('plugin_published'));
		$model->setState('show_icon', $input->get('show_icon'));
		$model->setState('must_validate', $input->get('must_validate'));
		$model->setState('validate_in', $input->get('validate_in'));
		$model->setState('validation_on', $input->get('validation_on'));
		$model->setState('validate_hidden', $input->get('validate_hidden'));
		$model->setState('subformprefix', $input->get('subformprefix'));
	}
}
