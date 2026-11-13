import {
  Armchair,
  Box,
  Car,
  CircleDashed,
  CircleDot,
  Cog,
  Disc3,
  DoorOpen,
  Engine,
  Fan,
  Gauge,
  Grid2X2,
  LampCeiling,
  Layers,
  Lightbulb,
  MirrorRectangular,
  Monitor,
  Scan,
  ShieldCheck,
  Wind,
} from 'lucide-react'

const ICONS = {
  car: Car,
  engine: Engine,
  chassis: Box,
  suspension: Grid2X2,
  seat: Armchair,
  brake: CircleDashed,
  light: Lightbulb,
  door: DoorOpen,
  glass: Scan,
  mirror: MirrorRectangular,
  wheel: CircleDot,
  tire: CircleDot,
  transmission: Cog,
  cooling: Fan,
  exhaust: Wind,
  disc: Disc3,
  caliper: CircleDashed,
  steering: Gauge,
  cage: ShieldCheck,
  harness: ShieldCheck,
  display: Monitor,
  headlight: Lightbulb,
  taillight: LampCeiling,
  layers: Layers,
}

export function ComponentIcon({ name, size = 18, strokeWidth = 1.7, ...props }) {
  const Icon = ICONS[name] ?? Layers
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" {...props} />
}
