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
use Fabrik\Component\Fabrik\Administrator\Extension\FabrikComponent;
//use Fabrik\Component\Fabrik\Administrator\Helper\AssociationsHelper;
//use Joomla\CMS\Association\AssociationExtensionInterface;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Database\DatabaseInterface;

use Joomla\CMS\Form\FormFactoryInterface;
use Joomla\CMS\Pagination\Pagination;

use Fabrik\Library\Fabrik\Classes\FbFormFactory;
use Fabrik\Library\Fabrik\Classes\FbPagination;

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
//		$container->registerServiceProvider(new CategoryFactory('\\Fabrik\\Component\\Fabrik'));
		$container->registerServiceProvider(new MVCFactory('\\Fabrik\\Component\\Fabrik'));
		$container->registerServiceProvider(new ComponentDispatcherFactory('\\Fabrik\\Component\\Fabrik'));
//		$container->registerServiceProvider(new RouterFactory('\\Fabrik\\Component\\Fabrik'));
        $container->share(
            FormFactoryInterface::class,
            static fn(Container $container) => new FbFormFactory($container->get(DatabaseInterface::class))
        );
/*        
        $container->set(
        	Pagination::class,
        	function(Container $container){
        		return new FbPagination();
        	}
        );
*/        
        // Register the DatabaseInterface::class to the container
        $container->set(
            DatabaseInterface::class,
            function (Container $container) {
                // Use Joomla's default database provider to get the database connection
                return $container->get('db');
            }
        );
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
