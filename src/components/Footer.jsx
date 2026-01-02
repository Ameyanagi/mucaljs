export function Footer() {
  const currentYear = new Date().getFullYear()
  const startYear = 2022

  return (
    <footer className="w-full bg-primary text-primary-foreground px-4 py-3 text-center text-sm">
      <p>
        &copy; {startYear === currentYear ? currentYear : `${startYear}-${currentYear}`}, Ameyanagi.
        <span className="hidden sm:inline"> X-ray absorption cross section calculator for XAS sample preparation.</span>
      </p>
    </footer>
  )
}

export default Footer
