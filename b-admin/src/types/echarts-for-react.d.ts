declare module 'echarts-for-react' {
  import * as echarts from 'echarts'

  interface ReactEChartsProps {
    option: echarts.EChartsOption
    style?: React.CSSProperties
    className?: string
    opts?: echarts.EChartsInitOption
    notMerge?: boolean
    lazyUpdate?: boolean
    onChartReady?: (echarts: echarts.ECharts) => void
    onEvents?: Record<string, (params: unknown) => void>
    updateOption?: (option: echarts.EChartsOption, notMerge?: boolean, lazyUpdate?: boolean) => void
    echartsInstance?: (instance: echarts.ECharts) => void
  }

  class ReactECharts extends React.Component<ReactEChartsProps> {}

  export default ReactECharts
}
