// Lightweight stub for llmClient to avoid bundling heavy server-side logic in the client
const llmClient = {
  // callWithDeduplication kept for compatibility but delegates to the unified llmService at runtime
  async callWithDeduplication(prompt, context = {}, options = {}) {
    // Dynamically import the centralized llmService when used in the client
    const { generateText } = await import('./llmService.js');
    const res = await generateText(prompt, options);
    return res;
  }
};

export { llmClient };