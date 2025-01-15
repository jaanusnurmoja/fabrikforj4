<?php

namespace Fabrik\Library\Fabrik\Classes;

use Joomla\CMS\Form\FormFactoryInterface;
use Joomla\Database\DatabaseInterface;

class FbFormFactory implements FormFactoryInterface
{
    public function __construct(private DatabaseInterface $db) {}

    public function createForm(string $name, array $options = []): FbForm
    {
        $form = new FbForm($name, $options);
        $form->setDatabase($this->db);

        return $form;
    }
}