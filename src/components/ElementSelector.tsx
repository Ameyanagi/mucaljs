import { Select, SelectOption } from './ui/select'
import { ELEMENTS } from '@/lib/mucalc'

interface ElementSelectorProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  id?: string
  className?: string
}

/**
 * Periodic table element selector dropdown
 */
export function ElementSelector({ value, onChange, id, className, ...props }: ElementSelectorProps) {
  return (
    <Select
      id={id}
      value={value}
      onChange={onChange}
      className={className}
      aria-label="Select element"
      {...props}
    >
      {ELEMENTS.map((element) => (
        <SelectOption key={element} value={element}>
          {element}
        </SelectOption>
      ))}
    </Select>
  )
}

export default ElementSelector
