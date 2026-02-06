import { useState } from 'react'
import { Header } from './components/Header'
import { MigratorPage } from './components/migrator'
import { ReferencePage } from './components/reference'

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState('migrator')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header activeTab={activeMainTab} setActiveTab={setActiveMainTab} />

      <main>
        {activeMainTab === 'migrator' ? <MigratorPage /> : <ReferencePage />}
      </main>
    </div>
  )
}
