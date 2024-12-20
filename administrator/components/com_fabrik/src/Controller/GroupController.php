<?php
/**
 * Group controller class.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 * @since       1.6
 */

namespace Fabrikar\Component\Fabrik\Administrator\Controller;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Administrator\Controller\FabFormController;

/**
 * Group controller class.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */
class GroupController extends FabFormController
{
	/**
	 * The prefix to use with controller messages.
	 *
	 * @var	string
	 */
	protected $text_prefix = 'COM_FABRIK_GROUP';
}
