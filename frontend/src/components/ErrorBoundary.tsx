import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-lg border bg-card text-card-foreground p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              The app hit a runtime error and stopped rendering.
            </p>
          </div>

          <pre className="text-xs whitespace-pre-wrap rounded-md bg-muted p-3 overflow-auto max-h-80">
            {this.state.error?.stack ?? this.state.error?.message ?? 'Unknown error'}
          </pre>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    )
  }
}

