import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'posture_project.settings')

# Initialize Django ASGI application early to ensure AppRegistry is populated
# This must be done before importing anything that uses models
django_asgi_app = get_asgi_application()

# Now we can import routing which uses models
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from posture_stream.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})