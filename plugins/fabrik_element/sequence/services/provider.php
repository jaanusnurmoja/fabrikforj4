<?php
defined('_JEXEC') || die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Fabrik\Plugin\Element\Sequence\Extension\Sequence;

return new class implements ServiceProviderInterface {
    public function register(Container $container)
    {
        $container->set(
            PluginInterface::class,
            function (Container $container)
            {
                $config  = (array)PluginHelper::getPlugin('Element', 'Sequence');
                $subject = $container->get(DispatcherInterface::class);

                $app = Factory::getApplication();

                /** @var \Joomla\CMS\Plugin\CMSPlugin $plugin */
                $plugin = new Sequence($subject, $config);
                $plugin->setApplication($app);

                return $plugin;
            }
        );
    }
};
