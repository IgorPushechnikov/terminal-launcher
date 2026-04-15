/**
 * IPC Helper с retry logic
 * 
 * Добавляет автоматические повторные попытки для IPC вызовов
 * с exponential backoff для обработки временных сбоев
 */

/**
 * Выполняет IPC вызов с автоматическими повторными попытками
 * 
 * @param fn - Функция IPC вызова
 * @param retries - Количество попыток (по умолчанию 3)
 * @param baseDelay - Базовая задержка в мс (по умолчанию 100)
 * @returns Результат IPC вызова
 * 
 * @example
 * // Вместо:
 * await window.electronAPI.terminalWrite(termId, data)
 * 
 * // Используйте:
 * await ipcWithRetry(() => window.electronAPI.terminalWrite(termId, data))
 */
export async function ipcWithRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  baseDelay: number = 100
): Promise<T> {
  let lastError: Error | unknown
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Если это последняя попытка - пробрасываем ошибку
      if (attempt === retries) {
        console.error(`[IPC] All ${retries} attempts failed`, error)
        throw error
      }
      
      // Exponential backoff: 100ms, 200ms, 400ms, ...
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.warn(`[IPC] Attempt ${attempt}/${retries} failed, retrying in ${delay}ms...`, error)
      
      // Ждём перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // TypeScript требует возврата значения, но мы никогда сюда не дойдём
  throw lastError
}

/**
 * Создаёт debounced версию IPC вызова
 * Полезно для операций которые могут вызываться часто (resize, scroll)
 * 
 * @param fn - Функция IPC вызова
 * @param delay - Задержка в мс (по умолчанию 300)
 * @returns Debounced функция
 * 
 * @example
 * const debouncedResize = createDebouncedIpc(
 *   (cols, rows) => window.electronAPI.terminalResize(termId, cols, rows),
 *   300
 * )
 */
export function createDebouncedIpc<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = window.setTimeout(() => {
      fn(...args).catch(error => {
        console.error('[IPC] Debounced call failed:', error)
      })
      timeoutId = null
    }, delay)
  }
}

/**
 * Rate limiter для IPC вызовов
 * Ограничивает частоту вызовов (например, выполнение команд)
 * 
 * @param fn - Функция IPC вызова
 * @param minInterval - Минимальный интервал между вызовами в мс
 * @returns Throttled функция
 * 
 * @example
 * const throttledExecute = createThrottledIpc(
 *   (cmd) => window.electronAPI.terminalWrite(termId, cmd),
 *   500 // Не чаще чем раз в 500ms
 * )
 */
export function createThrottledIpc<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  minInterval: number = 500
): (...args: Parameters<T>) => Promise<void> {
  let lastCallTime = 0
  let pendingPromise: Promise<void> | null = null
  
  return async (...args: Parameters<T>): Promise<void> => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    
    if (timeSinceLastCall < minInterval) {
      const waitTime = minInterval - timeSinceLastCall
      console.warn(`[IPC] Rate limited, waiting ${waitTime}ms`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    lastCallTime = Date.now()
    
    try {
      await fn(...args)
    } catch (error) {
      console.error('[IPC] Throttled call failed:', error)
      throw error
    }
  }
}
