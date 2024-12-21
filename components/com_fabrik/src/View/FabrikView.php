<?php
/**
 * Base Fabrik view class
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
namespace Fabrik\Component\Fabrik\Site\View;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Library\Fabrik\FabrikArray;
use Joomla\CMS\Document\Document;
use Joomla\CMS\Factory;
use Joomla\CMS\MVC\View\HtmlView;
use Joomla\CMS\Session\Session;
use Joomla\CMS\User\User;

/**
 * Class FabrikView
 */
class FabrikView extends HtmlView {
	/**
	 * @var JApplicationCMS
	 */
	protected $app;

	/**
	 * @var User
	 */
	protected $user;

	/**
	 * @var string
	 */
	protected $package;

	/**
	 * @var Session
	 */
	protected $session;

	/**
	 * @var Document
	 */
	protected $doc;

	/**
	 * @var JDatabaseDriver
	 */
	protected $db;

	/**
	 * @var Registry
	 */
	protected $config;

	/**
	 * Constructor
	 *
	 * @param   array $config A named configuration array for object construction.
	 *
	 */
	public function __construct($config = array()) {
		$this->app = FabrikArray::getValue($config, 'app', Factory::getApplication());
		$this->user = FabrikArray::getValue($config, 'user', Factory::getUser());
		$this->package = $this->app->getUserState('com_fabrik.package', 'fabrik');
		$this->session = FabrikArray::getValue($config, 'session', Factory::getSession());
		$this->doc = FabrikArray::getValue($config, 'doc', Factory::getDocument());
		$this->db = FabrikArray::getValue($config, 'db', Factory::getDbo());
		$this->config = FabrikArray::getValue($config, 'config', Factory::getApplication()->getConfig());
		parent::__construct($config);
	}
}