<?php
/**
 * Fabrik Open Archive Initiative Identity
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrikar\Component\Fabrik\Administrator\View\Oai;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Administrator\View\Form\BaseView;

/**
 * Fabrik Open Archive Initiative Identity View
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.4
 */
class OaiView extends BaseView
{
	/**
	 * Display the Identity
	 *
	 * @param   string $tpl The name of the template file to parse; automatically searches through the template paths.
	 *
	 * @return  mixed  A string if successful, otherwise a JError object.
	 */
	public function display($tpl = null)
	{
		$this->doc->setMimeEncoding('application/xml');

		echo $this->getModel()->identity();

		return true;
	}
}
