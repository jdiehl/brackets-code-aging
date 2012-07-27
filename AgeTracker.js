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

	var MAX_AGE = 5;

	function _classForAge(age) {
		switch (age) {
		case undefined:
			return "age6";
		case 0:
			return null;
		default:
			return "age" + age;
		}
	}

	/* AgeTracker Class */
	function AgeTracker(editor) {
		this.onChange = this.onChange.bind(this);
		this.editor = editor;
		$(this.editor).on("change", this.onChange);
		this.load();
	}

	AgeTracker.prototype = {

		// set the age of a line by updating the age counter and the editor appearance
		setLineAge: function (line, age) {
			if (this.age[line] !== age) {
				this.age[line] = age;
				this.editor._codeMirror.setLineClass(line, _classForAge(age));
				this.save();
			}
		},

		// increment the age of all lines
		incLineAges: function () {
			var lineCount = this.editor.lineCount();
			for (var line = 0; line < lineCount; line++) {
				if (this.age[line] === MAX_AGE) {
					delete this.age[line];
				} else if (this.age[line] !== undefined) {
					this.age[line]++;
				}
			}
			this.save();
		},

		// reset the age of the edited line
		onChange: function (event, editor, change) {
			this.setLineAge(change.from.line, 0);
			if (change.next) {
				this.onChange(event, editor, change.next);
			}
		},

		update: function () {
			var self = this;
			this.editor._codeMirror.operation(function () {
				var lineCount = self.editor.lineCount();
				for (var line = 0; line < lineCount; line++) {
					self.editor._codeMirror.setLineClass(line, _classForAge(self.age[line]));
				}
			});
		},

		storageKey: function (extra) {
			return "age:" + this.editor.document.file.fullPath + extra;
		},

		load: function () {
			var ageString = window.localStorage.getItem(this.storageKey());
			if (ageString) {
				this.age = JSON.parse(ageString);
				var ts = window.localStorage.getItem(this.storageKey("ts"));
				if (new Date().getTime() - ts > 86400) {
					this.incLineAges();
				}
			} else {
				this.age = {};
			}
			this.update();
		},

		save: function () {
			window.localStorage.setItem(this.storageKey(), JSON.stringify(this.age));
			window.localStorage.setItem(this.storageKey("ts"), new Date().getTime());
		},

		remove: function () {
			$(this.editor).off("change", this.onChange);
			var self = this;
			this.editor._codeMirror.operation(function () {
				var lineCount = self.editor.lineCount();
				for (var line = 0; line < lineCount; line++) {
					self.editor._codeMirror.setLineClass(line, null);
				}
			});
		}
	};

	module.exports = AgeTracker;
});
