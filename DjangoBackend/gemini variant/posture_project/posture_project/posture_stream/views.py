from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Avg, Sum, Count, Q
from datetime import datetime, timedelta
from .models import PostureLog
import json

def get_dashboard_stats(request):
    """Get overall dashboard statistics"""
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    last_week_start = week_start - timedelta(days=7)
    
    # Get current/latest posture angle
    latest_log = PostureLog.objects.order_by('-timestamp').first()
    current_score = latest_log.angle if latest_log else 90
    
    # Get weekly average
    weekly_avg = PostureLog.objects.filter(
        timestamp__gte=week_start
    ).aggregate(Avg('angle'))['angle__avg'] or 90
    
    # Get last week's average for comparison
    last_week_avg = PostureLog.objects.filter(
        timestamp__gte=last_week_start,
        timestamp__lt=week_start
    ).aggregate(Avg('angle'))['angle__avg'] or 90
    
    weekly_change = round(weekly_avg - last_week_avg, 1)
    
    return JsonResponse({
        'currentScore': round(current_score, 1),
        'weeklyAverage': round(weekly_avg, 1),
        'weeklyChange': weekly_change
    })

def get_today_data(request):
    """Get today's posture data by hour"""
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get logs for today
    logs = PostureLog.objects.filter(timestamp__gte=today_start).order_by('timestamp')
    
    # Group by hour
    hourly_data = {}
    for log in logs:
        hour = log.timestamp.strftime('%H:%M')
        if hour not in hourly_data:
            hourly_data[hour] = {
                'time': hour,
                'good': 0,
                'poor': 0,
                'angles': [],
                'count': 0
            }
        
        if log.posture_status == 'good':
            hourly_data[hour]['good'] += log.duration
        else:
            hourly_data[hour]['poor'] += log.duration
        
        hourly_data[hour]['angles'].append(log.angle)
        hourly_data[hour]['count'] += 1
    
    # Calculate average score for each hour
    result = []
    for hour, data in sorted(hourly_data.items()):
        avg_angle = sum(data['angles']) / len(data['angles']) if data['angles'] else 90
        result.append({
            'time': data['time'],
            'good': data['good'],
            'poor': data['poor'],
            'score': round(avg_angle, 1)
        })
    
    return JsonResponse({'data': result})

def get_week_data(request):
    """Get this week's posture data by day"""
    now = timezone.now()
    week_start = now - timedelta(days=7)
    
    # Get logs for the past 7 days
    logs = PostureLog.objects.filter(timestamp__gte=week_start).order_by('timestamp')
    
    # Initialize daily data
    daily_data = {}
    for i in range(7):
        day = (now - timedelta(days=6-i)).date()
        day_name = day.strftime('%a')  # Mon, Tue, etc.
        daily_data[day_name] = {
            'day': day_name,
            'angles': [],
            'sessions': 0
        }
    
    # Aggregate data
    for log in logs:
        day_name = log.timestamp.strftime('%a')
        if day_name in daily_data:
            daily_data[day_name]['angles'].append(log.angle)
            daily_data[day_name]['sessions'] += 1
    
    # Calculate averages
    result = []
    for day_name in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']:
        if day_name in daily_data:
            data = daily_data[day_name]
            avg_score = sum(data['angles']) / len(data['angles']) if data['angles'] else 0
            result.append({
                'day': day_name,
                'score': round(avg_score, 1) if avg_score > 0 else 0,
                'sessions': data['sessions']
            })
    
    return JsonResponse({'data': result})

def get_month_data(request):
    """Get this month's posture data by day"""
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get logs for this month
    logs = PostureLog.objects.filter(timestamp__gte=month_start).order_by('timestamp')
    
    # Group by date
    daily_data = {}
    for log in logs:
        date_str = log.timestamp.strftime('%m/%d')
        if date_str not in daily_data:
            daily_data[date_str] = {
                'date': date_str,
                'angles': [],
                'sessions': 0
            }
        
        daily_data[date_str]['angles'].append(log.angle)
        daily_data[date_str]['sessions'] += 1
    
    # Calculate averages
    result = []
    for date_str, data in sorted(daily_data.items()):
        avg_score = sum(data['angles']) / len(data['angles']) if data['angles'] else 90
        result.append({
            'date': date_str,
            'score': round(avg_score, 1),
            'sessions': data['sessions']
        })
    
    return JsonResponse({'data': result})

def get_recent_logs(request):
    """Get recent posture logs"""
    limit = int(request.GET.get('limit', 10))
    
    logs = PostureLog.objects.order_by('-timestamp')[:limit]
    
    data = []
    for log in logs:
        data.append({
            '_id': str(log.id),
            'timestamp': log.timestamp.isoformat(),
            'postureType': log.posture_status,
            'angle': log.angle,
            'duration': log.duration,
            'notes': f"{log.angle}° for {log.duration}s"
        })
    
    return JsonResponse({'data': data})
