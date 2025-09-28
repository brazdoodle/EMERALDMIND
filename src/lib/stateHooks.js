/**
 * State management hooks for EmeraldMind
 */

import { useCallback, useState } from "react";
import { LOADING_STATES } from "./stateConstants.js";

/**
 * Hook for managing async state with loading indicators
 */
export const useAsyncState = (initialData = null) => {
  const [state, setState] = useState({
    data: initialData,
    status: LOADING_STATES.IDLE,
    error: null,
    timestamp: null,
  });

  const setLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: LOADING_STATES.LOADING,
      error: null,
      timestamp: Date.now(),
    }));
  }, []);

  const setSuccess = useCallback((data) => {
    setState({
      data,
      status: LOADING_STATES.SUCCESS,
      error: null,
      timestamp: Date.now(),
    });
  }, []);

  const setError = useCallback((error) => {
    setState((prev) => ({
      ...prev,
      status: LOADING_STATES.ERROR,
      error: error?.message || error || "Unknown error",
      timestamp: Date.now(),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      status: LOADING_STATES.IDLE,
      error: null,
      timestamp: null,
    });
  }, [initialData]);

  const retry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: LOADING_STATES.RETRY,
      error: null,
      timestamp: Date.now(),
    }));
  }, []);

  const isLoading =
    state.status === LOADING_STATES.LOADING ||
    state.status === LOADING_STATES.RETRY;
  const hasError = state.status === LOADING_STATES.ERROR;
  const isSuccess = state.status === LOADING_STATES.SUCCESS;
  const isEmpty =
    !state.data || (Array.isArray(state.data) && state.data.length === 0);

  return {
    ...state,
    isLoading,
    hasError,
    isSuccess,
    isEmpty,
    setLoading,
    setSuccess,
    setError,
    reset,
    retry,
  };
};

/**
 * Hook for managing list state with operations
 */
export const useListState = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);

  const addItem = useCallback((item) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index, updater) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          return typeof updater === "function" ? updater(item) : updater;
        }
        return item;
      })
    );
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const replaceItems = useCallback((newItems) => {
    setItems(newItems || []);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    replaceItems,
    count: items.length,
    isEmpty: items.length === 0,
  };
};

/**
 * Hook for managing paginated state
 */
export const usePaginatedState = (initialItems = [], pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [items, setItems] = useState(initialItems);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback(
    (page) => {
      setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const updateItems = useCallback((newItems) => {
    setItems(newItems || []);
    setCurrentPage(0);
  }, []);

  return {
    items: currentItems,
    allItems: items,
    currentPage,
    totalPages,
    pageSize,
    hasNext: currentPage < totalPages - 1,
    hasPrev: currentPage > 0,
    goToPage,
    nextPage,
    prevPage,
    updateItems,
    totalCount: items.length,
  };
};
