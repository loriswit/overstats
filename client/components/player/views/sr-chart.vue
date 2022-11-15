<script lang="ts">
import { Line } from "vue-chartjs"
import Vue, { PropOptions } from "vue"
import { Event } from "~/types/event"

export default Vue.extend({
  name: "SrChart",
  extends: Line,
  props: {
    events: {
      type: Array,
      required: true
    } as PropOptions<Event[]>,
    editable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data (this: any) {
    return {
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
      }] as any[],
      options: {
        maintainAspectRatio: false,
        onClick: this.onClick,
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
          onHover: this.editable ? this.onHover : undefined
        }
      }
    }
  },
  watch: {
    events: {
      handler (this: any) {
        this.updateChart()
      },
      deep: true
    }
  },
  mounted (this: any) {
    this.updateChart()
  },
  methods: {
    updateChart (this: any) {
      let games = [...this.events]
        .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // assign previous skill rating to placement games
      const sr = {}
      for (const g of games) {
        if (g.sr) {
          sr[g.role] = g.sr
        } else if (sr[g.role]) {
          g.sr = sr[g.role]
        }
      }

      // only keep games with a skill rating
      games = games.filter((g: Event) => g.sr)

      for (const dataset of this.datasets) {
        const role = dataset.label === "Open Queue" ? "Any" : dataset.label
        dataset.data = games
          .filter((g: Event) => g.role === role)
          .map((g: Event) => ({ x: new Date(g.date), y: g.sr, id: g.id }))
      }

      const chartData = {
        datasets: this.datasets.filter((d: any) => d.data.length > 0)
      }

      this.renderChart(chartData, this.options)
    },
    onClick (_: any, event: any) {
      if (!event[0]) {
        return
      }
      const di = event[0]._datasetIndex
      const i = event[0]._index
      const id = this.datasets[di].data[i].id
      this.$emit("click-game", id)
    },
    onHover (event: any) {
      const points = this.$data._chart.getElementAtEvent(event)
      event.target.style.cursor = points.length ? "pointer" : "default"
    }
  }
})
</script>

<style scoped lang="sass">
canvas
  background-color: $glass
  border-radius: 10px
</style>
