let currentViewDate = new Date();

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendarView() {
  const subs = getSubscriptions();
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  document.getElementById('calendar-month-title').innerText = `${monthNames[month]} ${year}`;
  document.getElementById('calendar-sidebar-month').innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const subsWithSchedule = subs.filter(sub => sub.schedule && sub.schedule.enabled && sub.schedule.nextBillingDate);

  const subscriptionsByDate = {};
  subsWithSchedule.forEach(sub => {
    const billingDate = new Date(sub.schedule.nextBillingDate);
    if (billingDate.getFullYear() === year && billingDate.getMonth() === month) {
      const day = billingDate.getDate();
      if (!subscriptionsByDate[day]) {
        subscriptionsByDate[day] = [];
      }
      subscriptionsByDate[day].push(sub);
    }
  });

  let html = '';
  let dayCount = 1;
  let nextMonthDay = 1;
  let totalWeeks = Math.ceil((firstDayOfWeek + lastDate) / 7);

  for (let week = 0; week < totalWeeks; week++) {
    html += '<div class="grid grid-cols-7">';

    for (let day = 0; day < 7; day++) {
      const cellIndex = week * 7 + day;

      if (cellIndex < firstDayOfWeek) {
        const prevDay = prevLastDate - firstDayOfWeek + cellIndex + 1;
        html += `
          <div class="min-h-28 border-r border-b p-2 last:border-r-0 transition-colors" style="background-color: rgb(148 163 184 / 0.1); color: rgb(148 163 184);">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-medium">${prevDay}</span>
            </div>
          </div>
        `;
      } else if (dayCount <= lastDate) {
        const isToday = isCurrentMonth && dayCount === todayDate;
        const subsOnDay = subscriptionsByDate[dayCount] || [];

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        const currentDayDate = new Date(year, month, dayCount);
        const isUpcoming = currentDayDate > today && currentDayDate <= sevenDaysFromNow;

        let cellClass = 'min-h-28 border-r border-b p-2 last:border-r-0 transition-colors';
        if (isToday) {
          cellClass += ' bg-indigo-50/60';
        }

        const todayIndicator = isToday ? '<span class="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-600"></span>' : '';

        let dotsHtml = '';
        if (subsOnDay.length > 0) {
          const displaySubs = subsOnDay.slice(0, 5);
          dotsHtml = '<div class="mt-2 flex flex-wrap items-center gap-1">';
          displaySubs.forEach(sub => {
            const color = isUpcoming ? '#f59e0b' : (sub.schedule.status === 'Trial' ? '#ef4444' : '#10b981');
            dotsHtml += `<div title="${sub.name}" class="h-2 w-2 rounded-full" style="background-color: ${color};"></div>`;
          });
          if (subsOnDay.length > 5) {
            dotsHtml += `<span class="text-[10px] text-slate-500 font-medium">+${subsOnDay.length - 5}</span>`;
          }
          dotsHtml += '</div>';
        }

        const clickHandler = subsOnDay.length > 0 ? `onclick="showDayDetails(${dayCount}, ${month}, ${year})"` : '';
        const cursorClass = subsOnDay.length > 0 ? 'cursor-pointer hover:bg-slate-50' : '';

        html += `
          <div class="${cellClass} ${cursorClass}" ${clickHandler}>
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-medium">${dayCount}${todayIndicator}</span>
            </div>
            ${dotsHtml}
          </div>
        `;

        dayCount++;
      } else {
        html += `
          <div class="min-h-28 border-r border-b p-2 last:border-r-0 transition-colors" style="background-color: rgb(148 163 184 / 0.1); color: rgb(148 163 184);">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-medium">${nextMonthDay}</span>
            </div>
          </div>
        `;
        nextMonthDay++;
      }
    }

    html += '</div>';
  }

  document.getElementById('calendar-grid').innerHTML = html;

  updateCalendarStats(subsWithSchedule, year, month);
}

function updateCalendarStats(subsWithSchedule, year, month) {
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  let totalSpending = 0;
  let billingEventsCount = 0;
  let upcomingCount = 0;

  subsWithSchedule.forEach(sub => {
    const billingDate = new Date(sub.schedule.nextBillingDate);

    if (billingDate.getFullYear() === year && billingDate.getMonth() === month) {
      billingEventsCount++;

      const monthlyCost = parseFloat(sub.cost) || 0;
      totalSpending += monthlyCost;

      if (billingDate > today && billingDate <= sevenDaysFromNow) {
        upcomingCount++;
      }
    }
  });

  document.getElementById('calendar-total-spending').innerText = `$${totalSpending.toFixed(2)}`;
  document.getElementById('calendar-billing-events').innerText = billingEventsCount;
  document.getElementById('calendar-upcoming').innerText = upcomingCount;
}

function previousMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  renderCalendarView();
}

function nextMonth() {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  renderCalendarView();
}

function goToToday() {
  currentViewDate = new Date();
  renderCalendarView();
}

function showDayDetails(day, month, year) {
  const subs = getSubscriptions();
  const subsOnDay = subs.filter(sub => {
    if (!sub.schedule || !sub.schedule.enabled || !sub.schedule.nextBillingDate) return false;
    const billingDate = new Date(sub.schedule.nextBillingDate);
    return billingDate.getFullYear() === year &&
           billingDate.getMonth() === month &&
           billingDate.getDate() === day;
  });

  if (subsOnDay.length === 0) return;

  const monthName = monthNames[month];
  let html = `
    <div class="space-y-3">
      <div class="text-center border-b border-slate-100 pb-3">
        <h4 class="text-lg font-bold text-slate-900">${monthName} ${day}, ${year}</h4>
        <p class="text-sm text-slate-500 mt-1">${subsOnDay.length} subscription${subsOnDay.length > 1 ? 's' : ''}</p>
      </div>
  `;

  subsOnDay.forEach(sub => {
    const cost = parseFloat(sub.cost) || 0;
    const status = sub.schedule.status || 'Active';
    const statusColors = {
      'Active': 'bg-emerald-100 text-emerald-700',
      'Trial': 'bg-amber-100 text-amber-700',
      'Paused': 'bg-slate-100 text-slate-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    const statusClass = statusColors[status] || statusColors['Active'];

    html += `
      <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
        <div class="flex-1">
          <div class="font-semibold text-slate-900">${sub.name}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs px-2 py-0.5 rounded-full ${statusClass} font-medium">${status}</span>
            <span class="text-xs text-slate-500">${sub.billing}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="font-bold text-slate-900">$${cost.toFixed(2)}</div>
        </div>
      </div>
    `;
  });

  html += '</div>';

  const modalHtml = `
    <div id="day-details-backdrop" class="fixed inset-0 z-50 bg-slate-900/30 opacity-0 backdrop-blur-sm transition-opacity duration-300"></div>
    <div id="day-details-panel" class="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div class="pointer-events-auto flex max-h-[90vh] w-full translate-y-full transform flex-col overflow-hidden rounded-t-3xl bg-white opacity-0 shadow-2xl transition-all duration-300 sm:max-w-md sm:translate-y-10 sm:scale-95 sm:rounded-3xl">
        <div class="mt-4 flex justify-center sm:hidden">
          <div class="h-1.5 w-24 rounded-full bg-slate-200"></div>
        </div>
        <div class="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 p-5 backdrop-blur">
          <h3 class="text-lg font-bold text-slate-900">Billing Details</h3>
          <button onclick="closeDayDetails()" class="rounded-full bg-slate-100 p-2 text-slate-400 transition-colors hover:text-slate-600">
            <span class="iconify h-5 w-5" data-icon="ph:x-bold"></span>
          </button>
        </div>
        <div class="overflow-y-auto bg-white p-5" style="max-height: 70vh;">
          ${html}
        </div>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  document.body.appendChild(tempDiv);

  requestAnimationFrame(() => {
    const backdrop = document.getElementById('day-details-backdrop');
    const panel = document.getElementById('day-details-panel').querySelector('div');
    backdrop.classList.remove('opacity-0');
    panel.classList.remove('translate-y-full', 'sm:translate-y-10', 'sm:scale-95', 'opacity-0');
    panel.classList.add('translate-y-0', 'sm:translate-y-0', 'sm:scale-100', 'opacity-100');
  });

  document.getElementById('day-details-backdrop').addEventListener('click', closeDayDetails);
}

function closeDayDetails() {
  const backdrop = document.getElementById('day-details-backdrop');
  const panel = document.getElementById('day-details-panel').querySelector('div');

  if (!backdrop || !panel) return;

  backdrop.classList.add('opacity-0');
  panel.classList.remove('translate-y-0', 'sm:translate-y-0', 'sm:scale-100', 'opacity-100');
  panel.classList.add('translate-y-full', 'sm:translate-y-10', 'sm:scale-95', 'opacity-0');

  setTimeout(() => {
    backdrop.parentElement.remove();
  }, 300);
}
