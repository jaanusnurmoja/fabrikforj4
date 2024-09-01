<?php
defined('_JEXEC') || die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Fabrik\Plugin\Fabrik_element\Field\Extension\Field;
/*
// Make sure that Joomla has registered the namespace for the plugin
if (!class_exists(Field::class))
{
	JLoader::registerNamespace('\Fabrik\Plugins\Element\Field', realpath(__DIR__ . '/../src'));
}
*/
return new class implements ServiceProviderInterface {
    public function register(Container $container)
    {
        $container->set(
            PluginInterface::class,
            function (Container $container)
            {
                $config  = (array)PluginHelper::getPlugin('fabrik_element', 'Field');
                $subject = $container->get(DispatcherInterface::class);

                $app = Factory::getApplication();

                /** @var \Joomla\CMS\Plugin\CMSPlugin $plugin */
                $plugin = new Field($subject, $config);
                $plugin->setApplication($app);

                return $plugin;
            }
        );
    }
};
