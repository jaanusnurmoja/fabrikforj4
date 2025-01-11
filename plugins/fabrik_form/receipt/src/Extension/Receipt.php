<?php
/**
 * Send a receipt
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.form.receipt
 * @copyright   Copyright (C) 2005-2025  Fabrikar, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\Form\Receipt\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginformModel;
use Fabrik\Library\Fabrik\FabrikString;
use Fabrik\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Language\Text;
use Joomla\Event\SubscriberInterface;


/**
 * Send a receipt
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.form.receipt
 * @since       3.0
 */
class Receipt extends PluginformModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	protected $html = null;

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgFormReceipt } from "@fbplgformreceipt";';
	}

	/**
     * Returns an array of events this subscriber will listen to.
     *
     * @return  array
     *
     * @since   5.0
     */
    public static function getSubscribedEvents(): array
    {
        $pluginMethods = ["onAfterProcess" => "onAfterProcess"];

        return array_merge(parent::getSubscribedEvents(), $pluginMethods);
    }

	/**
	 * Sets up HTML to be injected into the form's bottom
	 *
	 * @return void
	 */
	public function getBottomContent()
	{
		$params = $this->getParams();
		$layout = $this->getLayout('bottom');
		$layoutData = new \stdClass;
		$layoutData->askReceipt = $params->get('ask-receipt');
		$layoutData->label = $params->get('receipt_button_label', '');

		if ($layoutData->label === '')
		{
			$layoutData->label = Text::_('PLG_FORM_RECEIPT_EMAIL_ME_A_COPY');
		}

		$this->html = $layout->render($layoutData);
	}

	/**
	 * Inject custom html into the bottom of the form
	 *
	 * @param   int  $c  Plugin counter
	 *
	 * @return  string  html
	 */
	public function getBottomContent_result($c)
	{
		return $this->html;
	}

	/**
	 * Run right at the end of the form processing
	 * form needs to be set to record in database for this to hook to be called
	 *
	 * @return	bool
	 */
	public function onAfterProcess()
	{
		$params = $this->getParams();
		$input = $this->app->input;
		$formModel = $this->getModel();

		if ($params->get('ask-receipt'))
		{
			if (!array_key_exists('fabrik_email_copy', $_POST))
			{
				return;
			}
		}

		$rowId = $input->get('rowid');
		$w = new FabrikWorker;
		$data = $this->getProcessData();
		$message = $params->get('receipt_message');
		$editURL = COM_FABRIK_LIVESITE . "index.php?option=com_" . $this->package . "&amp;view=form&amp;fabrik=" . $formModel->get('id') . "&amp;rowid="
			. $rowId;
		$viewURL = COM_FABRIK_LIVESITE . "index.php?option=com_" . $this->package . "&amp;view=details&amp;fabrik=" . $formModel->get('id') . "&amp;rowid="
			. $rowId;
		$editLink = "<a href=\"$editURL\">" . Text::_('EDIT') . "</a>";
		$viewLink = "<a href=\"$viewURL\">" . Text::_('VIEW') . "</a>";
		$message = str_replace('{fabrik_editlink}', $editLink, $message);
		$message = str_replace('{fabrik_viewlink}', $viewLink, $message);
		$message = str_replace('{fabrik_editurl}', $editURL, $message);
		$message = str_replace('{fabrik_viewurl}', $viewURL, $message);

		$message = $w->parseMessageForPlaceHolder($message, $data, false);

		$to = $w->parseMessageForPlaceHolder($params->get('receipt_to'), $data, false);
		$to = FabrikString::stripSpace($to);

		if (empty($to))
		{
			/* $$$ hugh - not much point trying to send if we don't have a To address
			 * (happens frequently if folk don't properly validate their form inputs and are using placeholders)
			 * @TODO - might want to add some feedback about email not being sent
			 */
			return;
		}

		$to = explode(',', $to);

		$subject = html_entity_decode($params->get('receipt_subject', ''));
		$subject = Text::_($w->parseMessageForPlaceHolder($subject, $data, false));

		@list($emailFrom, $emailFromName) = explode(":", $w->parseMessageForPlaceholder($params->get('from_email'), $this->data, false), 2);

		if (empty($emailFrom))
		{
			$emailFrom = $this->config->get('mailfrom');
		}

		if (empty($emailFromName))
		{
			$emailFromName = $this->config->get('fromname', $emailFrom);
		}

		$res = FabrikWorker::sendMail($emailFrom, $emailFromName, $to, $subject, $message, true);

		if (!$res)
		{
			throw new RuntimeException('Couldn\'t send receipt', 500);
		}
	}
}
