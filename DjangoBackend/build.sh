#!/usr/bin/env bash
# Build script for Render

set -o errexit

cd "gemini variant/posture_project/posture_project"

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
