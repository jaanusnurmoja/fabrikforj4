<?php
defined('_JEXEC') || die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Fabrik\Plugin\Fabrik_element\Internalid\Extension\Internalid;
/*
// Make sure that Joomla has registered the namespace for the plugin
if (!class_exists(Internalid::class))
{
	JLoader::registerNamespace('\Fabrik\Plugins\Element\Internalid', realpath(__DIR__ . '/../src'));
}
*/
return new class implements ServiceProviderInterface {
    public function register(Container $container)
    {
        $container->set(
            PluginInterface::class,
            function (Container $container)
            {
                $config  = (array)PluginHelper::getPlugin('fabrik_element', 'internalid');
                $subject = $container->get(DispatcherInterface::class);

                $app = Factory::getApplication();

                /** @var \Joomla\CMS\Plugin\CMSPlugin $plugin */
                $plugin = new Internalid($subject, $config);
                $plugin->setApplication($app);

                return $plugin;
            }
        );
    }
};
