<script lang="ts">
import { Line } from "vue-chartjs"
import Vue, { PropOptions } from "vue"
import Chart from "chart.js"

export default Vue.extend({
  name: "SrChart",
  extends: Line,
  props: {
    events: {
      type: Array,
      required: true
    } as PropOptions<any[]>,
    editable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      chartData: {
        datasets: [{
          label: "Open Queue",
          borderColor: "#223388",
          backgroundColor: "rgba(0,0,255,0.1)"
        }, {
          label: "Tank",
          borderColor: "#228833",
          backgroundColor: "rgba(0,128,0,0.1)"
        }, {
          label: "Damage",
          borderColor: "#882233",
          backgroundColor: "rgba(255,0,0,0.1)"
        }, {
          label: "Support",
          borderColor: "#778833",
          backgroundColor: "rgba(196,196,0,0.1)"
        }
        ]
      } as any,
      options: {
        maintainAspectRatio: false,
        onClick: (this as any).onClick,
        layout: {
          padding: 20
        },
        scales: {
          xAxes: [{
            type: "time"
          }],
          yAxes: [{
            ticks: {
              stepSize: 500
            }
          }]
        },
        elements: {
          line: {
            tension: 0
          }
        },
        hover: {
          onHover: this.editable ? function (this: Chart, event: any) {
            const points = this.getElementAtEvent(event)
            event.target.style.cursor = points.length ? "pointer" : "default"
          } : undefined
        }
      }
    }
  },
  mounted () {
    const games = this.events
      .filter(g => g.sr)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    for (const dataset of this.chartData.datasets) {
      const role = dataset.label === "Open Queue" ? "Any" : dataset.label
      dataset.data = games
        .filter(g => g.role === role)
        .map(g => ({ x: new Date(g.date), y: g.sr, id: g.id }))
    }

    this.chartData.datasets = this.chartData.datasets.filter((d: any) => d.data.length > 0)
    ;(this as any).renderChart(this.chartData, this.options)
  },
  methods: {
    onClick (_: any, event: any) {
      if (!event[0]) {
        return
      }
      const di = event[0]._datasetIndex
      const i = event[0]._index
      const id = this.chartData.datasets[di].data[i].id
      this.$emit("click-game", id)
    }
  }
})
</script>

<style scoped lang="sass">
canvas
  background-color: rgba(255, 255, 255, 0.8)
  border-radius: 10px
</style>
