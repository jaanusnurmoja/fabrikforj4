/**
 * Admin SwapList Editor
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

class SwapList {
  constructor(from, to, addbutton, removebutton, upbutton, downbutton) {
    this.from = document.getElementById(from);
    this.to = document.getElementById(to);

    if (document.getElementById(addbutton)) {
      document.getElementById(addbutton).addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('jform__createGroup0').checked = true;
        this.addSelectedToList(this.from, this.to);
        this.delSelectedFromList(this.from);
      });

      document.getElementById(removebutton).addEventListener('click', (e) => {
        e.preventDefault();
        this.addSelectedToList(this.to, this.from);
        this.delSelectedFromList(this.to);
      });

      document.getElementById(upbutton).addEventListener('click', (e) => {
        e.preventDefault();
        this.moveInList(-1);
      });

      document.getElementById(downbutton).addEventListener('click', (e) => {
        e.preventDefault();
        this.moveInList(1);
      });

      document.getElementById('adminForm').onsubmit = () => {
        Array.from(this.to.options).forEach((opt) => {
          opt.selected = true;
        });
        return true;
      };
    }
  }

  addSelectedToList(from, to) {
    const targetValues = Array.from(to.options).map((option) => option.value);

    Array.from(from.options).forEach((option) => {
      if (option.selected && !targetValues.includes(option.value)) {
        const newOption = new Option(option.text, option.value);
        to.add(newOption);
      }
    });
  }

  delSelectedFromList(from) {
    Array.from(from.options)
      .filter((option) => option.selected)
      .forEach((option) => {
        from.removeChild(option);
      });
  }

  moveInList(direction) {
    const selectedIndex = this.to.selectedIndex;
    const totalOptions = this.to.options.length;

    if (selectedIndex === -1 || 
        (direction === 1 && selectedIndex === totalOptions - 1) || 
        (direction === -1 && selectedIndex === 0)) {
      return false;
    }

    const options = Array.from(this.to.options);
    const swapIndex = selectedIndex + direction;

    // Swap the options
    [options[selectedIndex].text, options[swapIndex].text] = 
      [options[swapIndex].text, options[selectedIndex].text];
    [options[selectedIndex].value, options[swapIndex].value] = 
      [options[swapIndex].value, options[selectedIndex].value];

    // Update the select element
    this.to.options[selectedIndex].selected = false;
    this.to.options[swapIndex].selected = true;

    this.to.focus();
  }
}
