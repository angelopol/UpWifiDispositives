/** Next.js config used to rewrite /PowerPC to the API route */
module.exports = {
  async rewrites() {
    return [
      {
        source: '/PowerPC',
        destination: '/api/powerpc'
      }
      ,{
        source: '/PowerPCStatus',
        destination: '/api/PowerPCStatus'
      }
    ]
  }
}
