import { Header } from './components/Header'
import { AutoMigratorPage } from './components/auto-migrator'
import { MigratorPage } from './components/migrator'
import { ReferencePage } from './components/reference'
import { BuilderPage } from './components/builder'
import { useLocalStorage } from './utils'

export default function App() {
  const [activeMainTab, setActiveMainTab] = useLocalStorage('app:activeTab', 'migrator')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header activeTab={activeMainTab} setActiveTab={setActiveMainTab} />

      <main>
        {activeMainTab === 'auto-migrator' && <AutoMigratorPage />}
        {activeMainTab === 'migrator' && <MigratorPage />}
        {activeMainTab === 'reference' && <ReferencePage />}
        {activeMainTab === 'builder' && <BuilderPage />}
      </main>
    </div>
  )
}
