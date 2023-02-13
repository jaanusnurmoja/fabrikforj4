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

       
        if (array_key_exists('code', $params) === false) {
            /* we must have some code to deal with */
            return null;
        }
        
        $params['className'] = self::getClassName($params);
        if (empty($params['className'])) {
            // Something went wrong!
            return true;
        }
        
        ob_start();
        $newClass = new $params['className'];
        $result = $newClass->execute();
        $output = ob_get_contents();
        ob_end_clean();
        
        if (!empty($result)) {
            return $result;
        }
        
        return $output;
    }
    
    
    private static function createFunctionInMemory($string) 
    {
        $file_name = getmypid() . '_' . md5($string);
        
        $tmp_path = Factory::getApplication()->get('tmp_path', JPATH_ROOT . '/tmp');
        $temp_file = $tmp_path . '/fabrik' . '/' . $file_name;
        
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
    
    private static function generateClassContents($params)
     {
        /* Process any $thisVars */
        $thisVars = $params['thisVars'] ?? [];
        $privateThisVars = [];
        $initThisVars = [];
        foreach($thisVars as $thisVarName => $thisvarSource) {
            $privateThisVars[] = "private $thisVarName;";
            $initThisVars[] = "self::$thisVarName = &$thisvarSource"
        }

        if (count($thisVars)) {
            array_unshift($initThisVars, "public function __construct() {");
            $initThisVars[] = "};";
        }

        /* Process basic vars */
        $vars = $params['vars'] ?? [];
        $initBasicVars = [];
        foreach($vars as $varName => $varSource) {
            $initBasicVars = "$varName = &varSource";
        }

        $contents = [
            '<?php',                            /* Opening stuff  */
            'defined(\'_JEXEC\') or die;',
            'class '.$params['className'].'{',            /* Define the class */
            implode("\n", $privateThisVars),    /* Include any $thisVars definitions */
            'function doExecute(',              /* Our new function */
            implode(",", $initBasicVars),       /* Insert our basic variables */
            ') {',                              /* Close off the function call */
            $params['code'] . ';'                       /* Now the actual code */
        ];
        /* If there are thisVars, we need to add the construct function to initialize them */
        if (count($thisVars)) {
            $contents = array_merge($contents, $initThisVars);
        }
        
        $contents[] = "};";     /* And close off the class */

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
    
    private static function getClassName($params) 
    {
        $params['className'] = 'FabrikEvalClass_' . md5($params['code']);
        
        if (class_exists($params['className'])) {
            return $params['className'];
        }

        $contents = self::generateFileContents($params);
        self::createFunctionInMemory($contents);
        
        if (!class_exists($params['className'])) {
            // Something went wrong!
            return false;
        }
        
        return $className;
    }
}