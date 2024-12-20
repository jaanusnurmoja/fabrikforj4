<?php
/**
 * @package     Fabrik.Administrator
 * @subpackage  com_fabrik
 *
 * @copyright   Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

//use Joomla\CMS\Categories\CategoryFactoryInterface;
use Joomla\CMS\Component\Router\RouterFactoryInterface;
use Joomla\CMS\Extension\Service\Provider\RouterFactory;
use Joomla\CMS\Dispatcher\ComponentDispatcherFactoryInterface;
use Joomla\CMS\Extension\Service\Provider\ComponentDispatcherFactory;
use Joomla\CMS\Extension\ComponentInterface;
use Joomla\CMS\Extension\MVCComponent;//??
//use Joomla\CMS\Extension\Service\Provider\CategoryFactory;
use Joomla\CMS\MVC\Factory\MVCFactoryInterface;
use Joomla\CMS\Extension\Service\Provider\MVCFactory;
use Joomla\CMS\HTML\Registry;
use Fabrikar\Component\Fabrik\Administrator\Extension\FabrikComponent;
//use Fabrikar\Component\Fabrik\Administrator\Helper\AssociationsHelper;
//use Joomla\CMS\Association\AssociationExtensionInterface;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;

/**
 * The mywalks service provider.
 *
 * @since  4.0.0
 */
return new class implements ServiceProviderInterface
{
	/**
	 * Registers the service provider with a DI container.
	 *
	 * @param   Container  $container  The DI container.
	 *
	 * @return  void
	 *
	 * @since   4.0.0
	 */
	public function register(Container $container)
	{
//		$container->set(AssociationExtensionInterface::class, new AssociationsHelper);
//		$container->registerServiceProvider(new CategoryFactory('\\Fabrikar\\Component\\Fabrik'));
		$container->registerServiceProvider(new MVCFactory('\\Fabrikar\\Component\\Fabrik'));
		$container->registerServiceProvider(new ComponentDispatcherFactory('\\Fabrikar\\Component\\Fabrik'));
//		$container->registerServiceProvider(new RouterFactory('\\Fabrikar\\Component\\Fabrik'));
		$container->set(
				ComponentInterface::class,
				function (Container $container)
				{
					$component = new FabrikComponent($container->get(ComponentDispatcherFactoryInterface::class));

					$component->setRegistry($container->get(Registry::class));
					$component->setMVCFactory($container->get(MVCFactoryInterface::class));
//					$component->setCategoryFactory($container->get(CategoryFactoryInterface::class));
//					$component->setAssociationExtension($container->get(AssociationExtensionInterface::class));
//					$component->setRouterFactory($container->get(RouterFactoryInterface::class));

					return $component;
		}
		);
	}
};
