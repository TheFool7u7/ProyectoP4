import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faTwitter, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-lg font-bold">Contáctenos</h3>
        <p>Phone: 8706-1657 Email: juan@example.com</p>
        <div className="flex space-x-4 mt-4">
          <Link to="#"><FontAwesomeIcon icon={faYoutube} /></Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;