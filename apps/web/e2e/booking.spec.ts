import { expect, test } from '@playwright/test';

// Uses the seeded patient Alice and Dr. Chloe Nguyen, who has no seeded bookings.
test('a patient can log in, book, view and cancel an appointment', async ({ page }) => {
  // Log in
  await page.goto('/login');
  await page.getByLabel('Email').fill('alice@clinicq.test');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'Doctors' })).toBeVisible();

  // Book the doctor's first available time
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Dr. Chloe Nguyen' })
    .getByRole('link', { name: 'See available times' })
    .click();
  await expect(page.getByRole('heading', { name: 'Dr. Chloe Nguyen' })).toBeVisible();
  await page
    .getByRole('button', { name: /^\d{1,2}:\d{2}/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Confirm booking' }).click();

  // View it in My appointments
  await expect(page.getByRole('heading', { name: 'My appointments' })).toBeVisible();
  await expect(page.getByText('Your appointment is booked.')).toBeVisible();
  const appointment = page.getByRole('listitem').filter({ hasText: 'Dr. Chloe Nguyen' });
  await expect(appointment.getByText('Booked')).toBeVisible();

  // Cancel it (accepting the browser's "are you sure?" dialog)
  page.once('dialog', (dialog) => dialog.accept());
  await appointment.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Your appointment was cancelled.')).toBeVisible();
  await expect(appointment.getByText('Cancelled')).toBeVisible();
  await expect(appointment.getByRole('button', { name: 'Cancel' })).toHaveCount(0);
});
