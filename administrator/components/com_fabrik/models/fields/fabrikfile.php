<?php
/**
 * Overrides the Joomla File to use a layout without the max upload size warning
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Form\Field\FileField;
use Joomla\CMS\Form\FormHelper;

FormHelper::loadFieldClass('file');

/**
 * Get a list of templates - either in components/com_fabrik/views/{view}/tmpl or {view}/tmpl25
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       3.1b
 */
class JFormFieldFabrikfile extends FileField
{

    protected $type = 'Fabrikfile';

    protected $layout = 'fabrik.form.field.file';

}	