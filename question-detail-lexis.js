/* Per-question detail lexis. Keep each term attached to the exact question it supports. */
(function () {
  'use strict';
  if (window.IELTSQuestionDetailLexisReady) return;
  window.IELTSQuestionDetailLexisReady = true;

  /* Generated from local corrected homework records; see export_grading_lexis.py. */
  var DATA = window.IELTSQuestionDetailLexis || [];

  function normal(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function esc(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];
    });
  }

  var lookup = new Map();
  DATA.forEach(function (item) {
    lookup.set([item.part, normal(item.title), normal(item.question)].join('|'), item.terms);
  });

  function find(part, title, question) {
    return lookup.get([part, normal(title), normal(question)].join('|')) || [];
  }

  function cardTitle(card) {
    var el = card.querySelector('.ptitle');
    if (!el) return '';
    var clone = el.cloneNode(true);
    clone.querySelectorAll('.badge').forEach(function (badge) { badge.remove(); });
    return normal(clone.textContent);
  }

  function html(terms, className) {
    if (!terms.length) return '';
    var visible = terms.slice(0, 6);
    var rest = terms.slice(6);
    function termHtml(term) {
      return '<span><b>' + esc(term.en) + '</b><em>' + esc(term.zh) + '</em></span>';
    }
    return '<div class="detailLexis ' + (className || '') + '"><div class="detailLexisTitle">本题批改语料 · '
      + terms.length + ' 条</div><div class="detailLexisList">' + visible.map(termHtml).join('') + '</div>'
      + (rest.length ? '<details class="detailLexisMore"><summary>展开其余 ' + rest.length + ' 条</summary>'
        + '<div class="detailLexisList">' + rest.map(termHtml).join('') + '</div></details>' : '')
      + '</div>';
  }

  function injectBrowse() {
    document.querySelectorAll('#list .detailLexis').forEach(function (el) { el.remove(); });
    document.querySelectorAll('#list .card').forEach(function (card) {
      var title = cardTitle(card);
      var cue = card.querySelector('.cue');
      if (cue) {
        var cueTerms = find('p2', title, cue.textContent);
        if (cueTerms.length) cue.insertAdjacentHTML('afterend', html(cueTerms, 'browseDetailLexis'));
        return;
      }
      card.querySelectorAll('.qrow').forEach(function (row) {
        var text = row.querySelector('.qtxt');
        if (!text) return;
        var clone = text.cloneNode(true);
        clone.querySelectorAll('.zhs').forEach(function (el) { el.remove(); });
        var question = normal(clone.textContent);
        var terms = find('p1', title, question).concat(find('p3', title, question));
        if (terms.length) row.insertAdjacentHTML('afterend', html(terms, 'browseDetailLexis'));
      });
    });
  }

  function injectPractice() {
    if (!window.PG || !window.PCUR) return;
    var card = document.querySelector('#list .card');
    if (!card) return;
    card.querySelectorAll('.practiceDetailLexis').forEach(function (el) { el.remove(); });
    var terms = find(window.PG.part, window.PG.title, window.PCUR.t);
    if (!terms.length) return;
    var anchor = card.querySelector('.phead') || card.firstElementChild;
    if (anchor) anchor.insertAdjacentHTML('afterend', html(terms, 'practiceDetailLexis'));
  }

  var css = document.createElement('style');
  css.textContent = '.detailLexis{margin:8px 0 10px;padding:9px 10px;border:1px solid #c7d9ec;border-radius:9px;background:#eef6ff;color:#324b67}.detailLexisTitle{font-size:12px;font-weight:700;color:#2456a6;margin-bottom:5px}.detailLexis span{display:block;font-size:12.5px;line-height:1.5;margin:3px 0}.detailLexis b{color:#2456a6}.detailLexis em{font-style:normal;color:#5d7085}.detailLexisMore{margin-top:5px}.detailLexisMore summary{cursor:pointer;font-size:12px;color:#2456a6}.detailLexisMore .detailLexisList{padding-top:4px}.practiceDetailLexis{margin:10px 0 4px}';
  document.head.appendChild(css);

  var oldBrowse = window.renderBrowse;
  if (typeof oldBrowse === 'function') {
    window.renderBrowse = function () {
      var result = oldBrowse.apply(this, arguments);
      injectBrowse();
      return result;
    };
  }

  var oldRenderQ = window.renderQ;
  if (typeof oldRenderQ === 'function') {
    window.renderQ = function () {
      var result = oldRenderQ.apply(this, arguments);
      injectPractice();
      return result;
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBrowse, {once: true});
  } else {
    injectBrowse();
  }

  /* Other page modules can replace renderBrowse after this script loads. */
  var list = document.getElementById('list');
  if (list && window.MutationObserver) {
    new MutationObserver(function () {
      if (!list.querySelector('.detailLexis')) window.setTimeout(injectBrowse, 0);
    }).observe(list, {childList: true});
  }
})();
