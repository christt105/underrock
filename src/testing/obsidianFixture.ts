import { longDocument } from "./sampleContent";

/** Hand-written approximation of what Obsidian's reading view renders for `docs/sample-note.md`, after cleanup. */
export const OBSIDIAN_FIXTURE = `
<h1 id="underrock-sample-note" data-heading="Underrock sample note">Underrock sample note</h1>
<p>A paragraph with <strong>bold</strong>, <em>italic</em>, <del>strikethrough</del>, <mark>highlight</mark>, <code>inline code</code>, a <a class="external-link" href="https://obsidian.md">link</a>, a link to <a class="internal-link" href="#tables">a section below</a>, a link to Another note and a #tag. Inline math: <span class="math math-inline">e<sup>iπ</sup> + 1 = 0</span>.<sup class="footnote-ref"><a href="#fn-1" class="footnote-link">[1]</a></sup></p>
<h2 id="math" data-heading="Math">Math</h2>
<div class="math math-block">∫ e<sup>−x²</sup> dx = √π</div>
<h2 id="lists" data-heading="Lists">Lists</h2>
<ul><li>First item</li><li>Second item<ul><li>Nested item</li></ul></li></ul>
<ol><li>One</li><li>Two</li></ol>
<ul class="contains-task-list"><li class="task-list-item" data-task=""><input type="checkbox" class="task-list-item-checkbox">An open task</li><li class="task-list-item is-checked" data-task="x"><input type="checkbox" class="task-list-item-checkbox" checked>A finished task</li></ul>
<h2 id="tables" data-heading="Tables">Tables</h2>
<table><thead><tr><th>Engine</th><th>Platform</th><th>Output</th></tr></thead><tbody><tr><td>HTML + Paged.js</td><td>Desktop</td><td>Vector PDF</td></tr><tr><td>Typst</td><td>Desktop and mobile</td><td>Vector PDF</td></tr></tbody></table>
<h2 id="code" data-heading="Code">Code</h2>
<pre class="language-ts underrock-short"><code class="language-ts is-loaded"><span class="token keyword">export</span> <span class="token keyword">function</span> <span class="token function">greet</span><span class="token punctuation">(</span>name<span class="token operator">:</span> <span class="token builtin">string</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token builtin">string</span> <span class="token punctuation">{</span>
	<span class="token keyword">return</span> <span class="token template-string"><span class="token string">\`Hello, \${name}!\`</span></span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre>
<h2 id="callouts" data-heading="Callouts">Callouts</h2>
<div data-callout-metadata="" data-callout-fold="" data-callout="note" class="callout"><div class="callout-title"><div class="callout-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg></div><div class="callout-title-inner">A note</div></div><div class="callout-content"><p>Callouts keep their colour and title.</p></div></div>
<div data-callout-metadata="" data-callout-fold="-" data-callout="warning" class="callout is-collapsible is-collapsed"><div class="callout-title"><div class="callout-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path></svg></div><div class="callout-title-inner">Folded callout</div><div class="callout-fold is-collapsed"></div></div><div class="callout-content" style="display: none;"><p>Folded callouts are expanded in the PDF.</p></div></div>
<blockquote><p>A plain quote.</p></blockquote>
${longDocument(12)}
<hr>
<section class="footnotes"><ol><li data-footnote-id="fn-1" id="fn-1"><p>A footnote.</p></li></ol></section>
`;
