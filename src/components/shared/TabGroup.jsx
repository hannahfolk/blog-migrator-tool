export function TabGroup({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 bg-zinc-800 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === tab.value
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {tab.icon && <tab.icon size={14} />}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
