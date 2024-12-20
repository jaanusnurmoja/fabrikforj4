<?php
/**
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrikar\Component\Fabrik\Site\View\List;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Site\View\List\BaseView;

/**
 * List JSON view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.1
 */
class JsonView extends BaseView
{
	/**
	 * Display a json object representing the table data.
	 * Not used for updating fabrik list, use raw view for that, here in case you want to export the data to another application
	 *
	 * @param   string  $tpl  Template
	 *
	 * @return  void
	 */
	public function display($tpl = null)
	{
		$model = $this->getModel();
//		$model = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('List', 'Site');
		$model->setId($this->app->getInput()->getInt('listid'));

		if (!parent::access($model))
		{
			exit;
		}

		$data = $model->getData();
		echo json_encode($data);
	}
}
