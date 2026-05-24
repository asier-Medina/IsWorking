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
  TOTAL=$((TOTAL + 1))
  echo "HTTP $STATUS"
  echo "$BODY"
  if [ "$STATUS" = "$EXPECTED" ]; then ok; else
    echo -e "${RED}Esperado HTTP $EXPECTED pero llegó HTTP $STATUS${RESET}"
    fail
  fi
  echo "--------------------------------------"
}

expect_2xx() {
  TOTAL=$((TOTAL + 1))
  echo "HTTP $STATUS"
  echo "$BODY"
  if [[ "$STATUS" =~ ^2 ]]; then ok; else fail; fi
  echo "--------------------------------------"
}

expect_contains() {
  TEXT="$1"
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
expect_status "200"

# ======================================
# 2. REGISTRO Y LOGIN ADMIN
# ======================================

print_title "2. Crear admin y autenticar"

print_test "Registrar admin de prueba"
request_json "POST" "$BASE_URL/api/auth/register" '{
  "name": "Admin Logs Test",
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "company_id": 1,
  "role": "admin"
}' "none" ""
ADMIN_ID=$(extract_id "$BODY")
expect_status "201"
echo "ADMIN_ID=$ADMIN_ID"

if [ -z "$ADMIN_ID" ]; then
  echo -e "${RED}No se pudo extraer ADMIN_ID. El resto del test puede fallar.${RESET}"
fi

print_test "Login admin"
request_json "POST" "$BASE_URL/api/auth/login" '{
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'"
}' "save" "$COOKIE_ADMIN"
expect_status "200"

print_test "Refresh token admin"
request_no_body "POST" "$BASE_URL/api/auth/refresh" "use-save" "$COOKIE_ADMIN"
expect_status "200"

# ======================================
# 3. AUTH LOGS AUTOMÁTICOS
# ======================================

print_title "3. Logs automáticos de auth"

print_test "Logs del admin por user_id"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200"

print_test "Log de register generado automáticamente"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=register" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "register"

print_test "Log de login generado automáticamente"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=login" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "login"

print_test "Log de token_refresh generado automáticamente"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=token_refresh" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "token_refresh"

# ======================================
# 4. LOG AUTH MANUAL
# ======================================

print_title "4. Log auth manual"

print_test "Crear log login_failed manual"
request_json "POST" "$BASE_URL/api/logs/auth" '{
  "user_id": '"$ADMIN_ID"',
  "action": "login_failed",
  "ip": "127.0.0.1",
  "user_agent": "test_mongo.sh",
  "success": false,
  "reason": "TEST_AUTH_LOG_'"$UNIQUE"'"
}' "use" "$COOKIE_ADMIN"
expect_status "201"

print_test "Buscar log login_failed manual"
request_no_body "GET" "$BASE_URL/api/logs/auth?user_id=$ADMIN_ID&action=login_failed" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "TEST_AUTH_LOG_$UNIQUE"

# ======================================
# 5. RECORD LOGS AUTOMÁTICOS
# ======================================

print_title "5. Record logs automáticos al fichar"

print_test "Fichar entrada — debe generar log en Mongo"
request_json "POST" "$BASE_URL/api/records" '{
  "type": "entry",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}' "use-save" "$COOKIE_ADMIN"
expect_2xx

print_test "Log de fichaje generado automáticamente"
request_no_body "GET" "$BASE_URL/api/logs/records?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "entry"

print_test "Fichar salida — genera otro log"
request_json "POST" "$BASE_URL/api/records" '{
  "type": "exit",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}' "use-save" "$COOKIE_ADMIN"
expect_2xx

print_test "Logs del día deben tener entry y exit"
request_no_body "GET" "$BASE_URL/api/logs/records?user_id=$ADMIN_ID&date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "exit"

# ======================================
# 6. RECORD LOG MANUAL
# ======================================

print_title "6. Record log manual"

print_test "Crear log de fichaje manual"
request_json "POST" "$BASE_URL/api/logs/records" '{
  "user_id": '"$ADMIN_ID"',
  "company_id": 1,
  "record_id": 999999,
  "type": "entry",
  "mode": "remote",
  "latitude": 43.2632,
  "longitude": -2.9352
}' "use" "$COOKIE_ADMIN"
expect_status "201"

print_test "Listar record logs — debe contener record_id 999999"
request_no_body "GET" "$BASE_URL/api/logs/records?user_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "999999"

# ======================================
# 7. ADMIN LOGS AUTOMÁTICOS
# ======================================

print_title "7. Admin logs automáticos"

print_test "Crear empleado — debe generar log de admin"
request_json "POST" "$BASE_URL/api/users" '{
  "name": "Empleado Log Test",
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "role": "employee",
  "remote_allowed": false
}' "use-save" "$COOKIE_ADMIN"
EMPLOYEE_ID=$(extract_id "$BODY")
expect_2xx
echo "EMPLOYEE_ID=$EMPLOYEE_ID"

print_test "Log create_user generado automáticamente"
request_no_body "GET" "$BASE_URL/api/logs/admin?admin_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "create_user"

if [ -n "$EMPLOYEE_ID" ]; then
  print_test "Desactivar empleado — debe generar log deactivate_user"
  request_json "PATCH" "$BASE_URL/api/users/$EMPLOYEE_ID/status" \
    '{"active": false}' "use" "$COOKIE_ADMIN"
  expect_2xx

  print_test "Log deactivate_user generado"
  request_no_body "GET" "$BASE_URL/api/logs/admin?admin_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
  expect_status "200"
  expect_contains "deactivate_user"

  print_test "Reactivar empleado — debe generar log activate_user"
  request_json "PATCH" "$BASE_URL/api/users/$EMPLOYEE_ID/status" \
    '{"active": true}' "use" "$COOKIE_ADMIN"
  expect_2xx

  print_test "Log activate_user generado"
  request_no_body "GET" "$BASE_URL/api/logs/admin?admin_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
  expect_status "200"
  expect_contains "activate_user"
fi

# ======================================
# 8. ADMIN LOG MANUAL
# ======================================

print_title "8. Admin log manual"

print_test "Crear log admin manual"
request_json "POST" "$BASE_URL/api/logs/admin" '{
  "admin_id": '"$ADMIN_ID"',
  "company_id": 1,
  "action": "test_admin_log_'"$UNIQUE"'",
  "target_type": "user",
  "target_id": '"${EMPLOYEE_ID:-1}"',
  "payload": {"detail": "prueba manual test_mongo.sh"}
}' "use" "$COOKIE_ADMIN"
expect_status "201"

print_test "Buscar log admin manual"
request_no_body "GET" "$BASE_URL/api/logs/admin?admin_id=$ADMIN_ID" "use" "$COOKIE_ADMIN"
expect_status "200"
expect_contains "test_admin_log_$UNIQUE"

# ======================================
# 9. FILTROS POR FECHA
# ======================================

print_title "9. Filtros por fecha"

print_test "Auth logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/auth?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200"

print_test "Record logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/records?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200"

print_test "Admin logs de hoy"
request_no_body "GET" "$BASE_URL/api/logs/admin?date=$TODAY" "use" "$COOKIE_ADMIN"
expect_status "200"

# ======================================
# 10. SEGURIDAD
# ======================================

print_title "10. Seguridad"

print_test "Sin token debe dar 401"
request_no_body "GET" "$BASE_URL/api/logs/auth" "none" ""
expect_status "401"

print_test "Login empleado"
request_json "POST" "$BASE_URL/api/auth/login" '{
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'"
}' "save" "$COOKIE_EMPLOYEE"
expect_status "200"

print_test "Empleado accediendo a logs debe dar 403"
request_no_body "GET" "$BASE_URL/api/logs/auth" "use" "$COOKIE_EMPLOYEE"
expect_status "403"

# ======================================
# 11. VALIDACIÓN DE BORRADO
# ======================================

print_title "11. Validación de borrado"

print_test "DELETE /logs/auth sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/auth" "use" "$COOKIE_ADMIN"
expect_status "400"

print_test "DELETE /logs/records sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/records" "use" "$COOKIE_ADMIN"
expect_status "400"

print_test "DELETE /logs/admin sin before debe dar 400"
request_no_body "DELETE" "$BASE_URL/api/logs/admin" "use" "$COOKIE_ADMIN"
expect_status "400"

# ======================================
# 12. COMPROBACIÓN DIRECTA EN MONGO
# ======================================

print_title "12. Conteo directo en MongoDB"

if command -v docker >/dev/null 2>&1; then
  docker exec IsWorking_mongo mongosh isworking --quiet --eval '
    print("logauths:   " + db.logauths.countDocuments());
    print("logrecords: " + db.logrecords.countDocuments());
    print("logadmins:  " + db.logadmins.countDocuments());
  ' 2>/dev/null || echo -e "${YELLOW}No se pudo ejecutar mongosh. No pasa nada si los tests HTTP han funcionado.${RESET}"
else
  echo -e "${YELLOW}Docker no disponible. Se omite comprobación directa.${RESET}"
fi

# ======================================
# RESUMEN
# ======================================

print_title "RESUMEN FINAL"

echo "Total:    $TOTAL"
echo -e "Pasados:  ${GREEN}$PASSED${RESET}"
echo -e "Fallidos: ${RED}$FAILED${RESET}"
echo ""
echo "Admin:    $ADMIN_EMAIL (ID: $ADMIN_ID)"
echo "Empleado: $EMPLOYEE_EMAIL (ID: $EMPLOYEE_ID)"

if [ "$FAILED" -eq 0 ]; then
  echo -e "\n${GREEN}Todos los tests de logs Mongo han pasado.${RESET}"
  exit 0
else
  echo -e "\n${RED}Hay $FAILED tests fallando. Revisa las respuestas anteriores.${RESET}"
  exit 1
fi