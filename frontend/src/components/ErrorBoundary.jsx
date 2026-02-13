import React, { Component } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-stone-50 p-4 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-6">
                        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-stone-900">Something went wrong</h2>
                            <p className="text-stone-500">We encountered an unexpected error while loading this page.</p>
                        </div>

                        {this.state.error && (
                            <div className="bg-red-50 p-4 rounded-xl text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-700 break-words">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-[10px] bg-red-100/50 p-2 mt-2 rounded text-red-800 overflow-x-auto whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={this.handleReload}
                            className="w-full h-12 rounded-xl bg-stone-900 text-white hover:bg-black font-bold"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
