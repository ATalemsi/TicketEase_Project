import {Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy} from "@angular/core"
import {Observable, Subscription} from "rxjs"
import {Chart, registerables} from "chart.js"
import {selectError, selectLoading, selectPerformanceMetrics} from "../store/admin.selectors"
import {Store} from "@ngrx/store"
import {PerformanceMetrics} from "../../../shared/models/performance-metrics.model"
import {AdminActions} from "../store/admin.actions"
import {AuthState} from "../../auth/store/auth.reducer"
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component"
import {AsyncPipe, DecimalPipe, NgClass, NgIf} from "@angular/common"

@Component({
  selector: "app-statistics",
  standalone: true,
  imports: [SidebarComponent, AsyncPipe, NgIf, DecimalPipe, NgClass],
  templateUrl: "./statistics.component.html",
  styleUrl: "./statistics.component.css",
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("ticketStatusChart") ticketStatusChartRef!: ElementRef
  @ViewChild("ticketAssignmentChart") ticketAssignmentChartRef!: ElementRef
  @ViewChild("ticketComparisonChart") ticketComparisonChartRef!: ElementRef
  @ViewChild("ticketTrendChart") ticketTrendChartRef!: ElementRef
  @ViewChild("ticketPerformanceChart") ticketPerformanceChartRef!: ElementRef

  metrics$: Observable<PerformanceMetrics | null>
  loading$: Observable<boolean>
  error$: Observable<string | null>
  userRole$: Observable<string | null>

  isModalOpen = false

  sidebarOpen = false; // Start closed on mobile
  isMobile = false;

  ticketStatusChart: Chart | null = null
  ticketAssignmentChart: Chart | null = null
  ticketComparisonChart: Chart | null = null
  ticketTrendChart: Chart | null = null
  ticketPerformanceChart: Chart | null = null

  private metricsSubscription: Subscription | null = null
  private chartInitialized = false

  // Chart colors
  chartColors = {
    primary: "#6366F1",
    secondary: "#8B5CF6",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
    light: "#E5E7EB",
    dark: "#1F2937",
    purple: "#8B5CF6",
    indigo: "#6366F1",
    blue: "#3B82F6",
    lightBlue: "#60A5FA",
    cyan: "#06B6D4",
    teal: "#14B8A6",
    green: "#10B981",
    lightGreen: "#34D399",
    lime: "#A3E635",
    yellow: "#FBBF24",
    amber: "#F59E0B",
    orange: "#F97316",
    red: "#EF4444",
    pink: "#EC4899",
    rose: "#F43F5E",
  }

  constructor(private readonly store: Store<{ auth: AuthState }>) {
    // Register Chart.js components
    Chart.register(...registerables)

    this.metrics$ = this.store.select(selectPerformanceMetrics)
    this.loading$ = this.store.select(selectLoading)
    this.error$ = this.store.select(selectError)
    this.userRole$ = this.store.select((state) => state.auth.role)
    this.checkMobile();
    this.sidebarOpen = !this.isMobile;

    // Add resize listener
    window.addEventListener('resize', () => this.checkMobile());
  }

  private checkMobile(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;

    // Close sidebar automatically on mobile
    if (!wasMobile && this.isMobile) {
      this.sidebarOpen = false;
    }
    // Open sidebar automatically on desktop
    if (wasMobile && !this.isMobile) {
      this.sidebarOpen = true;
    }
  }

  ngOnInit(): void {
    this.loadMetrics()
    this.checkMobile();
  }
  // Sidebar toggle method
  toggleSidebar(): void {
    console.log('Toggling sidebar'); // Debug log
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngAfterViewInit(): void {
    // First attempt after a short delay
    setTimeout(() => {
      this.initializeCharts()
    }, 100)

    // Backup attempt after a longer delay (in case the first one fails)
    setTimeout(() => {
      if (!this.chartInitialized) {
        console.log("Retrying chart initialization...")
        this.destroyAllCharts() // Make sure to clean up any partial initializations
        this.initializeCharts()
      }
    }, 500)

    // Add event listener for window resize to handle responsive behavior
    window.addEventListener("resize", this.handleResize.bind(this))
  }

  ngOnDestroy(): void {
    if (this.metricsSubscription) {
      this.metricsSubscription.unsubscribe()
    }

    // Clean up charts
    this.destroyAllCharts()

    // Remove event listener
    window.removeEventListener("resize", this.handleResize.bind(this))
  }

  // Bound method for event listener
  private handleResize(): void {
    this.resizeAllCharts()
  }

  loadMetrics(): void {
    this.store.dispatch(AdminActions.loadPerformanceMetrics())
  }

  private resizeAllCharts(): void {
    if (this.ticketStatusChart) {
      this.ticketStatusChart.resize()
    }
    if (this.ticketAssignmentChart) {
      this.ticketAssignmentChart.resize()
    }
    if (this.ticketComparisonChart) {
      this.ticketComparisonChart.resize()
    }
    if (this.ticketTrendChart) {
      this.ticketTrendChart.resize()
    }
    if (this.ticketPerformanceChart) {
      this.ticketPerformanceChart.resize()
    }
  }

  private destroyAllCharts(): void {
    if (this.ticketStatusChart) {
      this.ticketStatusChart.destroy()
      this.ticketStatusChart = null
    }
    if (this.ticketAssignmentChart) {
      this.ticketAssignmentChart.destroy()
      this.ticketAssignmentChart = null
    }
    if (this.ticketComparisonChart) {
      this.ticketComparisonChart.destroy()
      this.ticketComparisonChart = null
    }
    if (this.ticketTrendChart) {
      this.ticketTrendChart.destroy()
      this.ticketTrendChart = null
    }
    if (this.ticketPerformanceChart) {
      this.ticketPerformanceChart.destroy()
      this.ticketPerformanceChart = null
    }
  }

  private createCharts(metrics: PerformanceMetrics): void {
    try {
      this.createTicketStatusChart(metrics)
      this.createTicketAssignmentChart(metrics)
      this.createTicketComparisonChart(metrics)
      this.createTicketTrendChart(metrics)
      this.createTicketPerformanceChart(metrics)
      this.chartInitialized = true
    } catch (error) {
      console.error("Error creating charts:", error)
      this.chartInitialized = false
    }
  }

  private isCanvasReady(canvasRef: ElementRef | null): boolean {
    if (!canvasRef?.nativeElement) {
      console.error("Canvas element not found")
      return false
    }

    const canvas = canvasRef.nativeElement
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      console.error("Could not get 2d context for canvas")
      return false
    }

    // Check if canvas has dimensions
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
      console.warn("Canvas has zero dimensions, setting default size")
      canvas.style.width = "100%"
      canvas.style.height = "300px"
    }

    return true
  }

  // New method to initialize charts
  private initializeCharts(): void {
    this.metricsSubscription = this.metrics$.subscribe((metrics) => {
      if (metrics) {
        // Force a small delay to ensure DOM is ready
        setTimeout(() => {
          this.createCharts(metrics)
        }, 50)
      }
    })
  }

  private createTicketStatusChart(metrics: PerformanceMetrics): void {
    if (!this.isCanvasReady(this.ticketStatusChartRef)) {
      return
    }

    const ctx = this.ticketStatusChartRef.nativeElement.getContext("2d")

    // Always destroy the previous chart if it exists
    if (this.ticketStatusChart) {
      this.ticketStatusChart.destroy()
      this.ticketStatusChart = null
    }

    const data = {
      labels: ["Resolved", "Unresolved", "New", "In Progress"],
      datasets: [
        {
          data: [metrics.resolvedTickets, metrics.unresolvedTickets, metrics.newTickets, metrics.inProgressTickets],
          backgroundColor: [
            this.chartColors.lightGreen, // Green for resolved
            this.chartColors.red, // Red for unresolved
            this.chartColors.lightBlue, // Blue for new
            this.chartColors.yellow, // Yellow for in progress
          ],
          borderWidth: 1,
          borderColor: "#fff",
        },
      ],
    }

    // Create the chart with the type specified directly
    this.ticketStatusChart = new Chart(ctx, {
      type: "doughnut", // Specify type directly here
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            display: true,
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          title: {
            display: true,
            text: "Ticket Status Distribution",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 15,
            },
          },
        },
      },
    })
  }

  private createTicketAssignmentChart(metrics: PerformanceMetrics): void {
    if (!this.isCanvasReady(this.ticketAssignmentChartRef)) {
      return
    }

    const ctx = this.ticketAssignmentChartRef.nativeElement.getContext("2d")

    // Always destroy the previous chart if it exists
    if (this.ticketAssignmentChart) {
      this.ticketAssignmentChart.destroy()
      this.ticketAssignmentChart = null
    }

    const data = {
      labels: ["Assigned", "Unassigned"],
      datasets: [
        {
          data: [metrics.ticketsAssignedToAgents, metrics.ticketsUnassigned],
          backgroundColor: [
            this.chartColors.indigo, // Indigo for assigned
            this.chartColors.light, // Gray for unassigned
          ],
          borderWidth: 1,
          borderColor: "#fff",
        },
      ],
    }

    // Create the chart with the type specified directly
    this.ticketAssignmentChart = new Chart(ctx, {
      type: "pie", // Specify type directly here
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            display: true,
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          title: {
            display: true,
            text: "Ticket Assignment Distribution",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 15,
            },
          },
        },
      },
    })
  }

  private createTicketComparisonChart(metrics: PerformanceMetrics): void {
    if (!this.isCanvasReady(this.ticketComparisonChartRef)) {
      return
    }

    const ctx = this.ticketComparisonChartRef.nativeElement.getContext("2d")

    // Always destroy the previous chart if it exists
    if (this.ticketComparisonChart) {
      this.ticketComparisonChart.destroy()
      this.ticketComparisonChart = null
    }

    const data = {
      labels: ["Resolved", "Unresolved", "New", "In Progress"],
      datasets: [
        {
          label: "Number of Tickets",
          data: [metrics.resolvedTickets, metrics.unresolvedTickets, metrics.newTickets, metrics.inProgressTickets],
          backgroundColor: [
            this.chartColors.lightGreen,
            this.chartColors.red,
            this.chartColors.lightBlue,
            this.chartColors.yellow,
          ],
          borderColor: [this.chartColors.green, this.chartColors.rose, this.chartColors.blue, this.chartColors.amber],
          borderWidth: 1,
        },
      ],
    }

    // Create the chart with the type specified directly
    this.ticketComparisonChart = new Chart(ctx, {
      type: "bar", // Specify type directly here
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Ticket Status Comparison",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 15,
            },
          },
        },
      },
    })
  }

  private createTicketTrendChart(metrics: PerformanceMetrics): void {
    if (!this.isCanvasReady(this.ticketTrendChartRef)) {
      return
    }

    const ctx = this.ticketTrendChartRef.nativeElement.getContext("2d")

    // Always destroy the previous chart if it exists
    if (this.ticketTrendChart) {
      this.ticketTrendChart.destroy()
      this.ticketTrendChart = null
    }

    // Simulate trend data based on current metrics
    // In a real app, you would get this from your API
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    // Generate some trend data based on current metrics
    const resolvedTrend = this.generateTrendData(metrics.resolvedTickets)
    const unresolvedTrend = this.generateTrendData(metrics.unresolvedTickets)

    const data = {
      labels: months,
      datasets: [
        {
          label: "Resolved Tickets",
          data: resolvedTrend,
          borderColor: this.chartColors.green,
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Unresolved Tickets",
          data: unresolvedTrend,
          borderColor: this.chartColors.red,
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    }

    // Create the chart with the type specified directly
    this.ticketTrendChart = new Chart(ctx, {
      type: "line", // Specify type directly here
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          title: {
            display: true,
            text: "Ticket Resolution Trend",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 15,
            },
          },
        },
      },
    })
  }

  private createTicketPerformanceChart(metrics: PerformanceMetrics): void {
    if (!this.isCanvasReady(this.ticketPerformanceChartRef)) {
      return
    }

    const ctx = this.ticketPerformanceChartRef.nativeElement.getContext("2d")

    // Always destroy the previous chart if it exists
    if (this.ticketPerformanceChart) {
      this.ticketPerformanceChart.destroy()
      this.ticketPerformanceChart = null
    }

    // Calculate percentages for radar chart
    const totalTickets = metrics.totalTickets || 1 // Avoid division by zero
    const resolvedPercentage = (metrics.resolvedTickets / totalTickets) * 100
    const assignedPercentage = (metrics.ticketsAssignedToAgents / totalTickets) * 100
    const responseTimeScore = this.calculateResponseTimeScore(metrics.averageResolutionTime)
    const newTicketsPercentage = (metrics.newTickets / totalTickets) * 100
    const inProgressPercentage = (metrics.inProgressTickets / totalTickets) * 100

    const data = {
      labels: ["Resolved Rate", "Assignment Rate", "Response Time", "New Tickets Rate", "In Progress Rate"],
      datasets: [
        {
          label: "Performance Metrics",
          data: [resolvedPercentage, assignedPercentage, responseTimeScore, newTicketsPercentage, inProgressPercentage],
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: this.chartColors.indigo,
          borderWidth: 2,
          pointBackgroundColor: this.chartColors.indigo,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: this.chartColors.indigo,
        },
      ],
    }

    // Create the chart with the type specified directly
    this.ticketPerformanceChart = new Chart(ctx, {
      type: "radar", // Specify type directly here
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            angleLines: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              backdropColor: "transparent",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Performance Metrics Overview",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 15,
            },
          },
        },
      },
    })
  }

  // Helper method to generate trend data based on current value
  private generateTrendData(currentValue: number): number[] {
    // Generate a trend that ends with the current value
    const trend = []
    const baseValue = Math.max(1, Math.floor(currentValue * 0.7))

    for (let i = 0; i < 5; i++) {
      // Random fluctuation between 70% and 130% of base value
      const randomFactor = 0.7 + Math.random() * 0.6
      trend.push(Math.floor(baseValue * randomFactor))
    }

    // Last value is the current value
    trend.push(currentValue)

    return trend
  }

  // Helper method to calculate response time score (lower is better)
  private calculateResponseTimeScore(averageResolutionTime: number): number {
    // Convert resolution time to a score between 0-100
    // Assuming 24 hours is the target (score 100), and 0 hours is perfect
    const maxResolutionTime = 24 // 24 hours

    if (averageResolutionTime <= 0) {
      return 100 // Perfect score for 0 hours
    }

    if (averageResolutionTime >= maxResolutionTime) {
      return 0 // Minimum score for >= 24 hours
    }

    // Linear scale: 100 - (resolutionTime / maxResolutionTime) * 100
    return 100 - (averageResolutionTime / maxResolutionTime) * 100
  }
}

