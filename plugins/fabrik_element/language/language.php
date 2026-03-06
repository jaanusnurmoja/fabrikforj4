<?php
/**
 * Fabrik Language Element
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.element.language
 */

defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Factory;
use Joomla\CMS\Language\LanguageHelper;

require_once JPATH_SITE . '/plugins/fabrik_element/dropdown/dropdown.php';

/**
 * Plugin element to render Joomla language selector values.
 */
class PlgFabrik_ElementLanguage extends PlgFabrik_ElementDropdown
{
	/**
	 * Get option values.
	 *
	 * @param   array  $data  Form data
	 *
	 * @return  array
	 */
	public function getSubOptionValues($data = array())
	{
		return array_column($this->getLanguageOptions(), 'value');
	}

	/**
	 * Get option labels.
	 *
	 * @param   array  $data  Form data
	 *
	 * @return  array
	 */
	public function getSubOptionLabels($data = array())
	{
		return array_column($this->getLanguageOptions(), 'text');
	}

	/**
	 * Default value.
	 *
	 * @param   array  $data  Form data
	 *
	 * @return  mixed
	 */
	public function getDefaultValue($data = array())
	{
		if (!isset($this->default))
		{
			$params = $this->getParams();
			$defaultCurrent = (int) $params->get('language_default_current', 1) === 1;
			$this->default = $defaultCurrent ? $this->getCurrentSef() : parent::getDefaultValue($data);
		}

		return $this->default;
	}


	/**
	 * Get database field description and normalize invalid legacy defaults.
	 *
	 * @return  string
	 */
	public function getFieldDescription()
	{
		$fieldType = trim((string) parent::getFieldDescription());

		if ($fieldType === '' || strtoupper($fieldType) === 'VARCHAR')
		{
			return 'VARCHAR(10)';
		}

		return $fieldType;
	}

	/**
	 * Append automatic language filter to list query where statements.
	 *
	 * @param   array  &$whereArray  List model where statements
	 *
	 * @return  void
	 */
	public function appendTableWhere(&$whereArray)
	{
		parent::appendTableWhere($whereArray);

		$params = $this->getParams();

		if ((int) $params->get('language_auto_list_filter', 1) !== 1)
		{
			return;
		}

		$db = FabrikWorker::getDbo();
		$key = FabrikString::safeColName($this->getFullName(false, false, false));
		$currentSef = $this->getCurrentSef();
		$where = '(' . $key . ' IN (' . $db->q($currentSef) . ', ' . $db->q('*') . ') OR ' . $key . ' = \'\')';

		if (!in_array($where, $whereArray, true))
		{
			$whereArray[] = $where;
		}
	}

	/**
	 * Build language option list.
	 *
	 * @return  array<int,array<string,string>>
	 */
	protected function getLanguageOptions()
	{
		static $options;

		if (isset($options))
		{
			return $options;
		}

		$params = $this->getParams();
		$languages = LanguageHelper::getLanguages('sef');
		$options = array();

		foreach ($languages as $sef => $lang)
		{
			$options[] = array(
				'value' => $sef,
				'text' => $lang->title . ' (' . $sef . ')'
			);
		}

		usort($options, function ($a, $b) {
			return strcmp($a['text'], $b['text']);
		});

		if ((int) $params->get('language_include_all', 0) === 1)
		{
			array_unshift($options, array('value' => '*', 'text' => '*'));
		}

		return $options;
	}

	/**
	 * Get currently active Joomla language SEF.
	 *
	 * @return  string
	 */
	protected function getCurrentSef()
	{
		$tag = Factory::getLanguage()->getTag();
		$languages = LanguageHelper::getLanguages('lang_code');

		if (isset($languages[$tag]) && !empty($languages[$tag]->sef))
		{
			return $languages[$tag]->sef;
		}

		return strtolower(substr($tag, 0, 2));
	}
}
