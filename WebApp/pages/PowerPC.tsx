import { GetServerSideProps } from 'next'
import { readState, writeState } from '../lib/state'

// This page responds directly with JSON so devices that hit /PowerPC
// receive the state without relying on rewrites that could trigger redirects.
export default function PowerPC() {
  // This route is server-only; it never renders a client page.
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const val = await readState()
    if (val === true) {
      await writeState(false)
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ status: 'ok' }))
      return { props: {} }
    }
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 401
    res.end(JSON.stringify({ error: 'no permission' }))
    return { props: {} }
  } catch (err) {
    console.error('PowerPC page error', String(err))
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'internal error' }))
    return { props: {} }
  }
}
