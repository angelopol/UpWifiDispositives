export default function Footer(){
  const version = process.env.NEXT_PUBLIC_VERSION || 'v0.1'
  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 text-sm text-gray-500 bg-white/80 backdrop-blur border-t border-gray-100">
      <div className="app-container h-full flex items-center justify-between">
        <div>© {new Date().getFullYear()} PowerESP</div>
        <div className="text-right">Versión: {version}</div>
      </div>
    </footer>
  )
}
