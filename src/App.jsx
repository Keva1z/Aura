import Hero from './components/Hero';
import About from './components/About';
import Gallery from './components/Gallery';
import Offices from './components/Offices';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Hero />
      <main>
        <Gallery />
        <About />
        <Offices />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
