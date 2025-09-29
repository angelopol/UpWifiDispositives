import { useEffect } from 'react'

type Props = { message: string }

export default function Toast({ message }: Props){
  useEffect(() => {
    // no-op: animation handled by CSS
  }, [message])
  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow toast-enter">
      {message}
    </div>
  )
}
