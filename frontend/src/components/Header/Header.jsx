import { useState } from "react";
import "./Header.css";
import ChangePassword from "../ChangePassword/changePassword";

const ICONS8 = (name, size = 48) =>
  `https://img.icons8.com/ios/${size}/3e35a8/${name}.png`;

const defaultNavLinks = [
  { label: "Mis fichajes", href: "historial", icon: ICONS8("time-card") },
  { label: "Ausencias", href: "#", icon: ICONS8("planner") },
  { label: "Equipo", href: "#", icon: ICONS8("conference-call") },
];

export default function Header({
  user,
  companyName = "IsWorking",
  navLinks = defaultNavLinks,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const userName = user?.name || "Cargando...";
  const userRole = user?.role || "Empleado";

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="header">
      <div className="header__inner">

        <a href="/" className="header__brand" aria-label="Ir a inicio">
          <span className="header__logo-icon" aria-hidden="true">IW</span>
          <span className="header__company">{companyName}</span>
        </a>

        <nav className="header__nav" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="header__nav-link">
              {link.icon && (
                <img src={link.icon} alt="" aria-hidden="true" className="header__nav-icon" />
              )}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">

          <button className="header__icon-btn" aria-label="Ver notificaciones (3 sin leer)">
            <img src={ICONS8("alarm")} alt="" aria-hidden="true" className="header__icon-img" />
            <span className="header__badge" aria-hidden="true">3</span>
          </button>

          {/* Perfil */}
          <div className="header__profile-wrap">
            <button
              className="header__avatar"
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Menú de usuario"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {user?.avatar
                ? <img src={user.avatar} alt={userName} className="header__avatar-img" />
                : <span aria-hidden="true">{initials}</span>
              }
            </button>

            {profileOpen && (
              <div className="header__dropdown" role="menu">
                <div className="header__dropdown-user">
                  <strong className="header__dropdown-name">{userName}</strong>
                  <span className="header__dropdown-role">{userRole}</span>
                </div>

                <hr className="header__dropdown-divider" />

                <button
                  onClick={() => {
                    setPasswordModalOpen(true);
                    setProfileOpen(false);
                  }}
                  className="header__dropdown-item"
                  role="menuitem"
                >
                  <img src={ICONS8("settings")} alt="" aria-hidden="true" className="header__dropdown-icon" />
                  Cambiar contraseña
                </button>

                <hr className="header__dropdown-divider" />

                <button
                  onClick={onLogout}
                  className="header__dropdown-item header__dropdown-item--danger"
                  role="menuitem"
                >
                  <img src={ICONS8("exit")} alt="" aria-hidden="true" className="header__dropdown-icon" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Hamburguesa (móvil) */}
          <button
            className="header__hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <img
              src={menuOpen ? ICONS8("delete-sign") : ICONS8("menu")}
              alt=""
              aria-hidden="true"
              className="header__hamburger-icon"
            />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <nav
        id="mobile-nav"
        className={`header__mobile-nav${menuOpen ? " header__mobile-nav--open" : ""}`}
        aria-label="Menú móvil"
        aria-hidden={!menuOpen}
      >
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="header__mobile-link"
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
          >
            {link.icon && (
              <img src={link.icon} alt="" aria-hidden="true" className="header__mobile-icon" />
            )}
            {link.label}
          </a>
        ))}
      </nav>

      <ChangePassword
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </header>
  );
}