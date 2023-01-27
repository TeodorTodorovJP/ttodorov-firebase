// A mock function to mimic making an async request for data
export function fetchTheme(theme = "blue") {
  return new Promise<{ data: string }>((resolve) => setTimeout(() => resolve({ data: theme }), 500));
}
