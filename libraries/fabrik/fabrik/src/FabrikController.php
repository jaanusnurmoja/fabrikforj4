<?php
/**
 * Created by PhpStorm.
 * User: rob
 * Date: 24/05/2016
 * Time: 09:56
 */

namespace Fabrik\Library\Fabrik;

defined('_JEXEC') or die;

use Fabrik\Library\Fabrik\FabrikArray;
use Joomla\CMS\Document\Document;
use Joomla\CMS\Factory;
use Joomla\CMS\MVC\Controller\BaseController;
use Joomla\CMS\Session\Session;
use Joomla\CMS\User\User;

class FabrikController extends BaseController {
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