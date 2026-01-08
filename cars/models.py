from django.db import models
from django.contrib.auth.models import User

class Car(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cars')
    brand = models.CharField(max_length=100, verbose_name='Марка')
    model = models.CharField(max_length=100, verbose_name='Модель')
    vin = models.CharField(max_length=17, verbose_name='VIN')
    year = models.IntegerField(blank=True, null=True, verbose_name='Год выпуска')
    power = models.IntegerField(blank=True, null=True, verbose_name='Мощность (л.с.)')
    tire_front = models.CharField(max_length=50, blank=True, null=True, verbose_name='Размер резины перед')
    tire_rear = models.CharField(max_length=50, blank=True, null=True, verbose_name='Размер резины зад')
    wipers = models.CharField(max_length=50, blank=True, null=True, verbose_name='Размеры дворников')
    notes = models.TextField(blank=True, null=True, verbose_name='Заметки')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    class Meta:
        verbose_name = 'Автомобиль'
        verbose_name_plural = 'Автомобили'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} {self.model}"


class RepairRecord(models.Model):
    """Запись о ремонте/обслуживании"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='repair_records', verbose_name='Автомобиль')
    date = models.DateField(verbose_name='Дата')
    mileage = models.IntegerField(verbose_name='Пробег (км)')
    work_description = models.TextField(verbose_name='Выполненные работы')
    work_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Стоимость работ')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    class Meta:
        verbose_name = 'Запись о ремонте'
        verbose_name_plural = 'Записи о ремонте'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.car} - {self.date} ({self.mileage} км)"


class Part(models.Model):
    """Запчасть, использованная при ремонте"""
    repair_record = models.ForeignKey(RepairRecord, on_delete=models.CASCADE, related_name='parts', verbose_name='Запись о ремонте')
    name = models.CharField(max_length=200, verbose_name='Наименование')
    part_code = models.CharField(max_length=100, verbose_name='Код детали')
    manufacturer = models.CharField(max_length=100, verbose_name='Производитель')
    quantity = models.IntegerField(default=1, verbose_name='Количество')
    cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Стоимость за единицу')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    class Meta:
        verbose_name = 'Запчасть'
        verbose_name_plural = 'Запчасти'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.part_code})"


class StockPart(models.Model):
    """Запчасть на складе (куплена, но еще не установлена)"""
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='stock_parts', verbose_name='Автомобиль')
    name = models.CharField(max_length=200, verbose_name='Наименование')
    part_code = models.CharField(max_length=100, verbose_name='Код детали')
    manufacturer = models.CharField(max_length=100, verbose_name='Производитель')
    quantity = models.IntegerField(default=1, verbose_name='Количество')
    cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Стоимость за единицу')
    purchase_date = models.DateField(verbose_name='Дата покупки', null=True, blank=True)
    notes = models.TextField(blank=True, null=True, verbose_name='Заметки')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')

    class Meta:
        verbose_name = 'Запчасть на складе'
        verbose_name_plural = 'Запчасти на складе'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.part_code}) - {self.car}"
