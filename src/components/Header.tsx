import { Github } from 'lucide-react'

export function Header() {
  return (
    <header className="w-full bg-primary text-primary-foreground px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">MuCal.js</h1>
        <a
          href="https://github.com/Ameyanagi/mucaljs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm hover:underline transition-colors"
          aria-label="View source on GitHub"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}

export default Header
