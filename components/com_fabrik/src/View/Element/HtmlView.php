<?php
/**
 * Fabrik Front End Element View
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrikar\Component\Fabrik\Administrator\View\Element;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Component\Fabrik\Site\View\FabrikView;

/**
 * Fabrik Front End Element View
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @since       3.0
 */
class HtmlView extends FabrikView
{
	/**
	 * Element id (not used?)
	 *
	 * @var int
	 */
	protected $id = null;

	/**
	 * Set id
	 *
	 * @param   int  $id  Element id
	 *
	 * @deprecated ?
	 *
	 * @return  void
	 */
	public function setId($id)
	{
		$this->id = $id;
	}

	/**
	 * Display the template
	 *
	 * @param   string  $tpl  Template
	 *
	 * @return void
	 */
	public function display($tpl = null)
	{
	}
}
