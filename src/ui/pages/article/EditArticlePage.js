import { test, expect } from '@playwright/test';

export class EditArticlePage {
  constructor(page) {
    this.page = page;
    this.titleField = page.getByPlaceholder('Article Title');
    this.descriptionField = page.getByPlaceholder(`What's this article about?`);
    this.textField = page.getByPlaceholder('Write your article (in markdown)');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.errorMessage = page.locator('.error-messages li');
  }

  async openEditor() {
    await test.step('Open edit article page', async () => {
      await this.page.getByRole('link', { name: 'Edit Article' }).click();
      await this.page.waitForSelector('textarea[placeholder="Write your article (in markdown)"]', { state: 'visible' });
    });
  }

  async updateTitle(title) {
    await test.step('Update article title', async () => {
      await this.titleField.fill(title);
    });
  }

  async updateDescription(description) {
    await test.step('Update article description', async () => {
      await this.descriptionField.fill(description);
    });
  }

  async updateText(text) {
    await test.step('Update article text', async () => {
      await this.textField.fill(text);
    });
  }

  async addTag(tag) {
    await test.step(`Add tag "${tag}"`, async () => {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
      await this.page.locator('.tag-pill', { hasText: tag }).waitFor({ state: 'visible' });
    });
  }

  async removeTag(tag) {
    await test.step(`Remove tag "${tag}"`, async () => {
      const tagElement = this.page.locator('.tag-pill', { hasText: tag });
      if (await tagElement.count() > 0) {
        await tagElement.locator('button').click();
        await tagElement.waitFor({ state: 'detached' });
      }
    });
  }

  async publishChanges() {
    await test.step('Click publish changes', async () => {
      await this.publishButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async assertErrorMessageContainsText(messageText) {
    await test.step(`Assert error message contains "${messageText}"`, async () => {
      await expect(this.errorMessage).toContainText(messageText);
    });
  }
}
