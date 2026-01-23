#!/bin/sh

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask backend
python backend/unified_app.py
