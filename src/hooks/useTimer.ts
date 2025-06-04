import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerHookReturn {
  time: number;
  isActive: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  restart: (newTime?: number) => void;
}

const useTimer = (initialTime: number = 60): TimerHookReturn => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const countRef = useRef<number | null>(null);
  const initialTimeRef = useRef(initialTime);

  const clearTimer = useCallback(() => {
    if (countRef.current) {
      window.clearInterval(countRef.current);
      countRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setTime(initialTimeRef.current);
    setIsActive(true);
    setIsPaused(false);
    countRef.current = window.setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearTimer();
          setIsActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    
    setIsPaused(false);
    countRef.current = window.setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearTimer();
          setIsActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [isPaused, clearTimer]);

  const reset = useCallback((newTime?: number) => {
    clearTimer();
    const resetTime = newTime !== undefined ? newTime : initialTimeRef.current;
    initialTimeRef.current = resetTime;
    setTime(resetTime);
    setIsActive(false);
    setIsPaused(false);
  }, [clearTimer]);

  const restart = useCallback((newTime?: number) => {
    reset(newTime);
    start();
  }, [reset, start]);

  useEffect(() => {
    initialTimeRef.current = initialTime;
    if (!isActive && !isPaused) {
      setTime(initialTime);
    }
  }, [initialTime, isActive, isPaused]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return { time, isActive, isPaused, start, pause, resume, reset, restart };
};

export default useTimer;