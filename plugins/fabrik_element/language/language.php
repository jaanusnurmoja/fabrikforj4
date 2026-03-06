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
			$this->default = $defaultCurrent ? Factory::getLanguage()->getTag() : parent::getDefaultValue($data);
		}

		return $this->default;
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
		$known = LanguageHelper::getKnownLanguages(JPATH_BASE);
		$options = array();

		foreach ($known as $tag => $lang)
		{
			$options[] = array(
				'value' => $tag,
				'text' => $lang['name'] . ' (' . $tag . ')'
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
}
