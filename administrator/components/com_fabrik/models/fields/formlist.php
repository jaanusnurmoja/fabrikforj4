<?php
/**
 * Renders a repeating drop down list of forms
 *
 * @package     Joomla
 * @subpackage  Form
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Form\Field\ListField;

/**
 * Renders a repeating drop down list of forms
 *
 * @package     Joomla
 * @subpackage  Form
 * @since       1.6
 */

class JFormFieldFormList extends ListField
{
	/**
	 * Element type
	 *
	 * @access	protected
	 * @var		string
	 */
	protected $type = 'Formlist';

	/**
	 * Method to get the field input markup.
	 *
	 * @return	string	The field input markup.
	 */

	protected function getInput()
	{

		$db = FabrikWorker::getDbo(true);
		$query = $db->getQuery(true);
		$query->select('id AS value, label AS ' . $db->quote('text') . ', published');
		$query->from('#__fabrik_forms');

		if (!$this->element['showtrashed'])
		{
			$query->where('published <> -2');
		}

		$query->order('published DESC, label ASC');
		$db->setQuery($query);
		$rows = $db->loadObjectList();

		foreach ($rows as $row) {
			switch ($row->published)
			{
				case '0':
					$row->text .= ' [' . Text::_('JUNPUBLISHED') . ']';
					break;
				case '-2':
					$row->text .= ' [' . Text::_('JTRASHED') . ']';
					break;
			}
			$this->addOption(htmlspecialchars($row->text), ['value'=>$row->value]);
		}

		return parent::getInput();

	}
}
