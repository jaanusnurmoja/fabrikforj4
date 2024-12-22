<?php
/**
 * Required System plugin if using Fabrik
 * Enables Fabrik to override some J classes
 *
 * @package     Joomla.Plugin
 * @subpackage  System
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

namespace Fabrik\Plugin\System\Fabrik\Extension;

// No direct access
defined('_JEXEC') or die('Restricted access');

use Fabrik\Library\Fabrik\FabrikHtml;
use Fabrik\Helpers\Worker;
use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Date\Date;
use Joomla\CMS\Factory;
use Joomla\CMS\Filesystem\File;
use Joomla\CMS\Form\Form;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Model\BaseDatabaseModel;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Table\Extension;
use Joomla\CMS\Table\Table;
use Joomla\CMS\Version;
use Joomla\Event\Event;
use Joomla\Event\SubscriberInterface;
use Joomla\Registry\Registry;
use Joomla\Utilities\ArrayHelper;

jimport('joomla.plugin.plugin');
jimport('joomla.filesystem.file');

/**
 * Joomla! Fabrik system
 *
 * @package     Joomla.Plugin
 * @subpackage  System
 * @since       3.0
 */
class Fabrik extends CMSPlugin implements SubscriberInterface
{
	protected $app; // Provided by the CSMPlugin interface

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
        	"onBeforeCompileHead" 	=> "onBeforeCompileHead",
        	"onAfterRender" 		=> "onAfterRender",
        	"onBeforeRender" 		=> "onBeforeRender",
        	"onStartIndex" 			=> "onStartIndex",
        	"onDoContentSearch" 	=> "onDoContentSearch",
        	"onAfterDispatch" 		=> "onAfterDispatch",
        	"onExtensionAfterSave" 	=> "onExtensionAfterSave",
        	"onAjaxLoadedPage"		=> "onAjaxLoadedPage"
        ];

        return $pluginMethods;
    }

	/**
	 * Constructor
	 *
	 * @param   object &$subject The object to observe
	 * @param   array  $config   An array that holds the plugin configuration
	 *
	 * @since    1.0
	 */
	public function __construct(&$subject, $config)
	{

		parent::__construct($subject, $config);

		jimport('joomla.filesystem.file');

		/**
		 * Added allow_user_defines to global config, defaulting to No, so even if a user_defines.php is present
		 * it won't get used unless this option is specifically set.  Did this because it looks like a user_defines.php
		 * managed to creep in to a release ZIP at some point, so some people unknowingly have one, which started causing
		 * issues after we added some more includes to defines.php.
		 */
		$fbConfig         = ComponentHelper::getParams('com_fabrik');
		$allowUserDefines = $fbConfig->get('allow_user_defines', '0') === '1';
		$p                = JPATH_SITE . '/plugins/system/fabrik/';
		$defines          = $allowUserDefines && File::exists($p . 'user_defines.php') ? $p . 'user_defines.php' : $p . 'defines.php';
		require_once $defines;

		$this->setBigSelects();

		$this->clearJs();

	}

	/**
	 * Get Page JavaScript from either session or cached .js file
	 *
	 * @return string
	 */
	public static function js()
	{
		/**
		 * We need to cache the requirejs stuff, as we insert it at the end of the document AFTER Joomla has written
		 * out the system cache, so loading a cached page will not have requirejs on the end.
		 */

		$config = Factory::getApplication()->getConfig();
		$app = Factory::getApplication();
		$script = '';
		$session = Factory::getSession();

		/**
		 * Whenever we cache a view, we add the cache ID to this session variable, by calling
		 * \FabrikHelperHTML::addToSessionCacheIds().  This gets cleared at the end of this function, so if there's
		 * anything in there, it was added on this page load.
		 *
		 * The theory is that if the view isn't cached, buildJs() will find everything it needs in our own session
		 * variables (fabrik.js.config, fabrik.js.scripts, etc).  If it is cached, the view won't have run, so we
		 * don't have our own session data, but we'll get it back from the cache.
		 */
		if ($session->has('fabrik.js.cacheids'))
		{
			/**
			 * NOTE that we use a different cache group name, 'fabrik_cacheids', NOT the default 'fabrik'.  This is
			 * because the main 'fabrik' cache could get cleared out from under us at any time, like if someone else
			 * submits a form, or anything else happens that causes Fabrik to do a $cache-clean().  This means that
			 * the 'fabrik_cacheids' cache could grow quite large, and will need to be cleaned occasionally.
			 */
			$cache = Worker::getCache(null, 'fabrik_cacheids');
			$cacheIds = $session->get('fabrik.js.cacheids', array());

			/**
			 * It's conceivable multiple views may have been rendered (modules, content plugins), so serialize them
			 * to get a unique ID for each combo.  In certain corner cases there may be an empty ID, so check and ignore.
			 */
			$cacheId = serialize($cacheIds);

			if (!empty($cacheId))
			{
				 // We got an ID, so ask the cache for it.
				$script = $cache->get(array('Fabrik', 'buildJs'), $cacheId);
			}
			else
			{
				// No viable ID, so just build
				$script = self::buildJs();
			}
		}
		else
		{
			// nothing in the session cacheids, so just build.
			$script = self::buildJs();
		}

		// clear the session data
		self::clearJs();

		return $script;
	}

	/**
	 * Clear session js store
	 *
	 * @return  void
	 */
	public static function clearJs()
	{
		$session = Factory::getSession();
		$session->set('fabrik.js.user.scripts', []);
		$session->set('fabrik.js.inline.scripts', []);
		$session->set('fabrik.js.domready.scripts', []);
		$session->set('fabrik.js.eleminit.scripts', []);
/*		$session->clear('fabrik.js.shim');
		$session->clear('fabrik.js.jlayouts');
*/		
	}

	/**
	 * Store head script in session js store,
	 * used by partial document type to exclude scripts already loaded, when building modal windows
	 *
	 * @return  void
	 */
	public static function storeHeadJs()
	{
		$session = Factory::getSession();
		$doc = Factory::getDocument();
		$app = Factory::getApplication();
		$key = md5($app->input->server->get('REQUEST_URI', '', 'string'));

		if (!empty($key))
		{
			$key = 'fabrik.js.head.cache.' . $key;

			// if this is 'html', it's a main page load, so clear the cache for this page and start again
			if ($app->input->get('format', 'html') === 'html')
			{
				$session->clear($key);
			}

			$scripts = $doc->_scripts;
			$existing = $session->get($key);

			/**
			 * if we already have scripts for this page, merge the new ones.  For example, this might be an AJAX
			 * call loading an element, so we just want to add any new scripts to the list, not blow it away and replace
			 */
			if (!empty($existing))
			{
				$existing = json_decode($existing);
				$existing = ArrayHelper::fromObject($existing);
				$scripts = array_merge($scripts, $existing);
			}

			$scripts = json_encode($scripts);
			$session->set($key, $scripts);
		}
	}

	public static function convertToWebAssetManager($config) {

		if (empty($config)) return $config;
		if (!is_array($config)) $config = [$config];

		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
		foreach ($config as $key => $item) {
			if (strpos($item, 'baseUrl') !== false) {
				$reqJsConfig = json_decode($item);
				foreach ($reqJsConfig->shim as $shimKey => $shim) {
					$webAsset = 'com_fabrik';
					$assets = explode('/', $shimKey);
					if (count($assets) == 1) {
						$wa->useScript($shimKey);
						unset($reqJsConfig->shim->$shimKey);
						continue;
					}
					if ($assets[0] == 'fabrik') $assets[0] = 'fab';
					foreach ($assets as $asset) {
						$webAsset .= ".$asset";
					}
					$wa->useScript($webAsset);
					unset($reqJsConfig->shim->$shimKey);
				}
				$config[$key] = json_encode($reqJsConfig);
			}
		}
		return $config;
	}

	/**
	 * Build Page <script> tag for insertion into DOM
	 *
	 * @return string
	 */
	public static function buildJs()
	{
		$session = Factory::getSession();
//		$config  = self::convertToWebAssetManager((array) $session->get('fabrik.js.config', []));
		$config  = ''; //implode("\n", $config);

		$js = (array) $session->get('fabrik.js.scripts', array());
		$js = implode("\n", $js);

		$jLayouts = (array) $session->get('fabrik.js.jlayouts', array());
		$jLayouts = json_encode(ArrayHelper::toObject($jLayouts));
		$js       = str_replace('%%jLayouts%%', $jLayouts, $js);

		if ($config . $js !== '')
		{
			/*
			 * Load requirejs into a DOM generated <script> tag - then load require.js code.
			 * Avoids issues with previous implementation where we were loading requirejs at the end of the head and then
			 * loading the code at the bottom of the page.
			 * For example this previous method broke with the codemirror editor which first
			 * tests if its inside requirejs (false) then loads scripts via <script> node creation. By the time the secondary
			 * scripts were loaded, Fabrik had loaded requires js, and conflicts occurred.
			 */
			$jsAssetBaseURI = \FabrikHelperHTML::getJSAssetBaseURI();
			$rjs            = $jsAssetBaseURI . 'media/com_fabrik/js/lib/require/require.js';
/*			$script         = 'setTimeout(function(){
            jQuery.ajaxSetup({
  cache: true
});
				 jQuery.getScript( "' . $rjs . '", function() {
				' . "\n" . $config . "\n" . $js . "\n" . '
			});
			 }, 600);';
*/		}
		else
		{
			$script = '';
		}
		return $script;
	}

	/**
	 * When loading a page via ajax, this plugins onBeforeCompileHead function is nto called, so we trigger it
	 * With this function. We use a seperate function as we do not want to trigger everyones onBeforeCompileHead function.
	 *
	 * @return  void
	 */
	public function onAjaxLoadedPage(Event $event) {
		self::onBeforeCompileHead($event);
	}

	private $domReadyScripts = [];

	private function addToDomReady($script) {
		if (empty($this->domReadyScripts)) {
			$this->domReadyScripts[] = "\t{";
			$this->domReadyScripts[] = "\t}";
		}
		array_pop($this->domReadyScripts);
		$this->domReadyScripts[] = $script;
		$this->domReadyScripts[] = "\t}";
	}

	private $promiseScripts = [];
	private function addToPromise($script) {
		if (empty($this->promiseScripts)) {
			$this->promiseScripts[] = "\t\tPromise.resolve()";;
			$this->promiseScripts[] = ";";
		}
		array_pop($this->promiseScripts);
		$this->promiseScripts[] = $script;
		$this->promiseScripts[] = ";";
	}

	/**
	 * Check if javascipt debug is enable and if so disable the autoversion for all of our js files.
	 * This is temporary until the joomla.asset.json file is revised to use the minified versions
	 *
	 * @return  void
	 */
	public function onBeforeCompileHead(Event $event)
	{ 

		$wa = Factory::getApplication()->getDocument()->getWebAssetManager();
		$fbConfig         = ComponentHelper::getParams('com_fabrik');

		/* Now let's insert all the stored up inline scripts */
		$session = Factory::getSession();
		/* First the domready scripts */
		foreach ($session->get('fabrik.js.domready.scripts') as $script) {
			$this->addToDomReady("\t\t{\n\t\t" . str_replace("\n", "\n\t\t", $script) . "\n\t\t}");
		}


		/* And our element initialization scripts */
		if (count($elemInitScripts = (array)$session->get('fabrik.js.eleminit.scripts')) > 0) {
			$this->addToPromise("\t\t.then(() => { window.fabrikElemInitScripts(); })");
			$scripts = ['window.fabrikElemInitScripts = function()'];
			$scripts[] = "\t{\n\t\t{";
			foreach ($elemInitScripts as $script) {
				$scripts[] = "\t\t\t" . $script;
			}
			$scripts[] = "\t\t}\n\t};\n\t";
			$wa->addInlineScript(implode("\n", $scripts), [], ['name' => 'fabrik.js.eleminit.scripts']);
		}

		/* Then our inline scripts */
		if (count($elemInlineScripts = (array)$session->get('fabrik.js.inline.scripts')) > 0) {
			$this->addToPromise("\t\t.then(() => { window.fabrikInlineScripts(); })");
			$scripts = ['window.fabrikInlineScripts = function()'];
			$scripts[] = "\t{";
			$scripts[] = "\t\tvar Fabrik = window.Fabrik || {};";
			foreach ($elemInlineScripts as $script) {
				$scripts[] = "\t\t{\n\t\t" . str_replace("\n", "\n\t\t", $script) . "\n\t\t}";
			}
			$scripts[] = "\t};\n\t";
			$wa->addInlineScript(implode("\n", $scripts), [], ['name' => 'fabrik.js.inline.scripts']);
		}

		/* And finally the users form/list/etc scripts */
		if (count($elemUserScripts = (array)$session->get('fabrik.js.user.scripts')) > 0) {
			foreach ($elemUserScripts as $key => $url) {
				$wa->registerAndUseScript("fabrik.js.user.scripts.$key", $url);
			}
			$session->set('fabrik.js.user.scripts', []);
		}

		foreach ($this->promiseScripts as $script) {
			$this->addToDomReady($script);
		}

		if (!empty($this->domReadyScripts)) {
			if (\FabrikHelperHTML::inAjaxLoadedPage() == false) {
				array_unshift($this->domReadyScripts, 'document.addEventListener("DOMContentLoaded", function()');
				array_push($this->domReadyScripts, ");\n\t");
			}		
			$wa->addInlineScript(implode("\n", $this->domReadyScripts), [], ['name' => 'fabrik.js.domready.scripts']);
		}

		/* Disable the autoversion if we are in debug mode, temporary until we move to the map files */
		if ($fbConfig->get('use_fabrikdebug', 0) != 0) {
			$assets = $wa->getAssets('script');
			foreach($assets as $asset) {
				/* Ignore anything that is non fabrik */
				if (strpos($asset->getName(), 'fabrik') === false) continue;
				/* Ignore all inline scripts */
				if (empty($asset->getUri())) continue;
				$wa->registerAndUseScript(
					$asset->getName(),
					ltrim($asset->getUri(), '/'),
					[...$asset->getOptions(), 'version' => false],
					$asset->getAttributes(),
					$asset->getDependencies()
				);
			}
		}

	}

	public function onAfterRender(Event $event) { 
		if (!in_array( Factory::getApplication()->input->get('format', 'html'), ['partial', 'html']))
		{
			return;
		}
		FabrikHtml::saveWebAssets();
	}

	/**
	 * 
	 *
	 * @since   3.0
	 *
	 * @return  void
	 */
	public function onBeforeRender(Event $event)
	{

	}

    /**
     * If a command line like finder_indexer.php is run, it won't call onAfterInitialise, and will then run content
     * plugins, and ours will bang out because "Fabrik system plugin has not been run".  So onStartIndex, initialize
     * our plugin.
     *
     * @since   3.8
     *
     * @return  void
     */
	public function onStartIndex(Event $event)
    {
        $this->onAfterInitialise();
    }

	/**
	 * From Global configuration setting, set big select for main J database
	 *
	 * @since    3.0.7
	 *
	 * @return  void
	 */
	protected function setBigSelects()
	{
		if (class_exists('\FabrikWorker'))
		{
			$db = Factory::getDbo();
			\FabrikWorker::bigSelects($db);
		}
	}

	/**
	 * Fabrik Search method
	 *
	 * The sql must return the following fields that are
	 * used in a common display routine: href, title, section, created, text,
	 * browsernav
	 *
	 * @param   string    $text     Target search string
	 * @param   Registry $params   Search plugin params
	 * @param   string    $phrase   Matching option, exact|any|all
	 * @param   string    $ordering Option, newest|oldest|popular|alpha|category
	 *
	 * @return  array
	 */
	public static function onDoContentSearch($text, $params, $phrase = '', $ordering = '')
	{
		$app      = Factory::getApplication();
		$package  = $app->getUserState('com_fabrik.package', 'fabrik');
		$fbConfig = ComponentHelper::getParams('com_fabrik');

		if (defined('COM_FABRIK_SEARCH_RUN'))
		{
			return;
		}

		$input = $app->input;
		define('COM_FABRIK_SEARCH_RUN', true);
		BaseDatabaseModel::addIncludePath(COM_FABRIK_FRONTEND . '/models', 'FabrikFEModel');

		$db = \FabrikWorker::getDbo(true);

		//Not existing in J!4, not necessary for "old" com_search-j4-adapted, see https://fabrikar.com/forums/index.php?threads/fabrik-search-plugin.53966/
		//require_once JPATH_SITE . '/components/com_content/helpers/route.php';

		// Load plugin params info
		//$limit = $params->def('search_limit', 50);
		$limit = $params->get('search_limit', 50);
		$text  = trim($text);

		if ($text == '')
		{
			return array();
		}

		switch ($ordering)
		{
			case 'oldest':
				$order = 'a.created ASC';
				break;

			case 'popular':
				$order = 'a.hits DESC';
				break;

			case 'alpha':
				$order = 'a.title ASC';
				break;

			case 'category':
				$order  = 'b.title ASC, a.title ASC';
				$morder = 'a.title ASC';
				break;

			case 'newest':
			default:
				$order = 'a.created DESC';
				break;
		}

		// Set heading prefix
		$headingPrefix = $params->get('include_list_title', true);

		// Get all tables with search on
		$query = $db->getQuery(true);
		$query->select('id')->from('#__fabrik_lists')->where('published = 1');
		$db->setQuery($query);

		$list    = array();
		$ids     = $db->loadColumn();
		$section = $params->get('search_section_heading');
		$urls    = array();

		// $$$ rob remove previous search results?
		$input->set('resetfilters', 1);

		// Ensure search doesn't go over memory limits
		$memory    = \FabrikWorker::getMemoryLimit();
		$usage     = array();
		$memSafety = 0;

		$listModel = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('List', 'FabrikFEModel');
		$app       = Factory::getApplication();

		foreach ($ids as $id)
		{
			// Re-ini the list model (was using reset() but that was flaky)
			$listModel = Factory::getApplication()->bootComponent('com_fabrik')->getMVCFactory()->createModel('List', 'FabrikFEModel');

			// $$$ geros - http://fabrikar.com/forums/showthread.php?t=21134&page=2
			$key = 'com_' . $package . '.list' . $id . '.filter.searchall';
			$app->setUserState($key, null);
			$usage[] = memory_get_usage();

			if (count($usage) > 2)
			{
				$diff = $usage[count($usage) - 1] - $usage[count($usage) - 2];

				if ($diff + $usage[count($usage) - 1] > $memory - $memSafety)
				{
					$msg = Text::_('PLG_FABRIK_SYSTEM_SEARCH_MEMORY_LIMIT');
					$app->enqueueMessage($msg);
					break;
				}
			}

			// $$$rob set this to current table
			// Otherwise the fabrik_list_filter_all var is not used
			$input->set('listid', $id);

			$listModel->setId($id);
			$searchFields = $listModel->getSearchAllFields();

			if (empty($searchFields))
			{
				continue;
			}

			$filterModel = $listModel->getFilterModel();
			$requestKey  = $filterModel->getSearchAllRequestKey();

			// Set the request variable that fabrik uses to search all records
			$input->set($requestKey, $text, 'post');

			$table  = $listModel->getTable();
			$params = $listModel->getParams();

			/*
			 * $$$ hugh - added 4/12/2015, if user doesn't have view list and view details, no searchee
			 */
			if (!$listModel->canView() || !$listModel->canViewDetails())
			{
				continue;
			}

			// Treat J! search as boolean, we check for com_search mode in list filter model getAdvancedSearchMode()
			$params->set('search-mode-advanced', '1');

			// The table shouldn't be included in the search results or we have reached the max number of records to show.
			if (!$params->get('search_use') || $limit <= 0)
			{
				continue;
			}

			// Set the table search mode to OR - this will search ALL fields with the search term
			$params->set('search-mode', 'OR');

			/**
			 * Disable pagination limits.
			 * For now, use filter_list_max limit, just to prevent totally unconstrained queries,
			 * might add seperate config setting for global search max at some point.
			 */
			$listModel->setLimits(0, $fbConfig->get('filter_list_max', 100));

			$allRows      = $listModel->getData();
			$elementModel = $listModel->getFormModel()->getElement($params->get('search_description', $table->label), true);
			$descName     = is_object($elementModel) ? $elementModel->getFullName() : '';

			$elementModel = $listModel->getFormModel()->getElement($params->get('search_title', 0), true);
			$title        = is_object($elementModel) ? $elementModel->getFullName() : '';

			/**
			 * $$$ hugh - added date element ... always use raw, as anything that isn't in
			 * standard MySQL format will cause a fatal error in J!'s search code when it does the Date create
			 */
			$elementModel = $listModel->getFormModel()->getElement($params->get('search_date', 0), true);
			$dateElement  = is_object($elementModel) ? $elementModel->getFullName() : '';

			if (!empty($dateElement))
			{
				$dateElement .= '_raw';
			}

			$aAllowedList = array();
			$pk           = $table->db_primary_key;

			foreach ($allRows as $group)
			{
				foreach ($group as $oData)
				{
					$pkval = $oData->__pk_val;

					if ($app->isClient('administrator') || $params->get('search_link_type') === 'form')
					{
						$href = $oData->fabrik_edit_url;
					}
					else
					{
						$href = $oData->fabrik_view_url;
					}

					if (!in_array($href, $urls))
					{
						$limit--;
						if ($limit < 0)
						{
							continue;
						}
						$urls[] = $href;
						$o      = new \stdClass;

						if (isset($oData->$title))
						{
							$o->title = $headingPrefix ? $table->label . ' : ' . $oData->$title : $oData->$title;
						}
						else
						{
							$o->title = $table->label;
						}

						$o->_pkey   = $table->db_primary_key;
						$o->section = $section;
						$o->href    = $href;

						// Need to make sure it's a valid date in MySQL format, otherwise J!'s code will pitch a fatal error
						if (isset($oData->$dateElement) && \FabrikString::isMySQLDate($oData->$dateElement))
						{
							$o->created = $oData->$dateElement;
						}
						else
						{
							$o->created = '';
						}

						$o->browsernav = 2;

						if (isset($oData->$descName))
						{
							$o->text = $oData->$descName;
						}
						else
						{
							$o->text = '';
						}

						$o->title       = strip_tags($o->title);
						$o->title       = html_entity_decode($o->title);
						$aAllowedList[] = $o;
					}
				}

				$list[] = $aAllowedList;
			}
		}

		$allList = array();

		foreach ($list as $li)
		{
			if (is_array($li) && !empty($li))
			{
				$allList = array_merge($allList, $li);
			}
		}
		if ($limit < 0)
		{
			$language = Factory::getApplication()->getLanguage();
			$language->load('plg_system_fabrik', JPATH_SITE . '/plugins/system/fabrik');
			$msg = Text::_('PLG_FABRIK_SYSTEM_SEARCH_LIMIT');
			$app->enqueueMessage($msg);
		}

		return $allList;
	}

	/**
	 * If a form or details view has set a canonical link - removed any J created links
	 *
	 * @throws Exception
	 */
	public function onAfterDispatch(Event $event)
	{
		$doc     = Factory::getDocument();
		$session = Factory::getSession();
		$package = Factory::getApplication()->getUserState('com_fabrik.package', 'fabrik');

		if (isset($doc->_links) && $session->get('fabrik.clearCanonical'))
		{
			$session->clear('fabrik.clearCanonical');

			foreach ($doc->_links as $k => $link)
			{
				if ($link['relation'] == 'canonical' && !strstr($k, $package))
				{
					unset($doc->_links[$k]);
					break;
				}
			}
		}
	}

	/**
	 * Global config has been saved.
	 * Check the product key and if it exists create an update site entry
	 * Update server XML manifest generated from update/premium.php
	 *
	 * @param string          $option
	 * @param Extension $data
	 * Fabrik 4: do nothing with Fabrik Product Key here
	 */
	function onExtensionAfterSave(Event $event)
	{
		return;
	}
}
