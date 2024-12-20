<?php
/**
 * Visualization list controller class.
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

use Fabrikar\Component\Fabrik\Administrator\Controller\FabAdminController;

/**
 * Visualization list controller class.
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */
class VisualizationsController extends FabAdminController
{
	/**
	 * The prefix to use with controller messages.
	 *
	 * @var	string
	 */
	protected $text_prefix = 'COM_FABRIK_VISUALIZATIONS';

	/**
	 * View item name
	 *
	 * @var string
	 */
	protected $view_item = 'visualizations';

	/**
	 * Proxy for getModel.
	 *
	 * @param   string  $name    model name
	 * @param   string  $prefix  model prefix
	 *
	 * @return  J model
	 */
	public function &getModel($name = 'Visualization', $prefix = '', $config = array())
	{
		$model = parent::getModel($name, $prefix, array('ignore_request' => true));

		return $model;
	}
}
