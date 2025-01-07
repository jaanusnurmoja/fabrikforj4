/**
 * Password Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
import { FbElement } from "@fbelement"; 
import { Fabrik } from "@fbfabrik";

export class FbPassword extends FbElement {
    constructor(element, options) {
        super(element, options);
        this.options = {
            progressbar: false,
            ...options,
        };

        if (!this.options.editable) {
            return;
        }
        this.init();
    }

    init() {
        if (this.element) {
            this.element.addEventListener('keyup', (e) => this.passwordChanged(e));
        }

        if (this.options.ajax_validation === true) {
            this.getConfirmationField().addEventListener('blur', (e) => this.callValidation(e));
        }

        if (this.getConfirmationField().value === '') {
            this.getConfirmationField().value = this.element.value;
        }

        Fabrik.addEvent('fabrik.form.doelementfx', (form, method, id, groupfx) => {
            if (form === this.form && id === this.strElement) {
                const confirmationField = this.getConfirmationField();
                switch (method) {
                    case 'disable':
                        jQuery(confirmationField).prop('disabled', true);
                        break;
                    case 'enable':
                        jQuery(confirmationField).prop('disabled', false);
                        break;
                    case 'readonly':
                        jQuery(confirmationField).prop('readonly', true);
                        break;
                    case 'notreadonly':
                        jQuery(confirmationField).prop('readonly', false);
                        break;
                }
            }
        });
    }

    callValidation(e) {
        this.form.doElementValidation(e, false, '_check');
    }

    cloned(c) {
        console.log('cloned');
        super.cloned(c);
        this.init();
    }

    passwordChanged() {
        const strength = this.getContainer().querySelector('.strength');
        if (!strength) {
            return;
        }

        const strongRegex = new RegExp("^(?=.{6,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
        const mediumRegex = new RegExp("^(?=.{6,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
        const enoughRegex = new RegExp("(?=.{6,}).*", "g");
        const pwd = this.element;
        let html = '';

        if (!this.options.progressbar) {
            if (!enoughRegex.test(pwd.value)) {
                html = `<span>${Joomla.JText._('PLG_ELEMENT_PASSWORD_MORE_CHARACTERS')}</span>`;
            } else if (strongRegex.test(pwd.value)) {
                html = `<span style="color:green">${Joomla.JText._('PLG_ELEMENT_PASSWORD_STRONG')}</span>`;
            } else if (mediumRegex.test(pwd.value)) {
                html = `<span style="color:orange">${Joomla.JText._('PLG_ELEMENT_PASSWORD_MEDIUM')}</span>`;
            } else {
                html = `<span style="color:red">${Joomla.JText._('PLG_ELEMENT_PASSWORD_WEAK')}</span>`;
            }
            strength.innerHTML = html;
        } else {
            let tipTitle = '', newBar;

            if (strongRegex.test(pwd.value)) {
                tipTitle = Joomla.JText._('PLG_ELEMENT_PASSWORD_STRONG');
                newBar = jQuery(Fabrik.jLayouts['fabrik-progress-bar-strong']);
            } else if (mediumRegex.test(pwd.value)) {
                tipTitle = Joomla.JText._('PLG_ELEMENT_PASSWORD_MEDIUM');
                newBar = jQuery(Fabrik.jLayouts['fabrik-progress-bar-medium']);
            } else if (enoughRegex.test(pwd.value)) {
                tipTitle = Joomla.JText._('PLG_ELEMENT_PASSWORD_WEAK');
                newBar = jQuery(Fabrik.jLayouts['fabrik-progress-bar-weak']);
            } else {
                tipTitle = Joomla.JText._('PLG_ELEMENT_PASSWORD_MORE_CHARACTERS');
                newBar = jQuery(Fabrik.jLayouts['fabrik-progress-bar-more']);
            }

            const options = { title: tipTitle };
            jQuery(newBar).tooltip(options);
            jQuery(strength).replaceWith(newBar);
        }
    }

    getConfirmationField() {
        return this.getContainer().querySelector('input[name*=check]');
    }
}

window.FbPassword = FbPassword;