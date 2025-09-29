export default function Header(){
  const version = process.env.NEXT_PUBLIC_VERSION || 'v0.1'
  return (
    <header className="w-full mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">PW</div>
        <div>
          <div className="text-lg font-semibold">PowerESP Control</div>
          <div className="text-xs text-gray-500">Controla dispositivos conectados por WiFi</div>
        </div>
      </div>
      <nav className="text-sm text-gray-600">
        {version}
      </nav>
    </header>
  )
}
