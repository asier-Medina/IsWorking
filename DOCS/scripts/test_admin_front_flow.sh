#!/usr/bin/env bash

set -u

BASE_URL="${BASE_URL:-http://localhost:3000/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@isworking.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-isworking123}"

TMP_DIR="$(mktemp -d)"
ADMIN_COOKIE="$TMP_DIR/admin_cookies.txt"
EMPLOYEE_COOKIE="$TMP_DIR/employee_cookies.txt"

TOTAL=0
PASSED=0
FAILED=0

EMPLOYEE_ID=""
SHIFT_ID=""
SCHEDULE_ID=""
TEST_EMAIL="empleado.test.$(date +%s)@isworking.com"
TEST_PASSWORD="Test12345!"
TEST_NAME="Empleado Test Admin"
UPDATED_NAME="Empleado Test Modificado"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

print_header() {
  echo ""
  echo "=================================================="
  echo "$1"
  echo "=================================================="
}

pass() {
  PASSED=$((PASSED + 1))
  echo "✅ $1"
}

fail() {
  FAILED=$((FAILED + 1))
  echo "❌ $1"
  if [ -n "${2:-}" ]; then
    echo "$2"
  fi
}

test_step() {
  TOTAL=$((TOTAL + 1))
}

json_get() {
  node -e "
    let data = '';
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => {
      try {
        const obj = JSON.parse(data);
        const path = process.argv[1].split('.');
        let value = obj;
        for (const key of path) {
          if (value === undefined || value === null) break;
          value = value[key];
        }
        if (value === undefined || value === null) process.exit(1);
        if (typeof value === 'object') console.log(JSON.stringify(value));
        else console.log(value);
      } catch (e) {
        process.exit(1);
      }
    });
  " "$1"
}

request() {
  local method="$1"
  local url="$2"
  local cookie_file="${3:-}"
  local body="${4:-}"

  if [ -n "$cookie_file" ] && [ -n "$body" ]; then
    curl -s -i -b "$cookie_file" -c "$cookie_file" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body"
  elif [ -n "$cookie_file" ]; then
    curl -s -i -b "$cookie_file" -c "$cookie_file" \
      -X "$method" "$url"
  elif [ -n "$body" ]; then
    curl -s -i \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body"
  else
    curl -s -i \
      -X "$method" "$url"
  fi
}

status_code() {
  echo "$1" | awk 'NR==1 {print $2}'
}

body() {
  echo "$1" | sed '1,/^\r$/d'
}

expect_status() {
  local response="$1"
  local expected="$2"
  local label="$3"

  local code
  code="$(status_code "$response")"

  if [ "$code" = "$expected" ]; then
    pass "$label [$code]"
    return 0
  else
    fail "$label [esperado $expected, recibido $code]" "$(body "$response")"
    return 1
  fi
}

print_header "0. Comprobando dependencias"

test_step
if command -v curl >/dev/null 2>&1; then
  pass "curl disponible"
else
  fail "curl no está instalado"
  exit 1
fi

test_step
if command -v node >/dev/null 2>&1; then
  pass "node disponible"
else
  fail "node no está instalado"
  exit 1
fi

print_header "1. Health check backend"

test_step
RES="$(request GET "${BASE_URL%/api}/health")"
expect_status "$RES" "200" "Backend responde en /health"

print_header "2. Login admin"

test_step
RES="$(curl -s -i -c "$ADMIN_COOKIE" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")"

if expect_status "$RES" "200" "Login admin correcto"; then
  ADMIN_ID="$(body "$RES" | json_get "user.id" || true)"
  ADMIN_ROLE="$(body "$RES" | json_get "user.role" || true)"
  echo "Admin ID: $ADMIN_ID"
  echo "Admin role: $ADMIN_ROLE"
fi

print_header "3. Listar empleados iniciales"

test_step
RES="$(request GET "$BASE_URL/users" "$ADMIN_COOKIE")"
expect_status "$RES" "200" "GET /users lista empleados"

echo ""
echo "Respuesta empleados:"
body "$RES"

print_header "4. Crear empleado desde panel admin"

CREATE_EMPLOYEE_BODY="{
  \"name\":\"$TEST_NAME\",
  \"email\":\"$TEST_EMAIL\",
  \"password\":\"$TEST_PASSWORD\",
  \"role\":\"employee\",
  \"remote_allowed\":true
}"

test_step
RES="$(request POST "$BASE_URL/users" "$ADMIN_COOKIE" "$CREATE_EMPLOYEE_BODY")"

if expect_status "$RES" "201" "POST /users crea empleado"; then
  EMPLOYEE_ID="$(body "$RES" | json_get "data.id" || true)"
  echo "Empleado creado ID: $EMPLOYEE_ID"
  echo "Empleado creado email: $TEST_EMAIL"
fi

if [ -z "$EMPLOYEE_ID" ]; then
  echo ""
  echo "No se pudo obtener EMPLOYEE_ID. Se abortan pruebas dependientes."
  exit 1
fi

print_header "5. Modificar empleado"

UPDATE_EMPLOYEE_BODY="{
  \"name\":\"$UPDATED_NAME\",
  \"remote_allowed\":false
}"

test_step
RES="$(request PATCH "$BASE_URL/users/$EMPLOYEE_ID" "$ADMIN_COOKIE" "$UPDATE_EMPLOYEE_BODY")"
expect_status "$RES" "200" "PATCH /users/:id modifica empleado"

echo ""
echo "Respuesta modificación:"
body "$RES"

print_header "6. Desactivar empleado"

test_step
RES="$(request PATCH "$BASE_URL/users/$EMPLOYEE_ID/status" "$ADMIN_COOKIE" "{\"active\":false}")"
expect_status "$RES" "200" "PATCH /users/:id/status desactiva empleado"

print_header "7. Comprobar que empleado desactivado no puede iniciar sesión"

test_step
RES="$(curl -s -i -c "$EMPLOYEE_COOKIE" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")"

expect_status "$RES" "401" "Login empleado desactivado bloqueado"

print_header "8. Activar empleado"

test_step
RES="$(request PATCH "$BASE_URL/users/$EMPLOYEE_ID/status" "$ADMIN_COOKIE" "{\"active\":true}")"
expect_status "$RES" "200" "PATCH /users/:id/status activa empleado"

print_header "9. Login empleado activado"

test_step
RES="$(curl -s -i -c "$EMPLOYEE_COOKIE" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")"

expect_status "$RES" "200" "Login empleado activado correcto"

print_header "10. Comprobar protección: admin no puede desactivarse a sí mismo"

if [ -n "${ADMIN_ID:-}" ]; then
  test_step
  RES="$(request PATCH "$BASE_URL/users/$ADMIN_ID/status" "$ADMIN_COOKIE" "{\"active\":false}")"

  CODE="$(status_code "$RES")"
  if [ "$CODE" = "400" ] || [ "$CODE" = "403" ]; then
    pass "Protección de autodesactivación correcta [$CODE]"
  else
    fail "El admin ha podido intentar desactivarse o no está protegido correctamente [$CODE]" "$(body "$RES")"
  fi
else
  echo "⚠️ No se pudo comprobar autodesactivación porque no hay ADMIN_ID"
fi

print_header "11. Crear plantilla de turno"

SHIFT_NAME="Turno Test $(date +%s)"

CREATE_SHIFT_BODY="{
  \"name\":\"$SHIFT_NAME\",
  \"type\":\"morning\",
  \"start_time\":\"08:00\",
  \"end_time\":\"16:00\",
  \"has_break\":false,
  \"break_start\":null,
  \"break_end\":null
}"

test_step
RES="$(request POST "$BASE_URL/shift-templates" "$ADMIN_COOKIE" "$CREATE_SHIFT_BODY")"

if expect_status "$RES" "201" "POST /shift-templates crea turno"; then
  SHIFT_ID="$(body "$RES" | json_get "id" || true)"
  echo "Turno creado ID: $SHIFT_ID"
fi

if [ -z "$SHIFT_ID" ]; then
  echo ""
  echo "No se pudo obtener SHIFT_ID. Se abortan pruebas dependientes."
  exit 1
fi

print_header "12. Listar plantillas de turno"

test_step
RES="$(request GET "$BASE_URL/shift-templates" "$ADMIN_COOKIE")"
expect_status "$RES" "200" "GET /shift-templates lista turnos"

print_header "13. Crear horario futuro para empleado"

TOMORROW="$(date -d tomorrow +%F 2>/dev/null || date -v+1d +%F)"

CREATE_SCHEDULE_BODY="{
  \"user_id\":$EMPLOYEE_ID,
  \"shift_template_id\":$SHIFT_ID,
  \"work_date\":\"$TOMORROW\"
}"

test_step
RES="$(request POST "$BASE_URL/schedules" "$ADMIN_COOKIE" "$CREATE_SCHEDULE_BODY")"

if expect_status "$RES" "201" "POST /schedules asigna turno"; then
  SCHEDULE_ID="$(body "$RES" | json_get "id" || true)"
  echo "Horario creado ID: $SCHEDULE_ID"
  echo "Fecha: $TOMORROW"
fi

if [ -z "$SCHEDULE_ID" ]; then
  echo ""
  echo "No se pudo obtener SCHEDULE_ID. Se continúa sin probar cambio de estado."
else
  print_header "14. Cambiar estado del horario"

  test_step
  RES="$(request PATCH "$BASE_URL/schedules/$SCHEDULE_ID/status" "$ADMIN_COOKIE" "{\"status\":\"confirmed\"}")"
  expect_status "$RES" "200" "PATCH /schedules/:id/status confirma horario"
fi

print_header "15. Listar horarios"

test_step
RES="$(request GET "$BASE_URL/schedules" "$ADMIN_COOKIE")"
expect_status "$RES" "200" "GET /schedules lista horarios"

print_header "16. Crear fichaje como empleado"

CREATE_RECORD_BODY="{
  \"type\":\"entry\",
  \"mode\":\"office\",
  \"latitude\":43.2632,
  \"longitude\":-2.9352,
  \"accuracy\":8.5,
  \"scheduleId\":$SCHEDULE_ID
}"

test_step
RES="$(request POST "$BASE_URL/records" "$EMPLOYEE_COOKIE" "$CREATE_RECORD_BODY")"

CODE="$(status_code "$RES")"
if [ "$CODE" = "201" ]; then
  pass "POST /records crea fichaje de entrada [$CODE]"
else
  echo "⚠️ No se pudo crear fichaje. Puede ser normal si el empleado ya tenía una secuencia de fichajes incompatible hoy."
  fail "POST /records crea fichaje de entrada [esperado 201, recibido $CODE]" "$(body "$RES")"
fi

print_header "17. Ver fichajes desde admin"

test_step
RES="$(request GET "$BASE_URL/records" "$ADMIN_COOKIE")"
expect_status "$RES" "200" "GET /records admin ve fichajes de empresa"

echo ""
echo "Respuesta registros:"
body "$RES"

print_header "18. Ver logs Mongo desde API"

test_step
RES="$(request GET "$BASE_URL/logs/auth" "$ADMIN_COOKIE")"
CODE="$(status_code "$RES")"
if [ "$CODE" = "200" ]; then
  pass "GET /logs/auth responde [$CODE]"
else
  echo "⚠️ Logs auth no disponibles o sin permisos."
  fail "GET /logs/auth [recibido $CODE]" "$(body "$RES")"
fi

test_step
RES="$(request GET "$BASE_URL/logs/admin" "$ADMIN_COOKIE")"
CODE="$(status_code "$RES")"
if [ "$CODE" = "200" ]; then
  pass "GET /logs/admin responde [$CODE]"
else
  echo "⚠️ Logs admin no disponibles o sin permisos."
  fail "GET /logs/admin [recibido $CODE]" "$(body "$RES")"
fi

print_header "19. Resumen"

echo "Total pruebas: $TOTAL"
echo "Correctas:     $PASSED"
echo "Fallidas:      $FAILED"
echo ""
echo "Empleado test creado:"
echo "ID:       $EMPLOYEE_ID"
echo "Email:    $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"
echo ""
echo "Turno test:"
echo "ID:   $SHIFT_ID"
echo "Name: $SHIFT_NAME"
echo ""
echo "Horario test:"
echo "ID:    $SCHEDULE_ID"
echo "Fecha: $TOMORROW"

if [ "$FAILED" -eq 0 ]; then
  echo ""
  echo "✅ Todo OK"
  exit 0
else
  echo ""
  echo "⚠️ Hay pruebas fallidas. Revisa los mensajes anteriores."
  exit 1
fi
