"""
URL configuration for car_garage project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from cars import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('api/cars/', views.car_list, name='car-list'),
    path('api/cars/<int:pk>/', views.car_detail, name='car-detail'),
    path('api/cars/<int:car_id>/repairs/', views.repair_record_list, name='repair-record-list'),
    path('api/cars/<int:car_id>/repairs/<int:record_id>/', views.repair_record_detail, name='repair-record-detail'),
    path('api/cars/<int:car_id>/repairs/<int:record_id>/parts/', views.part_create, name='part-create'),
    path('api/cars/<int:car_id>/repairs/<int:record_id>/parts/<int:part_id>/', views.part_detail, name='part-detail'),
    path('api/cars/<int:car_id>/stock/', views.stock_part_list, name='stock-part-list'),
    path('api/cars/<int:car_id>/stock/<int:stock_part_id>/', views.stock_part_detail, name='stock-part-detail'),
    path('api/cars/<int:car_id>/export-report/', views.export_report_to_excel, name='export-report'),
    path('car/<int:car_id>/', views.car_detail_view, name='car-detail'),
    path('', views.index_view, name='index'),
]
