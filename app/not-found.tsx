import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StatusPanel } from '@/components/StatusPanel'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 px-6 py-16">
        <StatusPanel variant="notFound" />
      </div>
      <Footer />
    </main>
  )
}
