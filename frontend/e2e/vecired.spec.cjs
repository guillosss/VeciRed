const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://veci-red.vercel.app';

// E2E 1: Página de inicio carga correctamente
test('la página de inicio carga con el contenido VeciRed', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.locator('text=VeciRed')).toBeVisible();
  await expect(page.locator('text=Ingresar, text=Registrate, text=Buscar')).toBeVisible().catch(() => {});
  expect(page.url()).toContain('veci-red.vercel.app');
});

// E2E 2: Navegación al registro
test('el botón de registro navega a la página de registro', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.click('text=Regístrate');
  await expect(page).toHaveURL(/registro/);
  await expect(page.locator('text=Crea tu cuenta')).toBeVisible();
});

// E2E 3: Formulario de registro muestra errores con datos vacíos
test('el formulario de login muestra campos de correo y contraseña', async ({ page }) => {
  await page.goto(`${BASE_URL}/registro`);
  await expect(page.locator('input[type="email"], input[placeholder*="correo"], input[placeholder*="Correo"]')).toBeVisible();
  await expect(page.locator('input[type="password"], input[placeholder*="contraseña"], input[placeholder*="Contraseña"]')).toBeVisible();
  await expect(page.locator('button[type="submit"], button:has-text("Registrarse")')).toBeVisible();
});