#!/bin/bash

# ======================================
#  TEST COMPLETO API - IsWorking
# ======================================

BASE_URL="http://localhost:3000"
COOKIE_FILE="cookies.txt"

ADMIN_EMAIL="admin_test_$(date +%s)@isworking.com"
EMPLOYEE_EMAIL="employee_test_$(date +%s)@isworking.com"
PASSWORD="12345"

COMPANY_ID=1
CREATED_USER_ID=""
CREATED_COMPANY_ID=""
CREATED_RECORD_ID=""
CREATED_SCHEDULE_ID=""
CREATED_SHIFT_TEMPLATE_ID=""

GREEN="\e[32m"
RED="\e[31m"
YELLOW="\e[33m"
BLUE="\e[34m"
RESET="\e[0m"

rm -f "$COOKIE_FILE"

print_title() {
  echo -e "\n${BLUE}======================================"
  echo -e "  $1"
  echo -e "======================================${RESET}\n"
}

print_test() {
  echo -e "${YELLOW}Probando: $1${RESET}"
}

print_ok() {
  echo -e "${GREEN}OK${RESET}"
}

print_fail() {
  echo -e "${RED}ERROR${RESET}"
}

request() {
  METHOD="$1"
  URL="$2"
  DATA="$3"
  USE_COOKIES="$4"
  SAVE_COOKIES="$5"

  if [ "$USE_COOKIES" = "yes" ] && [ "$SAVE_COOKIES" = "yes" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE" \
      -d "$DATA")
  elif [ "$USE_COOKIES" = "yes" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -b "$COOKIE_FILE" \
      -d "$DATA")
  elif [ "$SAVE_COOKIES" = "yes" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -H "Content-Type: application/json" \
      -c "$COOKIE_FILE" \
      -d "$DATA")
  else
    if [ -z "$DATA" ]; then
      RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
        -H "Content-Type: application/json")
    else
      RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
        -H "Content-Type: application/json" \
        -d "$DATA")
    fi
  fi

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "HTTP $STATUS"
  echo "$BODY"

  if [[ "$STATUS" =~ ^2 ]]; then
    print_ok
  else
    print_fail
  fi

  echo "--------------------------------------"
}

request_no_body() {
  METHOD="$1"
  URL="$2"
  USE_COOKIES="$3"
  SAVE_COOKIES="$4"

  if [ "$USE_COOKIES" = "yes" ] && [ "$SAVE_COOKIES" = "yes" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -b "$COOKIE_FILE" \
      -c "$COOKIE_FILE")
  elif [ "$USE_COOKIES" = "yes" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -b "$COOKIE_FILE")
  elif [ "$SAVE_COOKIES" = "yes" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
      -c "$COOKIE_FILE")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL")
  fi

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "HTTP $STATUS"
  echo "$BODY"

  if [[ "$STATUS" =~ ^2 ]]; then
    print_ok
  else
    print_fail
  fi

  echo "--------------------------------------"
}

extract_id() {
  echo "$1" | grep -o '"id":[0-9]*' | head -n 1 | grep -o '[0-9]*'
}

print_title "TEST DE RUTAS - IsWorking API"

# ======================================
# 1. HEALTH CHECK
# ======================================

print_title "1. Comprobando servidor"

print_test "Health check"
request_no_body "GET" "$BASE_URL/health" "no" "no"

# ======================================
# 2. AUTH
# ======================================

print_title "2. Auth: register, login, refresh"

print_test "Registrar usuario admin de prueba"
REGISTER_ADMIN_DATA='{
  "name": "Admin Test Script",
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "company_id": 1,
  "role": "admin"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_ADMIN_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP $STATUS"
echo "$BODY"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_test "Login admin y guardado de cookies"
LOGIN_DATA='{
  "email": "'"$ADMIN_EMAIL"'",
  "password": "'"$PASSWORD"'"
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_FILE" \
  -d "$LOGIN_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP $STATUS"
echo "$BODY"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_test "Refresh token"
request_no_body "POST" "$BASE_URL/api/auth/refresh" "yes" "yes"

# ======================================
# 3. COMPANIES
# ======================================

print_title "3. Companies"

print_test "Listar empresas"
request_no_body "GET" "$BASE_URL/api/companies" "yes" "no"

print_test "Ver empresa por ID 1"
request_no_body "GET" "$BASE_URL/api/companies/1" "yes" "no"

print_test "Crear empresa de prueba"
CREATE_COMPANY_DATA='{
  "name": "Empresa Test Script",
  "timezone": "Europe/Madrid",
  "office_latitude": 43.2630,
  "office_longitude": -2.9350,
  "office_radius_m": 300,
  "active": true
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/companies" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "$CREATE_COMPANY_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
CREATED_COMPANY_ID=$(extract_id "$BODY")

echo "HTTP $STATUS"
echo "$BODY"
echo "CREATED_COMPANY_ID=$CREATED_COMPANY_ID"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -n "$CREATED_COMPANY_ID" ]; then
  print_test "Actualizar empresa creada"
  UPDATE_COMPANY_DATA='{
    "name": "Empresa Test Script Actualizada",
    "office_radius_m": 500
  }'
  request "PATCH" "$BASE_URL/api/companies/$CREATED_COMPANY_ID" "$UPDATE_COMPANY_DATA" "yes" "no"

  print_test "Desactivar empresa creada"
  request_no_body "PATCH" "$BASE_URL/api/companies/$CREATED_COMPANY_ID/deactivate" "yes" "no"

  print_test "Activar empresa creada"
  request_no_body "PATCH" "$BASE_URL/api/companies/$CREATED_COMPANY_ID/activate" "yes" "no"
else
  echo -e "${RED}No se creó empresa. Se saltan pruebas de update/activate/deactivate.${RESET}"
fi

# ======================================
# 4. USERS
# ======================================

print_title "4. Users"

print_test "Listar usuarios de la empresa del admin"
request_no_body "GET" "$BASE_URL/api/users" "yes" "no"

print_test "Crear empleado desde admin"
CREATE_EMPLOYEE_DATA='{
  "name": "Empleado Test Script",
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "role": "employee",
  "remote_allowed": true
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "$CREATE_EMPLOYEE_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
CREATED_USER_ID=$(extract_id "$BODY")

echo "HTTP $STATUS"
echo "$BODY"
echo "CREATED_USER_ID=$CREATED_USER_ID"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -n "$CREATED_USER_ID" ]; then
  print_test "Actualizar empleado creado"
  UPDATE_EMPLOYEE_DATA='{
    "name": "Empleado Test Script Actualizado",
    "remote_allowed": false
  }'
  request "PUT" "$BASE_URL/api/users/$CREATED_USER_ID" "$UPDATE_EMPLOYEE_DATA" "yes" "no"

  print_test "Desactivar empleado creado"
  USER_STATUS_DATA='{
    "active": false
  }'
  request "PATCH" "$BASE_URL/api/users/$CREATED_USER_ID/status" "$USER_STATUS_DATA" "yes" "no"

  print_test "Reactivar empleado creado"
  USER_STATUS_DATA='{
    "active": true
  }'
  request "PATCH" "$BASE_URL/api/users/$CREATED_USER_ID/status" "$USER_STATUS_DATA" "yes" "no"
else
  echo -e "${RED}No se creó empleado. Se saltan pruebas de update/status.${RESET}"
fi

# ======================================
# 5. SHIFT TEMPLATES
# ======================================

print_title "5. Shift templates"

print_test "Listar plantillas de turnos"
request_no_body "GET" "$BASE_URL/api/shift-templates" "yes" "no"

print_test "Crear plantilla de turno"
CREATE_SHIFT_DATA='{
  "company_id": 1,
  "name": "Turno Test Script",
  "type": "morning",
  "start_time": "09:00",
  "end_time": "17:00",
  "break_start": "13:00",
  "break_end": "13:30",
  "has_break": true
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/shift-templates" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "$CREATE_SHIFT_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
CREATED_SHIFT_TEMPLATE_ID=$(extract_id "$BODY")

echo "HTTP $STATUS"
echo "$BODY"
echo "CREATED_SHIFT_TEMPLATE_ID=$CREATED_SHIFT_TEMPLATE_ID"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

# Si no se pudo crear, usamos plantilla 1 por defecto
if [ -z "$CREATED_SHIFT_TEMPLATE_ID" ]; then
  CREATED_SHIFT_TEMPLATE_ID=1
fi

# ======================================
# 6. SCHEDULES
# ======================================

print_title "6. Schedules"

print_test "Listar horarios"
request_no_body "GET" "$BASE_URL/api/schedules" "yes" "no"

# Si no hay usuario creado, usamos user_id 3 del init.sql
if [ -z "$CREATED_USER_ID" ]; then
  CREATED_USER_ID=3
fi

print_test "Asignar horario"
CREATE_SCHEDULE_DATA='{
  "user_id": '"$CREATED_USER_ID"',
  "shift_template_id": '"$CREATED_SHIFT_TEMPLATE_ID"',
  "work_date": "2026-06-01",
  "created_by": 1
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/schedules" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "$CREATE_SCHEDULE_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
CREATED_SCHEDULE_ID=$(extract_id "$BODY")

echo "HTTP $STATUS"
echo "$BODY"
echo "CREATED_SCHEDULE_ID=$CREATED_SCHEDULE_ID"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -n "$CREATED_SCHEDULE_ID" ]; then
  print_test "Actualizar estado del horario a confirmed"
  UPDATE_SCHEDULE_STATUS_DATA='{
    "status": "confirmed"
  }'
  request "PATCH" "$BASE_URL/api/schedules/$CREATED_SCHEDULE_ID/status" "$UPDATE_SCHEDULE_STATUS_DATA" "yes" "no"
else
  echo -e "${RED}No se creó horario. Se salta cambio de estado.${RESET}"
fi

# ======================================
# 7. RECORDS
# ======================================

print_title "7. Time records"

print_test "Listar fichajes"
request_no_body "GET" "$BASE_URL/api/records" "yes" "no"

print_test "Crear fichaje de entrada"
CREATE_RECORD_DATA='{
  "type": "entry",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5,
  "scheduleId": '"${CREATED_SCHEDULE_ID:-null}"'
}'

# Si CREATED_SCHEDULE_ID está vacío, rehacemos JSON sin scheduleId válido
if [ -z "$CREATED_SCHEDULE_ID" ]; then
CREATE_RECORD_DATA='{
  "type": "entry",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}'
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/records" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d "$CREATE_RECORD_DATA")

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
CREATED_RECORD_ID=$(extract_id "$BODY")

echo "HTTP $STATUS"
echo "$BODY"
echo "CREATED_RECORD_ID=$CREATED_RECORD_ID"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -n "$CREATED_RECORD_ID" ]; then
  print_test "Ver fichaje creado por ID"
  request_no_body "GET" "$BASE_URL/api/records/$CREATED_RECORD_ID" "yes" "no"

  print_test "Actualizar fichaje creado"
  UPDATE_RECORD_DATA='{
    "accuracy": 5.25,
    "mode": "office"
  }'
  request "PATCH" "$BASE_URL/api/records/$CREATED_RECORD_ID" "$UPDATE_RECORD_DATA" "yes" "no"

  print_test "Eliminar fichaje creado"
  request_no_body "DELETE" "$BASE_URL/api/records/$CREATED_RECORD_ID" "yes" "no"
else
  echo -e "${RED}No se creó fichaje. Se saltan pruebas de get/update/delete record.${RESET}"
fi

# ======================================
# 8. LOGOUT
# ======================================

print_title "8. Logout"

print_test "Logout"
request_no_body "POST" "$BASE_URL/api/auth/logout" "yes" "no"

# ======================================
# 9. RUTA INEXISTENTE
# ======================================

print_title "9. Ruta inexistente"

print_test "Comprobar 404 controlado"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/ruta-que-no-existe")
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP $STATUS"
echo "$BODY"

if [ "$STATUS" = "404" ]; then
  print_ok
else
  print_fail
fi

echo "--------------------------------------"
print_title "TEST FINALIZADO"

echo "Archivo de cookies usado: $COOKIE_FILE"
echo "Admin creado: $ADMIN_EMAIL"
echo "Empleado creado: $EMPLOYEE_EMAIL"
