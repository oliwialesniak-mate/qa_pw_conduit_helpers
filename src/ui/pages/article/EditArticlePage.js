import { expect, test } from '@playwright/test';

export class EditArticlePage {
  constructor(page) {
    this.page = page;
    this.titleField = page.getByPlaceholder('Article Title');
    this.descriptionField = page.getByPlaceholder(`What's this article about?`);
    this.textField = page.getByPlaceholder('Write your article (in markdown)');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.errorMessage = page.getByRole('list').nth(1);
  }

  async openEditor() {
    await test.step(`Open the Edit Article page`, async () => {
      await this.page.getByRole('link', { name: 'Edit Article' }).click();
    });
  }

  async updateTitle(title) {
    await test.step(`Update article title to "${title}"`, async () => {
      await this.titleField.fill(title);
    });
  }

  async updateDescription(description) {
    await test.step(`Update article description to "${description}"`, async () => {
      await this.descriptionField.fill(description);
    });
  }

  async updateText(text) {
    await test.step(`Update article text to "${text}"`, async () => {
      await this.textField.fill(text);
    });
  }

  async addTag(tag) {
    await test.step(`Add tag "${tag}"`, async () => {
      await this.tagsInput.fill(tag);
      await this.page.keyboard.press('Enter');
    });
  }

  async removeTag(tagName) {
    await test.step(`Remove tag "${tagName}"`, async () => {
      await this.page.locator(`.tag-pill:has-text("${tagName}") .ion-close-round`).click();
    });
  }

  async publishChanges() {
    await test.step(`Publish article changes`, async () => {
      await this.publishButton.click();
    });
  }

  async assertErrorMessageContainsText(text) {
    await test.step(`Assert error message contains "${text}"`, async () => {
      await expect(this.errorMessage).toContainText(text);
    });
  }
}
