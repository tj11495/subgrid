let currentViewDate = new Date();

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendarView() {
  console.log('renderCalendarView called');
  const subs = getSubscriptions();
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  console.log('Year:', year, 'Month:', month);

  const titleElement = document.getElementById('calendar-month-title');
  const sidebarElement = document.getElementById('calendar-sidebar-month');

  if (titleElement) titleElement.innerText = `${monthNames[month]} ${year}`;
  if (sidebarElement) sidebarElement.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  console.log('First day of week:', firstDayOfWeek, 'Last date:', lastDate);

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
          <div class="h-32 border-r border-b border-slate-200 p-3 bg-slate-50/50">
            <div class="text-sm font-semibold text-slate-300">${prevDay}</div>
          </div>
        `;
      } else if (dayCount <= lastDate) {
        const isToday = isCurrentMonth && dayCount === todayDate;
        const subsOnDay = subscriptionsByDate[dayCount] || [];

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        const currentDayDate = new Date(year, month, dayCount);
        const isUpcoming = currentDayDate > today && currentDayDate <= sevenDaysFromNow;

        let bgClass = 'bg-white';
        if (isToday) {
          bgClass = 'bg-blue-50/60';
        }

        const clickHandler = subsOnDay.length > 0 ? `onclick="showDayDetails(${dayCount}, ${month}, ${year})"` : '';
        const cursorClass = subsOnDay.length > 0 ? 'cursor-pointer hover:bg-slate-50 hover:shadow-sm' : '';

        let dayBadge = '';
        if (isToday) {
          dayBadge = '<span class="ml-1.5 inline-flex items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">Today</span>';
        }

        let subsHtml = '';
        if (subsOnDay.length > 0) {
          const displaySubs = subsOnDay.slice(0, 2);
          subsHtml = '<div class="mt-2 space-y-1.5">';
          displaySubs.forEach(sub => {
            let bgColor, textColor, borderColor;

            if (isUpcoming) {
              bgColor = 'bg-amber-50';
              textColor = 'text-amber-900';
              borderColor = 'border-amber-200';
            } else if (sub.schedule.status === 'Trial') {
              bgColor = 'bg-red-50';
              textColor = 'text-red-900';
              borderColor = 'border-red-200';
            } else if (sub.schedule.status === 'Paused') {
              bgColor = 'bg-slate-50';
              textColor = 'text-slate-700';
              borderColor = 'border-slate-200';
            } else {
              bgColor = 'bg-emerald-50';
              textColor = 'text-emerald-900';
              borderColor = 'border-emerald-200';
            }

            const subName = sub.name.length > 12 ? sub.name.substring(0, 12) + '...' : sub.name;
            subsHtml += `<div class="flex items-center gap-1.5 rounded-lg border ${borderColor} ${bgColor} px-2 py-1 text-[10px] font-semibold ${textColor}">
              <span class="truncate">${subName}</span>
            </div>`;
          });
          if (subsOnDay.length > 2) {
            subsHtml += `<div class="text-[10px] font-medium text-slate-500 pl-2">+${subsOnDay.length - 2} more</div>`;
          }
          subsHtml += '</div>';
        }

        html += `
          <div class="h-32 border-r border-b border-slate-200 p-3 ${bgClass} ${cursorClass} transition-all" ${clickHandler}>
            <div class="flex items-center">
              <span class="text-sm font-bold text-slate-900">${dayCount}</span>
              ${dayBadge}
            </div>
            ${subsHtml}
          </div>
        `;

        dayCount++;
      } else {
        html += `
          <div class="h-32 border-r border-b border-slate-200 p-3 bg-slate-50/50">
            <div class="text-sm font-semibold text-slate-300">${nextMonthDay}</div>
          </div>
        `;
        nextMonthDay++;
      }
    }

    html += '</div>';
  }

  const gridElement = document.getElementById('calendar-grid');
  console.log('Calendar grid element:', gridElement);
  console.log('HTML length:', html.length);

  if (gridElement) {
    gridElement.innerHTML = html;
    console.log('Calendar grid updated');
  } else {
    console.error('calendar-grid element not found!');
  }

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

  let totalCost = 0;
  subsOnDay.forEach(sub => {
    totalCost += toMonthly(sub);
  });

  let html = `
    <div class="space-y-4">
      <div class="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 border border-blue-100">
        <div class="text-center">
          <div class="text-sm font-medium text-blue-700 uppercase tracking-wide">${monthName} ${day}, ${year}</div>
          <div class="mt-2 text-4xl font-black text-blue-900">${formatCurrency(totalCost)}</div>
          <div class="mt-1 text-xs text-blue-600">${subsOnDay.length} subscription${subsOnDay.length > 1 ? 's' : ''} charging</div>
        </div>
      </div>

      <div class="space-y-3">
  `;

  subsOnDay.forEach(sub => {
    const monthlyCost = toMonthly(sub);
    const status = sub.schedule.status || 'Active';
    const statusColors = {
      'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Trial': 'bg-red-100 text-red-700 border-red-200',
      'Paused': 'bg-slate-100 text-slate-700 border-slate-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    const statusClass = statusColors[status] || statusColors['Active'];

    const statusIcons = {
      'Active': 'ph:check-circle-bold',
      'Trial': 'ph:clock-bold',
      'Paused': 'ph:pause-circle-bold',
      'Cancelled': 'ph:x-circle-bold'
    };
    const statusIcon = statusIcons[status] || statusIcons['Active'];

    html += `
      <div class="rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 text-base truncate">${sub.name}</div>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${statusClass} font-semibold border">
                <span class="iconify h-3 w-3" data-icon="${statusIcon}"></span>
                ${status}
              </span>
              <span class="text-xs text-slate-500">${sub.cycle}</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-slate-900">${formatCurrency(monthlyCost)}</div>
            <div class="text-xs text-slate-500 mt-1">/month</div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div></div>';

  const modalHtml = `
    <div id="day-details-backdrop" class="fixed inset-0 z-50 bg-slate-900/40 opacity-0 backdrop-blur-sm transition-opacity duration-300"></div>
    <div id="day-details-panel" class="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div class="pointer-events-auto flex max-h-[90vh] w-full translate-y-full transform flex-col overflow-hidden rounded-t-3xl bg-white opacity-0 shadow-2xl transition-all duration-300 sm:max-w-lg sm:translate-y-10 sm:scale-95 sm:rounded-3xl">
        <div class="mt-4 flex justify-center sm:hidden">
          <div class="h-1.5 w-24 rounded-full bg-slate-200"></div>
        </div>
        <div class="flex shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100/50 p-6 backdrop-blur">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <span class="iconify h-5 w-5 text-white" data-icon="ph:calendar-bold"></span>
            </div>
            <h3 class="text-xl font-bold text-slate-900">Billing Details</h3>
          </div>
          <button onclick="closeDayDetails()" class="rounded-xl bg-white border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95">
            <span class="iconify h-5 w-5" data-icon="ph:x-bold"></span>
          </button>
        </div>
        <div class="overflow-y-auto bg-slate-50 p-6" style="max-height: 70vh;">
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
