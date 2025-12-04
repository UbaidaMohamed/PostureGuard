from django.urls import path
from . import views

app_name = 'posture_stream'

urlpatterns = [
    path('dashboard/stats', views.get_dashboard_stats, name='dashboard_stats'),
    path('dashboard/today', views.get_today_data, name='today_data'),
    path('dashboard/week', views.get_week_data, name='week_data'),
    path('dashboard/month', views.get_month_data, name='month_data'),
    path('logs', views.get_recent_logs, name='recent_logs'),
]
