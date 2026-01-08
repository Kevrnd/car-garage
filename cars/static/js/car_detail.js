// Car Detail Page - Repairs and Parts Management

class CarDetailManager {
    constructor(carId) {
        this.carId = carId;
        this.repairs = [];
        this.parts = [];
        this.stockParts = [];
        this.selectedStockParts = [];
        this.selectedStockPartsInPartsModal = [];
        this.currentRepairId = null;
        this.apiUrl = `/api/cars/${carId}/`;
        this.init();
    }

    async init() {
        await this.loadRepairs();
        await this.loadStockParts(); // Загружаем запчасти на складе для расчета общей стоимости
        this.renderRepairs();
        this.updateTotalCost(); // Обновляем общую стоимость после загрузки данных
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Repair modal
        const addRepairBtn = document.getElementById('add-repair-btn');
        if (addRepairBtn) {
            addRepairBtn.addEventListener('click', () => {
                this.openRepairModal();
            });
        }
        
        const closeRepairModalBtn = document.getElementById('close-repair-modal');
        if (closeRepairModalBtn) {
            closeRepairModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeRepairModal();
            });
        }
        
        const cancelRepairBtn = document.getElementById('cancel-repair-btn');
        if (cancelRepairBtn) {
            cancelRepairBtn.addEventListener('click', () => {
                this.closeRepairModal();
            });
        }
        document.getElementById('repair-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRepair();
        });
        document.getElementById('repair-modal').addEventListener('click', (e) => {
            if (e.target.id === 'repair-modal') {
                this.closeRepairModal();
            }
        });

        // Parts modal
        document.getElementById('close-parts-modal').addEventListener('click', () => {
            this.closePartsModal();
        });
        document.getElementById('parts-modal').addEventListener('click', (e) => {
            if (e.target.id === 'parts-modal') {
                this.closePartsModal();
            }
        });

        // Part modal
        const addPartBtn = document.getElementById('add-part-btn');
        if (addPartBtn) {
            addPartBtn.addEventListener('click', () => {
                this.openPartModal();
            });
        }
        
        // Add stock parts button in parts modal
        const addStockPartsBtn = document.getElementById('add-stock-parts-btn');
        if (addStockPartsBtn) {
            addStockPartsBtn.addEventListener('click', async () => {
                await this.toggleStockPartsSelectionInPartsModal();
            });
        }
        
        // Add selected stock parts button
        const addSelectedStockPartsBtn = document.getElementById('add-selected-stock-parts-btn');
        if (addSelectedStockPartsBtn) {
            addSelectedStockPartsBtn.addEventListener('click', async () => {
                await this.addSelectedStockPartsToRepair();
            });
        }
        
        const closePartModalBtn = document.getElementById('close-part-modal');
        if (closePartModalBtn) {
            closePartModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closePartModal();
            });
        }
        
        const cancelPartBtn = document.getElementById('cancel-part-btn');
        if (cancelPartBtn) {
            cancelPartBtn.addEventListener('click', () => {
                this.closePartModal();
            });
        }
        
        const partForm = document.getElementById('part-form');
        if (partForm) {
            partForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePart();
            });
        }
        
        const partModal = document.getElementById('part-modal');
        if (partModal) {
            partModal.addEventListener('click', (e) => {
                if (e.target.id === 'part-modal') {
                    this.closePartModal();
                }
            });
        }

        // Report modal
        document.getElementById('report-btn').addEventListener('click', () => {
            this.openReportModal();
        });
        document.getElementById('close-report-modal').addEventListener('click', () => {
            this.closeReportModal();
        });
        document.getElementById('cancel-report-btn').addEventListener('click', () => {
            this.closeReportModal();
        });
        document.getElementById('generate-report-btn').addEventListener('click', () => {
            this.generateReport();
        });
        
        document.getElementById('export-excel-btn').addEventListener('click', () => {
            this.exportToExcel();
        });
        document.getElementById('report-modal').addEventListener('click', (e) => {
            if (e.target.id === 'report-modal') {
                this.closeReportModal();
            }
        });

        // Stock modal
        const manageStockBtn = document.getElementById('manage-stock-btn');
        if (manageStockBtn) {
            manageStockBtn.addEventListener('click', () => {
                this.openStockModal();
            });
        }
        
        const viewStockBtn = document.getElementById('view-stock-btn');
        if (viewStockBtn) {
            viewStockBtn.addEventListener('click', () => {
                this.openStockModal();
            });
        }
        
        const addStockPartMainBtn = document.getElementById('add-stock-part-main-btn');
        if (addStockPartMainBtn) {
            addStockPartMainBtn.addEventListener('click', () => {
                this.openStockPartModal();
            });
        }
        document.getElementById('close-stock-modal').addEventListener('click', () => {
            this.closeStockModal();
        });
        document.getElementById('stock-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stock-modal') {
                this.closeStockModal();
            }
        });

        // Stock part modal
        document.getElementById('add-stock-part-btn').addEventListener('click', () => {
            this.openStockPartModal();
        });
        document.getElementById('close-stock-part-modal').addEventListener('click', () => {
            this.closeStockPartModal();
        });
        document.getElementById('cancel-stock-part-btn').addEventListener('click', () => {
            this.closeStockPartModal();
        });
        document.getElementById('stock-part-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStockPart();
        });
        document.getElementById('stock-part-modal').addEventListener('click', (e) => {
            if (e.target.id === 'stock-part-modal') {
                this.closeStockPartModal();
            }
        });

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeRepairModal();
                this.closePartsModal();
                this.closePartModal();
                this.closeReportModal();
                this.closeStockModal();
                this.closeStockPartModal();
            }
        });
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

    async loadRepairs() {
        try {
            const response = await fetch(`${this.apiUrl}repairs/`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login/';
                    return;
                }
                throw new Error(`Ошибка ${response.status}`);
            }
            this.repairs = await response.json();
        } catch (error) {
            console.error('Error loading repairs:', error);
            this.repairs = [];
        }
    }

    renderRepairs() {
        const tbody = document.getElementById('repairs-table-body');
        if (this.repairs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-table">Нет записей о ремонте</td></tr>';
            this.updateTotalCost();
            return;
        }

        tbody.innerHTML = this.repairs.map((repair, index) => {
            const date = new Date(repair.date).toLocaleDateString('ru-RU');
            const parts = repair.parts || [];
            const partsCost = parts.reduce((sum, part) => sum + parseFloat(part.cost || 0) * (parseInt(part.quantity) || 1), 0);
            const totalCost = parseFloat(repair.work_cost || 0) + partsCost;
            const hasParts = parts.length > 0;
            // Проверка на замену масла (не строгое соответствие - ищем слова "масло" и "замена" в любом порядке)
            const workDesc = (repair.work_description || '').toLowerCase();
            const isOilChange = workDesc.includes('масло') && (workDesc.includes('замена') || workDesc.includes('замен') || workDesc.includes('смен'));
            const rowClass = isOilChange ? 'repair-row oil-change-row' : 'repair-row';
            
            return `
                <tr class="${rowClass}" data-repair-id="${repair.id}">
                    <td>${date}</td>
                    <td>${repair.mileage.toLocaleString('ru-RU')}</td>
                    <td>
                        <div>${this.escapeHtml(repair.work_description)}</div>
                        ${hasParts ? `
                            <div style="margin-top: 8px; font-size: 12px; color: var(--md-sys-color-on-surface-variant);">
                                <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: middle;">build</span>
                                <span>Запчасти: ${parts.length}</span>
                            </div>
                        ` : ''}
                    </td>
                    <td>
                        <div>${parseFloat(repair.work_cost).toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</div>
                        ${hasParts ? `
                            <div style="font-size: 12px; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">
                                + запчасти: ${partsCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽
                            </div>
                            <div style="font-size: 13px; font-weight: 500; color: var(--md-sys-color-primary); margin-top: 4px;">
                                Итого: ${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽
                            </div>
                        ` : ''}
                    </td>
                    <td>
                        <div class="table-actions">
                            ${hasParts ? `
                                <button class="table-action-btn" onclick="carDetailManager.viewParts(${repair.id})" title="Управление запчастями">
                                    <span class="material-symbols-outlined">build</span>
                                </button>
                            ` : `
                                <button class="table-action-btn" onclick="carDetailManager.viewParts(${repair.id})" title="Добавить запчасти">
                                    <span class="material-symbols-outlined">add_circle</span>
                                </button>
                            `}
                            <button class="table-action-btn" onclick="carDetailManager.editRepair(${repair.id})" title="Редактировать">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="table-action-btn" onclick="carDetailManager.deleteRepair(${repair.id})" title="Удалить">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
                ${hasParts ? `
                    <tr class="parts-row" id="parts-row-${repair.id}">
                        <td colspan="5" style="padding: 0;">
                            <div class="parts-inline-container">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--md-sys-color-outline-variant);">
                                    <span class="material-symbols-outlined" style="font-size: 18px; color: var(--md-sys-color-primary);">build</span>
                                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: var(--md-sys-color-on-surface);">Использованные запчасти (${parts.length})</h4>
                                </div>
                                <table class="parts-inline-table">
                                    <thead>
                                        <tr>
                                            <th>Наименование</th>
                                            <th>Код детали</th>
                                            <th>Производитель</th>
                                            <th>Количество</th>
                                            <th>Стоимость за ед. (₽)</th>
                                            <th>Итого (₽)</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${parts.map(part => {
                                            const quantity = parseInt(part.quantity) || 1;
                                            const unitCost = parseFloat(part.cost) || 0;
                                            const totalCost = unitCost * quantity;
                                            return `
                                                <tr>
                                                    <td>${this.escapeHtml(part.name || '')}</td>
                                                    <td>${this.escapeHtml(part.part_code || '')}</td>
                                                    <td>${this.escapeHtml(part.manufacturer || '')}</td>
                                                    <td>${quantity}</td>
                                                    <td>${unitCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</td>
                                                    <td><strong>${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</strong></td>
                                                    <td>
                                                        <div class="table-actions">
                                                            <button class="table-action-btn" onclick="carDetailManager.editPart(${part.id}, ${repair.id})" title="Редактировать">
                                                                <span class="material-symbols-outlined">edit</span>
                                                            </button>
                                                            <button class="table-action-btn" onclick="carDetailManager.deletePart(${part.id}, ${repair.id})" title="Удалить">
                                                                <span class="material-symbols-outlined">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                ` : ''}
            `;
        }).join('');
        
        this.updateTotalCost();
    }

    updateTotalCost() {
        // Общая стоимость работ
        const totalWorkCost = this.repairs.reduce((sum, repair) => {
            return sum + parseFloat(repair.work_cost || 0);
        }, 0);
        const totalWorkCostElement = document.getElementById('total-work-cost');
        if (totalWorkCostElement) {
            totalWorkCostElement.textContent = totalWorkCost.toLocaleString('ru-RU', {minimumFractionDigits: 2});
        }

        // Общая стоимость запчастей (в ремонтах + на складе)
        let totalPartsCost = 0;
        
        // Запчасти в ремонтах
        this.repairs.forEach(repair => {
            if (repair.parts && repair.parts.length > 0) {
                repair.parts.forEach(part => {
                    const quantity = parseInt(part.quantity) || 1;
                    const unitCost = parseFloat(part.cost || 0);
                    totalPartsCost += unitCost * quantity;
                });
            }
        });
        
        // Запчасти на складе
        if (this.stockParts && this.stockParts.length > 0) {
            this.stockParts.forEach(part => {
                const quantity = parseInt(part.quantity) || 1;
                const unitCost = parseFloat(part.cost || 0);
                totalPartsCost += unitCost * quantity;
            });
        }
        
        const totalPartsCostElement = document.getElementById('total-parts-cost');
        if (totalPartsCostElement) {
            totalPartsCostElement.textContent = totalPartsCost.toLocaleString('ru-RU', {minimumFractionDigits: 2});
        }
    }

    // Repair Methods
    async openRepairModal(repairId = null) {
        this.currentRepairId = repairId;
        this.selectedStockParts = [];
        document.getElementById('repair-modal-title').textContent = repairId ? 'Редактировать запись' : 'Добавить запись о ремонте';
        document.getElementById('repair-form').reset();
        document.getElementById('repair-id').value = repairId || '';

        // Always show stock parts selection for both new and editing
        const stockPartsSelection = document.getElementById('stock-parts-selection');
        if (stockPartsSelection) {
            stockPartsSelection.style.display = 'block';
        }

        if (repairId) {
            const repair = this.repairs.find(r => r.id === repairId);
            if (repair) {
                document.getElementById('repair-date').value = repair.date;
                document.getElementById('repair-mileage').value = repair.mileage;
                document.getElementById('repair-work-description').value = repair.work_description;
                document.getElementById('repair-work-cost').value = repair.work_cost;
            }
            // Load and show stock parts for editing too
            await this.loadStockParts();
            this.renderStockPartsSelection();
        } else {
            // Set today's date as default
            document.getElementById('repair-date').value = new Date().toISOString().split('T')[0];
            // Load and show stock parts for new repair
            await this.loadStockParts();
            this.renderStockPartsSelection();
        }

        document.getElementById('repair-modal').classList.add('show');
    }

    closeRepairModal() {
        document.getElementById('repair-modal').classList.remove('show');
        this.currentRepairId = null;
        this.selectedStockParts = [];
    }

    async saveRepair() {
        const formData = {
            date: document.getElementById('repair-date').value,
            mileage: parseInt(document.getElementById('repair-mileage').value),
            work_description: document.getElementById('repair-work-description').value.trim(),
            work_cost: parseFloat(document.getElementById('repair-work-cost').value)
        };

        // Add selected stock parts for both new and existing repairs
        if (this.selectedStockParts.length > 0) {
            formData.stock_part_ids = this.selectedStockParts;
        }

        try {
            const csrfToken = this.getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };

            let response;
            if (this.currentRepairId) {
                response = await fetch(`${this.apiUrl}repairs/${this.currentRepairId}/`, {
                    method: 'PUT',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${this.apiUrl}repairs/`, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при сохранении');
            }

            await this.loadRepairs();
            this.renderRepairs();
            this.updateTotalCost(); // Обновляем общую стоимость
            this.closeRepairModal();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Error saving repair:', error);
        }
    }

    editRepair(repairId) {
        this.openRepairModal(repairId);
    }

    async deleteRepair(repairId) {
        if (confirm('Вы уверены, что хотите удалить эту запись о ремонте?')) {
            try {
                const csrfToken = this.getCsrfToken();
                const response = await fetch(`${this.apiUrl}repairs/${repairId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении');
                }

                await this.loadRepairs();
                this.renderRepairs();
                this.updateTotalCost(); // Обновляем общую стоимость
            } catch (error) {
                alert(`Ошибка: ${error.message}`);
                console.error('Error deleting repair:', error);
            }
        }
    }

    // Parts Methods
    async viewParts(repairId) {
        this.currentRepairId = repairId;
        const repair = this.repairs.find(r => r.id === repairId);
        if (!repair) return;

        const date = new Date(repair.date).toLocaleDateString('ru-RU');
        document.getElementById('parts-modal-title').textContent = 'Использованные запчасти';
        document.getElementById('parts-repair-info').textContent = `Запись от ${date}, пробег: ${repair.mileage.toLocaleString('ru-RU')} км`;

        // Hide stock parts selection initially
        document.getElementById('stock-parts-selection-in-parts-modal').style.display = 'none';
        this.selectedStockPartsInPartsModal = [];

        await this.loadParts(repairId);
        this.renderParts();

        document.getElementById('parts-modal').classList.add('show');
    }

    closePartsModal() {
        document.getElementById('parts-modal').classList.remove('show');
        this.currentRepairId = null;
        this.parts = [];
        this.selectedStockPartsInPartsModal = [];
        const selectionDiv = document.getElementById('stock-parts-selection-in-parts-modal');
        if (selectionDiv) {
            selectionDiv.style.display = 'none';
        }
    }

    async loadParts(repairId) {
        try {
            const repair = this.repairs.find(r => r.id === repairId);
            this.parts = repair ? (repair.parts || []) : [];
        } catch (error) {
            console.error('Error loading parts:', error);
            this.parts = [];
        }
    }

    renderParts() {
        const tbody = document.getElementById('parts-table-body');
        if (this.parts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-table">Нет запчастей</td></tr>';
            return;
        }

        tbody.innerHTML = this.parts.map(part => {
            const quantity = parseInt(part.quantity) || 1;
            const unitCost = parseFloat(part.cost) || 0;
            const totalCost = unitCost * quantity;
            return `
                <tr>
                    <td>${this.escapeHtml(part.name || '')}</td>
                    <td>${this.escapeHtml(part.part_code || '')}</td>
                    <td>${this.escapeHtml(part.manufacturer || '')}</td>
                    <td>${quantity}</td>
                    <td>${unitCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</td>
                    <td><strong>${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</strong></td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn" onclick="carDetailManager.editPart(${part.id})" title="Редактировать">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="table-action-btn" onclick="carDetailManager.deletePart(${part.id})" title="Удалить">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openPartModal(partId = null) {
        document.getElementById('part-modal-title').textContent = partId ? 'Редактировать запчасть' : 'Добавить запчасть';
        document.getElementById('part-form').reset();
        document.getElementById('part-id').value = partId || '';

        if (partId) {
            // Find part in current repairs
            let part = null;
            if (this.currentRepairId) {
                const repair = this.repairs.find(r => r.id === this.currentRepairId);
                if (repair && repair.parts) {
                    part = repair.parts.find(p => p.id === partId);
                }
            }
            // Fallback to parts array (from modal)
            if (!part && this.parts.length > 0) {
                part = this.parts.find(p => p.id === partId);
            }
            
            if (part) {
                document.getElementById('part-name').value = part.name || '';
                document.getElementById('part-code').value = part.part_code || '';
                document.getElementById('part-manufacturer').value = part.manufacturer || '';
                document.getElementById('part-quantity').value = part.quantity || 1;
                document.getElementById('part-cost').value = part.cost || '';
            }
        }

        document.getElementById('part-modal').classList.add('show');
    }

    closePartModal() {
        document.getElementById('part-modal').classList.remove('show');
    }

    async savePart() {
        const formData = {
            name: document.getElementById('part-name').value.trim(),
            part_code: document.getElementById('part-code').value.trim(),
            manufacturer: document.getElementById('part-manufacturer').value.trim(),
            quantity: parseInt(document.getElementById('part-quantity').value) || 1,
            cost: parseFloat(document.getElementById('part-cost').value)
        };

        try {
            const csrfToken = this.getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };

            const partId = document.getElementById('part-id').value;
            let response;
            if (partId) {
                response = await fetch(`${this.apiUrl}repairs/${this.currentRepairId}/parts/${partId}/`, {
                    method: 'PUT',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${this.apiUrl}repairs/${this.currentRepairId}/parts/`, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при сохранении');
            }

            // Reload repairs to get updated parts
            await this.loadRepairs();
            this.renderRepairs();
            // If parts modal is open, reload parts
            if (this.currentRepairId && document.getElementById('parts-modal').classList.contains('show')) {
                await this.loadParts(this.currentRepairId);
                this.renderParts();
            }
            this.updateTotalCost(); // Обновляем общую стоимость
            this.closePartModal();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Error saving part:', error);
        }
    }

    toggleParts(repairId) {
        const partsRow = document.getElementById(`parts-row-${repairId}`);
        const toggleBtn = document.querySelector(`[onclick="carDetailManager.toggleParts(${repairId})"]`);
        
        if (!partsRow || !toggleBtn) return;
        
        const isExpanded = toggleBtn.getAttribute('data-expanded') === 'true';
        
        if (isExpanded) {
            partsRow.style.display = 'none';
            toggleBtn.setAttribute('data-expanded', 'false');
            toggleBtn.querySelector('.material-symbols-outlined').textContent = 'expand_more';
        } else {
            partsRow.style.display = '';
            toggleBtn.setAttribute('data-expanded', 'true');
            toggleBtn.querySelector('.material-symbols-outlined').textContent = 'expand_less';
        }
    }

    editPart(partId, repairId = null) {
        if (repairId) {
            this.currentRepairId = repairId;
            // Load parts for this repair to populate the parts array
            const repair = this.repairs.find(r => r.id === repairId);
            if (repair && repair.parts) {
                this.parts = repair.parts;
            }
        }
        this.openPartModal(partId);
    }

    async deletePart(partId, repairId = null) {
        if (confirm('Вы уверены, что хотите удалить эту запчасть?')) {
            try {
                if (repairId) {
                    this.currentRepairId = repairId;
                }
                const csrfToken = this.getCsrfToken();
                const response = await fetch(`${this.apiUrl}repairs/${this.currentRepairId}/parts/${partId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении');
                }

                await this.loadRepairs();
                this.renderRepairs();
                if (this.currentRepairId) {
                    await this.loadParts(this.currentRepairId);
                    this.renderParts();
                }
                this.updateTotalCost(); // Обновляем общую стоимость
            } catch (error) {
                alert(`Ошибка: ${error.message}`);
                console.error('Error deleting part:', error);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Report Methods
    openReportModal() {
        const modal = document.getElementById('report-modal');
        const dateFrom = document.getElementById('report-date-from');
        const dateTo = document.getElementById('report-date-to');
        
        // Set default dates (last 30 days)
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);
        
        dateTo.value = today.toISOString().split('T')[0];
        dateFrom.value = monthAgo.toISOString().split('T')[0];
        
        document.getElementById('report-results').style.display = 'none';
        document.getElementById('export-excel-btn').style.display = 'none';
        modal.classList.add('show');
    }

    closeReportModal() {
        document.getElementById('report-modal').classList.remove('show');
    }

    generateReport() {
        const dateFrom = document.getElementById('report-date-from').value;
        const dateTo = document.getElementById('report-date-to').value;

        if (!dateFrom || !dateTo) {
            alert('Пожалуйста, выберите период для отчета');
            return;
        }

        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire end date

        // Filter repairs by date range
        const filteredRepairs = this.repairs.filter(repair => {
            const repairDate = new Date(repair.date);
            return repairDate >= fromDate && repairDate <= toDate;
        });

        // Calculate totals
        let totalWorkCost = 0;
        let totalPartsCost = 0;
        let recordsCount = filteredRepairs.length;

        filteredRepairs.forEach(repair => {
            totalWorkCost += parseFloat(repair.work_cost || 0);
            
            // Calculate parts cost
            if (repair.parts && repair.parts.length > 0) {
                repair.parts.forEach(part => {
                    totalPartsCost += parseFloat(part.cost || 0);
                });
            }
        });

        const totalCost = totalWorkCost + totalPartsCost;

        // Update summary
        document.getElementById('report-records-count').textContent = recordsCount;
        document.getElementById('report-total-work-cost').textContent = 
            totalWorkCost.toLocaleString('ru-RU', {minimumFractionDigits: 2});
        document.getElementById('report-total-parts-cost').textContent = 
            totalPartsCost.toLocaleString('ru-RU', {minimumFractionDigits: 2});
        document.getElementById('report-total-cost').textContent = 
            totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2});

        // Generate report details
        const detailsDiv = document.getElementById('report-details');
        if (filteredRepairs.length === 0) {
            detailsDiv.innerHTML = '<p style="text-align: center; color: var(--md-sys-color-on-surface-variant);">Нет записей за выбранный период</p>';
        } else {
            detailsDiv.innerHTML = `
                <h4 style="margin-bottom: 16px;">Детализация:</h4>
                <table class="repairs-table">
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Пробег (км)</th>
                            <th>Выполненные работы</th>
                            <th>Стоимость работ</th>
                            <th>Стоимость запчастей</th>
                            <th>Итого</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredRepairs.map(repair => {
                            const date = new Date(repair.date).toLocaleDateString('ru-RU');
                            const workCost = parseFloat(repair.work_cost || 0);
                            const partsCost = repair.parts ? repair.parts.reduce((sum, part) => sum + parseFloat(part.cost || 0) * (parseInt(part.quantity) || 1), 0) : 0;
                            const rowTotal = workCost + partsCost;
                            
                            return `
                                <tr>
                                    <td>${date}</td>
                                    <td>${repair.mileage.toLocaleString('ru-RU')}</td>
                                    <td>${this.escapeHtml(repair.work_description)}</td>
                                    <td>${workCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</td>
                                    <td>${partsCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</td>
                                    <td><strong>${rowTotal.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        document.getElementById('report-results').style.display = 'block';
        document.getElementById('export-excel-btn').style.display = 'flex';
    }

    exportToExcel() {
        const dateFrom = document.getElementById('report-date-from').value;
        const dateTo = document.getElementById('report-date-to').value;

        if (!dateFrom || !dateTo) {
            alert('Пожалуйста, сначала сформируйте отчет');
            return;
        }

        // Create download URL
        const url = `${this.apiUrl}export-report/?date_from=${dateFrom}&date_to=${dateTo}`;
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Stock Parts Methods
    async loadStockParts() {
        try {
            const response = await fetch(`${this.apiUrl}stock/`, {
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login/';
                    return;
                }
                throw new Error(`Ошибка ${response.status}`);
            }
            this.stockParts = await response.json();
        } catch (error) {
            console.error('Error loading stock parts:', error);
            this.stockParts = [];
        }
    }

    renderStockPartsSelection() {
        const container = document.getElementById('stock-parts-list');
        if (this.stockParts.length === 0) {
            container.innerHTML = `
                <p style="color: var(--md-sys-color-on-surface-variant); font-size: 14px; text-align: center; padding: 16px;">
                    На складе нет запчастей. Добавьте запчасти через "Управление складом".
                </p>
            `;
            return;
        }

        container.innerHTML = `
            <div class="stock-parts-checkboxes">
                ${this.stockParts.map(part => {
                    const isSelected = this.selectedStockParts.includes(part.id);
                    const quantity = parseInt(part.quantity) || 1;
                    const unitCost = parseFloat(part.cost) || 0;
                    const totalCost = unitCost * quantity;
                    return `
                        <label class="stock-part-checkbox">
                            <input type="checkbox" value="${part.id}" ${isSelected ? 'checked' : ''} 
                                   onchange="carDetailManager.toggleStockPart(${part.id})">
                            <div class="stock-part-info">
                                <div class="stock-part-name">${this.escapeHtml(part.name)}</div>
                                <div class="stock-part-details">
                                    <span>${this.escapeHtml(part.part_code)}</span>
                                    <span>•</span>
                                    <span>${this.escapeHtml(part.manufacturer)}</span>
                                    <span>•</span>
                                    <span>Кол-во: ${quantity}</span>
                                    <span>•</span>
                                    <span>${unitCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽/ед.</span>
                                    <span>•</span>
                                    <span><strong>Итого: ${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</strong></span>
                                </div>
                            </div>
                        </label>
                    `;
                }).join('')}
            </div>
        `;
    }

    toggleStockPart(partId) {
        const index = this.selectedStockParts.indexOf(partId);
        if (index > -1) {
            this.selectedStockParts.splice(index, 1);
        } else {
            this.selectedStockParts.push(partId);
        }
    }

    async openStockModal() {
        await this.loadStockParts();
        this.renderStockParts();
        document.getElementById('stock-modal').classList.add('show');
    }

    closeStockModal() {
        document.getElementById('stock-modal').classList.remove('show');
    }

    renderStockParts() {
        const tbody = document.getElementById('stock-parts-table-body');
        if (this.stockParts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-table">На складе нет запчастей</td></tr>';
            return;
        }

        tbody.innerHTML = this.stockParts.map(part => {
            const quantity = parseInt(part.quantity) || 1;
            const unitCost = parseFloat(part.cost) || 0;
            const totalCost = unitCost * quantity;
            const purchaseDate = part.purchase_date ? new Date(part.purchase_date).toLocaleDateString('ru-RU') : '-';
            return `
                <tr>
                    <td>${this.escapeHtml(part.name || '')}</td>
                    <td>${this.escapeHtml(part.part_code || '')}</td>
                    <td>${this.escapeHtml(part.manufacturer || '')}</td>
                    <td>${quantity}</td>
                    <td>${unitCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</td>
                    <td><strong>${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</strong></td>
                    <td>${purchaseDate}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn" onclick="carDetailManager.editStockPart(${part.id})" title="Редактировать">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button class="table-action-btn" onclick="carDetailManager.deleteStockPart(${part.id})" title="Удалить">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openStockPartModal(stockPartId = null) {
        document.getElementById('stock-part-modal-title').textContent = stockPartId ? 'Редактировать запчасть' : 'Добавить запчасть на склад';
        document.getElementById('stock-part-form').reset();
        document.getElementById('stock-part-id').value = stockPartId || '';

        if (stockPartId) {
            const part = this.stockParts.find(p => p.id === stockPartId);
            if (part) {
                document.getElementById('stock-part-name').value = part.name || '';
                document.getElementById('stock-part-code').value = part.part_code || '';
                document.getElementById('stock-part-manufacturer').value = part.manufacturer || '';
                document.getElementById('stock-part-quantity').value = part.quantity || 1;
                document.getElementById('stock-part-cost').value = part.cost || '';
                document.getElementById('stock-part-purchase-date').value = part.purchase_date || '';
                document.getElementById('stock-part-notes').value = part.notes || '';
            }
        } else {
            // Set today's date as default for purchase date
            document.getElementById('stock-part-purchase-date').value = new Date().toISOString().split('T')[0];
        }

        document.getElementById('stock-part-modal').classList.add('show');
    }

    closeStockPartModal() {
        document.getElementById('stock-part-modal').classList.remove('show');
    }

    async saveStockPart() {
        const formData = {
            name: document.getElementById('stock-part-name').value.trim(),
            part_code: document.getElementById('stock-part-code').value.trim(),
            manufacturer: document.getElementById('stock-part-manufacturer').value.trim(),
            quantity: parseInt(document.getElementById('stock-part-quantity').value) || 1,
            cost: document.getElementById('stock-part-cost').value ? parseFloat(document.getElementById('stock-part-cost').value) : null,
            purchase_date: document.getElementById('stock-part-purchase-date').value || null,
            notes: document.getElementById('stock-part-notes').value.trim() || null
        };

        try {
            const csrfToken = this.getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };

            const stockPartId = document.getElementById('stock-part-id').value;
            let response;
            if (stockPartId) {
                response = await fetch(`${this.apiUrl}stock/${stockPartId}/`, {
                    method: 'PUT',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${this.apiUrl}stock/`, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при сохранении');
            }

            await this.loadStockParts();
            // Update stock modal if it's open
            if (document.getElementById('stock-modal').classList.contains('show')) {
                this.renderStockParts();
            }
            // Update selection in repair modal if it's open (both for new and editing)
            if (document.getElementById('repair-modal').classList.contains('show')) {
                this.renderStockPartsSelection();
            }
            // Update selection in parts modal if it's open
            if (document.getElementById('parts-modal').classList.contains('show')) {
                this.renderStockPartsSelectionInPartsModal();
            }
            this.updateTotalCost(); // Обновляем общую стоимость
            this.closeStockPartModal();
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Error saving stock part:', error);
        }
    }

    editStockPart(stockPartId) {
        this.openStockPartModal(stockPartId);
    }

    async deleteStockPart(stockPartId) {
        if (confirm('Вы уверены, что хотите удалить эту запчасть со склада?')) {
            try {
                const csrfToken = this.getCsrfToken();
                const response = await fetch(`${this.apiUrl}stock/${stockPartId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Ошибка при удалении');
                }

                await this.loadStockParts();
                this.renderStockParts();
                this.renderStockPartsSelection();
                // Update selection in parts modal if it's open
                if (document.getElementById('parts-modal').classList.contains('show')) {
                    this.renderStockPartsSelectionInPartsModal();
                }
                this.updateTotalCost(); // Обновляем общую стоимость
            } catch (error) {
                alert(`Ошибка: ${error.message}`);
                console.error('Error deleting stock part:', error);
            }
        }
    }

    // Stock Parts in Parts Modal Methods
    async toggleStockPartsSelectionInPartsModal() {
        const selectionDiv = document.getElementById('stock-parts-selection-in-parts-modal');
        if (!selectionDiv) return;

        const isVisible = selectionDiv.style.display !== 'none';
        
        if (isVisible) {
            selectionDiv.style.display = 'none';
        } else {
            selectionDiv.style.display = 'block';
            await this.loadStockParts();
            this.renderStockPartsSelectionInPartsModal();
        }
    }

    renderStockPartsSelectionInPartsModal() {
        const listDiv = document.getElementById('stock-parts-list-in-parts-modal');
        if (!listDiv) return;

        if (this.stockParts.length === 0) {
            listDiv.innerHTML = `
                <p style="color: var(--md-sys-color-on-surface-variant); font-size: 14px; text-align: center; padding: 16px;">
                    На складе нет запчастей
                </p>
            `;
            return;
        }

        listDiv.innerHTML = this.stockParts.map(part => {
            const isSelected = this.selectedStockPartsInPartsModal.includes(part.id);
            const quantity = parseInt(part.quantity) || 1;
            const unitCost = parseFloat(part.cost) || 0;
            const totalCost = unitCost * quantity;
            return `
                <div class="stock-part-item">
                    <label class="stock-part-checkbox">
                        <input type="checkbox" 
                               ${isSelected ? 'checked' : ''} 
                               onchange="carDetailManager.toggleStockPartInPartsModal(${part.id})">
                        <span class="checkmark"></span>
                        <div class="stock-part-info">
                            <div class="stock-part-name">${this.escapeHtml(part.name || '')}</div>
                            <div class="stock-part-details">
                                <span>Код: ${this.escapeHtml(part.part_code || '')}</span>
                                ${part.manufacturer ? `<span>Производитель: ${this.escapeHtml(part.manufacturer)}</span>` : ''}
                                <span>Кол-во: ${quantity}</span>
                                <span>${unitCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽/ед.</span>
                                <span class="stock-part-cost"><strong>Итого: ${totalCost.toLocaleString('ru-RU', {minimumFractionDigits: 2})} ₽</strong></span>
                            </div>
                        </div>
                    </label>
                </div>
            `;
        }).join('');
    }

    toggleStockPartInPartsModal(partId) {
        const index = this.selectedStockPartsInPartsModal.indexOf(partId);
        if (index > -1) {
            this.selectedStockPartsInPartsModal.splice(index, 1);
        } else {
            this.selectedStockPartsInPartsModal.push(partId);
        }
        // Re-render to update checkboxes
        this.renderStockPartsSelectionInPartsModal();
    }

    async addSelectedStockPartsToRepair() {
        if (!this.currentRepairId) {
            alert('Ошибка: не выбрана запись о ремонте');
            return;
        }

        if (this.selectedStockPartsInPartsModal.length === 0) {
            alert('Выберите запчасти для добавления');
            return;
        }

        try {
            const csrfToken = this.getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            };

            // Create parts from stock parts
            for (const stockPartId of this.selectedStockPartsInPartsModal) {
                const stockPart = this.stockParts.find(p => p.id === stockPartId);
                if (!stockPart) continue;

                // Create part in repair
                const partData = {
                    name: stockPart.name,
                    part_code: stockPart.part_code,
                    manufacturer: stockPart.manufacturer || null,
                    quantity: parseInt(stockPart.quantity) || 1,
                    cost: stockPart.cost
                };

                const response = await fetch(`${this.apiUrl}repairs/${this.currentRepairId}/parts/`, {
                    method: 'POST',
                    headers: headers,
                    credentials: 'include',
                    body: JSON.stringify(partData)
                });

                if (!response.ok) {
                    throw new Error('Ошибка при добавлении запчасти');
                }

                // Delete stock part
                const deleteResponse = await fetch(`${this.apiUrl}stock/${stockPartId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrfToken
                    },
                    credentials: 'include'
                });

                if (!deleteResponse.ok) {
                    console.warn('Не удалось удалить запчасть со склада');
                }
            }

            // Reload data
            await this.loadStockParts();
            await this.loadRepairs();
            await this.loadParts(this.currentRepairId);
            this.renderParts();
            this.renderRepairs();
            this.updateTotalCost(); // Обновляем общую стоимость
            this.selectedStockPartsInPartsModal = [];
            this.renderStockPartsSelectionInPartsModal();

            // Hide selection if empty
            if (this.stockParts.length === 0) {
                document.getElementById('stock-parts-selection-in-parts-modal').style.display = 'none';
            }
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
            console.error('Error adding stock parts to repair:', error);
        }
    }
}

// Initialize app
let carDetailManager;
document.addEventListener('DOMContentLoaded', () => {
    carDetailManager = new CarDetailManager(CAR_ID);
});

