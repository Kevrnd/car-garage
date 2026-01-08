from rest_framework import serializers
from .models import Car, RepairRecord, Part, StockPart

class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = ['id', 'brand', 'model', 'vin', 'year', 'power', 'tire_front', 'tire_rear', 'wipers', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_year(self, value):
        """Валидация года выпуска"""
        if value is not None and (value < 1900 or value > 2100):
            raise serializers.ValidationError("Год выпуска должен быть между 1900 и 2100")
        return value
    
    def validate_power(self, value):
        """Валидация мощности"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Мощность не может быть отрицательной")
        return value


class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = ['id', 'name', 'part_code', 'manufacturer', 'quantity', 'cost', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_cost(self, value):
        """Валидация стоимости"""
        if value < 0:
            raise serializers.ValidationError("Стоимость не может быть отрицательной")
        return value
    
    def validate_quantity(self, value):
        """Валидация количества"""
        if value < 1:
            raise serializers.ValidationError("Количество должно быть не менее 1")
        return value


class RepairRecordSerializer(serializers.ModelSerializer):
    parts = PartSerializer(many=True, read_only=True)
    
    class Meta:
        model = RepairRecord
        fields = ['id', 'date', 'mileage', 'work_description', 'work_cost', 'parts', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_mileage(self, value):
        """Валидация пробега"""
        if value < 0:
            raise serializers.ValidationError("Пробег не может быть отрицательным")
        return value
    
    def validate_work_cost(self, value):
        """Валидация стоимости работ"""
        if value < 0:
            raise serializers.ValidationError("Стоимость работ не может быть отрицательной")
        return value


class StockPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPart
        fields = ['id', 'name', 'part_code', 'manufacturer', 'quantity', 'cost', 'purchase_date', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate_cost(self, value):
        """Валидация стоимости"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Стоимость не может быть отрицательной")
        return value
    
    def validate_quantity(self, value):
        """Валидация количества"""
        if value < 1:
            raise serializers.ValidationError("Количество должно быть не менее 1")
        return value

