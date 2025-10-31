#!/bin/sh
# Inject runtime config into index.html
# Prefer VITE_API_BASE (full URL from connectionString) over VITE_API_HOST
API_BASE="${VITE_API_BASE:-}"
if [ -z "$API_BASE" ]; then
  # Fallback to VITE_API_HOST if VITE_API_BASE not set
  API_BASE="${VITE_API_HOST:-}"
  if [ -n "$API_BASE" ]; then
    # If only host is provided, construct full URL
    # Render's host property may include port, strip it if present
    API_BASE=$(echo "$API_BASE" | sed 's/:.*$//')
    # Append .onrender.com if not already present (Render host property only gives service name)
    if [ "${API_BASE#*onrender.com}" = "$API_BASE" ]; then
      API_BASE="${API_BASE}.onrender.com"
    fi
    # Ensure it has https:// prefix if not already present
    case "$API_BASE" in
      http*) ;;
      *) API_BASE="https://${API_BASE}" ;;
    esac
  fi
fi

# Log for debugging (check Render logs)
echo "Injecting API_BASE: ${API_BASE}" >&2

# Escape single quotes and forward slashes for sed
ESCAPED_API_BASE=$(echo "$API_BASE" | sed "s/'/\\\\'/g" | sed 's/\//\\\//g')

# Inject script tag into index.html - try multiple strategies
if [ -n "$API_BASE" ] && [ -f /usr/share/nginx/html/index.html ]; then
  # Strategy 1: Inject before </head>
  if grep -q '</head>' /usr/share/nginx/html/index.html; then
    sed -i "s|</head>|<script>window.__API_BASE__='${ESCAPED_API_BASE}';</script></head>|" /usr/share/nginx/html/index.html
  # Strategy 2: Inject before </body>
  elif grep -q '</body>' /usr/share/nginx/html/index.html; then
    sed -i "s|</body>|<script>window.__API_BASE__='${ESCAPED_API_BASE}';</script></body>|" /usr/share/nginx/html/index.html
  # Strategy 3: Append at end of <head> tag
  elif grep -q '<head>' /usr/share/nginx/html/index.html; then
    sed -i "s|<head>|<head><script>window.__API_BASE__='${ESCAPED_API_BASE}';</script>|" /usr/share/nginx/html/index.html
  # Strategy 4: Prepend to <body>
  elif grep -q '<body>' /usr/share/nginx/html/index.html; then
    sed -i "s|<body>|<body><script>window.__API_BASE__='${ESCAPED_API_BASE}';</script>|" /usr/share/nginx/html/index.html
  # Strategy 5: Just append before closing html tag
  else
    sed -i "s|</html>|<script>window.__API_BASE__='${ESCAPED_API_BASE}';</script></html>|" /usr/share/nginx/html/index.html
  fi
  echo "API_BASE injection completed" >&2
else
  echo "Warning: API_BASE is empty or index.html not found" >&2
fi

exec nginx -g 'daemon off;'

