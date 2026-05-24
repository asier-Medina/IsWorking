import "./Footer.css";

/* ios = contorno, ffffff = blanco */
const ICONS8 = (name, size = 48) =>
  `https://img.icons8.com/ios/${size}/ffffff/${name}.png`;

const socials = [
  { label: "LinkedIn",  href: "#", icon: ICONS8("linkedin") },
  { label: "X",         href: "#", icon: ICONS8("twitterx--v2") },
  { label: "Instagram", href: "#", icon: ICONS8("instagram-new--v1") },
];

const defaultColumns = [
  {
    title: "Producto",
    links: [
      { label: "Fichaje",   href: "#" },
      { label: "Ausencias", href: "#" },
      { label: "Turnos",    href: "#" },
      { label: "Informes",  href: "#" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros",       href: "#" },
      { label: "Blog",                 href: "#" },
      { label: "Trabaja con nosotros", href: "#" },
      { label: "Contacto",             href: "#" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de ayuda",     href: "#" },
      { label: "Privacidad",          href: "#" },
      { label: "Términos de uso",     href: "#" },
      { label: "Estado del servicio", href: "#" },
    ],
  },
];

export default function Footer({
  companyName = "IsWorking",
  columns = defaultColumns,
  year = new Date().getFullYear(),
}) {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Columna de marca */}
        <div className="footer__brand-col">
          <a href="#" className="footer__brand">
            <span className="footer__logo-icon" aria-hidden="true">IW</span>
            <span className="footer__company">{companyName}</span>
          </a>

          <p className="footer__tagline">
            Gestiona el tiempo de tu equipo de forma sencilla, ágil y sin papel.
          </p>

          {/* Redes sociales: fondo oscuro → iconos blancos visibles directamente */}
          <div className="footer__socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="footer__social-btn" aria-label={s.label}>
                <img src={s.icon} alt="" aria-hidden="true" className="footer__social-icon" />
              </a>
            ))}
          </div>

          {/* App badges */}
          <div className="footer__apps">
            <a href="#" className="footer__app-badge" aria-label="Descargar en App Store">
              <img
                src={ICONS8("apple-app-store--v1")}
                alt=""
                aria-hidden="true"
                className="footer__app-icon"
              />
              <span>App Store</span>
            </a>
            <a href="#" className="footer__app-badge" aria-label="Descargar en Google Play">
              <img
                src={ICONS8("google-play")}
                alt=""
                aria-hidden="true"
                className="footer__app-icon"
              />
              <span>Google Play</span>
            </a>
          </div>
        </div>

        {/* Columnas de links */}
        {columns.map((col) => (
          <div key={col.title} className="footer__col">
            <h3 className="footer__col-title">{col.title}</h3>
            <ul className="footer__link-list">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="footer__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Barra inferior */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          © {year} {companyName}. Todos los derechos reservados.
        </p>
        <div className="footer__bottom-links">
          <a href="#" className="footer__bottom-link">Privacidad</a>
          <span className="footer__bottom-sep" aria-hidden="true">·</span>
          <a href="#" className="footer__bottom-link">Cookies</a>
          <span className="footer__bottom-sep" aria-hidden="true">·</span>
          <a href="#" className="footer__bottom-link">Términos</a>
        </div>
      </div>
    </footer>
  );
}