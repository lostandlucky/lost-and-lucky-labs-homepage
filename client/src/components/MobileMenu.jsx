import { Link } from 'react-router-dom';

export default function MobileMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-[#e0e0e0] px-5 py-4">
      <nav className="flex flex-col gap-4">
        <Link
          to="/#portfolio"
          className="text-sm uppercase tracking-[2px] text-[#333]"
          onClick={onClose}
        >
          Portfolio
        </Link>
        <Link
          to="/contact-us"
          className="text-sm uppercase tracking-[2px] text-[#333]"
          onClick={onClose}
        >
          Contact
        </Link>
        <a
          href="https://www.instagram.com/lostandluckylabs/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-[#333]"
          onClick={onClose}
        >
          Instagram
        </a>
      </nav>
    </div>
  );
}
