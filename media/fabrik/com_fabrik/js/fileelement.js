/**
 * File Element Module
 * Contains methods used by any element that manipulates files/folders.
 */

 export class FbFileElement {
    constructor(element, options) {
        this.element = element;
        this.options = options;
        this.folderlist = [];
    }

    /**
     * Initialize the AJAX folder functionality.
     */
    ajaxFolder() {
        if (!this.element) {
            return;
        }

        const el = this.element.closest('.fabrikElement');
        this.breadcrumbs = el.querySelector('.breadcrumbs');
        this.folderdiv = el.querySelector('.folderselect');

        // Hide the folder div initially
        this.folderdiv.style.display = 'none';
        this.hiddenField = el.querySelector('.folderpath');

        // Add toggle event listener
        el.querySelector('.toggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.folderdiv.style.display = this.folderdiv.style.display === 'none' ? 'block' : 'none';
        });

        this.watchAjaxFolderLinks();
    }

    /**
     * Watch for clicks on folder and breadcrumb links.
     */
    watchAjaxFolderLinks() {
        this.folderdiv.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.browseFolders(link);
            });
        });

        this.breadcrumbs.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.useBreadcrumbs(link);
            });
        });
    }

    /**
     * A folder in the folder list has been clicked. Add to breadcrumbs and send AJAX request to update the folder list.
     * @param {HTMLElement} link The clicked folder link.
     */
    browseFolders(link) {
        this.folderlist.push(link.textContent);
        const dir = this.options.dir + this.folderlist.join(this.options.ds);
        this.addCrumb(link.textContent);
        this.doAjaxBrowse(dir);
    }

    /**
     * Update the breadcrumb list.
     * @param {HTMLElement} link The breadcrumb link to update to.
     */
    useBreadcrumbs(link) {
        const depth = parseInt(link.className.replace('crumb', ''), 10) || 0;

        this.folderlist = Array.from(this.breadcrumbs.querySelectorAll('a'))
            .slice(0, depth + 1)
            .map((crumb) => crumb.textContent);

        // Clear and recreate breadcrumbs
        const homeCrumbs = Array.from(this.breadcrumbs.children).slice(0, 2);
        this.breadcrumbs.innerHTML = '';
        homeCrumbs.forEach((child) => this.breadcrumbs.appendChild(child));

        this.folderlist.forEach((crumbText) => this.addCrumb(crumbText));

        const dir = this.options.dir + this.folderlist.join(this.options.ds);
        this.doAjaxBrowse(dir);
    }

    /**
     * Send an AJAX request to get an array of folders. Append to folder list if found.
     * @param {string} dir Directory to search in.
     */
    async doAjaxBrowse(dir) {
        try {
            const response = await fetch('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dir,
                    option: 'com_fabrik',
                    format: 'raw',
                    task: 'plugin.pluginAjax',
                    plugin: 'fileupload',
                    method: 'ajax_getFolders',
                    element_id: this.options.id,
                }),
            });

            const result = await response.json();
            this.folderdiv.innerHTML = '';

            result.forEach((folder) => {
                const li = document.createElement('li');
                li.className = 'fileupload_folder';
                li.innerHTML = `<a href="#">${folder}</a>`;
                this.folderdiv.appendChild(li);
            });

            this.folderdiv.style.display = result.length === 0 ? 'none' : 'block';
            this.watchAjaxFolderLinks();

            this.hiddenField.value = `/${this.folderlist.join('/')}/`;
            this.fireEvent('onBrowse');
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    }

    /**
     * Add a breadcrumb for the given text.
     * @param {string} text The text for the breadcrumb.
     */
    addCrumb(text) {
        const crumbLink = document.createElement('a');
        crumbLink.href = '#';
        crumbLink.className = `crumb${this.folderlist.length}`;
        crumbLink.textContent = text;

        const separator = document.createElement('span');
        separator.textContent = ' / ';

        this.breadcrumbs.appendChild(crumbLink);
        this.breadcrumbs.appendChild(separator);
    }

    /**
     * Fire a custom event.
     * @param {string} eventName The name of the event to fire.
     */
    fireEvent(eventName) {
        const event = new Event(eventName);
        this.element.dispatchEvent(event);
    }
}

window.FbFileElement = FbFileElement;