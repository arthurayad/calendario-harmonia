let allEventos = [];
let currentFilter = 'Todas';

const categoryColors = {
    'Estadual': '#1e3a52',
    'Ritualística': '#4a7c59',
    'Entretenimento': '#d4a574',
    'Pública': '#4a9b8e',
    'Feriado': '#e74c3c',
    'Sem Atividade': '#2c3e50'
};

const categoryCssClasses = {
    'Estadual': 'estadual',
    'Ritualística': 'ritualistica',
    'Entretenimento': 'entretenimento',
    'Pública': 'publica',
    'Feriado': 'feriado',
    'Sem Atividade': 'sematividade'
};

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupFilterButtons();
});

async function loadData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        allEventos = data.eventos || [];
        
        // Atualizar informações de contato e logo
        if (data.config) {
            document.getElementById('local-info').textContent = data.config.local || 'Rua José Pereira Liberato, 1178';
            document.getElementById('contact-info').textContent = data.config.contact || '(47) 99286-0936 (Arthur Ayad)';
            
            // Atualizar logo se disponível
            if (data.config.logo) {
                const logoImg = document.querySelector('.logo');
                if (logoImg) {
                    logoImg.src = data.config.logo;
                }
            }
        }
        
        renderCalendars();
        renderEventsList();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderEventsList();
        });
    });
}

function getFilteredEventos() {
    if (currentFilter === 'Todas') {
        return allEventos;
    }
    return allEventos.filter(e => e.categoria === currentFilter);
}

function renderEventsList() {
    const container = document.getElementById('eventos-container');
    container.innerHTML = '';
    
    const filtered = getFilteredEventos();
    const grouped = groupEventosByMonth(filtered);
    
    // Ordenar meses
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthKeys = Object.keys(grouped).sort((a, b) => meses.indexOf(a) - meses.indexOf(b));
    
    monthKeys.forEach(month => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-group';
        
        const monthTitle = document.createElement('h3');
        monthTitle.className = 'month-title';
        monthTitle.textContent = month;
        monthDiv.appendChild(monthTitle);
        
        grouped[month].forEach(evento => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            
            const date = new Date(evento.data);
            const day = date.getDate();
            
            const dateBox = document.createElement('div');
            dateBox.className = 'event-date-box';
            dateBox.textContent = day;
            dateBox.style.backgroundColor = categoryColors[evento.categoria] || '#999';
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'event-details';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'event-title';
            titleDiv.textContent = evento.titulo;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'event-category';
            categoryDiv.textContent = evento.categoria;
            
            const timeDiv = document.createElement('div');
            timeDiv.className = 'event-time';
            timeDiv.textContent = evento.hora || 'Horário não definido';
            
            const locationDiv = document.createElement('div');
            locationDiv.className = 'event-location';
            locationDiv.textContent = evento.local || 'Local não definido';
            
            detailsDiv.appendChild(titleDiv);
            detailsDiv.appendChild(categoryDiv);
            detailsDiv.appendChild(timeDiv);
            detailsDiv.appendChild(locationDiv);
            
            eventDiv.appendChild(dateBox);
            eventDiv.appendChild(detailsDiv);
            
            monthDiv.appendChild(eventDiv);
        });
        
        container.appendChild(monthDiv);
    });
}

function groupEventosByMonth(eventos) {
    const grouped = {};
    
    eventos.forEach(evento => {
        const date = new Date(evento.data);
        const monthName = date.toLocaleString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + 
                         date.toLocaleString('pt-BR', { month: 'long' }).slice(1);
        
        if (!grouped[monthName]) {
            grouped[monthName] = [];
        }
        grouped[monthName].push(evento);
    });
    
    return grouped;
}

function renderCalendars() {
    const container = document.getElementById('calendars-container');
    container.innerHTML = '';
    
    const months = getMonthsWithEvents();
    
    months.forEach(({ year, month }) => {
        const calendarDiv = document.createElement('div');
        calendarDiv.className = 'calendar';
        
        const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'calendar-title';
        titleDiv.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        calendarDiv.appendChild(titleDiv);
        
        const gridDiv = document.createElement('div');
        gridDiv.className = 'calendar-grid';
        
        // Headers dos dias da semana
        const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        dayHeaders.forEach(day => {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'day-header';
            headerDiv.textContent = day;
            gridDiv.appendChild(headerDiv);
        });
        
        // Dias do mês
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        
        // Dias vazios antes do primeiro dia
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day-cell empty';
            gridDiv.appendChild(emptyDiv);
        }
        
        // Dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-cell';
            dayDiv.textContent = day;
            
            const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
            const eventosDoDay = allEventos.filter(e => e.data === dateStr);
            
            if (eventosDoDay.length > 0) {
                const evento = eventosDoDay[0];
                const categoria = evento.categoria;
                const cssClass = categoryCssClasses[categoria] || 'sematividade';
                dayDiv.classList.add('has-event', cssClass);
                dayDiv.style.backgroundColor = categoryColors[categoria] || '#999';
                
                // Criar tooltip com informacoes do evento formatado
                const horaText = evento.hora ? '\u23f0 ' + evento.hora : '';
                const localText = evento.local ? '\ud83d\udccd ' + evento.local : '';
                const tooltipText = evento.titulo + '\n' + horaText + '\n' + localText;
                dayDiv.setAttribute('data-tooltip', tooltipText);
                dayDiv.title = evento.titulo + ' - ' + (evento.hora || 'S/ hora') + ' - ' + (evento.local || 'S/ local');
            }
            
            gridDiv.appendChild(dayDiv);
        }
        
        calendarDiv.appendChild(gridDiv);
        container.appendChild(calendarDiv);
    });
}

function getMonthsWithEvents() {
    const months = new Set();
    
    allEventos.forEach(evento => {
        const date = new Date(evento.data);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        months.add(JSON.stringify({ year, month }));
    });
    
    return Array.from(months)
        .map(m => JSON.parse(m))
        .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
}

// Atualizar dados a cada 5 segundos (para sincronização com admin)
setInterval(loadData, 5000);
