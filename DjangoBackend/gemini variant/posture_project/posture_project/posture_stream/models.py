from django.db import models
from django.utils import timezone

class PostureLog(models.Model):
    """Store posture monitoring data"""
    POSTURE_CHOICES = [
        ('good', 'Good Posture'),
        ('bad', 'Bad Posture'),
    ]
    
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    posture_status = models.CharField(max_length=10, choices=POSTURE_CHOICES)
    angle = models.FloatField(help_text="Hip angle in degrees")
    duration = models.IntegerField(default=0, help_text="Duration in seconds")
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['posture_status', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.posture_status} - {self.angle}° at {self.timestamp}"
