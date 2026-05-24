#!/bin/bash

# ======================================
#  TEST COMPLETO API - IsWorking
# ======================================

BASE_URL="http://localhost:3000"
COOKIE_FILE="cookies.txt"
COOKIE_FILE_EMPLOYEE="cookies_employee.txt"

ADMIN_EMAIL="admin_test_$(date +%s)@isworking.com"
EMPLOYEE_EMAIL="employee_test_$(date +%s)@isworking.com"
PASSWORD="12345"

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

rm -f "$COOKIE_FILE" "$COOKIE_FILE_EMPLOYEE"

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
  COOKIE="$4"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
    -H "Content-Type: application/json" \
    -b "$COOKIE" \
    -c "$COOKIE" \
    -d "$DATA")

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "HTTP $STATUS"
  echo "$BODY"

  if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
  echo "--------------------------------------"

  echo "$BODY"
}

request_no_body() {
  METHOD="$1"
  URL="$2"
  COOKIE="$3"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X "$METHOD" "$URL" \
    -b "$COOKIE" \
    -c "$COOKIE")

  BODY=$(echo "$RESPONSE" | sed '$d')
  STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "HTTP $STATUS"
  echo "$BODY"

  if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
  echo "--------------------------------------"

  echo "$BODY"
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
request_no_body "GET" "$BASE_URL/health" ""

# ======================================
# 2. AUTH
# ======================================

print_title "2. Auth"

print_test "Registrar admin"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Test",
    "email": "'"$ADMIN_EMAIL"'",
    "password": "'"$PASSWORD"'",
    "company_id": 1,
    "role": "admin"
  }')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS" && echo "$BODY"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_test "Login admin"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c "$COOKIE_FILE" \
  -d '{"email": "'"$ADMIN_EMAIL"'", "password": "'"$PASSWORD"'"}')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS" && echo "$BODY"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_test "Refresh token"
request_no_body "POST" "$BASE_URL/api/auth/refresh" "$COOKIE_FILE"

print_test "Login con credenciales incorrectas (debe dar 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "'"$ADMIN_EMAIL"'", "password": "wrongpassword"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS"
if [ "$STATUS" = "401" ]; then print_ok; else print_fail; fi
echo "--------------------------------------"

# ======================================
# 3. COMPANIES
# ======================================

print_title "3. Companies"

print_test "Listar empresas"
request_no_body "GET" "$BASE_URL/api/companies" "$COOKIE_FILE"

print_test "Ver empresa por ID 1"
request_no_body "GET" "$BASE_URL/api/companies/1" "$COOKIE_FILE"

print_test "Crear empresa"
RESPONSE=$(request "POST" "$BASE_URL/api/companies" '{
  "name": "Empresa Test Script",
  "timezone": "Europe/Madrid",
  "office_latitude": 43.2630,
  "office_longitude": -2.9350,
  "office_radius_m": 300,
  "active": true
}' "$COOKIE_FILE")
CREATED_COMPANY_ID=$(extract_id "$RESPONSE")
echo "CREATED_COMPANY_ID=$CREATED_COMPANY_ID"

if [ -n "$CREATED_COMPANY_ID" ]; then
  print_test "Actualizar empresa"
  request "PATCH" "$BASE_URL/api/companies/$CREATED_COMPANY_ID" \
    '{"name": "Empresa Test Actualizada", "office_radius_m": 500}' "$COOKIE_FILE"

  print_test "Desactivar empresa"
  request_no_body "PATCH" "$BASE_URL/api/companies/$CREATED_COMPANY_ID/deactivate" "$COOKIE_FILE"

  print_test "Activar empresa"
  request_no_body "PATCH" "$BASE_URL/api/companies/$CREATED_COMPANY_ID/activate" "$COOKIE_FILE"

  print_test "Empresa inexistente (debe dar 404)"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/companies/99999" -b "$COOKIE_FILE")
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  echo "HTTP $STATUS"
  if [ "$STATUS" = "404" ]; then print_ok; else print_fail; fi
  echo "--------------------------------------"
else
  echo -e "${RED}No se creó empresa. Se saltan pruebas de company.${RESET}"
fi

# ======================================
# 4. USERS
# ======================================

print_title "4. Users"

print_test "Listar usuarios"
request_no_body "GET" "$BASE_URL/api/users" "$COOKIE_FILE"

print_test "Crear empleado"
RESPONSE=$(request "POST" "$BASE_URL/api/users" '{
  "name": "Empleado Test",
  "email": "'"$EMPLOYEE_EMAIL"'",
  "password": "'"$PASSWORD"'",
  "role": "employee",
  "remote_allowed": true
}' "$COOKIE_FILE")
CREATED_USER_ID=$(extract_id "$RESPONSE")
echo "CREATED_USER_ID=$CREATED_USER_ID"

if [ -n "$CREATED_USER_ID" ]; then
  print_test "Ver empleado por ID"
  request_no_body "GET" "$BASE_URL/api/users/$CREATED_USER_ID" "$COOKIE_FILE"

  print_test "Actualizar empleado"
  request "PATCH" "$BASE_URL/api/users/$CREATED_USER_ID" \
    '{"name": "Empleado Test Actualizado", "remote_allowed": false}' "$COOKIE_FILE"

  print_test "Desactivar empleado"
  request "PATCH" "$BASE_URL/api/users/$CREATED_USER_ID/status" \
    '{"active": false}' "$COOKIE_FILE"

  print_test "Reactivar empleado"
  request "PATCH" "$BASE_URL/api/users/$CREATED_USER_ID/status" \
    '{"active": true}' "$COOKIE_FILE"

  print_test "Empleado inexistente (debe dar 404)"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users/99999" -b "$COOKIE_FILE")
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  echo "HTTP $STATUS"
  if [ "$STATUS" = "404" ]; then print_ok; else print_fail; fi
  echo "--------------------------------------"

  print_test "Login empleado"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -c "$COOKIE_FILE_EMPLOYEE" \
    -d '{"email": "'"$EMPLOYEE_EMAIL"'", "password": "'"$PASSWORD"'"}')
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  echo "HTTP $STATUS"
  if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
  echo "--------------------------------------"
else
  echo -e "${RED}No se creó empleado. Se saltan pruebas de user.${RESET}"
fi

# ======================================
# 5. SHIFT TEMPLATES
# ======================================

print_title "5. Shift Templates"

print_test "Listar plantillas"
request_no_body "GET" "$BASE_URL/api/shift-templates" "$COOKIE_FILE"

print_test "Crear plantilla de turno de mañana"
RESPONSE=$(request "POST" "$BASE_URL/api/shift-templates" '{
  "name": "Turno Mañana Test",
  "type": "morning",
  "start_time": "09:00",
  "end_time": "14:00",
  "break_start": "11:30",
  "break_end": "12:00",
  "has_break": true
}' "$COOKIE_FILE")
CREATED_SHIFT_TEMPLATE_ID=$(extract_id "$RESPONSE")
echo "CREATED_SHIFT_TEMPLATE_ID=$CREATED_SHIFT_TEMPLATE_ID"

print_test "Crear plantilla de turno partido"
request "POST" "$BASE_URL/api/shift-templates" '{
  "name": "Turno Partido Test",
  "type": "split",
  "start_time": "09:00",
  "end_time": "18:00",
  "has_break": false
}' "$COOKIE_FILE"

print_test "Tipo de turno inválido (debe dar 400)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/shift-templates" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"name": "Turno Malo", "type": "invalid", "start_time": "09:00", "end_time": "17:00"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS"
if [ "$STATUS" = "400" ]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -z "$CREATED_SHIFT_TEMPLATE_ID" ]; then
  CREATED_SHIFT_TEMPLATE_ID=1
fi

# ======================================
# 6. SCHEDULES
# ======================================

print_title "6. Schedules"

print_test "Listar horarios (admin)"
request_no_body "GET" "$BASE_URL/api/schedules" "$COOKIE_FILE"

if [ -z "$CREATED_USER_ID" ]; then CREATED_USER_ID=3; fi

print_test "Asignar turno"
RESPONSE=$(request "POST" "$BASE_URL/api/schedules" '{
  "user_id": '"$CREATED_USER_ID"',
  "shift_template_id": '"$CREATED_SHIFT_TEMPLATE_ID"',
  "work_date": "2026-06-01"
}' "$COOKIE_FILE")
CREATED_SCHEDULE_ID=$(extract_id "$RESPONSE")
echo "CREATED_SCHEDULE_ID=$CREATED_SCHEDULE_ID"

if [ -n "$CREATED_SCHEDULE_ID" ]; then
  print_test "Cambiar estado a confirmed"
  request "PATCH" "$BASE_URL/api/schedules/$CREATED_SCHEDULE_ID/status" \
    '{"status": "confirmed"}' "$COOKIE_FILE"

  print_test "Cambiar estado a absent"
  request "PATCH" "$BASE_URL/api/schedules/$CREATED_SCHEDULE_ID/status" \
    '{"status": "absent"}' "$COOKIE_FILE"

  print_test "Estado inválido (debe dar 400)"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/api/schedules/$CREATED_SCHEDULE_ID/status" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{"status": "invalid_status"}')
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  echo "HTTP $STATUS"
  if [ "$STATUS" = "400" ]; then print_ok; else print_fail; fi
  echo "--------------------------------------"

  if [ -n "$COOKIE_FILE_EMPLOYEE" ]; then
    print_test "Listar horarios (empleado — solo los suyos)"
    request_no_body "GET" "$BASE_URL/api/schedules" "$COOKIE_FILE_EMPLOYEE"
  fi
else
  echo -e "${RED}No se creó schedule. Se saltan pruebas de estado.${RESET}"
fi

# ======================================
# 7. RECORDS
# ======================================

print_title "7. Time Records"

print_test "Estado actual antes de fichar (debe dar nextAllowed: [entry])"
request_no_body "GET" "$BASE_URL/api/records/status" "$COOKIE_FILE"

print_test "Listar fichajes"
request_no_body "GET" "$BASE_URL/api/records" "$COOKIE_FILE"

print_test "Fichar entrada"
RESPONSE=$(request "POST" "$BASE_URL/api/records" '{
  "type": "entry",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}' "$COOKIE_FILE")
CREATED_RECORD_ID=$(extract_id "$RESPONSE")
echo "CREATED_RECORD_ID=$CREATED_RECORD_ID"

print_test "Estado actual tras entrada (debe dar nextAllowed: [break_start, exit])"
request_no_body "GET" "$BASE_URL/api/records/status" "$COOKIE_FILE"

print_test "Fichar entrada de nuevo (debe dar 400 — secuencia inválida)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/records" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{"type": "entry", "mode": "office", "latitude": 43.2632, "longitude": -2.9352, "accuracy": 8.5}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS"
if [ "$STATUS" = "400" ]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_test "Fichar inicio pausa"
request "POST" "$BASE_URL/api/records" '{
  "type": "break_start",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}' "$COOKIE_FILE"

print_test "Estado actual tras pausa (debe dar nextAllowed: [break_end])"
request_no_body "GET" "$BASE_URL/api/records/status" "$COOKIE_FILE"

print_test "Fichar fin pausa"
request "POST" "$BASE_URL/api/records" '{
  "type": "break_end",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}' "$COOKIE_FILE"

print_test "Fichar salida"
request "POST" "$BASE_URL/api/records" '{
  "type": "exit",
  "mode": "office",
  "latitude": 43.2632,
  "longitude": -2.9352,
  "accuracy": 8.5
}' "$COOKIE_FILE"

print_test "Estado final (debe dar nextAllowed: [entry])"
request_no_body "GET" "$BASE_URL/api/records/status" "$COOKIE_FILE"

print_test "Sync offline — enviar array de fichajes"
SYNC_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/records/sync" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_FILE" \
  -d '{
    "records": [
      {
        "type": "entry",
        "mode": "remote",
        "latitude": 43.27,
        "longitude": -2.94,
        "accuracy": 12.0,
        "timestamp": "'"$SYNC_TS"'"
      }
    ]
  }')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS" && echo "$BODY"
if [[ "$STATUS" =~ ^2 ]]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -n "$CREATED_RECORD_ID" ]; then
  print_test "Ver fichaje por ID"
  request_no_body "GET" "$BASE_URL/api/records/$CREATED_RECORD_ID" "$COOKIE_FILE"

  print_test "Actualizar fichaje"
  request "PATCH" "$BASE_URL/api/records/$CREATED_RECORD_ID" \
    '{"accuracy": 5.0}' "$COOKIE_FILE"

  print_test "Eliminar fichaje (solo admin)"
  request_no_body "DELETE" "$BASE_URL/api/records/$CREATED_RECORD_ID" "$COOKIE_FILE"
fi

if [ -n "$COOKIE_FILE_EMPLOYEE" ]; then
  print_test "Empleado ficha entrada en remoto"
  request "POST" "$BASE_URL/api/records" '{
    "type": "entry",
    "mode": "remote",
    "latitude": 43.30,
    "longitude": -2.98,
    "accuracy": 15.0
  }' "$COOKIE_FILE_EMPLOYEE"

  print_test "Estado del empleado tras fichar"
  request_no_body "GET" "$BASE_URL/api/records/status" "$COOKIE_FILE_EMPLOYEE"

  print_test "Empleado intenta ver fichajes de otro (debe dar 403)"
  if [ -n "$CREATED_RECORD_ID" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/records/$CREATED_RECORD_ID" \
      -b "$COOKIE_FILE_EMPLOYEE")
    STATUS=$(echo "$RESPONSE" | tail -n 1)
    echo "HTTP $STATUS"
    if [ "$STATUS" = "403" ]; then print_ok; else print_fail; fi
    echo "--------------------------------------"
  fi
fi

# ======================================
# 8. LOGOUT
# ======================================

print_title "8. Logout"

print_test "Logout admin"
request_no_body "POST" "$BASE_URL/api/auth/logout" "$COOKIE_FILE"

print_test "Acceso tras logout (debe dar 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/records" -b "$COOKIE_FILE")
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS"
if [ "$STATUS" = "401" ]; then print_ok; else print_fail; fi
echo "--------------------------------------"

if [ -n "$COOKIE_FILE_EMPLOYEE" ]; then
  print_test "Logout empleado"
  request_no_body "POST" "$BASE_URL/api/auth/logout" "$COOKIE_FILE_EMPLOYEE"
fi

# ======================================
# 9. RUTAS PROTEGIDAS SIN TOKEN
# ======================================

print_title "9. Seguridad"

print_test "Acceso a companies sin token (debe dar 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/companies")
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS"
if [ "$STATUS" = "401" ]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_test "Ruta inexistente (debe dar 404)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/ruta-inexistente")
STATUS=$(echo "$RESPONSE" | tail -n 1)
echo "HTTP $STATUS"
if [ "$STATUS" = "404" ]; then print_ok; else print_fail; fi
echo "--------------------------------------"

print_title "TEST FINALIZADO"
echo "Admin: $ADMIN_EMAIL"
echo "Empleado: $EMPLOYEE_EMAIL"
echo "IDs creados — company: $CREATED_COMPANY_ID | user: $CREATED_USER_ID | shift: $CREATED_SHIFT_TEMPLATE_ID | schedule: $CREATED_SCHEDULE_ID | record: $CREATED_RECORD_ID"