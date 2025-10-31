#!/bin/sh
# Inject runtime config into index.html
API_BASE="${VITE_API_HOST:-}"
if [ -n "$API_BASE" ]; then
  # If only host is provided, construct full URL
  case "$API_BASE" in
    http*) ;;
    *) API_BASE="https://${API_BASE}" ;;
  esac
else
  API_BASE="${VITE_API_BASE:-}"
fi

# Inject script tag into index.html before closing </head> or </body>
if [ -n "$API_BASE" ]; then
  sed -i "s|</head>|<script>window.__API_BASE__='${API_BASE}';</script></head>|" /usr/share/nginx/html/index.html || \
  sed -i "s|</body>|<script>window.__API_BASE__='${API_BASE}';</script></body>|" /usr/share/nginx/html/index.html
fi

exec nginx -g 'daemon off;'

