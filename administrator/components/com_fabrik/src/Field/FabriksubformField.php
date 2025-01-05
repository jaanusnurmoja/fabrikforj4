<?php
/**
 * Display a json loaded window with a repeatable set of sub fields
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Component\Fabrik\Administrator\Field;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Form\Field\SubformField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;

//jimport('joomla.form.formfield');
HTMLHelper::_('bootstrap.modal', '.selector', []);

/**
 * Display a json loaded window with a repeatable set of sub fields
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       1.6
 */

class FabriksubformField extends SubformField
{

	protected $type = 'Fabriksubform';


    /**
     * Method to get the name used for the field input tag.
     *
     * @param   string  $fieldName  The field element name.
     *
     * @return  string  The name to be used for the field input tag.
     *
     * @since   3.6
     */
    protected function getName($fieldName)
    {
        $name = '';

        // If there is a form control set for the attached form add it first.
        if ($this->formControl) {
            $name .= $this->formControl;
        }

        // If the field is in a group add the group control to the field name.
        if ($this->group) {
            // If we already have a name segment add the group control as another level.
            $groups = explode('.', $this->group);

            if ($name) {
                foreach ($groups as $group) {
                    $name .= '[' . $group . ']';
                }
            } else {
                $name .= array_shift($groups);

                foreach ($groups as $group) {
                    $name .= '[' . $group . ']';
                }
            }
        }

        // If we already have a name segment add the field name as another level.
        if ($name) {
        	$subFormIndex = Factory::getApplication()->getInput()->get('subformprefix');
        	$name .= '[' . $subFormIndex . ']';
            $name .= '[' . $fieldName . ']';
        } else {
            $name .= $fieldName;
        }

        return $name;
    }
    public function __get($name)
    {
        switch ($name) {
            case 'formsource':
            case 'min':
            case 'max':
            case 'layout':
            case 'groupByFieldset':
            case 'buttons':
                return $this->$name;
        }

        return parent::__get($name);
    }

    /**
     * Method to set certain otherwise inaccessible properties of the form field object.
     *
     * @param   string  $name   The property name for which to set the value.
     * @param   mixed   $value  The value of the property.
     *
     * @return  void
     *
     * @since   3.6
     */
    public function __set($name, $value)
    {

    	switch ($name) {
    		case 'name':
                $gotit = true;
//                echo "Here I am" . print_r($gotit, true); die;
    			break;
    	}
 		parent::__set($name, $value);
 	}
}