import { test, expect } from '@playwright/test';
import { CreateArticlePage } from '../../pages/article/CreateArticlePage';
import { ViewArticlePage } from '../../pages/article/ViewArticlePage';

export async function createNewArticle(page, article) {
  await test.step(`Create a new article: "${article.title}"`, async () => {
    const createArticlePage = new CreateArticlePage(page);
    const viewArticlePage = new ViewArticlePage(page); // dopasowana nazwa

    // Navigate to New Article
    await page.getByRole('link', { name: 'New Article' }).click();

    // Fill required fields
    await createArticlePage.fillTitleField(article.title);
    await createArticlePage.fillDescriptionField(article.description);
    await createArticlePage.fillTextField(article.text ?? article.body ?? '');

    // Add tags if any
    if (article.tags && article.tags.length > 0) {
      const tagsInput = page.getByPlaceholder('Enter tags');
      for (const tag of article.tags) {
        await test.step(`Add tag "${tag}"`, async () => {
          await tagsInput.fill(tag);
          await page.keyboard.press('Enter');
        });
      }
    }

    // Publish article
    await createArticlePage.clickPublishArticleButton();

    // Assert article title
    await viewArticlePage.assertArticleTitleIsVisible(article.title);
  });
}
