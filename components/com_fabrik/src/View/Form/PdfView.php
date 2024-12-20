<?php
/**
 * PDF Form view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrikar\Component\Fabrik\Site\View\Form;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Site\View\Form\BaseView;
use Fabrikar\Library\Fabrik\FabrikHtml;
use Fabrikar\Library\Fabrik\FabrikWorker;

/**
 * PDF Form view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0.6
 */
class PdfView extends BaseView {
	/**
	 * Main setup routine for displaying the form/detail view
	 *
	 * @param   string $tpl template
	 *
	 * @return  void
	 */
	public function display($tpl = null) {
		FabrikWorker::canPdf(true);

		if (parent::display($tpl) !== false) {
			/** @var JDocumentpdf $document */
			$document = $this->doc;

			/** @var FabrikFEModelList $model */
			$model = $this->getModel();
//			$model = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Form', 'Site');
			$params = $model->getParams();
			$size = $this->app->getInput()->get('pdf_size', $params->get('pdf_size', 'A4'));
			$orientation = $this->app->getInput()->get('pdf_orientation', $params->get('pdf_orientation', 'portrait'));
			$document->setPaper($size, $orientation);

			if ($this->app->getInput()->get('pdf_include_bootstrap', $params->get('pdf_include_bootstrap', '0')) === '1') {
				FabrikHtml::loadBootstrapCSS(true);
			}

			$this->output();
		}
	}

	/**
	 * Set the page title
	 *
	 * @param   object $w       parent worker
	 * @param   object &$params parameters
	 *
	 * @return  void
	 */
	protected function setTitle($w, &$params) {
		parent::setTitle($w, $params);

		$model = $this->getModel();
//		$model = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Form', 'Site');

		// Set the download file name based on the document title

		$layout = $model->getLayout('form.fabrik-pdf-title');
		$displayData = new \stdClass;
		$displayData->doc = $this->doc;
		$displayData->model = $this->getModel();
//		$displayData->model	= $model;

		$this->doc->setName($layout->render($displayData));
	}
}
