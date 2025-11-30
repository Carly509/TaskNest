class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateTodayEvents();
    }

    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => this.prevMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        document.getElementById('addEventBtn').addEventListener('click', () => this.openAddEventModal());
        
        document.getElementById('eventForm').addEventListener('submit', (e) => this.saveEvent(e));
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') this.closeModal();
        });

        document.getElementById('calendarDays').addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (dayElement) {
                const day = parseInt(dayElement.dataset.day);
                const month = this.currentDate.getMonth();
                const year = this.currentDate.getFullYear();
                this.selectedDate = new Date(year, month, day);
                this.openEditEventModal();
            }
        });
    }

    render() {
        this.renderHeader();
        this.renderDays();
    }

    renderHeader() {
        const monthYear = document.getElementById('monthYear');
        monthYear.textContent = this.currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    }

    renderDays() {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.dataset.day = date.getDate();

            if (date.getMonth() !== this.currentDate.getMonth()) {
                dayElement.classList.add('other-month');
            }

            if (this.isToday(date)) {
                dayElement.classList.add('today');
            }

            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();
            dayElement.appendChild(dayNumber);

            const events = this.getEventsForDate(date);
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'events';

            events.slice(0, 3).forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.title = event.title;
                eventElement.textContent = event.title;
                eventsContainer.appendChild(eventElement);
            });

            if (events.length > 3) {
                const moreElement = document.createElement('div');
                moreElement.className = 'event';
                moreElement.textContent = `+${events.length - 3} more`;
                eventsContainer.appendChild(moreElement);
            }

            dayElement.appendChild(eventsContainer);
            calendarDays.appendChild(dayElement);
        }
    }

    getEventsForDate(date) {
        const dateKey = date.toISOString().split('T')[0];
        return this.events[dateKey] || [];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
        this.updateTodayEvents();
    }

    updateTodayEvents() {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        const events = this.events[todayKey] || [];
        const todayEvents = document.getElementById('todayEvents');
        
        todayEvents.innerHTML = events.length ? 
            events.map(event => `
                <div class="event-item">
                    <h4>${event.title}</h4>
                    <div class="time">${new Date(event.dateTime).toLocaleString()}</div>
                    <p>${event.description || ''}</p>
                </div>
            `).join('') : 
            '<p style="color: #a0aec0; text-align: center; padding: 2rem;">No events today. Add one above!</p>';
    }

    openAddEventModal() {
        document.getElementById('modalTitle').textContent = 'Add Event';
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDateTime').value = '';
        document.getElementById('eventDescription').value = '';
        document.getElementById('deleteEventBtn').style.display = 'none';
        document.getElementById('eventDateTime').min = new Date().toISOString().slice(0, 16);
        this.showModal();
    }

    openEditEventModal() {
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventDateTime').min = this.selectedDate.toISOString().slice(0, 16);
        document.getElementById('eventDateTime').value = this.selectedDate.toISOString().slice(0, 16);
        
        const dateKey = this.selectedDate.toISOString().split('T')[0];
        const events = this.events[dateKey] || [];
        
        if (events.length > 0) {
            const event = events[0];
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDescription').value = event.description;
            document.getElementById('deleteEventBtn').style.display = 'block';
            document.getElementById('deleteEventBtn').onclick = () => this.deleteEvent(dateKey, 0);
        } else {
            document.getElementById('deleteEventBtn').style.display = 'none';
        }
        
        this.showModal();
    }

    saveEvent(e) {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value;
        const dateTime = document.getElementById('eventDateTime').value;
        const description = document.getElementById('eventDescription').value;
        
        const dateKey = dateTime.slice(0, 10);
        if (!this.events[dateKey]) this.events[dateKey] = [];
        
        this.events[dateKey].push({
            title,
            dateTime,
            description
        });
        
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        this.render();
        this.updateTodayEvents();
        this.closeModal();
    }

    deleteEvent(dateKey, index) {
        if (this.events[dateKey]) {
            this.events[dateKey].splice(index, 1);
            if (this.events[dateKey].length === 0) {
                delete this.events[dateKey];
            }
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
            this.render();
            this.updateTodayEvents();
            this.closeModal();
        }
    }

    showModal() {
        document.getElementById('eventModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('eventModal').style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});
