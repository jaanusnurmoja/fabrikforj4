<?php
/**
 * View when emailing a form to a user
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrikar\Component\Fabrik\Administrator\View\Emailform;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrikar\Library\Fabrik\FabrikHtml;
use Fabrikar\Library\Fabrik\FabrikString;
use Fabrikar\Library\Fabrik\FabrikWorker;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\View\HtmlView as BaseHtmlView;
use Joomla\CMS\Session\Session;

/**
 * View when emailing a form to a user
 *
 * @package     Joomla.Administrator
 * @subpackage  Fabrik
 * @since       3.0
 */

class HtmlView extends BaseHtmlView {
	/**
	 * Display
	 *
	 * @param   string  $tpl  Template
	 *
	 * @return  void
	 */

	public function display($tpl = null) {
		$model = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('Form', 'Site');
		$app = Factory::getApplication();
		$input = $app->input;

		if (!$input->get('youremail', false)) {
			FabrikHtml::emailForm($model);
		} else {
			$to = $template = '';
			$ok = $this->sendMail($to);
			FabrikHtml::emailSent($to, $ok);
		}
	}

	/**
	 * Send a mail
	 *
	 * @param   string  &$email  Email address
	 *
	 * @return  void
	 */

	public function sendMail(&$email) {
		Session::checkToken() or die('Invalid Token');
		$app = Factory::getApplication();
		$input = $app->input;

		/*
		 * First, make sure the form was posted from a browser.
		 * For basic web-forms, we don't care about anything
		 * other than requests from a browser:
		 */
		if (!isset($_SERVER['HTTP_USER_AGENT'])) {
			throw new \RuntimeException(Text::_('JERROR_ALERTNOAUTHOR'), 500);
		}

		// Make sure the form was indeed POST'ed:
		//  (requires your html form to use: action="post")
		if (!$_SERVER['REQUEST_METHOD'] == 'POST') {
			throw new \RuntimeException(Text::_('JERROR_ALERTNOAUTHOR'), 500);
		}

		// Attempt to defend against header injections:
		$badStrings = array('Content-Type:', 'MIME-Version:', 'Content-Transfer-Encoding:', 'bcc:', 'cc:');

		// Loop through each POST'ed value and test if it contains
		// one of the $badStrings:
		foreach ($_POST as $k => $v) {
			foreach ($badStrings as $v2) {
				if (FabrikString::strpos($v, $v2) !== false) {
					throw new \RuntimeException(Text::_('JERROR_ALERTNOAUTHOR'), 500);
				}
			}
		}

		// Made it past spammer test, free up some memory
		// and continue rest of script:
		unset($k, $v, $v2, $badStrings);
		$email = $input->getString('email', '');
		$yourname = $input->getString('yourname', '');
		$youremail = $input->getString('youremail', '');
		$subject_default = Text::sprintf('Email from', $yourname);
		$subject = $input->getString('subject', $subject_default);

		if (!$email || !$youremail || (FabrikWorker::isEmail($email) == false) || (FabrikWorker::isEmail($youremail) == false)) {
			$app->enqueueMessage(Text::_('PHPMAILER_INVALID_ADDRESS'));
		}

		$config = Factory::getApplication()->getConfig();
		$sitename = $config->get('sitename');

		// Link sent in email
		$link = $input->get('referrer', '', 'string');

		// Message text
		$msg = Text::sprintf('COM_FABRIK_EMAIL_MSG', $sitename, $yourname, $youremail, $link);

		// Mail function
		$mail = Factory::getMailer();
		$res = $mail->sendMail($youremail, $yourname, $email, $subject, $msg);
	}
}
