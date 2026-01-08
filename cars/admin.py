from django.contrib import admin
from .models import Car, RepairRecord, Part, StockPart

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['brand', 'model', 'user', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['brand', 'model', 'vin']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RepairRecord)
class RepairRecordAdmin(admin.ModelAdmin):
    list_display = ['car', 'date', 'mileage', 'work_cost', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['car__brand', 'car__model', 'work_description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ['name', 'part_code', 'manufacturer', 'cost', 'repair_record']
    list_filter = ['manufacturer']
    search_fields = ['name', 'part_code', 'manufacturer']
    readonly_fields = ['created_at']


@admin.register(StockPart)
class StockPartAdmin(admin.ModelAdmin):
    list_display = ['name', 'part_code', 'manufacturer', 'cost', 'car', 'purchase_date']
    list_filter = ['manufacturer', 'purchase_date']
    search_fields = ['name', 'part_code', 'manufacturer']
    readonly_fields = ['created_at']
