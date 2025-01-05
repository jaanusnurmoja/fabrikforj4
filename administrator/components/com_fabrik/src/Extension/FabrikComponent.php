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

use Joomla\CMS\Application\CMSApplicationInterface;
use Joomla\CMS\Component\Router\RouterServiceInterface;
use Joomla\CMS\Component\Router\RouterServiceTrait;
use Joomla\CMS\Dispatcher\DispatcherInterface;
use Joomla\CMS\Extension\BootableExtensionInterface;
use Joomla\CMS\Extension\MVCComponent;
use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLRegistryAwareTrait;
use Psr\Container\ContainerInterface;
use Joomla\Database\DatabaseInterface;

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

	private $container;
	
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

		$this->container = $container;

	}
	
	/**
	 * Returns the Container the extension was created with.
	 *
	 * We are going to use it wherever we are not instantiated through the extension object, e.g. fields.
	 *
	 * @return  Container
	 * @since   9.3.0
	 */
	public function getContainer(): Container
	{
		return $this->container;
	}

	/**
	 * Returns the dispatcher for the given application.
	 *
	 * @param   CMSApplicationInterface  $application  The application
	 *
	 * @return  DispatcherInterface
	 * @since   9.3.0
	 */
	public function getDispatcher(CMSApplicationInterface $application): DispatcherInterface
	{
		$dispatcher = parent::getDispatcher($application);

		if (method_exists($dispatcher, 'setDatabase'))
		{
			$dispatcher->setDatabase($this->container->get(DatabaseInterface::class));
		}

		return $dispatcher;
	}

	/**
	 * Returns the component's parameters service
	 *
	 * @return ComponentParameters
	 *
	 * @since  9.4.0
	 */
	public function getComponentParametersService(): ComponentParameters
	{
		return $this->container->get(ComponentParameters::class);
	}
}
