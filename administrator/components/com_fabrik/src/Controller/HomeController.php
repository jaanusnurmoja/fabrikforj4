<?php
/**
 * Fabrik Home Controller
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrikar\Component\Fabrik\Administrator\Controller;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Controller\AdminController;

/**
 * Fabrik Home Controller
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0
 */
class HomeController extends AdminController
{
	/**
	 * Delete all data from fabrik
	 *
	 * @return null
	 */
	public function reset()
	{
		$user = \Joomla\CMS\Factory::getUser();
		$is_suadmin = $user->authorise('core.admin');
		if (!$is_suadmin) {
			return \Joomla\CMS\Factory::getApplication()->enqueueMessage(Text::_('COM_FABRIK_HOME_RESET_NOAUTH'), 'error');
		}
		$model = $this->getModel('Home');
		$model->reset();
		$this->setRedirect('index.php?option=com_fabrik', Text::_('COM_FABRIK_HOME_FABRIK_RESET'));
	}

}
