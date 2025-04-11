import os

# Determine the base directory (assuming this file is in backend/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Common paths for project resources.
CONVERSATION_HISTORY_PATH = os.path.join(BASE_DIR, "data", "conversation_history.json")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
LOGS_DIR = os.path.join(BASE_DIR, "logs")

# Updated path: now pointing to the rest_config.json file located in the "rest_target" folder.
REST_CONFIG_PATH = os.path.join(BASE_DIR, "rest_target", "rest_config.json")