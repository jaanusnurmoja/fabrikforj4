/**
 * Admin Ace Editor Setup
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

function initAceEditor({
    editorId,
    theme,
    mode,
    fieldId,
    maxHeight,
    minHeight,
}) {
    const field = document.getElementById(fieldId);
    const fbEditor = ace.edit(editorId);

    fbEditor.setTheme(`ace/theme/${theme}`);
    fbEditor.getSession().setMode(JSON.parse(mode));
    fbEditor.setValue(field.value);
    fbEditor.navigateFileStart();
    fbEditor.setAnimatedScroll(true);
    fbEditor.setBehavioursEnabled(true);
    fbEditor.setDisplayIndentGuides(true);
    fbEditor.setHighlightGutterLine(true);
    fbEditor.setHighlightSelectedWord(true);
    fbEditor.setShowFoldWidgets(true);
    fbEditor.setWrapBehavioursEnabled(true);
    fbEditor.getSession().setUseWrapMode(true);
    fbEditor.getSession().setTabSize(2);

    fbEditor.on("blur", function () {
        if (field.value !== fbEditor.getValue()) {
            field.value = fbEditor.getValue();
            field.dispatchEvent(new Event("change"));
        }
        field.dispatchEvent(new Event("blur"));
    });

    const maxlines = Math.floor((maxHeight - 2) / fbEditor.renderer.lineHeight);

    const updateHeight = () => {
        const session = fbEditor.getSession();
        const renderer = fbEditor.renderer;
        const lineCount = session.getScreenLength();
        let height =
            (lineCount > maxlines ? maxlines : lineCount) * renderer.lineHeight +
            (renderer.$horizScroll ? renderer.scrollBar.getWidth() : 0) + 2;
        height = height < minHeight ? minHeight : height;

        const container = document.getElementById(`${editorId}-aceContainer`);
        if (container && container.style.height !== `${height}px`) {
            container.style.height = `${height}px`;
            fbEditor.resize();
        }
    };

    updateHeight();
    fbEditor.getSession().on("change", updateHeight);

}
