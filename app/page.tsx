import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CreatePasteForm } from '@/components/CreatePasteForm'

export default async function HomePage() {
  const t = await getTranslations('home')

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl sm:text-5xl text-msk-text">
              MSK <span className="text-msk-accent">Paste</span>
            </h1>
            <p className="text-msk-muted text-sm sm:text-base mt-3">{t('subtitle')}</p>
          </div>

          <CreatePasteForm />
        </div>
      </div>

      <Footer />
    </main>
  )
}
