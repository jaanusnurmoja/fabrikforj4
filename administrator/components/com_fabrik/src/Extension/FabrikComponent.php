<?php
/**
 * @package     Joomla.Administrator
 * @subpackage  com_fabrik
 *
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Fabrik\Component\Fabrik\Administrator\Extension;

defined('JPATH_PLATFORM') or die;

use Joomla\CMS\Application\SiteApplication;//??
use Joomla\CMS\Component\Router\RouterServiceInterface;
use Joomla\CMS\Component\Router\RouterServiceTrait;
use Joomla\CMS\Extension\BootableExtensionInterface;
use Joomla\CMS\Extension\MVCComponent;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLRegistryAwareTrait;
use Psr\Container\ContainerInterface;
//use Fabrik\Component\Fabrik\Administrator\Service\HTML\AdministratorService;
use Joomla\Database\DatabaseInterface;
require_once JPATH_ADMINISTRATOR . '/components/com_fabrik/includes/defines.php';

/**
 * Component class for com_fabrik
 *
 * @since  4.0.0
 */
class FabrikComponent extends MVCComponent implements
BootableExtensionInterface//, RouterServiceInterface
{
//	use RouterServiceTrait;
	use HTMLRegistryAwareTrait;

	/**
	 * Booting the extension. This is the function to set up the environment of the extension like
	 * registering new class loaders, etc.
	 *
	 * If required, some initial set up can be done from services of the container, eg.
	 * registering HTML services.
	 *
	 * @param   ContainerInterface  $container  The container
	 *
	 * @return  void
	 *
	 * @since   4.0.0
	 */
	public function boot(ContainerInterface $container)
	{
//		$this->getRegistry()->register('fabrikadministrator', new AdministratorService);
		$db = Factory::getContainer()->get(DatabaseInterface::class); 
		Factory::getApplication()->getDocument()->getWebAssetManager()->getRegistry()->addExtensionRegistryFile('fabrikar/com_fabrik');
	}
}
