<?php
/**
 * Display the template
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrikar\Component\Fabrik\Site\View\List;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Component\ComponentHelper;
use Fabrikar\Component\Fabrik\Site\View\List\BaseView;

/**
 * List YQL view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0.6
 */
class YqlView extends BaseView
{
	/**
	 * Display the template
	 *
	 * @param   sting  $tpl  template
	 *
	 * @return void
	 */
	public function display($tpl = null)
	{
		$model = $this->getModel();
//		$model = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('List', 'Site');
		$input = $this->app->getInput();
		$usersConfig = ComponentHelper::getParams('com_fabrik');
		$model->setId($input->getInt('listid', $usersConfig->get('listid')));
		$model->render();
		$table = $model->getTable();
		$this->doc->title = $table->label;
		$this->doc->description = $table->introduction;
		$this->doc->copyright = '';
		$this->doc->listid = $table->id;
		$this->doc->items = $model->getData();
	}
}
