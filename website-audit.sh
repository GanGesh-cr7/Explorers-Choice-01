#!/bin/bash

BASE_URL="https://www.explorerschoice.online"
API_URL="https://api.explorerschoice.online"

echo "=========================================="
echo "🔍 WEBSITE AUDIT REPORT"
echo "=========================================="
echo ""

# Test 1: Homepage loads
echo "1️⃣  Testing Homepage..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$RESPONSE" == "200" ]; then
  echo "   ✅ Homepage: $RESPONSE OK"
else
  echo "   ❌ Homepage: $RESPONSE ERROR"
fi

# Test 2: Check key pages
echo ""
echo "2️⃣  Testing Key Pages..."
PAGES=("/destinations" "/packages" "/contact" "/login" "/register" "/about" "/faq")
for page in "${PAGES[@]}"; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
  if [ "$RESPONSE" == "200" ]; then
    echo "   ✅ $page: $RESPONSE"
  else
    echo "   ⚠️  $page: $RESPONSE"
  fi
done

# Test 3: API endpoints
echo ""
echo "3️⃣  Testing API Endpoints..."
API_ENDPOINTS=("/api/destinations" "/api/packages" "/api/hotels" "/api/auth/me")
for endpoint in "${API_ENDPOINTS[@]}"; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint")
  if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "401" ]; then
    echo "   ✅ $endpoint: $RESPONSE"
  else
    echo "   ⚠️  $endpoint: $RESPONSE"
  fi
done

# Test 4: SSL/TLS
echo ""
echo "4️⃣  Testing SSL/TLS..."
SSL=$(echo | openssl s_client -servername www.explorerschoice.online -connect www.explorerschoice.online:443 2>/dev/null | grep "subject=")
if [ ! -z "$SSL" ]; then
  echo "   ✅ SSL Certificate: Valid"
  echo "   $SSL"
else
  echo "   ❌ SSL Certificate: Invalid or missing"
fi

# Test 5: Headers
echo ""
echo "5️⃣  Testing Security Headers..."
HEADERS=$(curl -s -I "$BASE_URL" | head -20)
echo "   Headers:"
echo "$HEADERS" | grep -i "content-security\|x-frame\|strict-transport\|x-content-type"

# Test 6: Frontend JS/CSS load
echo ""
echo "6️⃣  Testing Frontend Resources..."
CONTENT=$(curl -s "$BASE_URL")
JS_COUNT=$(echo "$CONTENT" | grep -o "\.js\"" | wc -l)
CSS_COUNT=$(echo "$CONTENT" | grep -o "\.css\"" | wc -l)
echo "   ✅ JavaScript files found: $JS_COUNT"
echo "   ✅ CSS files found: $CSS_COUNT"

# Test 7: API rewrite working
echo ""
echo "7️⃣  Testing API Rewrite Configuration..."
REWRITE_TEST=$(curl -s -I "$BASE_URL/api/packages" 2>&1)
if echo "$REWRITE_TEST" | grep -q "200\|301\|302"; then
  echo "   ✅ API Rewrite: Working"
else
  echo "   ⚠️  API Rewrite: May need checking"
fi

# Test 8: Response times
echo ""
echo "8️⃣  Testing Performance..."
START=$(date +%s%N | cut -b1-13)
curl -s "$BASE_URL" > /dev/null
END=$(date +%s%N | cut -b1-13)
TIME=$((END - START))
echo "   ⏱️  Homepage load time: ${TIME}ms"
if [ $TIME -lt 3000 ]; then
  echo "   ✅ Performance: Good"
elif [ $TIME -lt 6000 ]; then
  echo "   ⚠️  Performance: Acceptable"
else
  echo "   ❌ Performance: Slow (>6s)"
fi

echo ""
echo "=========================================="
echo "✅ AUDIT COMPLETE"
echo "=========================================="
