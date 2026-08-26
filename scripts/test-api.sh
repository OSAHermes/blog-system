#!/bin/bash
# Test all blog API endpoints (via docker exec)
set -e

PASS=0
FAIL=0

test_endpoint() {
    local path=$1
    local desc=$2
    
    result=$(docker exec blog_api node -e "
const http = require('http');
http.get('http://localhost:3000$path', (res) => {
  console.log(res.statusCode);
}).on('error', e => console.log('ERROR'));
")
    
    if [ "$result" = "200" ]; then
        echo "✓ $desc"
        ((PASS++))
    else
        echo "✗ $desc ($result)"
        ((FAIL++))
    fi
}

echo "=== Blog API Tests ==="

# Public endpoints
test_endpoint "/api/v1/public/settings" "Site settings"
test_endpoint "/api/v1/public/categories" "Categories"
test_endpoint "/api/v1/public/tags" "Tags"
test_endpoint "/api/v1/public/articles" "Articles list"
test_endpoint "/api/v1/public/links" "Links"

# Admin login
echo ""
echo "Testing admin login..."
login_result=$(docker exec blog_api node -e "
const http = require('http');
const data = JSON.stringify({username: 'admin', password: 'admin123'});
const req = http.request({hostname: 'localhost', port: 3000, path: '/api/v1/admin/login', method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}}, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log(res.statusCode));
});
req.write(data);
req.end();
")

if [ "$login_result" = "200" ]; then
    echo "✓ Admin login"
    ((PASS++))
else
    echo "✗ Admin login ($login_result)"
    ((FAIL++))
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
exit ${FAIL}