import Navbar from './components/Navbar'
import Intro   from './components/Intro'
import Hero    from './components/Hero'
import About   from './components/about'
import Gallery from './components/Gallery'

function App() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      {/* <Intro /> */}
      <Hero />
      <About />
      <Gallery />
    </div>
  )
}

export default App