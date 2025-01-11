/**
 * PickList Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbplgelementelement"; 
//import * as Sortables from "@sortablejs";

export class FbPicklist extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('fabrikpicklist');
        if (this.options.allowadd === true) {
            this.watchAddToggle();
            this.watchAdd();
        }
        this.makeSortable();
    }

    /**
     * Initialize the sortable object
     */
    makeSortable() {
        if (this.options.editable) {
            const c = this.getContainer();
            const from = c.querySelector('.fromList');
            const to = c.querySelector('.toList');
            const dropcolour = window.getComputedStyle(from).backgroundColor;

            this.sortable = new Sortables([from, to], {
                clone: true,
                revert: true,
                opacity: 0.7,
                hovercolor: this.options.bghovercolour,
                onComplete: (element) => {
                    this.setData();
                    this.showNotices(element);
                    this.fadeOut(from, dropcolour);
                    this.fadeOut(to, dropcolour);
                },
                onSort: (element, clone) => {
                    this.showNotices(element, clone);
                },
                onStart: (element, clone) => {
                    this.sortable.drag.addEvent('onEnter', (element, droppable) => {
                        if (this.sortable.lists.includes(droppable)) {
                            this.fadeOut(droppable, this.sortable.options.hovercolor);
                            if (this.sortable.lists.includes(this.sortable.drag.overed)) {
                                this.sortable.drag.overed.addEventListener('mouseleave', () => {
                                    this.fadeOut(from, dropcolour);
                                    this.fadeOut(to, dropcolour);
                                });
                            }
                        }
                    });
                }
            });

            const notices = [
                from.querySelector('li.emptypicklist'),
                to.querySelector('li.emptypicklist')
            ];
            this.sortable.removeItems(notices);
            this.showNotices();
        }
    }

    fadeOut(droppable, colour) {
        droppable.style.transition = 'background-color 600ms';
        droppable.style.backgroundColor = colour;
    }

    /**
     * Show empty notices
     * @param {HTMLElement} element - Li being dragged
     */
    showNotices(element = null, clone = null) {
        const c = this.getContainer();
        const lists = [c.querySelector('.fromList'), c.querySelector('.toList')];

        lists.forEach((list) => {
            const notice = list.querySelector('li.emptypicklist');
            const lis = list.querySelectorAll('li');
            const limit = (list === element || !element) ? 1 : 2;
            lis.length > limit ? notice.style.display = 'none' : notice.style.display = '';
        });
    }

    setData() {
        const c = this.getContainer();
        const to = c.querySelector('.toList');
        const lis = Array.from(to.querySelectorAll('li:not(.emptypicklist)'));
        const values = lis.map((item) =>
            item.id.replace(`${this.options.element}_value_`, '')
        );
        this.element.value = JSON.stringify(values);
    }

    watchAdd() {
        const c = this.getContainer();
        const to = c.querySelector('.toList');
        const btn = c.querySelector('input[type=button]');

        if (!btn) return;

        btn.addEventListener('click', (e) => {
            const valueInput = c.querySelector('input[name=addPicklistValue]');
            const labelInput = c.querySelector('input[name=addPicklistLabel]');
            const label = labelInput.value;
            const val = valueInput ? valueInput.value : label;

            if (!val || !label) {
                alert(Joomla.JText._('PLG_ELEMENT_PICKLIST_ENTER_VALUE_LABEL'));
                return;
            }

            const li = document.createElement('li');
            li.className = 'picklist';
            li.id = `${this.element.id}_value_${val}`;
            li.textContent = label;

            to.appendChild(li);
            this.sortable.addItems(li);

            e.preventDefault();
            if (valueInput) valueInput.value = '';
            labelInput.value = '';
            this.setData();
            this.addNewOption(val, label);
            this.showNotices();
        });
    }

    unclonableProperties() {
        return ['form', 'sortable'];
    }

    watchAddToggle() {
        const c = this.getContainer();
        let d = c.querySelector('div.addoption');
        const a = c.querySelector('.toggle-addoption');

        if (this.mySlider) {
            const clone = d.cloneNode(true);
            const fe = c.querySelector('.fabrikElement');
            d.parentNode.remove();
            fe.appendChild(clone);
            d = c.querySelector('div.addoption');
        }

        this.mySlider = new Fx.Slide(d, { duration: 500 });
        this.mySlider.hide();

        a.addEventListener('click', (e) => {
            e.preventDefault();
            this.mySlider.toggle();
        });
    }

    cloned(c) {
        delete this.sortable;
        if (this.options.allowadd === true) {
            this.watchAddToggle();
            this.watchAdd();
        }
        this.makeSortable();
        super.cloned(c);
    }
}

window.FbPicklist = FbPicklist;