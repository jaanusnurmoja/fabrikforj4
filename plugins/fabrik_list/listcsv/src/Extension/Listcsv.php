<?php
/**
 * Allow processing of CSV import / export on a per row basis
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.listcsv
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\List\Listcsv\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Component\Fabrik\Site\Model\PluginlistModel;
use Fabrik\Helpers\Php;
use Joomla\CMS\Filter\InputFilter;
use Joomla\Event\SubscriberInterface;

/**
 * Allow processing of CSV import / export on a per row basis
 *
 * @package     Joomla.Plugin
 * @subpackage  Fabrik.list.listcsv
 * @since       3.0
 */

class Listcsv extends PluginlistModel implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

	/*
	 * for use by user code
	 */
	public $userClass = null;

	/*
	 * for use by user code
	 */
	public $userData = null;

	/**
	 * Returns the javascript import map name for the plugin javascript.
	 *
	 * @return  string	 *
	 * @since   5.0
	 */
	public function getImportMapName()
	{
		return 'import { FbPlgListListcsv } from "@fbplglistlistcsv";';
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
        $pluginMethods = [
        	"onImportCSVRow" => "onImportCSVRow",
        	"onAfterImportCSVRow" => "onAfterImportCSVRow",
        	"onCompleteImportCSV" => "onCompleteImportCSV",
        	"onStartImportCSV" => "onStartImportCSV",
        	"onExportCSVRow" => "onExportCSVRow",
        	"onExportCSVHeadings" => "onExportCSVHeadings"
        ];

        return array_merge(method_exists('\PlgFabrik_Element', 'getSubscribedEvents') ? parent::getSubscribedEvents() : [], $pluginMethods);
    }

	/**
	 * determine if the table plugin is a button and can be activated only when rows are selected
	 *
	 * @return bool
	 */

	public function canSelectRows()
	{
		return false;
	}

	/**
	 * Prep the button if needed
	 *
	 * @param   array  &$args  Arguments
	 *
	 * @return  bool;
	 */

	public function button(&$args)
	{
		parent::button($args);

		return false;
	}

	/**
	 * Called when we import a csv row
	 *
	 * @return boolean
	 */

	public function onImportCSVRow()
	{
		$params = $this->getParams();
		$filter = InputFilter::getInstance();
		$file = $params->get('listcsv_import_php_file');
		$file = $filter->clean($file, 'CMD');
		$listModel = $this->getModel();

		if ($file != -1 && $file != '')
		{

			require JPATH_ROOT . '/plugins/fabrik_list/listcsv/scripts/' . $file;
		}

		$code = trim($params->get('listcsv_import_php_code', ''));

		if (!empty($code))
		{
			FabrikWorker::clearEval();
			$ret = Php::Eval(['code' => $code, 'vars'=>['listModel'=>$listModel]]);
			FabrikWorker::logEval($ret, 'Caught exception on eval in onImportCSVRow : %s');

			if ($ret === false)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Called after we import a csv row
	 *
	 * @return boolean
	 */

	public function onAfterImportCSVRow($args)
	{
		$params = $this->getParams();
		$filter = InputFilter::getInstance();
		$file = $params->get('listcsv_after_import_php_file');
		$file = $filter->clean($file, 'CMD');
		$listModel = $this->getModel();

		if ($file != -1 && $file != '')
		{

			require JPATH_ROOT . '/plugins/fabrik_list/listcsv/scripts/' . $file;
		}

		$code = trim($params->get('listcsv_after_import_php_code', ''));

		if (!empty($code))
		{
			FabrikWorker::clearEval();
			$ret = Php::Eval(['code' => $code, 'vars'=>['listModel'=>$listModel]]);
			FabrikWorker::logEval($ret, 'Caught exception on eval in onAfterImportCSVRow : %s');

			if ($ret === false)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Called when import is complete
	 *
	 * @return boolean
	 */

	public function onCompleteImportCSV()
	{
		$params = $this->getParams();
		$filter = InputFilter::getInstance();
		$file = $params->get('listcsv_import_complete_php_file');
		$file = $filter->clean($file, 'CMD');
		$listModel = $this->getModel();

		if ($file != -1 && $file != '')
		{

			require JPATH_ROOT . '/plugins/fabrik_list/listcsv/scripts/' . $file;
		}

		$code = trim($params->get('listcsv_import_complete_php_code', ''));

		if (!empty($code))
		{
			FabrikWorker::clearEval();
			$ret = Php::Eval(['code' => $code, 'vars'=>['listModel'=>$listModel]]);
			FabrikWorker::logEval($ret, 'Caught exception on eval in onCompleteImportCSV : %s');

			if ($ret === false)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Called before import is started
	 *
	 * @return boolean
	 */

	public function onStartImportCSV()
	{
		$params = $this->getParams();
		$filter = InputFilter::getInstance();
		$file = $params->get('listcsv_import_start_php_file');
		$file = $filter->clean($file, 'CMD');
		$listModel = $this->getModel();

		if ($file != -1 && $file != '')
		{

			require JPATH_ROOT . '/plugins/fabrik_list/listcsv/scripts/' . $file;
		}

		$code = trim($params->get('listcsv_import_start_php_code', ''));

		if (!empty($code))
		{
			FabrikWorker::clearEval();
			$ret = Php::Eval(['code' => $code, 'vars'=>['listModel'=>$listModel], 'thisVars'=>['userClass'=>$this->userClass]]);
			FabrikWorker::logEval($ret, 'Caught exception on eval in onStartImportCSV : %s');

			if ($ret === false)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Called when we import a csv row
	 *
	 * As PHP doesn't support pass by reference for func_get_args, can't pass heading array in
	 * as an arg, so plugin must modify $listModel->cavExportRow
	 *
	 * @return boolean
	 */

	public function onExportCSVRow()
	{
		$listModel = $this->getModel();
		$params = $this->getParams();
		$filter = InputFilter::getInstance();
		$file = $params->get('listcsv_export_php_file');
		$file = $filter->clean($file, 'CMD');

		if ($file != -1 && $file != '')
		{
			require JPATH_ROOT . '/plugins/fabrik_list/listcsv/scripts/' . $file;
		}

		$code = trim($params->get('listcsv_export_php_code', ''));

		if (!empty($code))
		{
			FabrikWorker::clearEval();
			$ret = Php::Eval(['code' => $code, 'vars'=>['listModel'=>$listModel]]);
			FabrikWorker::logEval($ret, 'Caught exception on eval in onExportCSVRow : %s');

			if ($ret === false)
			{
				return false;
			}
		}

		return true;
	}

	/**
	 * Called when we export the csv headings
	 *
	 * As PHP doesn't support pass by reference for func_get_args, can't pass heading array in
	 * as an arg, so plugin musr modify $listModel->cavExportHeadings
	 *
	 * @param  array  $args  row data
	 *
	 * @return boolean
	 */

	public function onExportCSVHeadings()
	{
		$listModel = $this->getModel();
		$params = $this->getParams();
		$filter = InputFilter::getInstance();
		$file = $params->get('listcsv_export_headings_php_file');
		$file = $filter->clean($file, 'CMD');

		if ($file != -1 && $file != '')
		{
			require JPATH_ROOT . '/plugins/fabrik_list/listcsv/scripts/' . $file;
		}

		$code = trim($params->get('listcsv_export_headings_php_code', ''));

		if (!empty($code))
		{
			FabrikWorker::clearEval();
			$ret = Php::Eval(['code' => $code, 'vars'=>['listModel'=>$listModel]]);
			FabrikWorker::logEval($ret, 'Caught exception on eval in onExportCSVHeadings : %s');

			if ($ret === false)
			{
				return false;
			}
		}

		return true;
	}

}
