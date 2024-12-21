<?php
/**
 * HTML Form view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrik\Component\Fabrik\Site\View\Details;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\View\Details\BaseView;
use Joomla\CMS\Router\Route;
use Joomla\Utilities\ArrayHelper;

/**
 * HTML Form view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0.6
 */
class HtmlView extends BaseView {
	/**
	 * Main setup routine for displaying the form/detail view
	 *
	 * @param   string $tpl template
	 *
	 * @return  void
	 */
	public function display($tpl = null) {
		$this->state = $this->get('State');
		$this->items = $this->get('Data');
		$model = $this->getModel();
		$params = $model->getParams();
//		$this->pagination = $this->get('Pagination');
//		$this->filterForm    = $this->get('FilterForm');
//		$this->activeFilters = $this->get('ActiveFilters');

		// Flag indicates to not add limitstart=0 to URL
		//$this->pagination->hideEmptyLimitstart = true;

		// Check for errors.
		if (count($errors = $this->get('Errors'))) {
			throw new GenericDataException(implode("\n", $errors), 500);
		}

		if (parent::display($tpl) !== false) {
			$this->setCanonicalLink();
			$this->output();
		}
	}

	/**
	 * Set the canonical link - this is the definitive URL that Google et all, will use
	 * to determine if duplicate URLs are the same content
	 *
	 * @return  string
	 */
	public function getCanonicalLink() {
		$url = '';

		if (!$this->app->isClient('administrator') && !$this->isMambot) {
			$model = $this->getModel();
			$data = $model->getData();
			$formId = $model->getId();
			$slug = $model->getListModel()->getSlug(ArrayHelper::toObject($data));
			$rowId = $slug === '' ? $model->getRowId() : $slug;
			$view = $model->isEditable() ? 'form' : 'details';
			$url = Route::_('index.php?option=com_fabrik&view=' . $view . '&formid=' . $formId . '&rowid=' . $rowId);
		}

		return $url;
	}

	/**
	 * Set the canonical link - this is the definitive URL that Google et all, will use
	 * to determine if duplicate URLs are the same content
	 *
	 * @throws Exception
	 */
	public function setCanonicalLink() {
		if (!$this->app->isClient('administrator') && !$this->isMambot) {
			$url = $this->getCanonicalLink();

			// Set a flag so that the system plugin can clear out any other canonical links.
			$this->session->set('fabrik.clearCanonical', true);
			try
			{
				$this->doc->addCustomTag('<link rel="canonical" href="' . htmlspecialchars($url) . '" />');
			} catch (Exception $err) {

			}

		}
	}
}
