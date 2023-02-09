<?php
    /**
     * @package         Regular Labs Library
     * @version         22.10.1331
     *
     * @author          Peter van Westen <info@regularlabs.com>
     * @link            http://regularlabs.com
     * @copyright       Copyright © 2022 Regular Labs All Rights Reserved
     * @license         http://www.gnu.org/licenses/gpl-2.0.html GNU/GPL
     */
    
    /**
     * This is a derivative of the Php class from Peter van Weston at Regular Labs,
     * it is highly modified for Fabrik's needs but the underlying
     * architecture is copyright Peter van Westen. The following applies to
     * the derivations.
     *
     * @package     Joomla
     * @subpackage  Fabrik
     * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
     * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
     */
    
    namespace Fabrik\Helpers;
    
    use Joomla\CMS\Factory;
    use Joomla\CMS\Version;
    use Joomla\CMS\Document\Document;
    use Joomla\CMS\Filesystem\File;
    
    class Php
    {
        
        
        public static function Eval($params = [])
        {
            if (empty($params)) {
                return null;
            }
            
            $codeString = "";
            
            if (array_key_exists('file', $params)) {
                /* We have a php file to include */
                /* It should be first in the code string */
            }
            
            if (array_key_exists('code', $params)) {
                /* we have an eval code block */
                $codeString .= $params['code'];
            }
            
            /* There has to be some code or why are we here */
            if (empty($codeString)) {
                return null;
            }
            
            $function_name = self::getFunctionName($codeString);
            if (!$function_name) {
                // Something went wrong!
                return true;
            }
            
            ob_start();
            $result = $function_name($params['vars'] ?? []);
            $output = ob_get_contents();
            ob_end_clean();
            
            if ($params['singleReturn'] ?? false) {
                return $result;
            }
            
            if (!is_array($output)) {
                return $output;
            }
            
            return $output;
        }
        
        public
        static function getApplication()
        {
            if (Factory::getApplication()->input->get('option', '') != 'com_finder') {
                return Factory::getApplication();
            }
            
            return Factory::getApplication()->getInstance('site');
        }
        
        public
        static function getDocument()
        {
            if (Factory::getApplication()->input->get('option', '') != 'com_finder') {
                return Document::getInstance();
            }
            
            $lang = Factory::getLanguage();
            $version = new Version;
            
            $attributes = [
                'charset' => 'utf-8',
                'lineend' => 'unix',
                'tab' => "\t",
                'language' => $lang->getTag(),
                'direction' => $lang->isRtl() ? 'rtl' : 'ltr',
                'mediaversion' => $version->getMediaVersion(),
            ];
            
            return Document::getInstance('html', $attributes);
        }
        
        private
        static function createFunctionInMemory(
            $string
        ) {
            $file_name = getmypid() . '_' . md5($string);
            
            $tmp_path = Factory::getApplication()->get('tmp_path', JPATH_ROOT . '/tmp');
            $temp_file = $tmp_path . '/regularlabs' . '/' . $file_name;
            
            // Write file
            if (!file_exists($temp_file) || is_writable($temp_file)) {
                File::write($temp_file, $string);
            }
            
            // Include file
            include_once $temp_file;
            
            // Delete file
            if (!Factory::getApplication()->get('debug')) {
                @chmod($temp_file, 0777);
                @unlink($temp_file);
            }
        }
        
        private
        static function generateFileContents(
            $function_name = 'rl_function',
            $string = ''
        ) {
            $init_variables = self::getVarInits();
            
            $init_variables[] =
                'if (is_array($rl_variables)) {'
                . 'foreach ($rl_variables as $rl_key => $rl_value) {'
                . '${$rl_key} = $rl_value;'
                . '}'
                . '}';
            
            $contents = [
                '<?php',
                'defined(\'_JEXEC\') or die;',
                'function ' . $function_name . '($rl_variables){',
                implode("\n", $init_variables),
                $string . ';',
                'return get_defined_vars();',
                ';}',
            ];
            
            $contents = implode("\n", $contents);
            
            // Remove Zero Width spaces / (non-)joiners
            $contents = str_replace(
                [
                    "\xE2\x80\x8B",
                    "\xE2\x80\x8C",
                    "\xE2\x80\x8D",
                ],
                '',
                $contents
            );
            
            return $contents;
        }
        
        private
        static function getFunctionName(
            $string
        ) {
            $function_name = 'regularlabs_php_' . md5($string);
            
            if (function_exists($function_name)) {
                return $function_name;
            }
            
            $contents = self::generateFileContents($function_name, $string);
            self::createFunctionInMemory($contents);
            
            if (!function_exists($function_name)) {
                // Something went wrong!
                return false;
            }
            
            return $function_name;
        }
        
        private
        static function getVarInits()
        {
            return [
                '$app = $mainframe = Fabrik\Helpers\Php::getApplication();',
                '$document = $doc = Fabrik\Helpers\Php::getDocument();',
                '$database = $db = Joomla\CMS\Factory::getDbo();',
                '$user = $app->getIdentity() ?: Joomla\CMS\Factory::getUser();',
                '$Itemid = $app->input->getInt(\'Itemid\');',
            ];
        }
        
        private
        static function prepareString(
            &$string
        ) {
            $string = trim($string);
            $string = str_replace('?><?php', '', $string . '<?php ;');
            
            if (substr($string, 0, 5) !== '<?php') {
                $string = '?>' . $string;
                
                return;
            }
            
            $string = substr($string, 5);
        }
    }