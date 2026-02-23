import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main role="main" className="flex-1 max-w-[1200px] w-full mx-auto px-5 pt-[70px] md:pt-[50px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
