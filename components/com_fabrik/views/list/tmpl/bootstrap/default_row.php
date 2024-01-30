<?php
/**
 * Fabrik List Template: Admin Row
 *
 * @package     Joomla
 * @subpackage  Fabrik
 * @copyright   Copyright (C) 2005-2020  Media A-Team, Inc. - All rights reserved.
 * @license     GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

// No direct access
defined('_JEXEC') or die('Restricted access');

?>
<tr id="<?php echo $this->_row->id;?>" class="<?php echo $this->_row->class;?>">
	<?php foreach ($this->headings as $heading => $label) {
		$style = empty($this->cellClass[$heading]['style']) ? '' : ' style="'.$this->cellClass[$heading]['style'].'"';
	
		/**
		* only when joined data is displayed in rowspan mode
		* and we are on the row where data should appear or 
		* in first row of new rowid where we need also link buttons etc
		* alterate approach to fabrikHide would be true or false 
		* then we get less html as td with no rowspan value would be removed
	*/		
	 	$fabrikHide = '';

		if (is_array($this->_row->data->rowspans))
		{
			if (array_key_exists($heading, $this->_row->data->rowspans) || (strstr($heading, 'fabrik_') && array_key_exists('__pk_val', $this->_row->data->rowspans))) {
				$rowspanHeading = strstr($heading, 'fabrik_') ? '__pk_val' : $heading;
				$style .= ' rowspan="'. $this->_row->data->rowspans[$rowspanHeading] .'"';
			}
			else {
				$fabrikHide = ' fabrikHide';
			}
		} 
		?> 
		<td class="<?php echo $this->cellClass[$heading]['class'] . $fabrikHide?>"<?php echo $style?>>
			<?php echo isset($this->_row->data) ? $this->_row->data->$heading : '';?>
		</td>
	<?php }?>
</tr>
