// Car Management Application

class CarManager {
    constructor() {
        this.cars = [];
        this.currentEditId = null;
        this.apiUrl = '/api/cars/';
        this.currentCarId = null;
        this.currentRepairId = null;
        this.repairs = [];
        this.parts = [];
        this.init();
    }

    async init() {
        await this.loadCars();
        this.renderCars();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add car button
        const addCarBtn = document.getElementById('add-car-btn');
        if (addCarBtn) {
            addCarBtn.addEventListener('click', () => {
                console.log('Add car button clicked');
                this.openModal();
            });
        } else {
            console.error('Add car button not found');
        }

        // Close modal
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Form submit
        const carForm = document.getElementById('car-form');
        if (carForm) {
            carForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCar();
            });
        }

        // Close modal on outside click
        const carModal = document.getElementById('car-modal');
        if (carModal) {
            carModal.addEventListener('click', (e) => {
                if (e.target.id === 'car-modal') {
                    this.closeModal();
                }
            });
        }

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(carId = null) {
        const modal = document.getElementById('car-modal');
        const form = document.getElementById('car-form');
        const title = document.getElementById('modal-title');

        if (!modal) {
            console.error('Modal element not found');
            return;
        }

        // Convert carId to number if it's provided (from onclick it comes as string)
        const numericCarId = carId ? (typeof carId === 'string' ? parseInt(carId, 10) : carId) : null;

        if (numericCarId) {
            // Edit mode
            const car = this.cars.find(c => c.id === numericCarId);
            if (car) {
                this.currentEditId = numericCarId;
                if (title) title.textContent = 'Редактировать автомобиль';
                this.fillForm(car);
            } else {
                console.error('Car not found with id:', numericCarId, 'Available cars:', this.cars);
                // Fallback to add mode if car not found
                this.currentEditId = null;
                if (title) title.textContent = 'Добавить автомобиль';
                if (form) form.reset();
            }
        } else {
            // Add mode
            this.currentEditId = null;
            if (title) title.textContent = 'Добавить автомобиль';
            if (form) form.reset();
        }

        if (modal) {
            modal.classList.add('show');
        }
        if (document.body) {
            document.body.style.overflow = 'hidden';
        }
        console.log('Modal opened');
    }

    closeModal() {
        const modal = document.getElementById('car-modal');
        const form = document.getElementById('car-form');
        
        if (modal) {
            modal.classList.remove('show');
        }
        if (document.body) {
            document.body.style.overflow = '';
        }
        if (form) {
            form.reset();
        }
        this.currentEditId = null;
    }

    fillForm(car) {
        const carIdEl = document.getElementById('car-id');
        const brandEl = document.getElementById('brand');
        const modelEl = document.getElementById('model');
        const vinEl = document.getElementById('vin');
        const yearEl = document.getElementById('year');
        const powerEl = document.getElementById('power');
        const tireFrontEl = document.getElementById('tire-front');
        const tireRearEl = document.getElementById('tire-rear');
        const wipersEl = document.getElementById('wipers');
        const notesEl = document.getElementById('notes');
        
        if (carIdEl) carIdEl.value = car.id;
        if (brandEl) brandEl.value = car.brand || '';
        if (modelEl) modelEl.value = car.model || '';
        if (vinEl) vinEl.value = car.vin || '';
        if (yearEl) yearEl.value = car.year || '';
        if (powerEl) powerEl.value = car.power || '';
        if (tireFrontEl) tireFrontEl.value = car.tire_front || '';
        if (tireRearEl) tireRearEl.value = car.tire_rear || '';
        if (wipersEl) wipersEl.value = car.wipers || '';
        if (notesEl) notesEl.value = car.notes || '';
    }

    getCsrfToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }

    async saveCar() {
        const brandEl = document.getElementById('brand');
        const modelEl = document.getElementById('model');
        const vinEl = document.getElementById('vin');
        const yearEl = document.getElementById('year');
        const powerEl = document.getElementById('power');
        const tireFrontEl = document.getElementById('tire-front');
        const tireRearEl = document.getElementById('tire-rear');
        const wipersEl = document.getElementById('wipers');
        const notesEl = document.getElementById('notes');
        
        if (!brandEl || !modelEl || !vinEl) {
            alert('Ошибка: не найдены обязательные поля формы');
            return;
        }
        
        const yearValue = yearEl ? yearEl.value : '';
        const powerValue = powerEl ? powerEl.value : '';
        
        const carData = {
            brand: brandEl.value.trim(),
            model: modelEl.value.trim(),
            vin: vinEl.value.trim(),
            year: yearValue && yearValue.trim() ? parseInt(yearValue) : null,
            power: powerValue && powerValue.trim() ? parseInt(powerValue) : null,
            tire_front: tireFrontEl ? tireFrontEl.value.trim() || null : null,
            tire_rear: tireRearEl ? tireRearEl.value.trim() || null : null,
            wipers: wipersEl ? wipersEl.value.trim() || null : null,
            notes: notesEl ? notesEl.value.trim() || null : null
        };
        
        // Удаляем null значения для необязательных полей, чтобы Django правильно их обработал
        Object.keys(carData).forEach(key => {
            if (carData[key] === null && key !== 'year' && key !== 'power') {
                delete carData[key];
            }
        });

        // Validation
        if (!carData.brand || !carData.model || !carData.vin) {
            alert('Пожалуйста, заполните обязательные поля: Марка, Модель и VIN');
            return;
        }

        try {
            const csrfToken = this.getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };

            let response;
            if (this.currentEditId) {
                // Update existing car
                response = await fetch(`${this.apiUrl}${this.currentEditId}/`, {
                    method: 'PUT',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(carData)
                });
            } else {
                // Add new car
                response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(carData)
                });
            }

            if (!response.ok) {
                let errorMessage = 'Ошибка при сохранении';
                const contentType = response.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else if (errorData.error) {
                            errorMessage = errorData.error;
                        } else if (typeof errorData === 'object') {
                            // Django validation errors
                            const errors = [];
                            for (const [field, messages] of Object.entries(errorData)) {
                                if (Array.isArray(messages)) {
                                    errors.push(`${field}: ${messages.join(', ')}`);
                                } else {
                                    errors.push(`${field}: ${messages}`);
                                }
                            }
                            errorMessage = errors.join('\n');
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                        errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
                    }
                } else {
                    errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            await this.loadCars();
            this.renderCars();
            this.closeModal();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Error saving car:', error);
        }
    }

    async deleteCar(carId) {
        if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
            try {
                const csrfToken = this.getCsrfToken();
                const response = await fetch(`${this.apiUrl}${carId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    let errorMessage = 'Ошибка при удалении';
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        try {
                            const error = await response.json();
                            errorMessage = error.detail || error.error || errorMessage;
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                    throw new Error(errorMessage);
                }

                await this.loadCars();
                this.renderCars();
            } catch (error) {
                alert(`Ошибка: ${error.message}`);
                console.error('Error deleting car:', error);
            }
        }
    }

    renderCars() {
        const container = document.getElementById('cars-list');
        const emptyState = document.getElementById('empty-state');

        if (this.cars.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            if (container) {
                container.innerHTML = '';
                if (emptyState) {
                    container.appendChild(emptyState);
                }
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }
        if (container) {
            container.innerHTML = '';

            this.cars.forEach(car => {
                const card = this.createCarCard(car);
                container.appendChild(card);
            });
        }
    }

    createCarCard(car) {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Don't open if clicking on action buttons
            if (!e.target.closest('.car-card-actions')) {
                this.openCarDetails(car.id);
            }
        });
        const tireFront = car.tire_front || '';
        const tireRear = car.tire_rear || '';
        
        // Format date
        const createdDate = car.created_at ? new Date(car.created_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : '';
        
        card.innerHTML = `
            <div class="car-card-header">
                <div class="car-card-title-section">
                    <div class="car-card-icon">
                        <span class="material-symbols-outlined">directions_car</span>
                    </div>
                    <div class="car-card-title-wrapper">
                        <h3 class="car-card-title">${this.escapeHtml(car.brand)} ${this.escapeHtml(car.model)}</h3>
                        <div class="car-card-subtitle">
                            <span class="material-symbols-outlined" style="font-size: 14px;">badge</span>
                            <span>${this.escapeHtml(car.vin)}</span>
                        </div>
                    </div>
                </div>
                <div class="car-card-actions" onclick="event.stopPropagation()">
                    <button class="icon-button" onclick="carManager.openModal('${car.id}')" title="Редактировать">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="icon-button" onclick="carManager.deleteCar('${car.id}')" title="Удалить">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
            <div class="car-card-body">
                <div class="car-card-info">
                    ${car.year || car.power ? `
                        <div class="car-info-section">
                            <div class="car-info-section-title">Характеристики</div>
                            ${car.year ? `
                                <div class="car-info-item">
                                    <span class="material-symbols-outlined">calendar_today</span>
                                    <div class="car-info-item-content">
                                        <div class="car-info-item-label">Год выпуска</div>
                                        <div class="car-info-item-value">${car.year}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${car.power ? `
                                <div class="car-info-item">
                                    <span class="material-symbols-outlined">bolt</span>
                                    <div class="car-info-item-content">
                                        <div class="car-info-item-label">Мощность</div>
                                        <div class="car-info-item-value">${car.power} л.с.</div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${tireFront || tireRear || car.wipers ? `
                        <div class="car-info-section">
                            <div class="car-info-section-title">Запчасти</div>
                            ${tireFront || tireRear ? `
                                <div class="car-info-item">
                                    <span class="material-symbols-outlined">tire_repair</span>
                                    <div class="car-info-item-content">
                                        <div class="car-info-item-label">Размеры резины</div>
                                        <div class="car-info-chips">
                                            ${tireFront ? `
                                                <div class="car-info-chip">
                                                    <span class="material-symbols-outlined">arrow_forward</span>
                                                    <span>${this.escapeHtml(tireFront)}</span>
                                                </div>
                                            ` : ''}
                                            ${tireRear ? `
                                                <div class="car-info-chip">
                                                    <span class="material-symbols-outlined">arrow_back</span>
                                                    <span>${this.escapeHtml(tireRear)}</span>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            ${car.wipers ? `
                                <div class="car-info-item">
                                    <span class="material-symbols-outlined">wipers</span>
                                    <div class="car-info-item-content">
                                        <div class="car-info-item-label">Дворники</div>
                                        <div class="car-info-item-value">${this.escapeHtml(car.wipers)}</div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${car.notes ? `
                        <div class="car-info-section">
                            <div class="car-info-section-title">Заметки</div>
                            <div class="car-info-item">
                                <span class="material-symbols-outlined">note</span>
                                <div class="car-info-item-content">
                                    <div class="car-info-item-value">${this.escapeHtml(car.notes.length > 150 ? car.notes.substring(0, 150) + '...' : car.notes)}</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            ${createdDate ? `
                <div class="car-card-footer">
                    <span>Добавлено: ${createdDate}</span>
                </div>
            ` : ''}
        `;
        return card;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadCars() {
        try {
            const response = await fetch(this.apiUrl, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login/';
                    return;
                }
                throw new Error('Ошибка при загрузке данных');
            }
            this.cars = await response.json();
        } catch (error) {
            console.error('Error loading cars:', error);
            if (error.message.includes('401')) {
                window.location.href = '/login/';
            } else {
                alert('Ошибка при загрузке данных. Проверьте, что сервер запущен.');
            }
            this.cars = [];
        }
    }

    // Car Details Methods - redirect to detail page
    openCarDetails(carId) {
        window.location.href = `/car/${carId}/`;
    }
}

// Initialize app
let carManager;
document.addEventListener('DOMContentLoaded', () => {
    carManager = new CarManager();
});
