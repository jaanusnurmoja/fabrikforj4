/**
 * Calc Element Forms
 *
 * @copyright: Copyright (C) 2005-2013, fabrikar.com - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from "@fbelement"; 
import { Fabrik } from "@fbfabrik"; 

export class FbPlgElementCalc extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.setPlugin('FbPlgElementCalc');
        this.observeGroupIds = [];
    }

    attachedToForm(cloning) {
        if (this.options.ajax) {
            this.options.observe.forEach((o) => {
                this.addObserveEvent(o);
            });

            if (cloning === undefined && this.options.calcOnLoad) {
                this.calc();
            } else if (cloning === true && (this.options.calcOnRepeat || this.options.calcOnLoad)) {
                this.calc();
            }

            Fabrik.addEvent('fabrik.cdd.update', (el) => {
                if (el.hasSubElements() && this.options.observe.includes(el.baseElementId)) {
                    this.addObserveEvent(el.baseElementId);
                }
            });
        }

        Fabrik.addEvent('fabrik.form.group.duplicate.end', (form, event, groupId) => {
            if (this.observeGroupIds.includes(groupId)) {
                this.calc();
            }
        });

        Fabrik.addEvent('fabrik.form.group.delete.end', (form, event, groupId) => {
            if (this.observeGroupIds.includes(groupId)) {
                this.calc();
            }
        });

        super.attachedToForm();
    }

    addObserveEvent(o) {
        if (o === '') return;

        if (this.form.formElements[o]) {
            this.form.formElements[o].addNewEventAux(
                this.form.formElements[o].getChangeEvent(),
                (e) => this.calc(e)
            );
        } else if (this.options.canRepeat) {
            const o2 = `${o}_${this.options.repeatCounter}`;
            if (this.form.formElements[o2]) {
                this.form.formElements[o2].addNewEventAux(
                    this.form.formElements[o2].getChangeEvent(),
                    (e) => this.calc(e)
                );
            }
        } else {
            Object.entries(this.form.repeatGroupMarkers).forEach(([k, v]) => {
                for (let v2 = 0; v2 < v; v2++) {
                    const o2 = `${o}_${v2}`;
                    if (this.form.formElements[o2]) {
                        this.form.formElements[o2].addNewEvent(
                            this.form.formElements[o2].getChangeEvent(),
                            (e) => this.calc(e)
                        );

                        if (!this.observeGroupIds.includes(k)) {
                            this.observeGroupIds.push(k);
                        }
                    }
                }
            });
        }
    }

    calc() {
        const formData = this.form.getFormElementData();

        Object.entries(this.form.getFormData(false)).forEach(([k, v]) => {
            if (/\[\d+\]$/.test(k) || /^fabrik_vars/.test(k)) {
                formData[k] = v;
            }
        });

        const data = {
            ...formData,
            option: 'com_fabrik',
            format: 'raw',
            task: 'plugin.pluginAjax',
            plugin: 'calc',
            method: 'ajax_calc',
            element_id: this.options.id,
            formid: this.form.id,
            repeatCounter: this.options.repeatCounter
        };

        Fabrik.loader.start(this.element.closest('.form-group'), Joomla.JText._('COM_FABRIK_LOADING'));

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => response.text())
            .then((responseText) => {
                Fabrik.loader.stop(this.element.closest('.form-group'));
                this.update(responseText);
                if (this.options.validations) {
                    this.form.doElementValidation(this.options.element);
                }
                this.element.dispatchEvent(new Event('change', { bubbles: true }));
                Fabrik.fireEvent('fabrik.calc.update', [this, responseText]);
            })
            .catch((error) => console.error('Error:', error));
    }

    cloned(c) {
        super.cloned(c);
        this.attachedToForm(true);
    }

    update(val) {
        if (this.getElement()) {
            this.element.innerHTML = val;
            this.options.value = val;
        }
    }

    getValue() {
        return this.element ? this.options.value : false;
    }
}

window.FbPlgElementCalc = FbPlgElementCalc;
