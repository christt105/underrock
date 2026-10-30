/**
 * Paged.js splits paragraphs at the exact overflow point and ignores `widows` and `orphans`.
 * When it breaks inside a hyphenated word the rest of the paragraph reflows and can lose a line,
 * so such a break counts one line fewer after it.
 * This hook moves the break earlier so that at least MIN_LINES lines of a paragraph or list
 * item stay on each side of a page break. A block too short to split moves whole, together with
 * the headings right before it, so it doesn't leave them alone at the bottom of the page.
 */
(function () {
	var MIN_LINES = 2;

	function closestBlock(node, rendered) {
		var el = node.nodeType === 1 ? node : node.parentElement;
		while (el && el !== rendered) {
			if (el.tagName === "P" || el.tagName === "LI") return el;
			el = el.parentElement;
		}
		return null;
	}

	function characters(block) {
		var chars = [];
		var walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
		var range = document.createRange();
		for (var node = walker.nextNode(); node; node = walker.nextNode()) {
			for (var i = 0; i < node.data.length; i++) {
				if (/\s/.test(node.data[i])) continue;
				range.setStart(node, i);
				range.setEnd(node, i + 1);
				var rect = range.getBoundingClientRect();
				if (rect.height > 0) chars.push({ node: node, offset: i, top: rect.top });
			}
		}
		return chars;
	}

	function lineStarts(chars, tolerance) {
		var starts = [];
		var lineTop = -Infinity;
		for (var i = 0; i < chars.length; i++) {
			if (Math.abs(chars[i].top - lineTop) > tolerance) {
				starts.push(i);
				lineTop = chars[i].top;
			}
		}
		return starts;
	}

	function charIndexAt(chars, node, offset) {
		for (var i = 0; i < chars.length; i++) {
			var position = chars[i].node.compareDocumentPosition(node);
			if (chars[i].node === node ? chars[i].offset >= offset : position & Node.DOCUMENT_POSITION_PRECEDING) return i;
		}
		return chars.length;
	}

	function withLeadingHeadings(block) {
		var first = block;
		var previous = block.previousElementSibling;
		while (previous && /^H[1-6]$/.test(previous.tagName)) {
			first = previous;
			previous = previous.previousElementSibling;
		}
		return first;
	}

	function hasContentBefore(block, rendered) {
		var range = document.createRange();
		range.setStart(rendered, 0);
		range.setEndBefore(block);
		return range.toString().trim() !== "";
	}

	window.PagedPolyfill.chunker.hooks.onOverflow.register(function (overflow, rendered) {
		if (!overflow || overflow.startContainer.nodeType !== Node.TEXT_NODE) return undefined;
		var block = closestBlock(overflow.startContainer, rendered);
		if (!block) return undefined;

		var chars = characters(block);
		var lineHeight = parseFloat(getComputedStyle(block).lineHeight) || 16;
		var starts = lineStarts(chars, lineHeight / 2);
		var breakChar = charIndexAt(chars, overflow.startContainer, overflow.startOffset);
		var breakLine = 0;
		while (breakLine + 1 < starts.length && starts[breakLine + 1] <= breakChar) breakLine++;

		var linesBefore = breakLine;
		var midWord = breakChar !== starts[breakLine];
		var linesAfter = starts.length - breakLine - (midWord ? 1 : 0);
		if (linesBefore === 0) return undefined;
		var newLine = linesAfter < MIN_LINES ? breakLine - (MIN_LINES - linesAfter) : breakLine;
		if (newLine === breakLine && linesBefore >= MIN_LINES) return undefined;

		var moved = document.createRange();
		moved.setEnd(overflow.endContainer, overflow.endOffset);
		if (newLine >= MIN_LINES) {
			var start = chars[starts[newLine]];
			moved.setStart(start.node, start.offset);
		} else if (hasContentBefore(withLeadingHeadings(block), rendered)) {
			moved.setStartBefore(withLeadingHeadings(block));
		} else {
			return undefined;
		}
		return moved;
	});
})();
