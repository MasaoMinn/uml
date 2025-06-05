import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginSheet from './loginsheet';
import { useTheme } from '@/context/theme';

function BasicExample() {
  const { theme,toggleTheme } = useTheme();
  const navbarClassName = theme === 'dark' ? 'bg-dark navbar-dark' : 'bg-light navbar-light';

  return (
    <Navbar expand="lg" className={`align-items-center ${navbarClassName}`}>
      <Container>
        <Navbar.Brand href="./">Mailbox</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
          </Nav>
          <Nav className="align-items-center">
            <Nav.Link><LoginSheet /></Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={toggleTheme}>switch theme</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="./">
                See us on Github
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;