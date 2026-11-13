export function Switch({ checked, onChange, label, disabled = false, size = 'normal' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? 'is-on' : ''} ${size === 'small' ? 'switch-small' : ''}`}
      onClick={onChange}
      disabled={disabled}
    >
      <span className="switch-thumb" />
    </button>
  )
}
