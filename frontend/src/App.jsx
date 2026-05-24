import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Clock from "./components/Clock/Clock";
import "./index.css";

export default function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Clock mode="office" />
      </main>
      <Footer />
    </>
  );
}