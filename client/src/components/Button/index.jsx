const Button = ({ children, onClick, type = "button", loading = false, disabled = false, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        loading ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
      } ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
export default Button;