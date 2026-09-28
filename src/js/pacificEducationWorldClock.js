/* Pacific Education — World Clock & World Date
 * Pilot feature: automatic, read-only time/date display for every dashboard.
 * Country time is location/time-zone based; countries with multiple zones show multiple clocks.
 * No manual time/date entry. Exact user location is never displayed by this feature.
 */
(function(window, document) {
  'use strict';

  var VERSION = '1.0.0';
  var LOCATIONS = [
    ['Fiji', 'Pacific/Fiji'],
    ['New Zealand', 'Pacific/Auckland'],
    ['Australia — Sydney', 'Australia/Sydney'],
    ['Papua New Guinea', 'Pacific/Port_Moresby'],
    ['Samoa', 'Pacific/Apia'],
    ['Tonga', 'Pacific/Tongatapu'],
    ['Japan', 'Asia/Tokyo'],
    ['India', 'Asia/Kolkata'],
    ['Iran', 'Asia/Tehran'],
    ['Brazil — Brasília', 'America/Sao_Paulo'],
    ['United Kingdom', 'Europe/London'],
    ['United States — New York', 'America/New_York'],
    ['United States — Los Angeles', 'America/Los_Angeles']
  ];

  function format(location, zone) {
    var now = new Date();
    var time = new Intl.DateTimeFormat(undefined, {
      timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(now);
    var date = new Intl.DateTimeFormat(undefined, {
      timeZone: zone, weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    }).format(now);
    var zoneName = new Intl.DateTimeFormat(undefined, { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(now).filter(function(p) { return p.type === 'timeZoneName'; })[0].value;
    return { location: location, zone: zone, time: time, date: date, zoneName: zoneName };
  }

  function ensurePanel(host, dashboardName) {
    if (!host || host.querySelector('.pacificEducationWorldClock')) return;
    var section = document.createElement('section');
    section.className = 'pacificEducationWorldClock';
    section.setAttribute('aria-label', dashboardName + ' World Clock and World Date');
    section.innerHTML = '<h3>World Clock &amp; World Date</h3>' +
      '<p>Automatic live time and date. No manual entry.</p>' +
      '<div class="pacificEducationWorldClockGrid"></div>';
    host.appendChild(section);
  }

  function render() {
    var targets = [
      ['teacherDashboard', 'Teacher Dashboard'],
      ['parentDashboard', 'Parent Dashboard'],
      ['studentDashboard', 'Student Dashboard'],
      ['professionalDashboard', 'Professional Dashboard'],
      ['pacificEducationTeacherClassDashboard', 'Teacher Class Dashboard'],
      ['pacificEducationStudentProgressDashboard', 'Student Progress Dashboard']
    ];
    targets.forEach(function(item) {
      var host = document.getElementById(item[0]);
      if (!host) return;
      ensurePanel(host, item[1]);
      var grid = host.querySelector('.pacificEducationWorldClockGrid');
      if (!grid) return;
      grid.innerHTML = '';
      LOCATIONS.forEach(function(item) {
        var value;
        try { value = format(item[0], item[1]); } catch (e) { return; }
        var card = document.createElement('div');
        card.style.cssText = 'border:1px solid #ccc;border-radius:6px;padding:8px;margin:4px;display:inline-block;min-width:180px;';
        card.innerHTML = '<strong>' + value.location + '</strong><br>' +
          '<span>' + value.time + ' (' + value.zoneName + ')</span><br>' +
          '<span>' + value.date + '</span><br><small>' + value.zone + '</small>';
        grid.appendChild(card);
      });
    });
  }

  function start() {
    render();
    window.setInterval(render, 1000);
  }

  window.PacificEducationWorldClock = Object.freeze({
    version: VERSION,
    locations: LOCATIONS.slice(),
    render: render
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window, document);
