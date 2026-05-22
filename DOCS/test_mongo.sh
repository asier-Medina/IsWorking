#!/bin/bash

# ======================================
# TEST LOGS MONGO - IsWorking API
# ======================================

BASE_URL="http://localhost:3000"
COOKIE_ADMIN="cookies_logs_admin.txt"
COOKIE_EMPLOYEE="cookies_logs_employee.txt"

UNIQUE="$(date +%s)"
TODAY="$(date +%F)"

ADMIN_EMAIL="admin_logs_test_${UNIQUE}@isworking.com"
EMPLOYEE_EMAIL="employee_logs_test_${UNIQUE}@isworking.com"
PASSWORD="12345"

ADMIN_ID=""
EMPLOYEE_ID=""

GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
BLUE="\e[34m"
RESET="\e[0m"

TOTAL=0
PASSED=0
FAILED=0

rm -f "$COOKIE_ADMIN" "$COOKIE_EMPLOYEE"

print_title() {
  echo -e "\n${BLUE}======================================"
  echo -e "  $1"
  echo -e "======================================${RESET}\n"
}

print_test() {
  echo -e "${YELLOW}Probando: $1${RESET}"
}

ok() {
  echo -e "${GREEN}OK${RESET}"
  PASSED=$((PASSED + 1))
}

fail() {
  echo -e "${RED}ERROR${RESET}"
  FAILED=$((FAILED + 1))
}

extract_id() {
  echo "$1" | grep -o '"id":[0-9]*' | head -n 1 | grep -o '[0-9]*'
}

request_json() {
  METHOD="$1"
  URL="$2"
  DATA="$3"
  COOKIE_MODE="$4"
  COOKIE_FILE="$5"

  if [ "$COOKIE_MODE" = "save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -c "$COOKIE_FILE" \
      -d "$DATA")
  elif [ "$COOKIE_MODE" = "use" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_FILE" \
      -d "$DATA")
  elif [ "$COOKIE_MODE" = "use-save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE" \
      -d "$DATA")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -d "$DATA")
  fi

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)
}

request_no_body() {
  METHOD="$1"
  URL="$2"
  COOKIE_MODE="$3"
  COOKIE_FILE="$4"

  if [ "$COOKIE_MODE" = "save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -c "$COOKIE_FILE")
  elif [ "$COOKIE_MODE" = "use" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -b "$COOKIE_FILE")
  elif [ "$COOKIE_MODE" = "use-save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL")
  fi

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)
}

expect_status() {
  EXPECTED="$1"
  DESCRIPTION="$2"

  TOTAL=$((TOTAL + 1))

  echo "HTTP $STATUS"
  echo "$BODY"

  if [ "$STATUS" = "$EXPECTED" ]; then
    ok
  else
    echo -e "${RED}Esperado HTTP $EXPECTED pero llegó HTTP $STATUS${RESET}"
    fail
  fi

  echo "--------------------------------------"
}

expect_2xx() {
  DESCRIPTION="$1"

  TOTAL=$((TOTAL + 1))

  echo "HTTP $STATUS"
  echo "$BODY"

  if [[ "$STATUS" =~ ^2 ]]; then
    ok
  else
    fail
  fi

  echo "--------------------------------------"
}

expect_contains() {
  TEXT="$1"
  DESCRIPTION="$2"

  TOTAL=$((TOTAL + 1))

  if echo "$BODY" | grep -q "$TEXT"; then
    echo -e "${GREEN}OK: encontrado '$TEXT'${RESET}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}ERROR: no se encontró '$TEXT' en la respuesta${RESET}"
    FAILED=$((FAILED + 1))
  fi

  echo "--------------------------------------"
}

print_title "TEST LOGS MONGO - IsWorking API"

# ======================================
# 1. HEALTH
# ======================================

print_title "1. Health check"

print_test "Servidor activo"
request_no_body "GET" "$BASE_URL/health" "none" ""
expect_status "200" "Health"

# ======================================
# 2. REGISTRO Y LOGIN ADMIN
# ======================================

print_title "2. Crear admin y autenticar"

print_test "Registrar admin de prueba"
REGISTER_ADMIN_DATA='{
  "name": "Admin Logs Test",
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "company_id": 1,
  "role": "admin"
}'

request_json "POST" "$BASE_URL/api/auth/register" "$REGISTER_ADMIN_DATA" "none" ""
ADMIN_ID=$(extract_id "$BODY")
expect_status "201" "Register admin"

echo "ADMIN_ID=$ADMIN_ID"

if [ -z "$ADMIN_ID" ]; then
  echo -e "${RED}No se pudo extraer ADMIN_ID. El resto del test puede fallar.${RESET}"
fi

print_test "Login admin y guardar cookies"
LOGIN_ADMIN_DATA='{
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'"
}'

request_json "POST" "$BASE_URL/api/auth/login" "$LOGIN_ADMIN_DATA" "save" "$COOKIE_ADMIN"
expect_status "200" "Login admin"

print_test "Refresh token admin"
request_no_body "POST" "$BASE_URL/api/auth/refresh" "use-save" "$COOKIE_ADMIN"
expect_status "200" "Refresh admin"

# ======================================
# 3. AUTH LOGS AUTOMÁTICOS
# ======================================

print_title "3. Comprobar logs automáticos de auth"

print_test "Listar logs auth del admin creado"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs por user_id"

print_test "Debe existir log de register"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=register" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs register"
expect_contains "register" "Contiene register"

print_test "Debe existir log de login"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=login" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs login"
expect_contains "login" "Contiene login"

print_test "Debe existir log de token_refresh"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=token_refresh" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs token_refresh"
expect_contains "token_refresh" "Contiene token_refresh"

# ======================================
# 4. CREAR LOG AUTH MANUAL
# ======================================

print_title "4. Crear y leer log auth manual"

print_test "Crear log auth manual login_failed"
MANUAL_AUTH_LOG='{
  "user_id": '"$ADMIN_ID"',
  "action": "login_failed",
  "ip": "127.0.0.1",
  "user_agent": "test_logs_mongo.sh",
  "success": false,
  "reason": "TEST_AUTH_LOG_'"$UNIQUE"'"
}'

request_json "POST" "$BASE_URL/api/logs/auth" "$MANUAL_AUTH_LOG" "use" "$COOKIE_ADMIN"
expect_status "201" "POST auth log manual"

print_test "Buscar log auth manual"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=login_failed" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth login_failed"
expect_contains "TEST_AUTH_LOG_$UNIQUE" "Contiene reason único"

# ======================================
# 5. RECORD LOGS
# ======================================

print_title "5. Crear y leer record logs"

print_test "Crear log de fichaje manual"
MANUAL_RECORD_LOG='{
  "user_id": '"$ADMIN_ID"',
  "company_id": 1,
  "record_id": 999999,
  "action": "create",
  "type": "entry",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352
}'

request_json "POST" "$BASE_URL/api/logs/records" "$MANUAL_RECORD_LOG" "use" "$COOKIE_ADMIN"
expect_status "201" "POST record log"

print_test "Listar record logs por user_id"
request_no_body "GET" "$BASE_URL/api/logs/records?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200" "GET record logs"
expect_contains "999999" "Contiene record_id de prueba"

# ======================================
# 6. ADMIN LOGS
# ======================================

print_title "6. Crear y leer admin logs"

print_test "Crear log admin manual"
MANUAL_ADMIN_LOG='{
  "admin_id": '"$ADMIN_ID"',
  "company_id": 1,
  "action": "test_admin_log_'"$UNIQUE"'",
  "target_type": "user",
  "target_id": '"$ADMIN_ID"',
  "detail": "Prueba manual desde test_logs_mongo.sh"
}'

request_json "POST" "$BASE_URL/api/logs/admin" "$MANUAL_ADMIN_LOG" "use" "$COOKIE_ADMIN"
expect_status "201" "POST admin log"

print_test "Listar admin logs por admin_id"
request_no_body "GET" "$BASE_URL/api/logs/admin?admin_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200" "GET admin logs"
expect_contains "test_admin_log_$UNIQUE" "Contiene action única"

# ======================================
# 7. FILTRO POR FECHA
# ======================================

print_title "7. Filtros por fecha"

print_test "Auth logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/auth?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs por fecha"

print_test "Record logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/records?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200" "GET record logs por fecha"

print_test "Admin logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/admin?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200" "GET admin logs por fecha"

# ======================================
# 8. SEGURIDAD
# ======================================

print_title "8. Seguridad de rutas de logs"

print_test "Acceso sin cookies debe dar 401"
request_no_body "GET" "$BASE_URL/api/logs/auth" "none" ""
expect_status "401" "GET logs sin auth"

print_test "Registrar empleado de prueba"
REGISTER_EMPLOYEE_DATA='{
  "name": "Employee Logs Test",
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "company_id": 1,
  "role": "employee"
}'

request_json "POST" "$BASE_URL/api/auth/register" "$REGISTER_EMPLOYEE_DATA" "none" ""
EMPLOYEE_ID=$(extract_id "$BODY")
expect_status "201" "Register employee"

print_test "Login empleado"
LOGIN_EMPLOYEE_DATA='{
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'"
}'

request_json "POST" "$BASE_URL/api/auth/login" "$LOGIN_EMPLOYEE_DATA" "save" "$COOKIE_EMPLOYEE"
expect_status "200" "Login employee"

print_test "Empleado intentando consultar logs debe dar 403"
request_no_body "GET" "$BASE_URL/api/logs/auth" "use" "$COOKIE_EMPLOYEE"
expect_status "403" "GET logs como employee"

# ======================================
# 9. DELETE SIN BEFORE
# No borra datos, solo comprueba validación.
# ======================================

print_title "9. Validación de borrado"

print_test "DELETE /api/logs/auth sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/auth" "use" "$COOKIE_ADMIN"
expect_status "400" "DELETE auth sin before"

print_test "DELETE /api/logs/records sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/records" "use" "$COOKIE_ADMIN"
expect_status "400" "DELETE records sin before"

print_test "DELETE /api/logs/admin sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/admin" "use" "$COOKIE_ADMIN"
expect_status "400" "DELETE admin sin before"

# ======================================
# 10. COMPROBACIÓN DIRECTA EN MONGO
# ======================================

print_title "10. Comprobación directa opcional en Mongo"

if command -v docker >/dev/null 2>&1; then
  echo "Conteo directo en MongoDB:"
  docker exec IsWorking_mongo mongosh isworking --quiet --eval '
    print("logauths: " + db.logauths.countDocuments());
    print("logrecords: " + db.logrecords.countDocuments());
    print("logadmins: " + db.logadmins.countDocuments());
  ' 2>/dev/null || echo -e "${YELLOW}No se pudo ejecutar mongosh dentro del contenedor. No pasa nada si los tests HTTP han funcionado.${RESET}"
else
  echo -e "${YELLOW}Docker no disponible en esta terminal. Se omite comprobación directa.${RESET}"
fi

#!/bin/bash

# ======================================
# TEST LOGS MONGO - IsWorking API
# ======================================

BASE_URL="http://localhost:3000"
COOKIE_ADMIN="cookies_logs_admin.txt"
COOKIE_EMPLOYEE="cookies_logs_employee.txt"

UNIQUE="$(date +%s)"
TODAY="$(date +%F)"

ADMIN_EMAIL="admin_logs_test_${UNIQUE}@isworking.com"
EMPLOYEE_EMAIL="employee_logs_test_${UNIQUE}@isworking.com"
PASSWORD="12345"

ADMIN_ID=""
EMPLOYEE_ID=""

GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
BLUE="\e[34m"
RESET="\e[0m"

TOTAL=0
PASSED=0
FAILED=0

rm -f "$COOKIE_ADMIN" "$COOKIE_EMPLOYEE"

print_title() {
  echo -e "\n${BLUE}======================================"
  echo -e "  $1"
  echo -e "======================================${RESET}\n"
}

print_test() {
  echo -e "${YELLOW}Probando: $1${RESET}"
}

ok() {
  echo -e "${GREEN}OK${RESET}"
  PASSED=$((PASSED + 1))
}

fail() {
  echo -e "${RED}ERROR${RESET}"
  FAILED=$((FAILED + 1))
}

extract_id() {
  echo "$1" | grep -o '"id":[0-9]*' | head -n 1 | grep -o '[0-9]*'
}

request_json() {
  METHOD="$1"
  URL="$2"
  DATA="$3"
  COOKIE_MODE="$4"
  COOKIE_FILE="$5"

  if [ "$COOKIE_MODE" = "save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -c "$COOKIE_FILE" \
      -d "$DATA")
  elif [ "$COOKIE_MODE" = "use" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_FILE" \
      -d "$DATA")
  elif [ "$COOKIE_MODE" = "use-save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE" \
      -d "$DATA")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -d "$DATA")
  fi

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)
}

request_no_body() {
  METHOD="$1"
  URL="$2"
  COOKIE_MODE="$3"
  COOKIE_FILE="$4"

  if [ "$COOKIE_MODE" = "save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -c "$COOKIE_FILE")
  elif [ "$COOKIE_MODE" = "use" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -b "$COOKIE_FILE")
  elif [ "$COOKIE_MODE" = "use-save" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL")
  fi

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)
}

expect_status() {
  EXPECTED="$1"
  DESCRIPTION="$2"

  TOTAL=$((TOTAL + 1))

  echo "HTTP $STATUS"
  echo "$BODY"

  if [ "$STATUS" = "$EXPECTED" ]; then
    ok
  else
    echo -e "${RED}Esperado HTTP $EXPECTED pero llegó HTTP $STATUS${RESET}"
    fail
  fi

  echo "--------------------------------------"
}

expect_2xx() {
  DESCRIPTION="$1"

  TOTAL=$((TOTAL + 1))

  echo "HTTP $STATUS"
  echo "$BODY"

  if [[ "$STATUS" =~ ^2 ]]; then
    ok
  else
    fail
  fi

  echo "--------------------------------------"
}

expect_contains() {
  TEXT="$1"
  DESCRIPTION="$2"

  TOTAL=$((TOTAL + 1))

  if echo "$BODY" | grep -q "$TEXT"; then
    echo -e "${GREEN}OK: encontrado '$TEXT'${RESET}"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}ERROR: no se encontró '$TEXT' en la respuesta${RESET}"
    FAILED=$((FAILED + 1))
  fi

  echo "--------------------------------------"
}

print_title "TEST LOGS MONGO - IsWorking API"

# ======================================
# 1. HEALTH
# ======================================

print_title "1. Health check"

print_test "Servidor activo"
request_no_body "GET" "$BASE_URL/health" "none" ""
expect_status "200" "Health"

# ======================================
# 2. REGISTRO Y LOGIN ADMIN
# ======================================

print_title "2. Crear admin y autenticar"

print_test "Registrar admin de prueba"
REGISTER_ADMIN_DATA='{
  "name": "Admin Logs Test",
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "company_id": 1,
  "role": "admin"
}'

request_json "POST" "$BASE_URL/api/auth/register" "$REGISTER_ADMIN_DATA" "none" ""
ADMIN_ID=$(extract_id "$BODY")
expect_status "201" "Register admin"

echo "ADMIN_ID=$ADMIN_ID"

if [ -z "$ADMIN_ID" ]; then
  echo -e "${RED}No se pudo extraer ADMIN_ID. El resto del test puede fallar.${RESET}"
fi

print_test "Login admin y guardar cookies"
LOGIN_ADMIN_DATA='{
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'"
}'

request_json "POST" "$BASE_URL/api/auth/login" "$LOGIN_ADMIN_DATA" "save" "$COOKIE_ADMIN"
expect_status "200" "Login admin"

print_test "Refresh token admin"
request_no_body "POST" "$BASE_URL/api/auth/refresh" "use-save" "$COOKIE_ADMIN"
expect_status "200" "Refresh admin"

# ======================================
# 3. AUTH LOGS AUTOMÁTICOS
# ======================================

print_title "3. Comprobar logs automáticos de auth"

print_test "Listar logs auth del admin creado"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs por user_id"

print_test "Debe existir log de register"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=register" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs register"
expect_contains "register" "Contiene register"

print_test "Debe existir log de login"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=login" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs login"
expect_contains "login" "Contiene login"

print_test "Debe existir log de token_refresh"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=token_refresh" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs token_refresh"
expect_contains "token_refresh" "Contiene token_refresh"

# ======================================
# 4. CREAR LOG AUTH MANUAL
# ======================================

print_title "4. Crear y leer log auth manual"

print_test "Crear log auth manual login_failed"
MANUAL_AUTH_LOG='{
  "user_id": '"$ADMIN_ID"',
  "action": "login_failed",
  "ip": "127.0.0.1",
  "user_agent": "test_logs_mongo.sh",
  "success": false,
  "reason": "TEST_AUTH_LOG_'"$UNIQUE"'"
}'

request_json "POST" "$BASE_URL/api/logs/auth" "$MANUAL_AUTH_LOG" "use" "$COOKIE_ADMIN"
expect_status "201" "POST auth log manual"

print_test "Buscar log auth manual"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=login_failed" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth login_failed"
expect_contains "TEST_AUTH_LOG_$UNIQUE" "Contiene reason único"

# ======================================
# 5. RECORD LOGS
# ======================================

print_title "5. Crear y leer record logs"

print_test "Crear log de fichaje manual"
MANUAL_RECORD_LOG='{
  "user_id": '"$ADMIN_ID"',
  "company_id": 1,
  "record_id": 999999,
  "action": "create",
  "type": "entry",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352
}'

request_json "POST" "$BASE_URL/api/logs/records" "$MANUAL_RECORD_LOG" "use" "$COOKIE_ADMIN"
expect_status "201" "POST record log"

print_test "Listar record logs por user_id"
request_no_body "GET" "$BASE_URL/api/logs/records?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200" "GET record logs"
expect_contains "999999" "Contiene record_id de prueba"

# ======================================
# 6. ADMIN LOGS
# ======================================

print_title "6. Crear y leer admin logs"

print_test "Crear log admin manual"
MANUAL_ADMIN_LOG='{
  "admin_id": '"$ADMIN_ID"',
  "company_id": 1,
  "action": "test_admin_log_'"$UNIQUE"'",
  "target_type": "user",
  "target_id": '"$ADMIN_ID"',
  "detail": "Prueba manual desde test_logs_mongo.sh"
}'

request_json "POST" "$BASE_URL/api/logs/admin" "$MANUAL_ADMIN_LOG" "use" "$COOKIE_ADMIN"
expect_status "201" "POST admin log"

print_test "Listar admin logs por admin_id"
request_no_body "GET" "$BASE_URL/api/logs/admin?admin_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200" "GET admin logs"
expect_contains "test_admin_log_$UNIQUE" "Contiene action única"

# ======================================
# 7. FILTRO POR FECHA
# ======================================

print_title "7. Filtros por fecha"

print_test "Auth logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/auth?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200" "GET auth logs por fecha"

print_test "Record logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/records?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200" "GET record logs por fecha"

print_test "Admin logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/admin?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200" "GET admin logs por fecha"

# ======================================
# 8. SEGURIDAD
# ======================================

print_title "8. Seguridad de rutas de logs"

print_test "Acceso sin cookies debe dar 401"
request_no_body "GET" "$BASE_URL/api/logs/auth" "none" ""
expect_status "401" "GET logs sin auth"

print_test "Registrar empleado de prueba"
REGISTER_EMPLOYEE_DATA='{
  "name": "Employee Logs Test",
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "company_id": 1,
  "role": "employee"
}'

request_json "POST" "$BASE_URL/api/auth/register" "$REGISTER_EMPLOYEE_DATA" "none" ""
EMPLOYEE_ID=$(extract_id "$BODY")
expect_status "201" "Register employee"

print_test "Login empleado"
LOGIN_EMPLOYEE_DATA='{
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'"
}'

request_json "POST" "$BASE_URL/api/auth/login" "$LOGIN_EMPLOYEE_DATA" "save" "$COOKIE_EMPLOYEE"
expect_status "200" "Login employee"

print_test "Empleado intentando consultar logs debe dar 403"
request_no_body "GET" "$BASE_URL/api/logs/auth" "use" "$COOKIE_EMPLOYEE"
expect_status "403" "GET logs como employee"

# ======================================
# 9. DELETE SIN BEFORE
# No borra datos, solo comprueba validación.
# ======================================

print_title "9. Validación de borrado"

print_test "DELETE /api/logs/auth sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/auth" "use" "$COOKIE_ADMIN"
expect_status "400" "DELETE auth sin before"

print_test "DELETE /api/logs/records sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/records" "use" "$COOKIE_ADMIN"
expect_status "400" "DELETE records sin before"

print_test "DELETE /api/logs/admin sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/admin" "use" "$COOKIE_ADMIN"
expect_status "400" "DELETE admin sin before"

# ======================================
# 10. COMPROBACIÓN DIRECTA EN MONGO
# ======================================

print_title "10. Comprobación directa opcional en Mongo"

if command -v docker >/dev/null 2>&1; then
  echo "Conteo directo en MongoDB:"
  docker exec IsWorking_mongo mongosh isworking --quiet --eval '
    print("logauths: " + db.logauths.countDocuments());
    print("logrecords: " + db.logrecords.countDocuments());
    print("logadmins: " + db.logadmins.countDocuments());
  ' 2>/dev/null || echo -e "${YELLOW}No se pudo ejecutar mongosh dentro del contenedor. No pasa nada si los tests HTTP han funcionado.${RESET}"
else
  echo -e "${YELLOW}Docker no disponible en esta terminal. Se omite comprobación directa.${RESET}"
fi

# ======================================
# RESUMEN
# ======================================

print_title "RESUMEN"

echo "Total tests: $TOTAL"
echo -e "Pasados: ${GREEN}$PASSED${RESET}"
echo -e "Fallidos: ${RED}$FAILED${RESET}"
echo "Admin creado: $ADMIN_EMAIL"
echo "Empleado creado: $EMPLOYEE_EMAIL"
echo "Cookie admin: $COOKIE_ADMIN"
echo "Cookie employee: $COOKIE_EMPLOYEE"

if [ "$FAILED" -eq 0 ]; then
  echo -e "\n${GREEN}Todos los tests de logs Mongo han pasado.${RESET}"
  exit 0
else
  echo -e "\n${RED}Hay tests fallando. Revisa las respuestas anteriores.${RESET}"
  exit 1
fi
