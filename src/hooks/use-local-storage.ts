
"use client";

import { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";

// A hook to sync state with localStorage across tabs/components
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch a storage event to notify other components/tabs
          window.dispatchEvent(new StorageEvent('storage', { key }));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch(e) {
            console.error(e);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("storage", handleStorageChange);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, [key]);

  return [storedValue, setValue];
}
