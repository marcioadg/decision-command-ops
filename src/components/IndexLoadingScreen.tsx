
interface IndexLoadingScreenProps {
  retryCount: number;
}

export const IndexLoadingScreen = ({ retryCount }: IndexLoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tactical-accent mx-auto mb-4"></div>
        <p className="text-tactical-text font-mono">Loading tactical decisions...</p>
        {retryCount > 0 && (
          <p className="text-tactical-text/60 font-mono text-sm mt-2">
            Retry attempt {retryCount}/3
          </p>
        )}
      </div>
    </div>
  );
};
