let currentCalendarField = null;
let currentCalendarDate = new Date();

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function openCalendar(fieldId) {
  currentCalendarField = fieldId;

  const hiddenInput = document.getElementById(fieldId);
  const labelMap = {
    'start-date': 'Start Date *',
    'next-billing-date': 'Next Billing Date *'
  };

  if (hiddenInput.value) {
    currentCalendarDate = new Date(hiddenInput.value);
  } else {
    currentCalendarDate = new Date();
  }

  document.getElementById('calendar-title').innerText = labelMap[fieldId] || 'Select Date';
  renderCalendar();
  showCalendar();
}

function closeCalendar() {
  hideCalendar();
}

function showCalendar() {
  const backdrop = document.getElementById('calendar-backdrop');
  const panel = document.getElementById('calendar-panel');
  const panelInner = panel.querySelector('div');

  backdrop.classList.remove('hidden');
  panel.classList.remove('hidden');

  requestAnimationFrame(function() {
    backdrop.classList.remove('opacity-0');
    if (panelInner) {
      panelInner.classList.remove('translate-y-full', 'sm:scale-95', 'opacity-0');
      panelInner.classList.add('translate-y-0', 'sm:translate-y-0', 'sm:scale-100', 'opacity-100');
    }
  });
}

function hideCalendar() {
  const backdrop = document.getElementById('calendar-backdrop');
  const panel = document.getElementById('calendar-panel');
  const panelInner = panel.querySelector('div');

  backdrop.classList.add('opacity-0');

  if (panelInner) {
    panelInner.classList.remove('translate-y-0', 'sm:translate-y-0', 'sm:scale-100', 'opacity-100');
    panelInner.classList.add('translate-y-full', 'sm:scale-95', 'opacity-0');
  }

  setTimeout(function() {
    backdrop.classList.add('hidden');
    panel.classList.add('hidden');
  }, 300);
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  const selectedDateInput = document.getElementById(currentCalendarField);
  let selectedDate = null;
  if (selectedDateInput && selectedDateInput.value) {
    selectedDate = new Date(selectedDateInput.value);
  }

  let html = '<div class="space-y-4">';

  html += '<div class="flex items-center justify-center gap-2">';
  html += '<div class="flex-1 min-w-[120px]">';
  html += '<select id="calendar-month" onchange="changeCalendarMonth()" class="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">';
  for (let i = 0; i < 12; i++) {
    html += '<option value="' + i + '"' + (i === month ? ' selected' : '') + '>' + monthNames[i] + '</option>';
  }
  html += '</select>';
  html += '</div>';

  html += '<div class="flex-1 min-w-[80px]">';
  html += '<select id="calendar-year" onchange="changeCalendarYear()" class="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">';
  for (let y = 2016; y <= 2036; y++) {
    html += '<option value="' + y + '"' + (y === year ? ' selected' : '') + '>' + y + '</option>';
  }
  html += '</select>';
  html += '</div>';
  html += '</div>';

  html += '<table class="w-full border-collapse">';
  html += '<thead><tr class="flex">';
  for (let i = 0; i < 7; i++) {
    html += '<th class="flex h-9 w-9 items-center justify-center text-xs font-normal text-slate-500">' + dayNames[i] + '</th>';
  }
  html += '</tr></thead>';
  html += '<tbody>';

  let dayCount = 1;
  let nextMonthDay = 1;

  for (let week = 0; week < 6; week++) {
    html += '<tr class="flex mt-2">';

    for (let day = 0; day < 7; day++) {
      const cellIndex = week * 7 + day;

      html += '<td class="flex h-9 w-9 items-center justify-center p-0">';

      if (cellIndex < firstDayOfWeek) {
        const prevDay = prevLastDate - firstDayOfWeek + cellIndex + 1;
        html += '<button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 opacity-50 hover:bg-slate-100" onclick="selectPrevMonthDay(' + prevDay + ')">' + prevDay + '</button>';
      } else if (dayCount <= lastDate) {
        const isSelected = selectedDate &&
                          selectedDate.getDate() === dayCount &&
                          selectedDate.getMonth() === month &&
                          selectedDate.getFullYear() === year;
        const isToday = new Date().toDateString() === new Date(year, month, dayCount).toDateString();

        let buttonClass = 'inline-flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-slate-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';

        if (isSelected) {
          buttonClass += ' bg-slate-900 text-white font-semibold hover:bg-slate-800';
        } else if (isToday) {
          buttonClass += ' border border-slate-300';
        }

        html += '<button type="button" class="' + buttonClass + '" onclick="selectDate(' + dayCount + ')">' + dayCount + '</button>';
        dayCount++;
      } else {
        html += '<button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 opacity-50 hover:bg-slate-100" onclick="selectNextMonthDay(' + nextMonthDay + ')">' + nextMonthDay + '</button>';
        nextMonthDay++;
      }

      html += '</td>';
    }

    html += '</tr>';

    if (dayCount > lastDate) break;
  }

  html += '</tbody></table>';
  html += '</div>';

  document.getElementById('calendar-content').innerHTML = html;
}

function changeCalendarMonth() {
  const monthSelect = document.getElementById('calendar-month');
  currentCalendarDate.setMonth(parseInt(monthSelect.value));
  renderCalendar();
}

function changeCalendarYear() {
  const yearSelect = document.getElementById('calendar-year');
  currentCalendarDate.setFullYear(parseInt(yearSelect.value));
  renderCalendar();
}

function selectDate(day) {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const selectedDate = new Date(year, month, day);

  setDateValue(selectedDate);
  closeCalendar();
}

function selectPrevMonthDay(day) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
  currentCalendarDate.setDate(day);
  const selectedDate = new Date(currentCalendarDate);
  setDateValue(selectedDate);
  closeCalendar();
}

function selectNextMonthDay(day) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
  currentCalendarDate.setDate(day);
  const selectedDate = new Date(currentCalendarDate);
  setDateValue(selectedDate);
  closeCalendar();
}

function setDateValue(date) {
  const hiddenInput = document.getElementById(currentCalendarField);
  const button = document.getElementById(currentCalendarField + '-button');
  const display = document.getElementById(currentCalendarField + '-display');

  const dateString = date.toISOString().split('T')[0];
  hiddenInput.value = dateString;

  const monthName = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  display.innerText = monthName.substring(0, 3) + ' ' + day + ', ' + year;
  display.classList.remove('text-slate-400');
  display.classList.add('text-slate-900');

  if (hiddenInput.onchange) {
    hiddenInput.onchange();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const calendarBackdrop = document.getElementById('calendar-backdrop');
  const calendarPanel = document.getElementById('calendar-panel');
  const calendarPanelInner = calendarPanel ? calendarPanel.querySelector('div') : null;

  if (calendarBackdrop) calendarBackdrop.addEventListener('click', closeCalendar);
  if (calendarPanel) {
    calendarPanel.addEventListener('click', closeCalendar);
    if (calendarPanelInner) calendarPanelInner.addEventListener('click', function(e) { e.stopPropagation(); });
  }
});
