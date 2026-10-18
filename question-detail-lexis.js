/* Per-question detail lexis. Keep each term attached to the exact question it supports. */
(function () {
  'use strict';
  if (window.IELTSQuestionDetailLexisReady) return;
  window.IELTSQuestionDetailLexisReady = true;

  var DATA = [
    {
      part: 'p1',
      title: 'Advertisements',
      question: 'What kinds of advertisements do you watch?',
      terms: [
        {en: 'in-feed advertisements', zh: '描述穿插在短视频信息流里的广告'},
        {en: 'sponsored posts', zh: '描述社交平台或短视频平台上的赞助内容'}
      ]
    },
    {
      part: 'p1',
      title: 'Advertisements',
      question: 'Where can you see advertisements?',
      terms: [
        {en: 'in-feed advertisements', zh: '描述穿插在短视频信息流里的广告'},
        {en: 'sponsored posts', zh: '描述社交平台或短视频平台上的赞助内容'}
      ]
    },
    {
      part: 'p1',
      title: 'Advertisements',
      question: 'Do you watch advertisements from the beginning to the end?',
      terms: [
        {en: 'skip past adverts', zh: '描述刷手机时快速划走广告'}
      ]
    },
    {
      part: 'p1',
      title: 'Advertisements',
      question: 'Do you often see advertisements when you are on your phone or computer?',
      terms: [
        {en: 'in-feed advertisements', zh: '描述穿插在短视频信息流里的广告'},
        {en: 'targeted advertising', zh: '描述根据用户兴趣推送的广告'},
        {en: 'skip past adverts', zh: '描述刷手机时快速划走广告'}
      ]
    }
  ];

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
    return '<div class="detailLexis ' + (className || '') + '"><div class="detailLexisTitle">本题细节词</div>'
      + terms.map(function (term) {
        return '<span><b>' + esc(term.en) + '</b><em>' + esc(term.zh) + '</em></span>';
      }).join('') + '</div>';
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
  css.textContent = '.detailLexis{margin:8px 0 10px;padding:9px 10px;border:1px solid #c7d9ec;border-radius:9px;background:#eef6ff;color:#324b67}.detailLexisTitle{font-size:12px;font-weight:700;color:#2456a6;margin-bottom:5px}.detailLexis span{display:block;font-size:12.5px;line-height:1.5;margin:3px 0}.detailLexis b{color:#2456a6}.detailLexis em{font-style:normal;color:#5d7085}.practiceDetailLexis{margin:10px 0 4px}';
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
})();
