/**
 * Copyright (C) 2011 Jonathan Diehl
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * https://github.com/jdiehl/brackets-code-aging
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global window, define, brackets, $ */

define(function (require, exports, module) {
	'use strict';

	// Brackets modules
	var EditorManager   = brackets.getModule("editor/EditorManager"),
		DocumentManager = brackets.getModule("document/DocumentManager"),
		AppInit         = brackets.getModule("utils/AppInit");

	var AgeTracker = require("AgeTracker");

	var $link;
	var tracker;

	function loadCSS() {
		$link = $("<link rel='stylesheet' type='text/css'>")
			.attr("href", require.toUrl("code-aging.css"))
			.appendTo(window.document.head);
	}

	function onCurrentDocumentChange() {
		var editor = EditorManager.getCurrentFullEditor();
		if (editor) {
			tracker = new AgeTracker(editor);
		}
	}

	function init() {
		loadCSS();
		$(DocumentManager).on("currentDocumentChange", onCurrentDocumentChange);
		AppInit.appReady(onCurrentDocumentChange);
	}

	function unload() {
		$link.remove();
		$(DocumentManager).off("currentDocumentChange", onCurrentDocumentChange);
		if (tracker) {
			tracker.remove();
		}
	}

	$(init);

	exports.init = init;
	exports.unload = unload;
});
