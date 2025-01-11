<?php
defined('_JEXEC') || die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Fabrik\Plugin\List\Update_col\Extension\Update_col;

return new class implements ServiceProviderInterface {
    public function register(Container $container)
    {
        $container->set(
            PluginInterface::class,
            function (Container $container)
            {
                $config  = (array)PluginHelper::getPlugin('List', 'Update_col');
                $subject = $container->get(DispatcherInterface::class);

                $app = Factory::getApplication();

                /** @var \Joomla\CMS\Plugin\CMSPlugin $plugin */
                $plugin = new Update_col($subject, $config);
                $plugin->setApplication($app);

                return $plugin;
            }
        );
    }
};
