import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { MucalForm } from './components/MucalForm'
import { useMucalForm } from './hooks/useMucalForm'

function App() {
  const {
    state,
    setField,
    setMultiple,
    calcAreaFromDiameter,
    calcDiameterFromArea,
    calcAbsorptionData,
    resetAll,
  } = useMucalForm()

  const handlers = {
    setField,
    setMultiple,
    calcAreaFromDiameter,
    calcDiameterFromArea,
    calcAbsorptionData,
    resetAll,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 py-3">
        <MucalForm state={state} handlers={handlers} />
      </main>
      <Footer />
    </div>
  )
}

export default App
