"""
Script to create sample posture data for testing the dashboard
"""
import os
import django
import sys
from datetime import datetime, timedelta
import random

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'posture_project.settings')
django.setup()

from posture_stream.models import PostureLog
from django.utils import timezone

def create_sample_data():
    """Create sample posture data for testing"""
    print("Creating sample posture data...")
    
    now = timezone.now()
    
    # Create data for today (every hour)
    for hour in range(8, 18):  # 8 AM to 6 PM
        for minute_offset in [0, 20, 40]:
            timestamp = now.replace(hour=hour, minute=minute_offset, second=0, microsecond=0)
            
            # Random angle between 70 and 120 degrees
            angle = random.uniform(70, 120)
            posture_status = 'good' if angle > 90 else 'bad'
            duration = random.randint(30, 180)  # 30 seconds to 3 minutes
            
            PostureLog.objects.create(
                timestamp=timestamp,
                posture_status=posture_status,
                angle=angle,
                duration=duration
            )
    
    # Create data for the past 7 days
    for days_ago in range(1, 8):
        day = now - timedelta(days=days_ago)
        
        # Create 5-10 logs per day
        num_logs = random.randint(5, 10)
        for _ in range(num_logs):
            hour = random.randint(8, 18)
            minute = random.randint(0, 59)
            timestamp = day.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            angle = random.uniform(70, 120)
            posture_status = 'good' if angle > 90 else 'bad'
            duration = random.randint(30, 300)
            
            PostureLog.objects.create(
                timestamp=timestamp,
                posture_status=posture_status,
                angle=angle,
                duration=duration
            )
    
    # Create data for the past month
    for days_ago in range(8, 31):
        day = now - timedelta(days=days_ago)
        
        # Create 3-7 logs per day
        num_logs = random.randint(3, 7)
        for _ in range(num_logs):
            hour = random.randint(8, 18)
            minute = random.randint(0, 59)
            timestamp = day.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            angle = random.uniform(70, 120)
            posture_status = 'good' if angle > 90 else 'bad'
            duration = random.randint(30, 300)
            
            PostureLog.objects.create(
                timestamp=timestamp,
                posture_status=posture_status,
                angle=angle,
                duration=duration
            )
    
    total_count = PostureLog.objects.count()
    print(f"Successfully created {total_count} posture log entries!")
    
    # Print summary
    print("\nSummary:")
    print(f"  Today's logs: {PostureLog.objects.filter(timestamp__gte=now.replace(hour=0, minute=0, second=0)).count()}")
    print(f"  This week: {PostureLog.objects.filter(timestamp__gte=now - timedelta(days=7)).count()}")
    print(f"  This month: {PostureLog.objects.filter(timestamp__gte=now - timedelta(days=30)).count()}")

if __name__ == '__main__':
    create_sample_data()
