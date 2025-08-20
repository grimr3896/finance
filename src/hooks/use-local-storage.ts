
"use client";

import { useState, useEffect, useCallback } from 'react';

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}


export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // This effect runs only on the client
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);


  const debouncedSetValue = useCallback(
    debounce((value: T) => {
      try {
        if (typeof window !== 'undefined') {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    }, 500),
    [key, storedValue]
  );
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        debouncedSetValue(valueToStore);
    } catch (error) {
        console.error(error)
    }
  };

  return [storedValue, setValue];
}
