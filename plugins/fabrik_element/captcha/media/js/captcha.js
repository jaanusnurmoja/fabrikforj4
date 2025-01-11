/**
 * Captcha Element
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

import { FbElement } from '@fbelement';

export class FbPlgElementCaptcha extends FbElement {
    constructor(element, options) {
        super(element, options);
        if (options.method === 'invisible') {
            window.fabrikCaptureLoaded = () => {
                this.widgetId = grecaptcha.render(this.options.element, {
                    sitekey: this.options.siteKey,
                    size: 'invisible',
                    callback: this.captureCompleted.bind(this),
                });
            };

            // Load the reCAPTCHA script dynamically
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?onload=fabrikCaptureLoaded&render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    captureCompleted(response) {
        window.fabrikCaptchaSubmitCallBack(true);
        delete window.fabrikCaptchaSubmitCallBack;
    }

    /**
     * Called from FbFormSubmit
     *
     * @param {Function} cb Callback function to run when the element is in an acceptable state for the form processing to continue
     */
    onsubmit(cb) {
        if (typeof cb === 'undefined') {
            return;
        }

        if (this.options.method === 'invisible') {
            if (!grecaptcha.getResponse()) {
                window.fabrikCaptchaSubmitCallBack = cb;
                grecaptcha.execute(this.widgetId);
            }
        } else {
            super.onsubmit(cb);
        }
    }
}

window.FbPlgElementCaptcha = FbPlgElementCaptcha;
