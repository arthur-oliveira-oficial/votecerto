"use client"
import dynamic from "next/dynamic"
import { memo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicComponent = any

const ChartDinamico = dynamic(
  () => import("@/components/ui/chart").then((mod) => mod.ChartContainer),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full" />,
  }
)
const ChartTooltipDinamico = dynamic(
  () => import("@/components/ui/chart").then((mod) => mod.ChartTooltipContent),
  {
    ssr: false,
    loading: () => <Skeleton className="h-20 w-40" />,
  }
)
const CarouselDinamico = dynamic(
  () => import("@/components/ui/carousel").then((mod) => mod.Carousel),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full" />,
  }
)
// Lazy loading para componentes Recharts (otimização de performance)
// Usamos type assertion para evitar problemas de tipagem com Recharts
const BarChartDinamico = dynamic(
  () => import("recharts").then((mod) => mod.BarChart as DynamicComponent),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
)
const BarDinamico = dynamic(
  () => import("recharts").then((mod) => mod.Bar as DynamicComponent),
  { ssr: false }
)
const XAxisDinamico = dynamic(
  () => import("recharts").then((mod) => mod.XAxis as DynamicComponent),
  { ssr: false }
)
const YAxisDinamico = dynamic(
  () => import("recharts").then((mod) => mod.YAxis as DynamicComponent),
  { ssr: false }
)
const TooltipDinamico = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip as DynamicComponent),
  { ssr: false }
)
const ResponsiveContainerDinamico = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer as DynamicComponent),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
)
const CellDinamico = dynamic(
  () => import("recharts").then((mod) => mod.Cell as DynamicComponent),
  { ssr: false }
)
const PieChartDinamico = dynamic(
  () => import("recharts").then((mod) => mod.PieChart as DynamicComponent),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
)
const PieDinamico = dynamic(
  () => import("recharts").then((mod) => mod.Pie as DynamicComponent),
  { ssr: false }
)
const LegendDinamico = dynamic(
  () => import("recharts").then((mod) => mod.Legend as DynamicComponent),
  { ssr: false }
)
const LineChartDinamico = dynamic(
  () => import("recharts").then((mod) => mod.LineChart as DynamicComponent),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
)
const LineDinamico = dynamic(
  () => import("recharts").then((mod) => mod.Line as DynamicComponent),
  { ssr: false }
)
// Lazy load do componente ResultadosParciais que usa Recharts
const ResultadosParciaisDinamico = dynamic(
  () => import("@/components/resultados-parciais").then((mod) => mod.ResultadosParciais),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
        <div className="h-64 bg-slate-100 rounded" />
      </div>
    ),
  }
)
export const MemoizedChart = memo(ChartDinamico);
export const MemoizedChartTooltip = memo(ChartTooltipDinamico);
export const MemoizedCarousel = memo(CarouselDinamico);
export const MemoizedBarChart = memo(BarChartDinamico);
export const MemoizedBar = memo(BarDinamico);
export const MemoizedXAxis = memo(XAxisDinamico);
export const MemoizedYAxis = memo(YAxisDinamico);
export const MemoizedTooltip = memo(TooltipDinamico);
export const MemoizedResponsiveContainer = memo(ResponsiveContainerDinamico);
export const MemoizedCell = memo(CellDinamico);
export const MemoizedPieChart = memo(PieChartDinamico);
export const MemoizedPie = memo(PieDinamico);
export const MemoizedLegend = memo(LegendDinamico);
export const MemoizedLineChart = memo(LineChartDinamico);
export const MemoizedLine = memo(LineDinamico);
export const LazyResultadosParciais = memo(ResultadosParciaisDinamico);
