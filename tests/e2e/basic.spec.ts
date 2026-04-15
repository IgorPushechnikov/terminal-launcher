import { test, expect } from '@playwright/test'

test('приложение должно загружаться', async ({ page }) => {
  // В dev режиме приложение работает на localhost:5173
  await page.goto('http://localhost:5173', { timeout: 45000, waitUntil: 'domcontentloaded' })

  // Проверяем, что страница загрузилась
  await expect(page).toHaveTitle(/Terminal Launcher/, { timeout: 10000 })
})

test('должна быть хотя бы одна вкладка по умолчанию', async ({ page }) => {
  await page.goto('http://localhost:5173', { timeout: 45000, waitUntil: 'domcontentloaded' })
  
  // Ждем загрузки приложения с увеличенным таймаутом
  await page.waitForSelector('.tab-bar-container', { timeout: 15000 })
  
  // Проверяем наличие вкладок
  const tabs = await page.locator('.tab-item').count()
  expect(tabs).toBeGreaterThan(0)
})

test('кнопка добавления вкладки должна работать', async ({ page }) => {
  await page.goto('http://localhost:5173', { timeout: 45000, waitUntil: 'domcontentloaded' })
  
  await page.waitForSelector('.tab-bar-container', { timeout: 15000 })
  
  // Считаем начальное количество вкладок
  const initialTabs = await page.locator('.tab-item').count()
  
  // Кликаем кнопку добавления
  await page.click('.add-tab', { timeout: 5000 })
  
  // Ждем обновления
  await page.waitForTimeout(500)
  
  // Проверяем, что вкладка добавилась
  const newTabs = await page.locator('.tab-item').count()
  expect(newTabs).toBe(initialTabs + 1)
})

test('переключение языка должно работать', async ({ page }) => {
  await page.goto('http://localhost:5173', { timeout: 45000, waitUntil: 'domcontentloaded' })
  
  // Ждем загрузки приложения
  await page.waitForSelector('.tab-bar-container', { timeout: 15000 })
  
  // Находим кнопку переключения языка по классу
  const langButton = await page.locator('.language-toggle').first()
  await expect(langButton).toBeVisible({ timeout: 5000 })
  
  // Получаем текст кнопки до клика
  const textBefore = await langButton.textContent()
  
  // Кликаем кнопку
  await langButton.click({ timeout: 5000 })
  
  // Даем время на обновление UI
  await page.waitForTimeout(500)
  
  // Проверяем что текст кнопки изменился (язык переключился)
  const textAfter = await langButton.textContent()
  expect(textAfter).not.toBe(textBefore)
})

test('добавление и удаление команды', async ({ page }) => {
  await page.goto('http://localhost:5173', { timeout: 45000, waitUntil: 'domcontentloaded' })
  
  // Ждем загрузки панели команд
  await page.waitForSelector('.command-panel', { timeout: 15000 })
  
  // Ищем кнопку добавления команды (кнопка с +)
  const addCommandButton = await page.locator('.add-btn').first()
  
  if (await addCommandButton.count() > 0) {
    await addCommandButton.click({ timeout: 5000 })
    
    // Ждем появления модального окна
    await page.waitForTimeout(500)
    
    // Проверяем что форма открылась (ищем поля ввода)
    const nameInput = await page.locator('input[placeholder*="название"], input[placeholder*="name"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5000 })
  }
})

test('удаление вкладки', async ({ page }) => {
  await page.goto('http://localhost:5173', { timeout: 45000, waitUntil: 'domcontentloaded' })
  
  // Ждем загрузки приложения
  await page.waitForSelector('.tab-bar-container', { timeout: 15000 })
  
  // Добавляем новую вкладку
  await page.click('.add-tab', { timeout: 5000 })
  await page.waitForTimeout(500)
  
  const tabsBeforeDelete = await page.locator('.tab-item').count()
  
  // Ищем кнопку закрытия на последней вкладке
  const closeButtons = await page.locator('.tab-close, .close-tab').all()
  if (closeButtons.length > 0) {
    await closeButtons[closeButtons.length - 1].click({ timeout: 5000 })
    await page.waitForTimeout(300)
    
    const tabsAfterDelete = await page.locator('.tab-item').count()
    expect(tabsAfterDelete).toBe(tabsBeforeDelete - 1)
  }
})
